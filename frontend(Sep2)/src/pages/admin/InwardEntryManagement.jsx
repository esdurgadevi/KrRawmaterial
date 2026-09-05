// frontend/src/pages/admin/transaction-cotton/InwardEntryManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import inwardEntryService from '../../services/admin1/transaction-cotton/inwardEntryService';
import purchaseOrderService from '../../services/admin1/transaction-cotton/purchaseOrderService';
import godownService from '../../services/admin1/master/godownService';

const InwardEntryManagement = () => {
  // States
  const [inwardEntries, setInwardEntries] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [godowns, setGodowns] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [purchaseOrderLoading, setPurchaseOrderLoading] = useState(false);
  const [godownLoading, setGodownLoading] = useState(false);
  const [inwardNoLoading, setInwardNoLoading] = useState(false);
  const [fetchingOrderDetails, setFetchingOrderDetails] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  
  // Form state - aligned with database model
  const [formData, setFormData] = useState({
    inwardNo: '',
    inwardDate: new Date().toISOString().split('T')[0],
    type: '', // Changed from 'Upcountry' to ''
    
    // Purchase Order details (from selection)
    purchaseOrderId: '',
    purchaseOrderNo: '',
    
    // Related data from purchase order (read-only)
    supplier: '',
    broker: '',
    variety: '',
    mixingGroup: '',
    station: '',
    purchaseCandyRate: '',
    purchaseQuantity: '',
    
    // Payment details
    lcNo: '',
    paymentDays: '',
    paymentDate: '',
    govtForm: '',
    
    // Document details
    billNo: '',
    billDate: '',
    lotNo: '',
    lorryNo: '',
    date: '',
    
    // Rate and charges
    candyRate: '',
    pMark: '',
    pressRunningNo: '',
    commisType: '',
    commisValue: '',
    
    // Quantity and weight
    Qty: '',
    grossWeight: '',
    tareWeight: '',
    nettWeight: '',
    
    // Freight and charges
    freight: '',
    cooly: '',
    bale: '',
    
    // Tax percentages (editable for Port/Polyster)
    gst: '',
    sgst: '',
    cgst: '',
    igst: '',
    
    // Tax amounts (calculated)
    sgstAmount: '',
    cgstAmount: '',
    igstAmount: '',
    Tax: '',
    TaxRs: '',
    
    // Other
    permitNo: '',
    comm: '',
    remarks: '',
    
    // Godown
    godownId: '',
    godownName: ''
  });

  // Autocomplete states
  const [showPurchaseOrderDropdown, setShowPurchaseOrderDropdown] = useState(false);
  const [showGodownDropdown, setShowGodownDropdown] = useState(false);
  
  // Search states
  const [purchaseOrderSearch, setPurchaseOrderSearch] = useState('');
  const [godownSearch, setGodownSearch] = useState('');
  
  // Refs for closing dropdowns
  const purchaseOrderRef = useRef(null);
  const godownRef = useRef(null);

  // Tax rates configuration for different types
  const taxRates = {
    Upcountry: {
      sgst: 0,
      cgst: 0,
      igst: 5,
      gst: 5
    },
    Fought: {
      sgst: 2.5,
      cgst: 2.5,
      igst: 0,
      gst: 5
    },
    Port: {
      sgst: '',
      cgst: '',
      igst: '',
      gst: ''
    },
    Polyster: {
      sgst: '',
      cgst: '',
      igst: '',
      gst: ''
    }
  };

  // Apply tax rates based on type selection
  useEffect(() => {
    if (formData.type && taxRates[formData.type]) {
      const rates = taxRates[formData.type];
      
      // For Port and Polyster, clear tax fields (user will enter)
      if (formData.type === 'Port' || formData.type === 'Polyster') {
        setFormData(prev => ({
          ...prev,
          sgst: '',
          cgst: '',
          igst: '',
          gst: '',
          sgstAmount: '',
          cgstAmount: '',
          igstAmount: '',
          Tax: '',
          TaxRs: ''
        }));
      } else if (formData.type === 'Upcountry' || formData.type === 'Fought') {
        // For Upcountry and Fought, set fixed rates
        setFormData(prev => ({
          ...prev,
          sgst: rates.sgst,
          cgst: rates.cgst,
          igst: rates.igst,
          gst: rates.gst
        }));
        
        // Calculate tax amounts if candyRate exists
        if (formData.candyRate) {
          calculateTaxAmounts(formData.candyRate, rates.sgst, rates.cgst, rates.igst, rates.gst);
        }
      }
    }
  }, [formData.type]);

  // Calculate payment date when inwardDate or paymentDays changes
  useEffect(() => {
    if (formData.inwardDate && formData.paymentDays) {
      const inwardDate = new Date(formData.inwardDate);
      const days = parseInt(formData.paymentDays);
      
      if (!isNaN(days) && days > 0) {
        const paymentDate = new Date(inwardDate);
        paymentDate.setDate(inwardDate.getDate() + days);
        
        const formattedDate = paymentDate.toISOString().split('T')[0];
        
        if (formattedDate !== formData.paymentDate) {
          setFormData(prev => ({
            ...prev,
            paymentDate: formattedDate
          }));
        }
      }
    }
  }, [formData.inwardDate, formData.paymentDays]);

  // Calculate nett weight when gross or tare changes
  useEffect(() => {
    const gross = parseFloat(formData.grossWeight) || 0;
    const tare = parseFloat(formData.tareWeight) || 0;
    
    if (gross > 0 || tare > 0) {
      const nett = gross - tare;
      setFormData(prev => ({
        ...prev,
        nettWeight: nett > 0 ? nett.toFixed(3) : '0.000'
      }));
    }
  }, [formData.grossWeight, formData.tareWeight]);

  // Calculate tax amounts when relevant fields change
  const calculateTaxAmounts = (candyRate, sgst, cgst, igst, gst) => {
    const rate = parseFloat(candyRate) || 0;
    const sgstRate = parseFloat(sgst) || 0;
    const cgstRate = parseFloat(cgst) || 0;
    const igstRate = parseFloat(igst) || 0;
    const gstRate = parseFloat(gst) || 0;
    
    const sgstAmt = rate * (sgstRate / 100);
    const cgstAmt = rate * (cgstRate / 100);
    const igstAmt = rate * (igstRate / 100);
    
    // Total GST amount (sum of applicable taxes)
    const totalGstAmt = sgstAmt + cgstAmt + igstAmt;
    
    setFormData(prev => ({
      ...prev,
      sgstAmount: sgstAmt.toFixed(2),
      cgstAmount: cgstAmt.toFixed(2),
      igstAmount: igstAmt.toFixed(2),
      Tax: gstRate.toFixed(2),
      TaxRs: totalGstAmt.toFixed(2)
    }));
  };

  // Handle tax field changes for Port/Polyster
  useEffect(() => {
    if ((formData.type === 'Port' || formData.type === 'Polyster') && 
        formData.candyRate && 
        (formData.sgst || formData.cgst || formData.igst || formData.gst)) {
      
      const sgst = formData.sgst || 0;
      const cgst = formData.cgst || 0;
      const igst = formData.igst || 0;
      const gst = parseFloat(sgst) + parseFloat(cgst) + parseFloat(igst);
      
      calculateTaxAmounts(formData.candyRate, sgst, cgst, igst, gst);
    }
  }, [formData.candyRate, formData.sgst, formData.cgst, formData.igst, formData.type]);

  // Load all data on component mount
  useEffect(() => {
    fetchInwardEntries();
    fetchPurchaseOrders();
    fetchGodowns();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const refs = [purchaseOrderRef, godownRef];
      
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target)) {
          switch(ref) {
            case purchaseOrderRef: setShowPurchaseOrderDropdown(false); break;
            case godownRef: setShowGodownDropdown(false); break;
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch functions
  const fetchInwardEntries = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await inwardEntryService.getAll();
      // Handle the response structure from your API
      const entriesData = response?.inwardEntries || (Array.isArray(response) ? response : []);
      setInwardEntries(entriesData);
    } catch (err) {
      setError(err.message || 'Failed to load inward entries');
      setInwardEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    setPurchaseOrderLoading(true);
    try {
      const response = await purchaseOrderService.getAll();
      const ordersData = Array.isArray(response) ? response : [];
      setPurchaseOrders(ordersData);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setPurchaseOrderLoading(false);
    }
  };

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

  // Fetch next inward number from API
  const fetchNextInwardNumber = async () => {
    try {
      setInwardNoLoading(true);
      const response = await inwardEntryService.getNextInwardNo();
      setFormData(prev => ({
        ...prev,
        inwardNo: response || ''
      }));
    } catch (err) {
      console.error('Error fetching next inward number:', err);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, '0');
      const defaultInwardNo = `GI/${currentYear}-${nextYear}/0001`;
      
      setFormData(prev => ({
        ...prev,
        inwardNo: defaultInwardNo
      }));
      
      setError('Could not fetch next inward number. Using default pattern.');
    } finally {
      setInwardNoLoading(false);
    }
  };

  // Handle purchase order selection - using getById to fetch complete details
  const handlePurchaseOrderSelect = async (orderId) => {
    try {
      setFetchingOrderDetails(true);
      
      // Fetch complete purchase order details by ID
      const response = await purchaseOrderService.getById(orderId);
      const order = response.purchaseOrder || response; // Handle different response structures
      
      setFormData(prev => ({
        ...prev,
        purchaseOrderId: order.id,
        purchaseOrderNo: order.orderNo || '',
        supplier: order.supplier || '',
        broker: order.broker || '',
        variety: order.variety || '',
        mixingGroup: order.mixing || '',
        station: order.station || '',
        purchaseCandyRate: order.candyRate || '',
        purchaseQuantity: order.quantity || '',
        candyRate: order.candyRate || '' // Auto-populate candy rate
      }));
      
      setPurchaseOrderSearch(order.orderNo || '');
      setShowPurchaseOrderDropdown(false);
      
      // Calculate tax amounts if type is set and candyRate exists
      if (formData.type && order.candyRate) {
        const rates = taxRates[formData.type] || {};
        calculateTaxAmounts(order.candyRate, rates.sgst, rates.cgst, rates.igst, rates.gst);
      }
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      setError('Failed to load purchase order details');
    } finally {
      setFetchingOrderDetails(false);
    }
  };

  // Filter purchase orders based on search
  const filteredPurchaseOrders = purchaseOrders.filter(order => {
    if (!purchaseOrderSearch.trim()) return true;
    const searchLower = purchaseOrderSearch.toLowerCase();
    return (
      (order.orderNo && order.orderNo.toLowerCase().includes(searchLower)) ||
      (order.supplierName && order.supplierName.toLowerCase().includes(searchLower)) ||
      (order.varietyName && order.varietyName.toLowerCase().includes(searchLower))
    );
  });

  const filteredGodowns = godowns.filter(godown => {
    if (!godownSearch.trim()) return true;
    const searchLower = godownSearch.toLowerCase();
    return (
      (godown.godownName && godown.godownName.toLowerCase().includes(searchLower)) ||
      (godown.locationName && godown.locationName.toLowerCase().includes(searchLower))
    );
  });

  // Filter inward entries based on search
  const filteredEntries = (() => {
    const entriesArray = Array.isArray(inwardEntries) ? inwardEntries : [];
    
    return entriesArray.filter(entry => {
      if (!entry) return false;
      
      const inwardNo = entry.inwardNo || '';
      const purchaseOrderNo = entry.purchaseOrderNo || '';
      const supplier = entry.supplier || '';
      const variety = entry.variety || '';
      
      return searchTerm === '' || 
        inwardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variety.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Prevent inwardNo changes when creating new entry
    if (name === 'inwardNo' && !editingEntry) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'paymentDays' || name === 'candyRate' || name === 'commisValue' || 
               name === 'Qty' || name === 'freight' || name === 'cooly' || name === 'bale' ||
               name === 'grossWeight' || name === 'tareWeight' || name === 'nettWeight' || 
               name === 'comm' || name === 'sgst' || name === 'cgst' || name === 'igst' || name === 'gst')
                ? (value === '' ? '' : parseFloat(value) || 0)
                : value
    }));
  };

  // Handle godown selection
  const handleGodownSelect = (godown) => {
    setFormData(prev => ({
      ...prev,
      godownId: godown.id,
      godownName: godown.godownName
    }));
    setGodownSearch(godown.godownName);
    setShowGodownDropdown(false);
  };

  // Clear selection functions
  const clearPurchaseOrderSelection = () => {
    setFormData(prev => ({
      ...prev,
      purchaseOrderId: '',
      purchaseOrderNo: '',
      supplier: '',
      broker: '',
      variety: '',
      mixingGroup: '',
      station: '',
      purchaseCandyRate: '',
      purchaseQuantity: '',
      candyRate: ''
    }));
    setPurchaseOrderSearch('');
    setShowPurchaseOrderDropdown(false);
  };

  const clearGodownSelection = () => {
    setFormData(prev => ({
      ...prev,
      godownId: '',
      godownName: ''
    }));
    setGodownSearch('');
    setShowGodownDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.type) {
      setError('Please select a type');
      return;
    }

    if (!formData.inwardDate) {
      setError('Inward date is required');
      return;
    }

    if (!formData.purchaseOrderId) {
      setError('Please select a purchase order');
      return;
    }

    if (!formData.godownId) {
      setError('Please select a godown');
      return;
    }

    if (!formData.Qty || parseFloat(formData.Qty) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    try {
      // Calculate tax amounts before submission
      const sgst = parseFloat(formData.sgst) || 0;
      const cgst = parseFloat(formData.cgst) || 0;
      const igst = parseFloat(formData.igst) || 0;
      const candyRate = parseFloat(formData.candyRate) || 0;
      
      const sgstAmount = candyRate * (sgst / 100);
      const cgstAmount = candyRate * (cgst / 100);
      const igstAmount = candyRate * (igst / 100);
      const totalTaxAmount = sgstAmount + cgstAmount + igstAmount;
      const totalTaxPercent = sgst + cgst + igst;

      // Prepare payload according to model
      const payload = {
        inwardNo: formData.inwardNo.trim(),
        inwardDate: formData.inwardDate,
        type: formData.type,
        
        purchaseOrderId: parseInt(formData.purchaseOrderId, 10),
        
        lcNo: formData.lcNo || null,
        paymentDays: formData.paymentDays ? parseInt(formData.paymentDays, 10) : null,
        paymentDate: formData.paymentDate || null,
        govtForm: formData.govtForm || null,
        
        billNo: formData.billNo || null,
        billDate: formData.billDate || null,
        lotNo: formData.lotNo || null,
        lorryNo: formData.lorryNo || null,
        date: formData.date || null,
        
        candyRate: candyRate || null,
        pMark: formData.pMark || null,
        pressRunningNo: formData.pressRunningNo || null,
        commisType: formData.commisType || null,
        commisValue: formData.commisValue ? parseFloat(formData.commisValue) : null,
        
        Qty: parseInt(formData.Qty) || null,
        grossWeight: formData.grossWeight ? parseFloat(formData.grossWeight) : null,
        tareWeight: formData.tareWeight ? parseFloat(formData.tareWeight) : null,
        nettWeight: formData.nettWeight ? parseFloat(formData.nettWeight) : null,
        
        freight: formData.freight ? parseFloat(formData.freight) : null,
        cooly: formData.cooly ? parseFloat(formData.cooly) : null,
        bale: formData.bale ? parseFloat(formData.bale) : null,
        
        gst: totalTaxPercent || null,
        sgst: sgst || null,
        cgst: cgst || null,
        igst: igst || null,
        
        sgstAmount: sgstAmount || null,
        cgstAmount: cgstAmount || null,
        igstAmount: igstAmount || null,
        
        Tax: totalTaxPercent || null,
        TaxRs: totalTaxAmount || null,
        
        permitNo: formData.permitNo || null,
        comm: formData.comm ? parseFloat(formData.comm) : null,
        remarks: formData.remarks || null,
        
        godownId: parseInt(formData.godownId, 10)
      };
      console.log(payload);
      
      if (editingEntry) {
        // Update existing entry
        await inwardEntryService.update(editingEntry.id, payload);
        setSuccess('Inward entry updated successfully!');
      } else {
        // Create new entry
        await inwardEntryService.create(payload);
        setSuccess('Inward entry created successfully!');
      }
      
      // Refresh entries list
      fetchInwardEntries();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      let errorMsg = 'Operation failed';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`Failed to save inward entry: ${errorMsg}`);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await inwardEntryService.getById(id);
      const entry = response.inwardEntry || response;
      
      setEditingEntry(entry);
      
      // Map API response to form data
      setFormData({
        inwardNo: entry.inwardNo || '',
        inwardDate: entry.inwardDate || new Date().toISOString().split('T')[0],
        type: entry.type || '',
        
        purchaseOrderId: entry.purchaseOrderId || '',
        purchaseOrderNo: entry.purchaseOrderNo || '',
        
        supplier: entry.supplier || '',
        broker: entry.broker || '',
        variety: entry.variety || '',
        mixingGroup: entry.mixingGroup || '',
        station: entry.station || '',
        purchaseCandyRate: entry.purchaseCandyRate || '',
        purchaseQuantity: entry.purchaseQuantity || '',
        
        lcNo: entry.lcNo || '',
        paymentDays: entry.paymentDays || '',
        paymentDate: entry.paymentDate || '',
        govtForm: entry.govtForm || '',
        
        billNo: entry.billNo || '',
        billDate: entry.billDate || '',
        lotNo: entry.lotNo || '',
        lorryNo: entry.lorryNo || '',
        date: entry.date || '',
        
        candyRate: entry.candyRate || '',
        pMark: entry.pMark || '',
        pressRunningNo: entry.pressRunningNo || '',
        commisType: entry.commisType || '',
        commisValue: entry.commisValue || '',
        
        Qty: entry.Qty || '',
        grossWeight: entry.grossWeight || '',
        tareWeight: entry.tareWeight || '',
        nettWeight: entry.nettWeight || '',
        
        freight: entry.freight || '',
        cooly: entry.cooly || '',
        bale: entry.bale || '',
        
        gst: entry.gst || '',
        sgst: entry.sgst || '',
        cgst: entry.cgst || '',
        igst: entry.igst || '',
        
        sgstAmount: entry.sgstAmount || '',
        cgstAmount: entry.cgstAmount || '',
        igstAmount: entry.igstAmount || '',
        Tax: entry.Tax || '',
        TaxRs: entry.TaxRs || '',
        
        permitNo: entry.permitNo || '',
        comm: entry.comm || '',
        remarks: entry.remarks || '',
        
        godownId: entry.godownId || '',
        godownName: entry.godownName || ''
      });
      
      setPurchaseOrderSearch(entry.purchaseOrderNo || '');
      setGodownSearch(entry.godownName || '');
      
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching entry details:', error);
      setError('Failed to load entry details for editing');
    }
  };

  const handleView = async (id) => {
    try {
      const response = await inwardEntryService.getById(id);
      setViewingEntry(response.inwardEntry || response);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching entry details:', error);
      setError('Failed to load entry details');
    }
  };

  const handleDelete = async (id, inwardNo) => {
    if (!window.confirm(`Are you sure you want to delete inward entry "${inwardNo}"?`)) {
      return;
    }

    try {
      await inwardEntryService.delete(id);
      setSuccess('Inward entry deleted successfully!');
      fetchInwardEntries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete inward entry');
    }
  };

  const resetForm = () => {
    setFormData({
      inwardNo: '',
      inwardDate: new Date().toISOString().split('T')[0],
      type: '', // Changed from 'Upcountry' to ''
      
      purchaseOrderId: '',
      purchaseOrderNo: '',
      
      supplier: '',
      broker: '',
      variety: '',
      mixingGroup: '',
      station: '',
      purchaseCandyRate: '',
      purchaseQuantity: '',
      
      lcNo: '',
      paymentDays: '',
      paymentDate: '',
      govtForm: '',
      
      billNo: '',
      billDate: '',
      lotNo: '',
      lorryNo: '',
      date: '',
      
      candyRate: '',
      pMark: '',
      pressRunningNo: '',
      commisType: '',
      commisValue: '',
      
      Qty: '',
      grossWeight: '',
      tareWeight: '',
      nettWeight: '',
      
      freight: '',
      cooly: '',
      bale: '',
      
      gst: '',
      sgst: '',
      cgst: '',
      igst: '',
      
      sgstAmount: '',
      cgstAmount: '',
      igstAmount: '',
      Tax: '',
      TaxRs: '',
      
      permitNo: '',
      comm: '',
      remarks: '',
      
      godownId: '',
      godownName: ''
    });
    
    setPurchaseOrderSearch('');
    setGodownSearch('');
    setShowPurchaseOrderDropdown(false);
    setShowGodownDropdown(false);
    setEditingEntry(null);
    setViewingEntry(null);
  };

  const openCreateModal = () => {
    resetForm();
    fetchNextInwardNumber();
    setShowModal(true);
  };

  const exportEntries = async () => {
    try {
      const headers = [
        'Inward No', 'Date', 'Type', 'PO No', 'Supplier', 'Variety', 
        'Qty', 'Gross Wt', 'Nett Wt', 'Godown', 'Bill No', 'Lorry No'
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," +
        headers.join(',') + '\n' +
        filteredEntries.map(entry => {
          return [
            `"${entry.inwardNo || ''}"`,
            `"${entry.inwardDate || ''}"`,
            `"${entry.type || ''}"`,
            `"${entry.purchaseOrderNo || ''}"`,
            `"${entry.supplier || ''}"`,
            `"${entry.variety || ''}"`,
            entry.Qty || '',
            entry.grossWeight || '',
            entry.nettWeight || '',
            `"${entry.godownName || ''}"`,
            `"${entry.billNo || ''}"`,
            `"${entry.lorryNo || ''}"`
          ].join(',');
        }).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inward-entries-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Inward entries exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export inward entries');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTaxDescription = () => {
    switch(formData.type) {
      case 'Upcountry':
        return "IGST 5% (Upcountry Transaction)";
      case 'Fought':
        return "SGST 2.5% + CGST 2.5% (Fought Transaction)";
      case 'Port':
        return "Enter tax percentages manually";
      case 'Polyster':
        return "Enter tax percentages manually";
      default:
        return "Select a type to see tax details";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Gate Inward Management</h1>
            <p className="text-gray-600">Add, modify and manage inward entry details</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Create New Inward
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">⚠️</span>
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">✓</span>
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by inward number, PO number, supplier, or variety..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={exportEntries}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchInwardEntries();
                fetchPurchaseOrders();
                fetchGodowns();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Inward Entries Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Inward Entries ({filteredEntries.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredEntries.length} of {inwardEntries.length} entries
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading inward entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">🚚</span>
            <p className="text-gray-600 mb-2">No inward entries found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">Try adjusting your search</p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first inward entry
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    INWARD DETAILS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SUPPLIER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QUANTITY & WEIGHT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    INWARD DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {entry.inwardNo}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            PO: {entry.purchaseOrderNo || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {entry.supplier || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          Qty: {entry.noOfBales || 0} bales
                        </div>
                        <div className="text-sm text-gray-600">
                          Nett: {entry.nettWeight ? parseFloat(entry.nettWeight).toFixed(3) : 'N/A'} kg
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(entry.inwardDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(entry.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(entry.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.inwardNo)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                        >
                          <span className="mr-1">🗑️</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Inward Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingEntry ? 'Edit Inward Entry' : 'Create New Inward Entry'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Inward Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Inward Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Inward Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Inward Number {!editingEntry && '(Auto-generated)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                            {inwardNoLoading ? (
                              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                                <span className="w-4 h-4 animate-spin inline-block mr-2 text-gray-400">↻</span>
                                <span className="text-gray-500">Generating inward number...</span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                name="inwardNo"
                                value={formData.inwardNo}
                                onChange={handleInputChange}
                                required
                                readOnly={!editingEntry}
                                className={`w-full pl-10 pr-4 py-2 border ${!editingEntry ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                placeholder={editingEntry ? "Edit inward number" : "Auto-generated"}
                              />
                            )}
                          </div>
                        </div>

                        {/* Type - Updated with placeholder option */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type *
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="Upcountry">Upcountry</option>
                            <option value="Fought">Local</option>
                            <option value="Port">Import</option>
                            <option value="Polyster">Polyster</option>
                          </select>
                        </div>

                        {/* Purchase Order Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purchase Order *
                          </label>
                          <div className="relative" ref={purchaseOrderRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📋</span>
                            <input
                              type="text"
                              value={purchaseOrderSearch}
                              onChange={(e) => {
                                setPurchaseOrderSearch(e.target.value);
                                setShowPurchaseOrderDropdown(true);
                              }}
                              onFocus={() => setShowPurchaseOrderDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Search by order number..."
                              required
                            />
                            {formData.purchaseOrderId && (
                              <button
                                type="button"
                                onClick={clearPurchaseOrderSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Purchase Order Dropdown */}
                            {showPurchaseOrderDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {purchaseOrderLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading purchase orders...
                                  </div>
                                ) : filteredPurchaseOrders.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {purchaseOrderSearch ? 'No purchase orders found' : 'No purchase orders available'}
                                  </div>
                                ) : (
                                  filteredPurchaseOrders.map((order) => (
                                    <div
                                      key={order.id}
                                      onClick={() => handlePurchaseOrderSelect(order.id)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.purchaseOrderId === order.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{order.orderNo}</div>
                                          <div className="text-xs text-gray-500">
                                            Supplier: {order.supplierName || 'N/A'} | Variety: {order.varietyName || 'N/A'}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Qty: {order.quantity} | Rate: ₹{order.candyRate || 'N/A'}/candy
                                          </div>
                                        </div>
                                        {formData.purchaseOrderId === order.id && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Inward Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Inward Date *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="inwardDate"
                              value={formData.inwardDate}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* LC No */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            LC No.
                          </label>
                          <input
                            type="text"
                            name="lcNo"
                            value={formData.lcNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter LC number"
                          />
                        </div>

                        {/* Payment Days */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Days
                          </label>
                          <input
                            type="number"
                            name="paymentDays"
                            value={formData.paymentDays}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter payment days"
                          />
                        </div>

                        {/* Payment Date (Auto-calculated) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Date
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="paymentDate"
                              value={formData.paymentDate}
                              readOnly
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Auto-calculated: Inward Date + Payment Days
                          </p>
                        </div>

                        {/* Govt Form */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Govt Form
                          </label>
                          <input
                            type="text"
                            name="govtForm"
                            value={formData.govtForm}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter govt form"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Purchase Details (Read-only) */}
                    {formData.purchaseOrderId && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Purchase Order Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              PO Number
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.purchaseOrderNo || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Supplier
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.supplier || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Broker
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.broker || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Variety
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.variety || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Mixing Group
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.mixingGroup || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              Station
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.station || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              PO Candy Rate
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              ₹{formData.purchaseCandyRate || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">
                              PO Quantity
                            </label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300">
                              {formData.purchaseQuantity || 'N/A'} bales
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Godown Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Godown Details</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Godown *
                        </label>
                        <div className="relative" ref={godownRef}>
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🏢</span>
                          <input
                            type="text"
                            value={godownSearch}
                            onChange={(e) => {
                              setGodownSearch(e.target.value);
                              setShowGodownDropdown(true);
                            }}
                            onFocus={() => setShowGodownDropdown(true)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search godowns..."
                            required
                          />
                          {formData.godownId && (
                            <button
                              type="button"
                              onClick={clearGodownSelection}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          )}
                          
                          {/* Godown Dropdown */}
                          {showGodownDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {godownLoading ? (
                                <div className="p-3 text-center text-gray-500">
                                  <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                  Loading godowns...
                                </div>
                              ) : filteredGodowns.length === 0 ? (
                                <div className="p-3 text-center text-gray-500">
                                  {godownSearch ? 'No godowns found' : 'No godowns available'}
                                </div>
                              ) : (
                                filteredGodowns.map((godown) => (
                                  <div
                                    key={godown.id}
                                    onClick={() => handleGodownSelect(godown)}
                                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                      formData.godownId === godown.id ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium text-gray-900">{godown.godownName}</div>
                                        <div className="text-xs text-gray-500">
                                          Location: {godown.locationName} | Code: #{godown.code}
                                        </div>
                                      </div>
                                      {formData.godownId === godown.id && (
                                        <span className="w-4 h-4 text-blue-600">✓</span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity and Weight */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Quantity & Weight</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity (Bales) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📦</span>
                            <input
                              type="number"
                              name="Qty"
                              value={formData.Qty}
                              onChange={handleInputChange}
                              onWheel={(e) => e.target.blur()}
                              required
                              min="0"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter quantity"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gross Weight (kg)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                            <input
                              type="number"
                              name="grossWeight"
                              value={formData.grossWeight}
                              onChange={handleInputChange}
                              onWheel={(e) => e.target.blur()}
                              min="0"
                              step="0.001"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter gross weight"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tare Weight (kg)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                            <input
                              type="number"
                              name="tareWeight"
                              value={formData.tareWeight}
                              onChange={handleInputChange}
                              onWheel={(e) => e.target.blur()}
                              min="0"
                              step="0.001"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter tare weight"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nett Weight (kg)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                            <input
                              type="number"
                              name="nettWeight"
                              value={formData.nettWeight}
                              readOnly
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                              placeholder="Auto-calculated"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Auto-calculated: Gross - Tare
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Document Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Document Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bill No.
                          </label>
                          <input
                            type="text"
                            name="billNo"
                            value={formData.billNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter bill number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bill Date
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="billDate"
                              value={formData.billDate}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lot No.
                          </label>
                          <input
                            type="text"
                            name="lotNo"
                            value={formData.lotNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter lot number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lorry No.
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🚚</span>
                            <input
                              type="text"
                              name="lorryNo"
                              value={formData.lorryNo}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter lorry number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Candy Rate (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                            <input
                              type="number"
                              name="candyRate"
                              value={formData.candyRate}
                              onChange={handleInputChange}
                              onWheel={(e) => e.target.blur()}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter candy rate"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            P. Mark
                          </label>
                          <input
                            type="text"
                            name="pMark"
                            value={formData.pMark}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter P mark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Press Running No.
                          </label>
                          <input
                            type="text"
                            name="pressRunningNo"
                            value={formData.pressRunningNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter press running number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commis. Type
                          </label>
                          <input
                            type="text"
                            name="commisType"
                            value={formData.commisType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter commission type"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commis. Value
                          </label>
                          <input
                            type="number"
                            name="commisValue"
                            value={formData.commisValue}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter commission value"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Freight and Charges */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Freight & Charges</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Freight
                          </label>
                          <input
                            type="number"
                            name="freight"
                            value={formData.freight}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter freight"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cooly
                          </label>
                          <input
                            type="number"
                            name="cooly"
                            value={formData.cooly}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter cooly"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bale
                          </label>
                          <input
                            type="number"
                            name="bale"
                            value={formData.bale}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter bale"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tax Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Tax Details</h4>
                        <div className="text-sm font-medium text-blue-600">
                          {getTaxDescription()}
                        </div>
                      </div>
                      
                      {formData.type === '' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-700">
                          Please select a type to configure tax details
                        </div>
                      )}
                      
                      {(formData.type === 'Port' || formData.type === 'Polyster') && formData.type !== '' && (
                        // Editable tax fields for Port/Polyster
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                SGST %
                              </label>
                              <input
                                type="number"
                                name="sgst"
                                value={formData.sgst}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter SGST %"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                CGST %
                              </label>
                              <input
                                type="number"
                                name="cgst"
                                value={formData.cgst}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter CGST %"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                IGST %
                              </label>
                              <input
                                type="number"
                                name="igst"
                                value={formData.igst}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter IGST %"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                SGST Amount
                              </label>
                              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                ₹{parseFloat(formData.sgstAmount || 0).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                CGST Amount
                              </label>
                              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                ₹{parseFloat(formData.cgstAmount || 0).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                IGST Amount
                              </label>
                              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                ₹{parseFloat(formData.igstAmount || 0).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total Tax (₹)
                              </label>
                              <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg font-semibold">
                                ₹{parseFloat(formData.TaxRs || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {(formData.type === 'Upcountry' || formData.type === 'Fought') && formData.type !== '' && (
                        // Read-only tax fields for Upcountry/Fought
                        <div className="space-y-4">
                          {formData.type === 'Fought' && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SGST %
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                    <input
                                      type="number"
                                      value={formData.sgst}
                                      readOnly
                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SGST Amount
                                  </label>
                                  <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                    ₹{parseFloat(formData.sgstAmount || 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CGST %
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                    <input
                                      type="number"
                                      value={formData.cgst}
                                      readOnly
                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CGST Amount
                                  </label>
                                  <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                    ₹{parseFloat(formData.cgstAmount || 0).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          
                          {formData.type === 'Upcountry' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  IGST %
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                  <input
                                    type="number"
                                    value={formData.igst}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  IGST Amount
                                </label>
                                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                  ₹{parseFloat(formData.igstAmount || 0).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm font-medium text-blue-800">
                              Total Tax: ₹{parseFloat(formData.TaxRs || 0).toFixed(2)} ({formData.Tax || 0}%)
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Other Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Other Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Permit No.
                          </label>
                          <input
                            type="text"
                            name="permitNo"
                            value={formData.permitNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter permit number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commission
                          </label>
                          <input
                            type="number"
                            name="comm"
                            value={formData.comm}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter commission"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Remarks</h4>
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add any remarks..."
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={!formData.type || !formData.inwardNo || !formData.inwardDate || !formData.purchaseOrderId || 
                             !formData.godownId || !formData.Qty}
                  >
                    {editingEntry ? 'Update Inward' : 'Create Inward'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Inward Entry Details Modal */}
      {showViewModal && viewingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Inward Entry Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Entry Details */}
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">#</span>
                      <h4 className="text-2xl font-bold text-gray-900">{viewingEntry.inwardNo}</h4>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">📋</span>
                        <span className="text-sm text-gray-600">PO: {viewingEntry.purchaseOrderNo || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">📅</span>
                        <span className="text-sm text-gray-600">Date: {formatDate(viewingEntry.inwardDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      viewingEntry.type === 'Upcountry' ? 'bg-green-100 text-green-800' : 
                      viewingEntry.type === 'Fought' ? 'bg-blue-100 text-blue-800' :
                      viewingEntry.type === 'Port' ? 'bg-purple-100 text-purple-800' :
                      viewingEntry.type === 'Polyster' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewingEntry.type || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Purchase Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Purchase Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm text-gray-500">Supplier</div>
                          <div className="font-medium">{viewingEntry.supplier || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Broker</div>
                          <div className="font-medium">{viewingEntry.broker || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Variety</div>
                          <div className="font-medium">{viewingEntry.variety || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Mixing Group</div>
                          <div className="font-medium">{viewingEntry.mixingGroup || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Station</div>
                          <div className="font-medium">{viewingEntry.station || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Candy Rate</div>
                          <div className="font-medium">₹{viewingEntry.candyRate || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Godown Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Godown</h5>
                      <div className="font-medium">{viewingEntry.godownName || 'N/A'}</div>
                    </div>

                    {/* Quantity & Weight */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Quantity & Weight</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm text-gray-500">Quantity</div>
                          <div className="font-bold text-xl">{viewingEntry.Qty || 0} bales</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Gross Weight</div>
                          <div>{viewingEntry.grossWeight ? parseFloat(viewingEntry.grossWeight).toFixed(3) : 'N/A'} kg</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Tare Weight</div>
                          <div>{viewingEntry.tareWeight ? parseFloat(viewingEntry.tareWeight).toFixed(3) : 'N/A'} kg</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Nett Weight</div>
                          <div className="font-semibold">{viewingEntry.nettWeight ? parseFloat(viewingEntry.nettWeight).toFixed(3) : 'N/A'} kg</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    {(viewingEntry.lcNo || viewingEntry.paymentDays || viewingEntry.paymentDate) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-lg font-semibold text-gray-800 mb-3">Payment Details</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {viewingEntry.lcNo && (
                            <div>
                              <div className="text-sm text-gray-500">LC No.</div>
                              <div>{viewingEntry.lcNo}</div>
                            </div>
                          )}
                          {viewingEntry.paymentDays && (
                            <div>
                              <div className="text-sm text-gray-500">Payment Days</div>
                              <div>{viewingEntry.paymentDays} days</div>
                            </div>
                          )}
                          {viewingEntry.paymentDate && (
                            <div>
                              <div className="text-sm text-gray-500">Payment Date</div>
                              <div>{formatDate(viewingEntry.paymentDate)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Document Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Document Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {viewingEntry.billNo && (
                          <>
                            <div>
                              <div className="text-sm text-gray-500">Bill No.</div>
                              <div>{viewingEntry.billNo}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Bill Date</div>
                              <div>{formatDate(viewingEntry.billDate)}</div>
                            </div>
                          </>
                        )}
                        {viewingEntry.lotNo && (
                          <div>
                            <div className="text-sm text-gray-500">Lot No.</div>
                            <div>{viewingEntry.lotNo}</div>
                          </div>
                        )}
                        {viewingEntry.lorryNo && (
                          <div>
                            <div className="text-sm text-gray-500">Lorry No.</div>
                            <div>{viewingEntry.lorryNo}</div>
                          </div>
                        )}
                        {viewingEntry.pMark && (
                          <div>
                            <div className="text-sm text-gray-500">P. Mark</div>
                            <div>{viewingEntry.pMark}</div>
                          </div>
                        )}
                        {viewingEntry.pressRunningNo && (
                          <div>
                            <div className="text-sm text-gray-500">Press Running No.</div>
                            <div>{viewingEntry.pressRunningNo}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Freight & Charges */}
                    {(viewingEntry.freight || viewingEntry.cooly || viewingEntry.bale) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-lg font-semibold text-gray-800 mb-3">Freight & Charges</h5>
                        <div className="grid grid-cols-3 gap-3">
                          {viewingEntry.freight && (
                            <div>
                              <div className="text-sm text-gray-500">Freight</div>
                              <div>₹{parseFloat(viewingEntry.freight).toFixed(2)}</div>
                            </div>
                          )}
                          {viewingEntry.cooly && (
                            <div>
                              <div className="text-sm text-gray-500">Cooly</div>
                              <div>₹{parseFloat(viewingEntry.cooly).toFixed(2)}</div>
                            </div>
                          )}
                          {viewingEntry.bale && (
                            <div>
                              <div className="text-sm text-gray-500">Bale</div>
                              <div>₹{parseFloat(viewingEntry.bale).toFixed(2)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tax Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Tax Details</h5>
                      <div className="space-y-3">
                        {viewingEntry.type === 'Upcountry' && (
                          <div>
                            <div className="text-sm text-gray-500">IGST</div>
                            <div className="font-medium">{viewingEntry.igst || 5}%</div>
                            <div className="text-sm">Amount: ₹{parseFloat(viewingEntry.igstAmount || 0).toFixed(2)}</div>
                          </div>
                        )}
                        
                        {viewingEntry.type === 'Fought' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-gray-500">SGST</div>
                              <div className="font-medium">{viewingEntry.sgst || 2.5}%</div>
                              <div className="text-sm">₹{parseFloat(viewingEntry.sgstAmount || 0).toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">CGST</div>
                              <div className="font-medium">{viewingEntry.cgst || 2.5}%</div>
                              <div className="text-sm">₹{parseFloat(viewingEntry.cgstAmount || 0).toFixed(2)}</div>
                            </div>
                          </div>
                        )}
                        
                        {(viewingEntry.type === 'Port' || viewingEntry.type === 'Polyster') && (
                          <div className="grid grid-cols-3 gap-2">
                            {viewingEntry.sgst > 0 && (
                              <div>
                                <div className="text-xs text-gray-500">SGST</div>
                                <div className="font-medium">{viewingEntry.sgst}%</div>
                                <div className="text-xs">₹{parseFloat(viewingEntry.sgstAmount || 0).toFixed(2)}</div>
                              </div>
                            )}
                            {viewingEntry.cgst > 0 && (
                              <div>
                                <div className="text-xs text-gray-500">CGST</div>
                                <div className="font-medium">{viewingEntry.cgst}%</div>
                                <div className="text-xs">₹{parseFloat(viewingEntry.cgstAmount || 0).toFixed(2)}</div>
                              </div>
                            )}
                            {viewingEntry.igst > 0 && (
                              <div>
                                <div className="text-xs text-gray-500">IGST</div>
                                <div className="font-medium">{viewingEntry.igst}%</div>
                                <div className="text-xs">₹{parseFloat(viewingEntry.igstAmount || 0).toFixed(2)}</div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="p-2 bg-blue-50 rounded mt-2">
                          <div className="text-sm font-medium text-blue-800">
                            Total Tax: ₹{parseFloat(viewingEntry.TaxRs || 0).toFixed(2)} ({viewingEntry.Tax || 0}%)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other Details */}
                    {(viewingEntry.permitNo || viewingEntry.comm) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-lg font-semibold text-gray-800 mb-3">Other Details</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {viewingEntry.permitNo && (
                            <div>
                              <div className="text-sm text-gray-500">Permit No.</div>
                              <div>{viewingEntry.permitNo}</div>
                            </div>
                          )}
                          {viewingEntry.comm && (
                            <div>
                              <div className="text-sm text-gray-500">Commission</div>
                              <div>₹{parseFloat(viewingEntry.comm).toFixed(2)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {viewingEntry.remarks && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-lg font-semibold text-gray-800 mb-3">Remarks</h5>
                        <div className="text-gray-700">{viewingEntry.remarks}</div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Timestamps</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm text-gray-500">Created</div>
                          <div className="text-sm">
                            {viewingEntry.createdAt ? new Date(viewingEntry.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingEntry.createdAt ? new Date(viewingEntry.createdAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Updated</div>
                          <div className="text-sm">
                            {viewingEntry.updatedAt ? new Date(viewingEntry.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingEntry.updatedAt ? new Date(viewingEntry.updatedAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingEntry.id);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Edit Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InwardEntryManagement;
