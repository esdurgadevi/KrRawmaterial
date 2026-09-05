// frontend/src/pages/admin/transaction-cotton/InwardLotPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import inwardEntryService from '../../services/admin1/transaction-cotton/inwardEntryService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';
import godownService from '../../services/admin1/master/godownService';

const InwardLotPage = () => {
  const navigate = useNavigate();

  // States for list view
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWeightmentModal, setShowWeightmentModal] = useState(false);

  // Data states
  const [selectedLot, setSelectedLot] = useState(null);
  const [inwardEntries, setInwardEntries] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [selectedInward, setSelectedInward] = useState(null);
  const [selectedGodown, setSelectedGodown] = useState(null);
  const [inwardBales, setInwardBales] = useState(null);
  const [inwardLotsData, setInwardLotsData] = useState(null);

  // Existing lots states
  const [existingLots, setExistingLots] = useState([]);
  const [existingLotsTotals, setExistingLotsTotals] = useState({
    totalQty: 0,
    totalFreight: 0,
    totalNettWeight: 0
  });
  const [existingLotsLoading, setExistingLotsLoading] = useState(false);

  // Loading states
  const [inwardLoading, setInwardLoading] = useState(false);
  const [godownLoading, setGodownLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lotNoLoading, setLotNoLoading] = useState(false);

  // Dropdown visibility states
  const [showInwardDropdown, setShowInwardDropdown] = useState(false);
  const [showGodownDropdown, setShowGodownDropdown] = useState(false);

  // Search states
  const [inwardSearch, setInwardSearch] = useState('');
  const [godownSearch, setGodownSearch] = useState('');

  // Refs for dropdowns
  const inwardRef = useRef(null);
  const godownRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    // Header
    inwardId: '',
    inwardNo: '',
    lotNo: '',
    lotDate: new Date().toISOString().split('T')[0],

    // Purchase details (from inward)
    supplier: '',
    broker: '',
    variety: '',
    mixingGroup: '',
    station: '',
    companyBroker: '',
    rateType: '',

    // Party details (from inward)
    billNo: '',
    billDate: '',
    lotNoParty: '',
    lorryNo: '',
    date: '',
    candyRate: '',
    pMark: '',
    pressRunningNo: '',
    commisType: '',
    commisValue: '',
    permitNo: '',
    comm: '',
    cooly: '',
    bale: '',

    // Tax details (from inward)
    gst: '',
    sgst: '',
    cgst: '',
    igst: '',
    sgstAmount: '',
    cgstAmount: '',
    igstAmount: '',
    Tax: '',
    TaxRs: '',

    // Per Qty values (from inward)
    grossPerQty: '',
    tarePerQty: '',
    freightPerQty: '',

    // User inputs
    godownId: '',
    godownName: '',
    qty: '',
    paymentDays: '',
    lcNo: '',
    setNo: '',
    cess: '0',
    type: '',

    // Calculated fields
    grossWeight: '',
    tareWeight: '',
    nettWeight: '',
    freight: '',
    candyRateWithTax: '',
    ratePerKg: '',
    quintalRate: '',
    assessValue: '',

    // Flag for UI feedback
    isLastLot: false,
  });

  // Weightment state
  const [weightments, setWeightments] = useState([]);
  const [weightmentTotals, setWeightmentTotals] = useState({
    grossWeight: 0,
    tareWeight: 0,
    baleWeight: 0,
    baleValue: 0
  });

  // Refs for keyboard navigation
  const inputRefs = useRef({});

  // Load data on mount
  useEffect(() => {
    fetchLots();
    fetchInwardEntries();
    fetchGodowns();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inwardRef.current && !inwardRef.current.contains(event.target)) {
        setShowInwardDropdown(false);
      }
      if (godownRef.current && !godownRef.current.contains(event.target)) {
        setShowGodownDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate payment date when lotDate and paymentDays change
  useEffect(() => {
    if (formData.lotDate && formData.paymentDays) {
      const lotDate = new Date(formData.lotDate);
      const days = parseInt(formData.paymentDays);
      if (!isNaN(days) && days > 0) {
        const paymentDate = new Date(lotDate);
        paymentDate.setDate(lotDate.getDate() + days);
      }
    }
  }, [formData.lotDate, formData.paymentDays]);

  // ─────────────────────────────────────────────────────────────────────────────
  // CORE FIX: Calculate all values when qty changes
  // When it is the LAST lot, weights are derived from inward remaining values
  // (not qty × perQty) so that the totals tally exactly with the inward entry.
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!formData.qty || !selectedInward) return;

    const qty = parseFloat(formData.qty) || 0;
    if (qty <= 0) return;

    const totalInwardQty = parseInt(selectedInward.Qty) || 0;
    const newTotalQty = existingLotsTotals.totalQty + qty;
    const isLastLot = newTotalQty === totalInwardQty;

    // Per-qty values from inward (used for all non-last lots, and for tare on last lot)
    const grossPerQty = parseFloat(selectedInward.grossPerQty) || 0;
    const tarePerQty = parseFloat(selectedInward.tarePerQty) || 0;
    const freightPerQty = parseFloat(selectedInward.freightPerQty) || 0;

    let grossWeight, tareWeight, nettWeight, freight;

    if (isLastLot) {
      // ── LAST LOT: force exact tally against the inward entry ──────────────
      //
      // Nett weight  = inward total nett  − sum of all previous lots' nett weights
      // Freight      = inward total freight − sum of all previous lots' freight
      // Tare weight  = perQty × qty  (proportional; not a tallied field)
      // Gross weight = nett + tare   (back-calculated so gross also tallies)
      //
      nettWeight = (parseFloat(selectedInward.nettWeight) || 0)
        - existingLotsTotals.totalNettWeight;
      freight = (parseFloat(selectedInward.freight) || 0)
        - existingLotsTotals.totalFreight;
      tareWeight = Math.floor(tarePerQty * qty);
      grossWeight = nettWeight + tareWeight;
    } else {
      // ── NORMAL LOT: standard perQty × qty calculation ─────────────────────
      grossWeight = Math.floor(grossPerQty * qty);
      tareWeight = Math.floor(tarePerQty * qty);
      nettWeight = grossWeight - tareWeight;
      freight = freightPerQty * qty;
    }

    // ── Rate calculations (same for both last and normal lots) ────────────────
    const baseCandyRate = parseFloat(selectedInward.candyRate) || 0;
    const freightPerKg = nettWeight > 0 ? freight / nettWeight : 0;
    const freightAdjustment = freightPerKg * 355.62;
    const candyRateWithTax = Math.floor(baseCandyRate + freightAdjustment);

    let ratePerKg = candyRateWithTax / 355.62;
    ratePerKg = Math.round(ratePerKg * 100) / 100;
    const quintalRate = ratePerKg * 100;
    const assessValue = Math.round(nettWeight * ratePerKg);

    setFormData(prev => ({
      ...prev,
      grossWeight: grossWeight.toFixed ? grossWeight.toFixed(3) : String(Math.round(grossWeight)),
      tareWeight: String(Math.round(tareWeight)),
      nettWeight: nettWeight.toFixed ? nettWeight.toFixed(3) : String(Math.round(nettWeight)),
      freight: freight.toFixed(2),
      candyRateWithTax: Math.round(candyRateWithTax).toString(),
      ratePerKg: ratePerKg.toFixed(2),
      quintalRate: quintalRate.toFixed(2),
      assessValue: assessValue.toString(),
      isLastLot,
    }));
  }, [formData.qty, selectedInward, existingLotsTotals]);

  // Fetch existing lots for selected inward
  const fetchExistingLotsForInward = async (inwardNo) => {
    try {
      setExistingLotsLoading(true);
      const response = await inwardLotService.getAll();
      const allLots = Array.isArray(response) ? response : [];

      const filteredLots = allLots.filter(lot =>
        (lot.inwardNo || lot.InwardEntry?.inwardNo) === inwardNo
      );

      setExistingLots(filteredLots);

      const totals = filteredLots.reduce((acc, lot) => ({
        totalQty: acc.totalQty + (parseInt(lot.qty) || 0),
        totalFreight: acc.totalFreight + (parseFloat(lot.freight) || 0),
        totalNettWeight: acc.totalNettWeight + (parseFloat(lot.nettWeight) || 0),
      }), { totalQty: 0, totalFreight: 0, totalNettWeight: 0 });

      setExistingLotsTotals(totals);

      console.log('Existing lots for inward:', filteredLots);
      console.log('Totals:', totals);

    } catch (err) {
      console.error('Error fetching existing lots:', err);
    } finally {
      setExistingLotsLoading(false);
    }
  };

  // Fetch next lot number
  const fetchNextLotNo = async () => {
    try {
      setLotNoLoading(true);
      const response = await inwardLotService.getNextLotNo();
      setFormData(prev => ({ ...prev, lotNo: response || '' }));
    } catch (err) {
      console.error('Error fetching next lot number:', err);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, '0');
      const defaultLotNo = `UC/${currentYear}-${nextYear}/${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, lotNo: defaultLotNo }));
    } finally {
      setLotNoLoading(false);
    }
  };

  // Fetch lots
  const fetchLots = async () => {
    setLoading(true);
    try {
      const response = await inwardLotService.getAll();
      const lotsData = Array.isArray(response) ? response : [];
      setLots(lotsData);
    } catch (err) {
      console.error('Failed to load lots:', err);
      setError('Failed to load inward lots');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inward entries
  const fetchInwardEntries = async () => {
    setInwardLoading(true);
    try {
      const response = await inwardEntryService.getAll();
      const entriesData = response?.inwardEntries || (Array.isArray(response) ? response : []);
      setInwardEntries(entriesData);
    } catch (err) {
      console.error('Failed to load inward entries:', err);
    } finally {
      setInwardLoading(false);
    }
  };

  // Fetch godowns
  const fetchGodowns = async () => {
    setGodownLoading(true);
    try {
      const response = await godownService.getAll();
      const godownsData = Array.isArray(response) ? response : [];
      setGodowns(godownsData);
    } catch (err) {
      console.error('Failed to load godowns:', err);
    } finally {
      setGodownLoading(false);
    }
  };

  // Handle inward selection
  const handleInwardSelect = async (inwardId) => {
    try {
      setLoading(true);
      const response = await inwardEntryService.getById(inwardId);
      const inward = response.inwardEntry || response;

      setSelectedInward(inward);
      setInwardSearch(inward.inwardNo || '');

      await fetchExistingLotsForInward(inward.inwardNo);

      const qty = parseInt(inward.Qty) || 0;
      const grossPerBale = parseFloat(inward.grossPerQty) || 0;
      const tarePerBale = parseFloat(inward.tarePerQty) || 0;
      const netPerBale = grossPerBale - tarePerBale;

      const balesObject = {
        inwardNo: inward.inwardNo,
        inwardId: inward.id,
        totalBales: qty,
        totalGrossWeight: parseFloat(inward.grossWeight) || 0,
        totalTareWeight: parseFloat(inward.tareWeight) || 0,
        totalNetWeight: parseFloat(inward.nettWeight) || 0,
        perBaleWeights: { grossPerBale, tarePerBale, netPerBale },
        balesList: Array.from({ length: qty }, (_, index) => ({
          slNo: index + 1,
          baleIndex: index + 1,
          grossWeight: grossPerBale,
          tareWeight: tarePerBale,
          netWeight: netPerBale,
        })),
      };

      setInwardBales(balesObject);

      setInwardLotsData({
        inwardNo: inward.inwardNo,
        inwardId: inward.id,
        totalBales: qty,
        totalGrossWeight: parseFloat(inward.grossWeight) || 0,
        totalTareWeight: parseFloat(inward.tareWeight) || 0,
        totalNetWeight: parseFloat(inward.nettWeight) || 0,
      });

      setFormData(prev => ({
        ...prev,
        inwardId: inward.id,
        inwardNo: inward.inwardNo || '',
        supplier: inward.supplier || '',
        broker: inward.broker || '',
        variety: inward.variety || '',
        mixingGroup: inward.mixingGroup || '',
        station: inward.station || '',
        companyBroker: inward.companyBroker || '',
        rateType: inward.rateType || '',
        billNo: inward.billNo || '',
        billDate: inward.billDate || '',
        lotNoParty: inward.lotNo || '',
        lorryNo: inward.lorryNo || '',
        date: inward.date || '',
        candyRate: inward.candyRate || '',
        pMark: inward.pMark || '',
        pressRunningNo: inward.pressRunningNo || '',
        commisType: inward.commisType || '',
        commisValue: inward.commisValue || '',
        permitNo: inward.permitNo || '',
        comm: inward.comm || '',
        cooly: inward.cooly || '',
        bale: inward.bale || '',
        gst: inward.gst || '',
        sgst: inward.sgst || '',
        cgst: inward.cgst || '',
        igst: inward.igst || '',
        sgstAmount: inward.sgstAmount || '',
        cgstAmount: inward.cgstAmount || '',
        igstAmount: inward.igstAmount || '',
        Tax: inward.Tax || '',
        TaxRs: inward.TaxRs || '',
        grossPerQty: inward.grossPerQty || '',
        tarePerQty: inward.tarePerQty || '',
        freightPerQty: inward.freightPerQty || '',
        type: inward.type || '',
      }));

      setShowInwardDropdown(false);

    } catch (error) {
      console.error('Error fetching inward details:', error);
      setError('Failed to load inward entry details');
    } finally {
      setLoading(false);
    }
  };

  // Handle godown selection
  const handleGodownSelect = (godown) => {
    setFormData(prev => ({
      ...prev,
      godownId: godown.id,
      godownName: godown.godownName,
    }));
    setSelectedGodown(godown);
    setGodownSearch(godown.godownName);
    setShowGodownDropdown(false);
  };

  // Clear selections
  const clearInwardSelection = () => {
    setSelectedInward(null);
    setInwardBales(null);
    setInwardLotsData(null);
    setExistingLots([]);
    setExistingLotsTotals({ totalQty: 0, totalFreight: 0, totalNettWeight: 0 });
    setInwardSearch('');
    setFormData(prev => ({
      ...prev,
      inwardId: '', inwardNo: '', supplier: '', broker: '', variety: '',
      mixingGroup: '', station: '', companyBroker: '', rateType: '',
      billNo: '', billDate: '', lotNoParty: '', lorryNo: '', date: '',
      candyRate: '', pMark: '', pressRunningNo: '', commisType: '',
      commisValue: '', permitNo: '', comm: '', cooly: '', bale: '',
      gst: '', sgst: '', cgst: '', igst: '', sgstAmount: '', cgstAmount: '',
      igstAmount: '', Tax: '', TaxRs: '', grossPerQty: '', tarePerQty: '',
      freightPerQty: '', type: '', grossWeight: '', tareWeight: '',
      nettWeight: '', freight: '', candyRateWithTax: '', ratePerKg: '',
      quintalRate: '', assessValue: '', isLastLot: false,
    }));
  };

  const clearGodownSelection = () => {
    setFormData(prev => ({ ...prev, godownId: '', godownName: '' }));
    setSelectedGodown(null);
    setGodownSearch('');
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate if this is the last lot
  const validateLastLot = () => {
    if (!selectedInward) return false;

    const totalInwardQty = parseInt(selectedInward.Qty) || 0;
    const currentQty = parseInt(formData.qty) || 0;
    const totalExistingQty = existingLotsTotals.totalQty;
    const newTotalQty = totalExistingQty + currentQty;
    const isLastLot = newTotalQty === totalInwardQty;

    if (isLastLot) {
      // Because we already forced the weights to match in the useEffect,
      // these checks should always pass. They remain as a safety net.
      const totalExistingNettWeight = existingLotsTotals.totalNettWeight;
      const currentNettWeight = parseFloat(formData.nettWeight) || 0;
      const totalNettWeight = totalExistingNettWeight + currentNettWeight;
      const inwardNettWeight = parseFloat(selectedInward.nettWeight) || 0;
      const weightTolerance = 1.0; // 1 kg tolerance (accounts for rounding)

      if (Math.abs(totalNettWeight - inwardNettWeight) > weightTolerance) {
        setError(
          `This is the last lot! Total nett weight (${totalNettWeight.toFixed(3)} kg) ` +
          `must match inward nett weight (${inwardNettWeight.toFixed(3)} kg).`
        );
        return false;
      }

      const totalExistingFreight = existingLotsTotals.totalFreight;
      const currentFreight = parseFloat(formData.freight) || 0;
      const totalFreight = totalExistingFreight + currentFreight;
      const inwardFreight = parseFloat(selectedInward.freight) || 0;
      const freightTolerance = 1.0;

      if (Math.abs(totalFreight - inwardFreight) > freightTolerance) {
        setError(
          `This is the last lot! Total freight (₹${totalFreight.toFixed(2)}) ` +
          `must match inward freight (₹${inwardFreight.toFixed(2)}).`
        );
        return false;
      }

      setSuccess(
        `This is the last lot for inward ${selectedInward.inwardNo}. ` +
        `All weights and freight tally correctly!`
      );
    }

    return true;
  };

  // Open weightment modal
  const handleOpenWeightment = () => {
    if (!formData.qty || parseInt(formData.qty) <= 0) {
      setError('Please enter valid quantity first');
      return;
    }

    if (selectedInward) {
      const totalInwardQty = parseInt(selectedInward.Qty) || 0;
      const currentQty = parseInt(formData.qty) || 0;
      const totalExistingQty = existingLotsTotals.totalQty;
      const remainingQty = totalInwardQty - totalExistingQty;

      if (currentQty > remainingQty) {
        setError(`Only ${remainingQty} bales remaining for this inward entry. Please adjust quantity.`);
        return;
      }
    }

    const qty = parseInt(formData.qty);
    const headerGross = parseFloat(formData.grossWeight) || 0;
    const headerTare = parseFloat(formData.tareWeight) || 0;
    const headerNet = parseFloat(formData.nettWeight) || 0;
    const grossPerBale = headerGross / qty;
    const tarePerBale = headerTare / qty;
    const ratePerKg = parseFloat(formData.ratePerKg) || 0;

    const newWeightments = Array.from({ length: qty }, (_, index) => {
      const isLastBale = index === qty - 1;
      const previousTotals = isLastBale
        ? Array.from({ length: index }).reduce(
            (acc) => {
              acc.grossWeight += parseFloat((grossPerBale).toFixed(3)) || 0;
              acc.tareWeight += parseFloat((tarePerBale).toFixed(3)) || 0;
              acc.baleWeight += parseFloat((grossPerBale - tarePerBale).toFixed(3)) || 0;
              return acc;
            },
            { grossWeight: 0, tareWeight: 0, baleWeight: 0 }
          )
        : null;

      const grossWeight = isLastBale
        ? headerGross - previousTotals.grossWeight
        : grossPerBale;
      const tareWeight = isLastBale
        ? headerTare - previousTotals.tareWeight
        : tarePerBale;
      const baleWeight = isLastBale
        ? headerNet - previousTotals.baleWeight
        : grossPerBale - tarePerBale;

      return {
        id: index + 1,
        slNo: index + 1,
        baleNo: generateBaleNumber(index + 1),
        grossWeight: grossWeight.toFixed(3),
        tareWeight: tareWeight.toFixed(3),
        baleWeight: baleWeight.toFixed(3),
        baleValue: (baleWeight * ratePerKg).toFixed(2),
        isEdited: false,
      };
    });

    setWeightments(newWeightments);

    const totals = newWeightments.reduce(
      (acc, w) => {
        acc.grossWeight += parseFloat(w.grossWeight) || 0;
        acc.tareWeight += parseFloat(w.tareWeight) || 0;
        acc.baleWeight += parseFloat(w.baleWeight) || 0;
        acc.baleValue += parseFloat(w.baleValue) || 0;
        return acc;
      },
      { grossWeight: 0, tareWeight: 0, baleWeight: 0, baleValue: 0 }
    );

    setWeightmentTotals(totals);
    setShowWeightmentModal(true);
  };

  // Generate bale number
  const generateBaleNumber = (index) => {
    return `${formData.lotNo}-${index.toString().padStart(3, '0')}`;
  };

  // Handle weightment change
  const handleWeightmentChange = (index, field, value) => {
    const updatedWeightments = [...weightments];
    const numValue = value === '' ? '' : parseFloat(value) || 0;

    updatedWeightments[index][field] = numValue;
    updatedWeightments[index].isEdited = true;

    if (field === 'grossWeight' || field === 'tareWeight') {
      const gross = parseFloat(updatedWeightments[index].grossWeight) || 0;
      const tare = parseFloat(updatedWeightments[index].tareWeight) || 0;
      const baleWeight = gross - tare;
      updatedWeightments[index].baleWeight = baleWeight.toFixed(3);
      const ratePerKg = parseFloat(formData.ratePerKg) || 0;
      updatedWeightments[index].baleValue = (baleWeight * ratePerKg).toFixed(2);
    }

    if (field === 'baleWeight') {
      const ratePerKg = parseFloat(formData.ratePerKg) || 0;
      updatedWeightments[index].baleValue = (numValue * ratePerKg).toFixed(2);
    }

    setWeightments(updatedWeightments);

    const totals = updatedWeightments.reduce(
      (acc, w) => {
        acc.grossWeight += parseFloat(w.grossWeight) || 0;
        acc.tareWeight += parseFloat(w.tareWeight) || 0;
        acc.baleWeight += parseFloat(w.baleWeight) || 0;
        acc.baleValue += parseFloat(w.baleValue) || 0;
        return acc;
      },
      { grossWeight: 0, tareWeight: 0, baleWeight: 0, baleValue: 0 }
    );

    setWeightmentTotals(totals);
  };

  // Validate weightments before submit
  const validateWeightments = () => {
    const headerGross = parseFloat(formData.grossWeight) || 0;
    const headerTare = parseFloat(formData.tareWeight) || 0;
    const headerNet = parseFloat(formData.nettWeight) || 0;

    const weightmentGross = weightmentTotals.grossWeight;
    const weightmentTare = weightmentTotals.tareWeight;
    const weightmentNet = weightmentTotals.baleWeight;

    const tolerance = 0.5;

    const grossMatch = Math.abs(headerGross - weightmentGross) <= tolerance;
    const tareMatch = Math.abs(headerTare - weightmentTare) <= tolerance;
    const netMatch = Math.abs(headerNet - weightmentNet) <= tolerance;

    if (!grossMatch || !tareMatch || !netMatch) {
      setError(
        `Weightment totals must match header values.\n` +
        `Gross: ${headerGross.toFixed(3)} vs ${weightmentGross.toFixed(3)}\n` +
        `Tare: ${headerTare.toFixed(3)} vs ${weightmentTare.toFixed(3)}\n` +
        `Net: ${headerNet.toFixed(3)} vs ${weightmentNet.toFixed(3)}`
      );
      return false;
    }

    return true;
  };

  // Handle key down for navigation
  const handleKeyDown = (e, index, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fields = ['grossWeight', 'tareWeight'];
      const currentFieldIndex = fields.indexOf(field);

      if (currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        const nextInputId = `weightment-${index}-${nextField}`;
        const nextInput = inputRefs.current[nextInputId];
        if (nextInput) nextInput.focus();
      } else {
        const nextIndex = index + 1;
        if (nextIndex < weightments.length) {
          const nextInputId = `weightment-${nextIndex}-grossWeight`;
          const nextInput = inputRefs.current[nextInputId];
          if (nextInput) nextInput.focus();
        }
      }
    }
  };

  // Handle create submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedInward) { setError('Please select an inward entry'); return; }
    if (!formData.godownId) { setError('Please select a godown'); return; }
    if (!formData.qty || parseInt(formData.qty) <= 0) { setError('Please enter valid quantity'); return; }
    if (weightments.length === 0) { setError('Please add weightments first'); return; }
    if (!validateWeightments()) return;
    if (!validateLastLot()) return;

    setSubmitting(true);

    try {
      const lotHeader = {
        inwardId: selectedInward.id,
        lotNo: formData.lotNo,
        lotDate: formData.lotDate,
        qty: parseInt(formData.qty) || 0,
        freight: parseFloat(formData.freight) || 0,
        grossWeight: parseFloat(formData.grossWeight) || 0,
        tareWeight: parseFloat(formData.tareWeight) || 0,
        nettWeight: parseFloat(formData.nettWeight) || 0,
        candyRate: parseFloat(formData.candyRateWithTax) || 0,
        quintalRate: parseFloat(formData.quintalRate) || 0,
        ratePerKg: parseFloat(formData.ratePerKg) || 0,
        assessValue: parseFloat(formData.assessValue) || 0,
        godownId: parseInt(formData.godownId),
        lcNo: formData.lcNo || null,
        paymentDays: formData.paymentDays ? parseInt(formData.paymentDays) : null,
        paymentDate: formData.paymentDate || null,
        setNo: formData.setNo || null,
        cess: parseFloat(formData.cess) || 0,
        type: formData.type || null,
      };

      const weightmentsData = weightments.map(w => ({
        baleNo: w.baleNo,
        grossWeight: parseFloat(w.grossWeight) || 0,
        tareWeight: parseFloat(w.tareWeight) || 0,
        baleWeight: parseFloat(w.baleWeight) || 0,
        baleValue: parseFloat(w.baleValue) || 0,
      }));

      await inwardLotService.create(lotHeader, weightmentsData);

      setSuccess('Lot created successfully!');
      setTimeout(() => {
        resetForm();
        setShowCreateModal(false);
        fetchLots();
      }, 2000);

    } catch (err) {
      console.error('Error creating lot:', err);
      setError(err.response?.data?.message || 'Failed to create lot');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle view
  const handleView = async (id) => {
    try {
      const response = await inwardLotService.getById(id);
      setSelectedLot(response);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching lot details:', error);
      setError('Failed to load lot details');
    }
  };

  // Handle edit
  const handleEdit = async (id) => {
    try {
      setError('');
      const lotResponse = await inwardLotService.getById(id);
      const lot = lotResponse.data || lotResponse;

      if (!lot || !lot.id) { setError('Invalid lot data received'); return; }

      setSelectedLot(lot);

      let godown = null;

      try {
        if (lot.inwardId) {
          const inwardResponse = await inwardEntryService.getById(lot.inwardId);
          const inwardData = inwardResponse.inwardEntry || inwardResponse;
          setSelectedInward(inwardData);
          setInwardSearch(inwardData.inwardNo || '');
          await fetchExistingLotsForInward(inwardData.inwardNo);
        } else {
          setSelectedInward(null);
          setInwardSearch('');
        }
      } catch (inwardErr) {
        console.error('Error fetching inward entry:', inwardErr);
        setSelectedInward(null);
      }

      try {
        const godownResponse = await godownService.getAll();
        const godownsData = Array.isArray(godownResponse) ? godownResponse : [];
        godown = godownsData.find(g => g.id === lot.godownId);
        setSelectedGodown(godown);
        setGodownSearch(godown?.godownName || '');
      } catch (godownErr) {
        console.error('Error fetching godowns:', godownErr);
        setSelectedGodown(null);
      }

      setFormData({
        inwardId: lot.inwardId || '',
        inwardNo: lot.inwardNo || '',
        lotNo: lot.lotNo || '',
        lotDate: lot.lotDate ? lot.lotDate.split('T')[0] : new Date().toISOString().split('T')[0],
        supplier: lot.supplier || '',
        broker: lot.broker || '',
        variety: lot.variety || '',
        mixingGroup: lot.mixingGroup || '',
        station: lot.station || '',
        companyBroker: lot.companyBroker || '',
        rateType: lot.rateType || '',
        billNo: lot.billNo || '',
        billDate: lot.billDate || '',
        lotNoParty: lot.inwardLotNo || '',
        lorryNo: lot.lorryNo || '',
        date: lot.inwardDate || '',
        candyRate: lot.inwardCandyRate || '',
        pMark: lot.pMark || '',
        pressRunningNo: lot.pressRunningNo || '',
        commisType: lot.commisType || '',
        commisValue: lot.commisValue || '',
        permitNo: lot.permitNo || '',
        comm: lot.comm || '',
        cooly: lot.cooly || '',
        bale: lot.bale || '',
        gst: lot.gst || '',
        sgst: lot.sgst || '',
        cgst: lot.cgst || '',
        igst: lot.igst || '',
        sgstAmount: lot.sgstAmount || '',
        cgstAmount: lot.cgstAmount || '',
        igstAmount: lot.igstAmount || '',
        Tax: lot.Tax || '',
        TaxRs: lot.TaxRs || '',
        grossPerQty: lot.grossWeight && lot.qty ? (parseFloat(lot.grossWeight) / lot.qty).toFixed(3) : '',
        tarePerQty: lot.tareWeight && lot.qty ? (parseFloat(lot.tareWeight) / lot.qty).toFixed(3) : '',
        freightPerQty: lot.freight && lot.qty ? (parseFloat(lot.freight) / lot.qty).toFixed(2) : '',
        godownId: lot.godownId || '',
        godownName: godown?.godownName || '',
        qty: lot.qty || '',
        paymentDays: lot.paymentDays || '',
        lcNo: lot.lcNo || '',
        setNo: lot.setNo || '',
        cess: lot.cess || '0',
        type: lot.type || '',
        grossWeight: lot.grossWeight || '',
        tareWeight: lot.tareWeight || '',
        nettWeight: lot.nettWeight || '',
        freight: lot.freight || '0',
        candyRateWithTax: lot.candyRate || '',
        ratePerKg: lot.ratePerKg || '',
        quintalRate: lot.quintalRate || '',
        assessValue: lot.assessValue || '',
        isLastLot: false,
      });

      if (lot.weightments && lot.weightments.length > 0) {
        const formattedWeightments = lot.weightments.map((w, index) => ({
          id: w.id || index + 1,
          slNo: index + 1,
          baleNo: w.baleNo,
          grossWeight: w.grossWeight,
          tareWeight: w.tareWeight,
          baleWeight: w.baleWeight,
          baleValue: w.baleValue,
          isEdited: false,
        }));

        setWeightments(formattedWeightments);

        const totals = formattedWeightments.reduce(
          (acc, w) => {
            acc.grossWeight += parseFloat(w.grossWeight) || 0;
            acc.tareWeight += parseFloat(w.tareWeight) || 0;
            acc.baleWeight += parseFloat(w.baleWeight) || 0;
            acc.baleValue += parseFloat(w.baleValue) || 0;
            return acc;
          },
          { grossWeight: 0, tareWeight: 0, baleWeight: 0, baleValue: 0 }
        );

        setWeightmentTotals(totals);
      }

      setShowEditModal(true);

    } catch (error) {
      console.error('Error loading lot for edit:', error);
      setError('Failed to load lot details for editing');
    }
  };

  // Handle update submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedLot) { setError('No lot selected for update'); return; }
    if (!selectedLot.id) { setError('Invalid lot data: missing ID'); return; }
    if (weightments.length === 0) { setError('Please add weightments first'); return; }
    if (!validateWeightments()) return;

    setSubmitting(true);
    try {
      const lotHeader = {
        inwardId: selectedInward?.id || selectedLot.inwardId,
        lotNo: formData.lotNo,
        lotDate: formData.lotDate,
        qty: parseInt(formData.qty) || 0,
        freight: parseFloat(formData.freight) || 0,
        grossWeight: parseFloat(formData.grossWeight) || 0,
        tareWeight: parseFloat(formData.tareWeight) || 0,
        nettWeight: parseFloat(formData.nettWeight) || 0,
        candyRate: parseFloat(formData.candyRateWithTax) || 0,
        quintalRate: parseFloat(formData.quintalRate) || 0,
        ratePerKg: parseFloat(formData.ratePerKg) || 0,
        assessValue: parseFloat(formData.assessValue) || 0,
        godownId: parseInt(formData.godownId),
        lcNo: formData.lcNo || null,
        paymentDays: formData.paymentDays ? parseInt(formData.paymentDays) : null,
        paymentDate: formData.paymentDate || null,
        setNo: formData.setNo || null,
        cess: parseFloat(formData.cess) || 0,
        type: formData.type || null,
      };

      const weightmentsData = weightments.map(w => ({
        id: w.id,
        baleNo: w.baleNo,
        grossWeight: parseFloat(w.grossWeight) || 0,
        tareWeight: parseFloat(w.tareWeight) || 0,
        baleWeight: parseFloat(w.baleWeight) || 0,
        baleValue: parseFloat(w.baleValue) || 0,
      }));

      await inwardLotService.update(selectedLot.id, lotHeader, weightmentsData);

      setSuccess('Lot updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        fetchLots();
        resetForm();
      }, 2000);

    } catch (err) {
      console.error('Error updating lot:', err);
      setError(err.response?.data?.message || 'Failed to update lot');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id, lotNo) => {
    if (!window.confirm(`Are you sure you want to delete lot "${lotNo}"?`)) return;

    try {
      await inwardLotService.delete(id);
      setSuccess('Lot deleted successfully!');
      fetchLots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete lot');
    }
  };

  // Export lots
  const exportLots = () => {
    try {
      const headers = [
        'Lot No', 'Lot Date', 'Quantity', 'Gross Weight', 'Tare Weight',
        'Nett Weight', 'Candy Rate', 'Quintal Rate', 'Rate/Kg', 'Assess Value',
        'Freight', 'Supplier', 'Station', 'Created Date',
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' +
        headers.join(',') + '\n' +
        filteredLots.map(lot => [
          `"${lot.lotNo || ''}"`,
          `"${lot.lotDate || ''}"`,
          lot.qty || 0,
          lot.grossWeight || 0,
          lot.tareWeight || 0,
          lot.nettWeight || 0,
          lot.candyRate || 0,
          lot.quintalRate || 0,
          lot.ratePerKg || 0,
          lot.assessValue || 0,
          lot.freight || 0,
          `"${lot.supplier || ''}"`,
          `"${lot.station || ''}"`,
          `"${lot.createdAt ? new Date(lot.createdAt).toLocaleDateString('en-IN') : ''}"`,
        ].join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `inward-lots-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess('Lots exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export lots');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      inwardId: '', inwardNo: '', lotNo: '',
      lotDate: new Date().toISOString().split('T')[0],
      supplier: '', broker: '', variety: '', mixingGroup: '', station: '',
      companyBroker: '', rateType: '', billNo: '', billDate: '', lotNoParty: '',
      lorryNo: '', date: '', candyRate: '', pMark: '', pressRunningNo: '',
      commisType: '', commisValue: '', permitNo: '', comm: '', cooly: '', bale: '',
      gst: '', sgst: '', cgst: '', igst: '', sgstAmount: '', cgstAmount: '',
      igstAmount: '', Tax: '', TaxRs: '', grossPerQty: '', tarePerQty: '',
      freightPerQty: '', godownId: '', godownName: '', qty: '', paymentDays: '',
      lcNo: '', setNo: '', cess: '0', type: '', grossWeight: '', tareWeight: '',
      nettWeight: '', freight: '', candyRateWithTax: '', ratePerKg: '',
      quintalRate: '', assessValue: '', isLastLot: false,
    });
    setSelectedInward(null);
    setSelectedGodown(null);
    setExistingLots([]);
    setExistingLotsTotals({ totalQty: 0, totalFreight: 0, totalNettWeight: 0 });
    setWeightments([]);
    setWeightmentTotals({ grossWeight: 0, tareWeight: 0, baleWeight: 0, baleValue: 0 });
    setInwardSearch('');
    setGodownSearch('');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  // Format number with decimals
  const formatNumber = (value, decimals = 3) => {
    if (value === undefined || value === null || value === '') return '0';
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toFixed(decimals);
  };

  // Filter lots based on search
  const filteredLots = lots.filter(lot => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (lot.lotNo && lot.lotNo.toLowerCase().includes(searchLower)) ||
      (lot.supplier && lot.supplier.toLowerCase().includes(searchLower)) ||
      (lot.station && lot.station.toLowerCase().includes(searchLower)) ||
      (lot.inwardNo && lot.inwardNo.toLowerCase().includes(searchLower))
    );
  });

  // Filter inward entries
  const filteredInwardEntries = inwardEntries.filter(entry => {
    if (!inwardSearch.trim()) return true;
    const searchLower = inwardSearch.toLowerCase();
    return entry.inwardNo && entry.inwardNo.toLowerCase().includes(searchLower);
  });

  // Filter godowns
  const filteredGodowns = godowns.filter(godown => {
    if (!godownSearch.trim()) return true;
    const searchLower = godownSearch.toLowerCase();
    return godown.godownName && godown.godownName.toLowerCase().includes(searchLower);
  });

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    fetchNextLotNo();
    setShowCreateModal(true);
  };

  // Calculate remaining bales
  const getRemainingBales = () => {
    if (!selectedInward) return 0;
    return (parseInt(selectedInward.Qty) || 0) - existingLotsTotals.totalQty;
  };

  // ─── Shared form sections (used in both Create and Edit modals) ──────────────

  const renderInwardDetails = () => (
    <>
      {/* Existing Lots Summary */}
      {existingLots.length > 0 && selectedInward && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-md font-semibold text-yellow-800 mb-2">
            Existing Lots for {selectedInward.inwardNo}
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-600">Total Bales Created</p>
              <p className="text-lg font-bold text-yellow-700">
                {existingLotsTotals.totalQty} / {selectedInward.Qty || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Freight Used</p>
              <p className="text-lg font-bold text-yellow-700">
                ₹{existingLotsTotals.totalFreight.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Net Weight Used</p>
              <p className="text-lg font-bold text-yellow-700">
                {existingLotsTotals.totalNettWeight.toFixed(3)} kg
              </p>
            </div>
          </div>
          <div className="text-sm text-yellow-700">
            <span className="font-semibold">Remaining: </span>
            {getRemainingBales()} bales |{' '}
            ₹{(parseFloat(selectedInward.freight) - existingLotsTotals.totalFreight).toFixed(2)} freight |{' '}
            {(parseFloat(selectedInward.nettWeight) - existingLotsTotals.totalNettWeight).toFixed(3)} kg net weight
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {existingLots.map(lot => (
              <span key={lot.id} className="inline-block mr-2 mb-1 px-2 py-1 bg-yellow-100 rounded">
                {lot.lotNo} (Qty: {lot.qty})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Last Lot Banner */}
      {formData.isLastLot && (
        <div className="mb-6 p-3 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <div>
            <p className="text-sm font-semibold text-green-800">This is the last lot</p>
            <p className="text-xs text-green-700">
              Weights have been automatically adjusted to tally exactly with the inward entry.
            </p>
          </div>
        </div>
      )}

      {/* Purchase Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Supplier', formData.supplier],
            ['Broker', formData.broker],
            ['Variety', formData.variety],
            ['Mixing', formData.mixingGroup],
            ['Station', formData.station],
            ['Company Broker', formData.companyBroker || 'NONE'],
            ['Rate Type', formData.rateType],
          ].map(([label, val]) => (
            <div key={label}>
              <label className="block text-xs text-gray-500">{label}</label>
              <div className="font-medium">{val || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Party Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Party details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Bill No.', formData.billNo],
            ['Bill Date', formatDate(formData.billDate)],
            ['Lot No.', formData.lotNoParty],
            ['Lorry No.', formData.lorryNo],
            ['Date', formatDate(formData.date)],
            ['Candy Rate', `₹${formData.candyRate || 'N/A'}`],
            ['P. Mark', formData.pMark || '-'],
            ['Press Running No.', formData.pressRunningNo || '-'],
            ['Commis. Type', formData.commisType || '-'],
            ['Commis. Value', `₹${formData.commisValue || '0'}`],
            ['Permit No.', formData.permitNo || '-'],
            ['Commission', `₹${formData.comm || '0'}`],
            ['Cooly', `₹${formData.cooly || '0'}`],
            ['Bale', `₹${formData.bale || '0'}`],
          ].map(([label, val]) => (
            <div key={label}>
              <label className="block text-xs text-gray-500">{label}</label>
              <div className="font-medium">{val || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['GST %', `${formData.gst || '0'}%`],
            ['SGST %', `${formData.sgst || '0'}%`],
            ['CGST %', `${formData.cgst || '0'}%`],
            ['IGST %', `${formData.igst || '0'}%`],
            ['SGST Amt', `₹${formData.sgstAmount || '0'}`],
            ['CGST Amt', `₹${formData.cgstAmount || '0'}`],
            ['IGST Amt', `₹${formData.igstAmount || '0'}`],
            ['Total Tax', `₹${formData.TaxRs || '0'}`],
          ].map(([label, val]) => (
            <div key={label}>
              <label className="block text-xs text-gray-500">{label}</label>
              <div className="font-medium">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per Qty Values */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Per Quantity Values</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500">Gross Per Qty</label>
            <div className="font-medium">{formData.grossPerQty || '0'} kg</div>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Tare Per Qty</label>
            <div className="font-medium">{formData.tarePerQty || '0'} kg</div>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Freight Per Qty</label>
            <div className="font-medium">₹{formData.freightPerQty || '0'}</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderGodownDropdown = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Godown *</label>
      <div className="relative" ref={godownRef}>
        <input
          type="text"
          value={godownSearch}
          onChange={(e) => { setGodownSearch(e.target.value); setShowGodownDropdown(true); }}
          onFocus={() => setShowGodownDropdown(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type to search godown..."
          required
        />
        {selectedGodown && (
          <button type="button" onClick={clearGodownSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
        {showGodownDropdown && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {godownLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading godowns...</p>
              </div>
            ) : filteredGodowns.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {godownSearch ? 'No godowns found' : 'No godowns available'}
              </div>
            ) : (
              filteredGodowns.slice(0, 10).map((godown) => (
                <div key={godown.id} onClick={() => handleGodownSelect(godown)}
                  className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${selectedGodown?.id === godown.id ? 'bg-blue-100' : ''}`}>
                  <div className="font-medium text-gray-900">{godown.godownName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {godown.locationName || 'N/A'} | Code: #{godown.code || 'N/A'}
                  </div>
                </div>
              ))
            )}
            {filteredGodowns.length > 10 && (
              <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-200">
                Showing 10 of {filteredGodowns.length} results. Type to search more.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderLotDetailsInputs = (isEdit = false) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Lot Details</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {renderGodownDropdown()}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (Bales) *
          </label>
          <input
            type="number"
            name="qty"
            value={formData.qty}
            onChange={handleInputChange}
            onWheel={(e) => e.target.blur()}
            min="1"
            max={isEdit ? undefined : getRemainingBales()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter quantity"
            required
          />
          {!isEdit && getRemainingBales() > 0 && (
            <p className="text-xs text-gray-500 mt-1">Max available: {getRemainingBales()} bales</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LC No.</label>
          <input type="text" name="lcNo" value={formData.lcNo} onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter LC number" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Days</label>
          <input type="number" name="paymentDays" value={formData.paymentDays} onChange={handleInputChange}
            onWheel={(e) => e.target.blur()} min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter payment days" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Set No.</label>
          <input type="text" name="setNo" value={formData.setNo} onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter set number" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cess</label>
          <input type="number" name="cess" value={formData.cess} onChange={handleInputChange}
            onWheel={(e) => e.target.blur()} min="0" step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter cess" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <input type="text" name="type" value={formData.type} onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter type" />
        </div>
      </div>
    </div>
  );

  const renderCalculatedValues = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Calculated Values
        {formData.isLastLot && (
          <span className="ml-3 text-xs font-normal px-2 py-1 bg-green-100 text-green-700 rounded-full">
            Last lot — weights locked to inward remaining
          </span>
        )}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Gross Weight', `${formData.grossWeight || '0'} kg`, 'text-blue-600'],
          ['Tare Weight', `${formData.tareWeight || '0'} kg`, 'text-blue-600'],
          ['Nett Weight', `${formData.nettWeight || '0'} kg`, 'text-blue-600'],
          ['Freight', `₹${formData.freight || '0'}`, 'text-blue-600'],
          ['Candy Rate (with tax)', `₹${formData.candyRateWithTax || '0'}`, 'text-green-600'],
          ['Rate/Kg', `₹${formData.ratePerKg || '0'}`, 'text-green-600'],
          ['Quintal Rate', `₹${formData.quintalRate || '0'}`, 'text-green-600'],
          ['Assess Value', `₹${formData.assessValue || '0'}`, 'text-green-600'],
        ].map(([label, val, color]) => (
          <div key={label}>
            <label className="block text-xs text-gray-500">{label}</label>
            <div className={`font-medium ${color}`}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Inward Lot Management</h1>
            <p className="text-gray-600">Manage all inward lots and their configurations</p>
          </div>
          <button onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center">
            <span className="mr-2">+</span>Add New Lot
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5">⚠️</span>
          <div className="flex-1 whitespace-pre-line">{error}</div>
          <button onClick={() => setError('')} className="ml-2">✕</button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5">✓</span>
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">✕</button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input type="text" placeholder="Search lots by lot number, supplier, station, or inward number..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportLots}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
              <span className="mr-2">📥</span>Export
            </button>
            <button onClick={fetchLots} disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50">
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lots ({filteredLots.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading lots...</p>
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📦</span>
            <p className="text-gray-600 mb-2">No lots found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">Try adjusting your search</p>
            ) : (
              <button onClick={openCreateModal} className="text-blue-600 hover:text-blue-800 font-medium">
                Create your first lot
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CODE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOT NO (QTY, FREIGHT)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PURCHASE ORDER NO (CANDY RATE)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INWARD NO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SUPPLIER</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATION</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLots.map((lot, index) => (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{String(index + 1).padStart(4, '0')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{lot.lotNo || 'N/A'}</div>
                      <div className="text-sm text-gray-500">Qty: {lot.qty || 0} bales | Freight: ₹{lot.freight || '0'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{lot.purchaseOrderNo || 'N/A'}</div>
                      <div className="text-sm text-gray-500">Candy Rate: ₹{lot.candyRate || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{lot.inwardNo || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={lot.supplier || 'N/A'}>
                        {lot.supplier || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lot.station || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleView(lot.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center">
                          <span className="mr-1">👁️</span>View
                        </button>
                        <button onClick={() => handleEdit(lot.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center">
                          <span className="mr-1">✏️</span>Edit
                        </button>
                        <button onClick={() => handleDelete(lot.id, lot.lotNo)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center">
                          <span className="mr-1">🗑️</span>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">Showing {filteredLots.length} of {lots.length} lots</div>
        </div>
      </div>

      {/* ── CREATE MODAL ─────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Create New Inward Lot</h3>
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-500">✕</button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Inward Number Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inward Number *</label>
                    <div className="relative" ref={inwardRef}>
                      <input type="text" value={inwardSearch}
                        onChange={(e) => { setInwardSearch(e.target.value); setShowInwardDropdown(true); }}
                        onFocus={() => setShowInwardDropdown(true)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type to search inward number..." required />
                      {selectedInward && (
                        <button type="button" onClick={clearInwardSelection}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
                      )}
                      {showInwardDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {inwardLoading ? (
                            <div className="p-4 text-center">
                              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              <p className="mt-2 text-sm text-gray-500">Loading inward entries...</p>
                            </div>
                          ) : filteredInwardEntries.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              {inwardSearch ? 'No inward entries found' : 'No inward entries available'}
                            </div>
                          ) : (
                            filteredInwardEntries.slice(0, 10).map((entry) => (
                              <div key={entry.id} onClick={() => handleInwardSelect(entry.id)}
                                className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${selectedInward?.id === entry.id ? 'bg-blue-100' : ''}`}>
                                <div className="font-medium text-gray-900">{entry.inwardNo}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Date: {formatDate(entry.inwardDate)} | Qty: {entry.noOfBales || 0} bales
                                </div>
                              </div>
                            ))
                          )}
                          {filteredInwardEntries.length > 10 && (
                            <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-200">
                              Showing 10 of {filteredInwardEntries.length} results. Type to search more.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lot No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lot No. *</label>
                    {lotNoLoading ? (
                      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        <span className="w-4 h-4 animate-spin inline-block mr-2 text-gray-400 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                        <span className="text-gray-500">Generating lot number...</span>
                      </div>
                    ) : (
                      <input type="text" name="lotNo" value={formData.lotNo} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono"
                        placeholder="Auto-generated" readOnly required />
                    )}
                    <p className="text-xs text-gray-500 mt-1">Auto-generated lot number</p>
                  </div>

                  {/* Lot Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lot Date *</label>
                    <input type="date" name="lotDate" value={formData.lotDate} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required />
                  </div>
                </div>

                {selectedInward && (
                  <>
                    {renderInwardDetails()}
                    {renderLotDetailsInputs(false)}
                    {renderCalculatedValues()}
                  </>
                )}

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="button" onClick={handleOpenWeightment}
                    disabled={!selectedInward || !formData.qty}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
                    Weighment
                  </button>
                  <button type="submit"
                    disabled={submitting || !selectedInward || !formData.godownId || !formData.qty || weightments.length === 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                    {submitting ? 'Creating...' : 'Create Lot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── WEIGHTMENT MODAL ──────────────────────────────────────────────────── */}
      {showWeightmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Bale Weightment Details</h3>
                <button onClick={() => setShowWeightmentModal(false)} className="text-gray-400 hover:text-gray-500">✕</button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="text-xs text-gray-500">Header Gross</label>
                  <div className="font-semibold">{parseFloat(formData.grossWeight || 0).toFixed(3)} kg</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Header Tare</label>
                  <div className="font-semibold">{parseFloat(formData.tareWeight || 0).toFixed(3)} kg</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Header Net</label>
                  <div className="font-semibold">{parseFloat(formData.nettWeight || 0).toFixed(3)} kg</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Rate/Kg</label>
                  <div className="font-semibold">₹{parseFloat(formData.ratePerKg || 0).toFixed(2)}</div>
                </div>
              </div>

              {formData.isLastLot && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <strong>Last lot:</strong> gross and tare per bale have been derived from the remaining
                  inward weights. Adjust individual bale weights as needed — the totals must still match
                  the header values shown above.
                </div>
              )}

              <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BALE NO</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GROSS WEIGHT (KG)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TARE WEIGHT (KG)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BALE WEIGHT (KG)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BALE VALUE (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {weightments.map((weightment, index) => (
                      <tr key={weightment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-mono">{weightment.baleNo}</td>
                        <td className="px-4 py-2">
                          <input
                            ref={el => inputRefs.current[`weightment-${index}-grossWeight`] = el}
                            type="number" value={weightment.grossWeight}
                            onChange={(e) => handleWeightmentChange(index, 'grossWeight', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'grossWeight')}
                            onWheel={(e) => e.target.blur()} step="0.001"
                            className={`w-32 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${weightment.isEdited ? 'border-yellow-500' : 'border-gray-300'}`} />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            ref={el => inputRefs.current[`weightment-${index}-tareWeight`] = el}
                            type="number" value={weightment.tareWeight}
                            onChange={(e) => handleWeightmentChange(index, 'tareWeight', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'tareWeight')}
                            onWheel={(e) => e.target.blur()} step="0.001"
                            className={`w-32 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${weightment.isEdited ? 'border-yellow-500' : 'border-gray-300'}`} />
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {parseFloat(weightment.baleWeight || 0).toFixed(3)}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          ₹{parseFloat(weightment.baleValue || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-4 py-2 text-sm">Totals</td>
                      <td className="px-4 py-2 text-sm">{weightmentTotals.grossWeight.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm">{weightmentTotals.tareWeight.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm">{weightmentTotals.baleWeight.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm">₹{weightmentTotals.baleValue.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowWeightmentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={() => setShowWeightmentModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Save Weightments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ────────────────────────────────────────────────────────── */}
      {showViewModal && selectedLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Lot Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-500">✕</button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Lot No</p>
                    <h4 className="text-2xl font-bold text-gray-900">{selectedLot.lotNo}</h4>
                    <p className="text-sm text-gray-600">Date: {formatDate(selectedLot.lotDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Rate Type</p>
                    <p className="text-lg font-semibold">{selectedLot.rateType || 'CANDY'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-blue-800">Purchase Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['Supplier', selectedLot.supplier],
                          ['Broker', selectedLot.broker],
                          ['Variety', selectedLot.variety],
                          ['Mixing Group', selectedLot.mixingGroup],
                          ['Station', selectedLot.station],
                          ['Company Broker', selectedLot.companyBroker],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="font-medium">{val || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-blue-800">Party Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['Bill No.', selectedLot.billNo],
                          ['Bill Date', formatDate(selectedLot.billDate)],
                          ['Inward Lot No.', selectedLot.inwardLotNo],
                          ['P. Mark', selectedLot.pMark || '-'],
                          ['Press Running No.', selectedLot.pressRunningNo || '-'],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="font-medium">{val || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-blue-800">Quantity & Weight</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-xs text-gray-500">Quantity (Bales)</p><p className="font-bold text-xl">{selectedLot.qty}</p></div>
                        <div><p className="text-xs text-gray-500">Gross Weight</p><p className="font-medium">{formatNumber(selectedLot.grossWeight)} kg</p></div>
                        <div><p className="text-xs text-gray-500">Tare Weight</p><p className="font-medium">{formatNumber(selectedLot.tareWeight)} kg</p></div>
                        <div><p className="text-xs text-gray-500">Nett Weight</p><p className="font-semibold text-blue-600">{formatNumber(selectedLot.nettWeight)} kg</p></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-blue-800">Godown</h5>
                      <p className="font-medium">{selectedLot.godownName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-green-800">Rate Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-xs text-gray-500">Candy Rate</p><p className="font-bold text-green-600">₹{formatNumber(selectedLot.candyRate, 2)}</p></div>
                        <div><p className="text-xs text-gray-500">Inward Candy Rate</p><p className="font-medium">₹{formatNumber(selectedLot.inwardCandyRate, 2) || 'N/A'}</p></div>
                        <div><p className="text-xs text-gray-500">Rate/Kg</p><p className="font-medium">₹{formatNumber(selectedLot.ratePerKg, 2)}</p></div>
                        <div><p className="text-xs text-gray-500">Quintal Rate</p><p className="font-medium">₹{formatNumber(selectedLot.quintalRate, 2)}</p></div>
                        <div className="col-span-2"><p className="text-xs text-gray-500">Assess Value</p><p className="font-semibold text-green-600">₹{formatNumber(selectedLot.assessValue, 0)}</p></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-purple-800">Tax Details</h5>
                      <div className="grid grid-cols-3 gap-2">
                        <div><p className="text-xs text-gray-500">GST</p><p className="font-medium">{formatNumber(selectedLot.gst, 2)}%</p></div>
                        <div><p className="text-xs text-gray-500">SGST</p><p className="font-medium">{formatNumber(selectedLot.sgst, 2)}%</p></div>
                        <div><p className="text-xs text-gray-500">CGST</p><p className="font-medium">{formatNumber(selectedLot.cgst, 2)}%</p></div>
                        <div><p className="text-xs text-gray-500">IGST</p><p className="font-medium">{formatNumber(selectedLot.igst, 2)}%</p></div>
                        <div><p className="text-xs text-gray-500">SGST Amt</p><p className="text-sm">₹{formatNumber(selectedLot.sgstAmount, 2)}</p></div>
                        <div><p className="text-xs text-gray-500">CGST Amt</p><p className="text-sm">₹{formatNumber(selectedLot.cgstAmount, 2)}</p></div>
                        <div><p className="text-xs text-gray-500">IGST Amt</p><p className="text-sm">₹{formatNumber(selectedLot.igstAmount, 2)}</p></div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Total Tax</p>
                          <p className="font-semibold text-purple-600">₹{formatNumber(selectedLot.TaxRs, 2)} ({formatNumber(selectedLot.Tax, 2)}%)</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3 text-orange-800">Freight & Other Charges</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-xs text-gray-500">Freight</p><p className="font-medium">₹{formatNumber(selectedLot.freight, 2)}</p></div>
                        <div><p className="text-xs text-gray-500">Cess</p><p className="font-medium">₹{formatNumber(selectedLot.cess, 2) || '0'}</p></div>
                      </div>
                    </div>

                    {(selectedLot.lcNo || selectedLot.paymentDays || selectedLot.paymentDate) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-3 text-gray-800">Payment Details</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedLot.lcNo && <div><p className="text-xs text-gray-500">LC No.</p><p className="font-medium">{selectedLot.lcNo}</p></div>}
                          {selectedLot.paymentDays && <div><p className="text-xs text-gray-500">Payment Days</p><p className="font-medium">{selectedLot.paymentDays}</p></div>}
                          {selectedLot.paymentDate && <div><p className="text-xs text-gray-500">Payment Date</p><p className="font-medium">{formatDate(selectedLot.paymentDate)}</p></div>}
                        </div>
                      </div>
                    )}

                    {(selectedLot.setNo || selectedLot.type) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-3 text-gray-800">Additional Info</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedLot.setNo && <div><p className="text-xs text-gray-500">Set No.</p><p className="font-medium">{selectedLot.setNo}</p></div>}
                          {selectedLot.type && <div><p className="text-xs text-gray-500">Type</p><p className="font-medium">{selectedLot.type}</p></div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedLot.weightments && selectedLot.weightments.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-lg font-semibold mb-4 text-gray-800">Bale Details</h5>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {['S.No', 'Bale No', 'Gross (kg)', 'Tare (kg)', 'Bale Wt (kg)', 'Bale Value (₹)', 'Issued'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedLot.weightments.map((w, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{idx + 1}</td>
                              <td className="px-4 py-2 text-sm font-mono">{w.baleNo}</td>
                              <td className="px-4 py-2 text-sm">{formatNumber(w.grossWeight)}</td>
                              <td className="px-4 py-2 text-sm">{formatNumber(w.tareWeight)}</td>
                              <td className="px-4 py-2 text-sm font-medium">{formatNumber(w.baleWeight)}</td>
                              <td className="px-4 py-2 text-sm">₹{formatNumber(w.baleValue, 2)}</td>
                              <td className="px-4 py-2 text-sm">
                                {w.isIssued
                                  ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Issued</span>
                                  : <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Available</span>}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-100 font-semibold">
                            <td className="px-4 py-2 text-sm" colSpan="2">Totals</td>
                            <td className="px-4 py-2 text-sm">{formatNumber(selectedLot.weightments.reduce((s, w) => s + parseFloat(w.grossWeight || 0), 0))}</td>
                            <td className="px-4 py-2 text-sm">{formatNumber(selectedLot.weightments.reduce((s, w) => s + parseFloat(w.tareWeight || 0), 0))}</td>
                            <td className="px-4 py-2 text-sm">{formatNumber(selectedLot.weightments.reduce((s, w) => s + parseFloat(w.baleWeight || 0), 0))}</td>
                            <td className="px-4 py-2 text-sm">₹{formatNumber(selectedLot.weightments.reduce((s, w) => s + parseFloat(w.baleValue || 0), 0), 2)}</td>
                            <td className="px-4 py-2 text-sm"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm">{formatDate(selectedLot.createdAt)}</p>
                    <p className="text-xs text-gray-500">{selectedLot.createdAt ? new Date(selectedLot.createdAt).toLocaleTimeString() : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm">{formatDate(selectedLot.updatedAt)}</p>
                    <p className="text-xs text-gray-500">{selectedLot.updatedAt ? new Date(selectedLot.updatedAt).toLocaleTimeString() : ''}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
                  <button onClick={() => { setShowViewModal(false); handleEdit(selectedLot.id); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit Lot</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ────────────────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Edit Inward Lot</h3>
                <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-500">✕</button>
              </div>

              <form onSubmit={handleUpdateSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inward Number</label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      {formData.inwardNo || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lot No.</label>
                    <input type="text" name="lotNo" value={formData.lotNo} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lot Date *</label>
                    <input type="date" name="lotDate" value={formData.lotDate} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required />
                  </div>
                </div>

                {/* Read-only sections (purchase, party, tax, per qty) */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ['Supplier', formData.supplier],
                      ['Broker', formData.broker],
                      ['Variety', formData.variety],
                      ['Mixing', formData.mixingGroup],
                      ['Station', formData.station],
                      ['Company Broker', formData.companyBroker || 'NONE'],
                      ['Rate Type', formData.rateType],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <label className="block text-xs text-gray-500">{label}</label>
                        <div className="font-medium">{val || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Party Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ['Bill No.', formData.billNo],
                      ['Bill Date', formatDate(formData.billDate)],
                      ['Lot No.', formData.lotNoParty],
                      ['Lorry No.', formData.lorryNo],
                      ['Date', formatDate(formData.date)],
                      ['Candy Rate', `₹${formData.candyRate || 'N/A'}`],
                      ['P. Mark', formData.pMark || '-'],
                      ['Press Running No.', formData.pressRunningNo || '-'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <label className="block text-xs text-gray-500">{label}</label>
                        <div className="font-medium">{val || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ['GST %', `${formData.gst || '0'}%`],
                      ['SGST %', `${formData.sgst || '0'}%`],
                      ['CGST %', `${formData.cgst || '0'}%`],
                      ['IGST %', `${formData.igst || '0'}%`],
                      ['SGST Amt', `₹${formData.sgstAmount || '0'}`],
                      ['CGST Amt', `₹${formData.cgstAmount || '0'}`],
                      ['IGST Amt', `₹${formData.igstAmount || '0'}`],
                      ['Total Tax', `₹${formData.TaxRs || '0'}`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <label className="block text-xs text-gray-500">{label}</label>
                        <div className="font-medium">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Per Quantity Values</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="block text-xs text-gray-500">Gross Per Qty</label><div className="font-medium">{formData.grossPerQty || '0'} kg</div></div>
                    <div><label className="block text-xs text-gray-500">Tare Per Qty</label><div className="font-medium">{formData.tarePerQty || '0'} kg</div></div>
                    <div><label className="block text-xs text-gray-500">Freight Per Qty</label><div className="font-medium">₹{formData.freightPerQty || '0'}</div></div>
                  </div>
                </div>

                {renderLotDetailsInputs(true)}
                {renderCalculatedValues()}

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="button" onClick={handleOpenWeightment} disabled={!formData.qty}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
                    Weighment
                  </button>
                  <button type="submit"
                    disabled={submitting || !formData.godownId || !formData.qty || weightments.length === 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
                    {submitting ? 'Updating...' : 'Update Lot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InwardLotPage;
