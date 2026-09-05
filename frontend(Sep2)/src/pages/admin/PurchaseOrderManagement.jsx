import React, { useState, useEffect, useRef } from 'react';
import purchaseOrderService from '../../services/admin1/transaction-cotton/purchaseOrderService';
import supplierService from '../../services/admin1/master/supplierService';
import brokerService from '../../services/admin1/master/brokerService';
import varietyService from '../../services/admin1/master/varietyService';
import mixingGroupService from '../../services/admin1/master/mixingGroupService';
import stationService from '../../services/admin1/master/stationService';
import companyBrokerService from '../../services/admin1/master/companyBrokerService';

const PurchaseOrderManagement = () => {
  // States
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [mixingGroups, setMixingGroups] = useState([]);
  const [stations, setStations] = useState([]);
  const [companyBrokers, setCompanyBrokers] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [varietyLoading, setVarietyLoading] = useState(false);
  const [mixingGroupLoading, setMixingGroupLoading] = useState(false);
  const [stationLoading, setStationLoading] = useState(false);
  const [companyBrokerLoading, setCompanyBrokerLoading] = useState(false);
  const [orderNoLoading, setOrderNoLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    orderNo: '',
    orderDate: new Date().toISOString().split('T')[0],
    
    supplierId: '',
    supplierName: '',
    brokerId: '',
    brokerName: '',
    varietyId: '',
    varietyName: '',
    mixingGroupId: '',
    mixingGroupName: '',
    stationId: '',
    stationName: '',
    
    expectedDeliveryDate: '',
    
    orderType: 'SPOT',
    packingType: 'Bale',
    
    quantity: '',
    
    candyRate: '',
    quintalRate: '',
    ratePerKg: '',
    
    selectedRateType: 'PER_KG',
    
    approxLotValue: '',
    
    paymentMode: '',
    currency: 'RUPEES',
    
    staple: '',
    moist: '',
    mic: '',
    str: '',
    rd: '',
    
    remarks: ''
  });

  // Autocomplete states
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const [showVarietyDropdown, setShowVarietyDropdown] = useState(false);
  const [showMixingGroupDropdown, setShowMixingGroupDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showCompanyBrokerDropdown, setShowCompanyBrokerDropdown] = useState(false);
  
  // Search states
  const [supplierSearch, setSupplierSearch] = useState('');
  const [brokerSearch, setBrokerSearch] = useState('');
  const [varietySearch, setVarietySearch] = useState('');
  const [mixingGroupSearch, setMixingGroupSearch] = useState('');
  const [stationSearch, setStationSearch] = useState('');
  const [companyBrokerSearch, setCompanyBrokerSearch] = useState('');
  
  // Refs for closing dropdowns
  const supplierRef = useRef(null);
  const brokerRef = useRef(null);
  const varietyRef = useRef(null);
  const mixingGroupRef = useRef(null);
  const stationRef = useRef(null);
  const companyBrokerRef = useRef(null);

  // Load all data on component mount
  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchBrokers();
    fetchVarieties();
    fetchMixingGroups();
    fetchStations();
    fetchCompanyBrokers();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const refs = [
        supplierRef, brokerRef, varietyRef, 
        mixingGroupRef, stationRef, companyBrokerRef
      ];
      
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target)) {
          switch(ref) {
            case supplierRef: setShowSupplierDropdown(false); break;
            case brokerRef: setShowBrokerDropdown(false); break;
            case varietyRef: setShowVarietyDropdown(false); break;
            case mixingGroupRef: setShowMixingGroupDropdown(false); break;
            case stationRef: setShowStationDropdown(false); break;
            case companyBrokerRef: setShowCompanyBrokerDropdown(false); break;
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Add this useEffect after your other useEffects
// Add this useEffect after your other useEffects
useEffect(() => {
  // Calculate rate per kg from candy rate (candy rate / 355.62)
  if (formData.candyRate && !isNaN(parseFloat(formData.candyRate))) {
    const calculatedRatePerKg = parseFloat(formData.candyRate) / 355.62;
    setFormData(prev => ({
      ...prev,
      ratePerKg: calculatedRatePerKg.toFixed(2),
      quintalRate: (calculatedRatePerKg * 100).toFixed(2)
    }));
  }
}, [formData.candyRate]);

// Update the quintal rate useEffect
useEffect(() => {
  // Calculate rate per kg from quintal rate (quintal rate / 100)
  if (formData.quintalRate && !isNaN(parseFloat(formData.quintalRate))) {
    const calculatedRatePerKg = parseFloat(formData.quintalRate) / 100;
    setFormData(prev => ({
      ...prev,
      ratePerKg: calculatedRatePerKg.toFixed(2)
    }));
  }
}, [formData.quintalRate]);

// Update the rate per kg useEffect
useEffect(() => {
  // Calculate quintal rate from rate per kg (rate per kg * 100)
  if (formData.ratePerKg && !isNaN(parseFloat(formData.ratePerKg))) {
    const calculatedQuintalRate = parseFloat(formData.ratePerKg) * 100;
    setFormData(prev => ({
      ...prev,
      quintalRate: calculatedQuintalRate.toFixed(2)
    }));
  }
}, [formData.ratePerKg]);

// Update the approximate lot value calculation
useEffect(() => {
  // Calculate approximate lot value when quantity or rate per kg changes
  const calculateApproxLotValue = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const ratePerKg = parseFloat(formData.ratePerKg) || 0;
    return quantity * ratePerKg;
  };
  
  const approxValue = calculateApproxLotValue();
  if (!isNaN(approxValue) && approxValue !== formData.approxLotValue) {
    setFormData(prev => ({
      ...prev,
      approxLotValue: approxValue.toFixed(2)
    }));
  }
}, [formData.quantity, formData.ratePerKg]);
  // Fetch functions
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await purchaseOrderService.getAll();
      const ordersData = Array.isArray(response) ? response : [];
      setPurchaseOrders(ordersData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load purchase orders');
      setPurchaseOrders([]);
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    setSupplierLoading(true);
    try {
      const response = await supplierService.getAll();
      const suppliersData = Array.isArray(response) ? response : [];
      setSuppliers(suppliersData);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setSupplierLoading(false);
    }
  };

  const fetchBrokers = async () => {
    setBrokerLoading(true);
    try {
      const response = await brokerService.getAll();
      const brokersData = Array.isArray(response) ? response : [];
      setBrokers(brokersData);
    } catch (err) {
      console.error('Failed to load brokers:', err);
    } finally {
      setBrokerLoading(false);
    }
  };

  const fetchVarieties = async () => {
    setVarietyLoading(true);
    try {
      const response = await varietyService.getAll();
      const varietiesData = Array.isArray(response) ? response : [];
      setVarieties(varietiesData);
    } catch (err) {
      console.error('Failed to load varieties:', err);
    } finally {
      setVarietyLoading(false);
    }
  };

  const fetchMixingGroups = async () => {
    setMixingGroupLoading(true);
    try {
      const response = await mixingGroupService.getAll();
      const groupsData = Array.isArray(response) ? response : [];
      setMixingGroups(groupsData);
    } catch (err) {
      console.error('Failed to load mixing groups:', err);
    } finally {
      setMixingGroupLoading(false);
    }
  };

  const fetchStations = async () => {
    setStationLoading(true);
    try {
      const response = await stationService.getAll();
      const stationsData = Array.isArray(response) ? response : [];
      setStations(stationsData);
    } catch (err) {
      console.error('Failed to load stations:', err);
    } finally {
      setStationLoading(false);
    }
  };

  const fetchCompanyBrokers = async () => {
    setCompanyBrokerLoading(true);
    try {
      const response = await companyBrokerService.getAll();
      const brokersData = Array.isArray(response) ? response : [];
      setCompanyBrokers(brokersData);
    } catch (err) {
      console.error('Failed to load company brokers:', err);
    } finally {
      setCompanyBrokerLoading(false);
    }
  };

  // Fetch next order number from API
  const fetchNextOrderNumber = async () => {
    try {
      setOrderNoLoading(true);
      const response = await fetch('https://krexports.org/krerm/purchase-orders/next-order-no', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch next order number');
      }
      
      const data = await response.json();
      console.log(data);
      setFormData(prev => ({
        ...prev,
        orderNo: data.nextOrderNo || ''
      }));
      
    } catch (err) {
      console.error('Error fetching next order number:', err);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, '0');
      const defaultOrderNo = `PO/${currentYear}-${nextYear}/0001`;
      
      setFormData(prev => ({
        ...prev,
        orderNo: defaultOrderNo
      }));
      
      setError('Could not fetch next order number. Using default pattern.');
    } finally {
      setOrderNoLoading(false);
    }
  };

  // Get names by ID
  const getSupplierName = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    return supplier ? supplier.accountName : 'Unknown Supplier';
  };

  const getBrokerName = (id) => {
    const broker = brokers.find(b => b.id === id);
    return broker ? broker.brokerName : 'Unknown Broker';
  };

  const getVarietyName = (id) => {
    const variety = varieties.find(v => v.id === id);
    return variety ? variety.variety : 'Unknown Variety';
  };

  const getMixingGroupName = (id) => {
    const group = mixingGroups.find(g => g.id === id);
    return group ? group.mixingName : 'Unknown Group';
  };

  const getStationName = (id) => {
    const station = stations.find(s => s.id === id);
    return station ? station.station : 'Unknown Station';
  };

  const getCompanyBrokerName = (id) => {
    const broker = companyBrokers.find(cb => cb.id === id);
    return broker ? broker.companyName : 'Unknown Company Broker';
  };

  // Filter based on search
  const filteredSuppliers = suppliers.filter(supplier => {
    if (!supplierSearch.trim()) return suppliers;
    const searchLower = supplierSearch.toLowerCase();
    return (
      (supplier.accountName && supplier.accountName.toLowerCase().includes(searchLower)) ||
      (supplier.code && supplier.code.toString().includes(searchLower)) ||
      (supplier.place && supplier.place.toLowerCase().includes(searchLower))
    );
  });

  const filteredBrokers = brokers.filter(broker => {
    if (!brokerSearch.trim()) return brokers;
    const searchLower = brokerSearch.toLowerCase();
    return (
      (broker.brokerName && broker.brokerName.toLowerCase().includes(searchLower)) ||
      (broker.brokerCode && broker.brokerCode.toString().includes(searchLower))
    );
  });

  const filteredVarieties = varieties.filter(variety => {
    if (!varietySearch.trim()) return varieties;
    const searchLower = varietySearch.toLowerCase();
    return (
      (variety.variety && variety.variety.toLowerCase().includes(searchLower)) ||
      (variety.code && variety.code.toString().includes(searchLower))
    );
  });

  const filteredMixingGroups = mixingGroups.filter(group => {
    if (!mixingGroupSearch.trim()) return mixingGroups;
    const searchLower = mixingGroupSearch.toLowerCase();
    return (
      (group.mixingName && group.mixingName.toLowerCase().includes(searchLower)) ||
      (group.mixingCode && group.mixingCode.toString().includes(searchLower))
    );
  });

  const filteredStations = stations.filter(station => {
    if (!stationSearch.trim()) return stations;
    const searchLower = stationSearch.toLowerCase();
    return (
      (station.station && station.station.toLowerCase().includes(searchLower)) ||
      (station.code && station.code.toString().includes(searchLower))
    );
  });


  // Filter purchase orders based on search
  const filteredOrders = (() => {
    const ordersArray = Array.isArray(purchaseOrders) ? purchaseOrders : [];
    
    return ordersArray.filter(order => {
      if (!order || typeof order !== 'object') return false;
      
      const orderNo = order.orderNo || '';
      const supplierName = getSupplierName(order.supplierId);
      const brokerName = order.brokerId ? getBrokerName(order.brokerId) : '';
      const varietyName = getVarietyName(order.varietyId);
      const mixingGroupName = getMixingGroupName(order.mixingGroupId);
      const stationName = getStationName(order.stationId);
      const companyBrokerName = order.companyBrokerId ? getCompanyBrokerName(order.companyBrokerId) : '';
      
      return searchTerm === '' || 
        orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brokerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        varietyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mixingGroupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyBrokerName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Prevent orderNo changes when creating new order (editingOrder is null)
  if (name === 'orderNo' && !editingOrder) {
    return; // Don't allow changes when creating
  }
  
  setFormData(prev => ({
    ...prev,
    [name]: name === 'quantity' || name === 'candyRate' || name === 'quintalRate' || 
            name === 'ratePerKg' || name === 'approxLotValue' ||  // <-- staple removed
            name === 'moist' || name === 'mic' || name === 'str' || name === 'rd'
      ? (value === '' ? '' : parseFloat(value) || '')
      : value
  }));
};

  // Handle selection functions
  const handleSupplierSelect = (supplier) => {
    setFormData(prev => ({
      ...prev,
      supplierId: supplier.id,
      supplierName: supplier.accountName
    }));
    setSupplierSearch(supplier.accountName);
    setShowSupplierDropdown(false);
  };

  const handleBrokerSelect = (broker) => {
    setFormData(prev => ({
      ...prev,
      brokerId: broker.id,
      brokerName: broker.brokerName
    }));
    setBrokerSearch(broker.brokerName);
    setShowBrokerDropdown(false);
  };

  const handleVarietySelect = (variety) => {
    setFormData(prev => ({
      ...prev,
      varietyId: variety.id,
      varietyName: variety.variety
    }));
    setVarietySearch(variety.variety);
    setShowVarietyDropdown(false);
  };

  const handleMixingGroupSelect = (group) => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: group.id,
      mixingGroupName: group.mixingName
    }));
    setMixingGroupSearch(group.mixingName);
    setShowMixingGroupDropdown(false);
  };

  const handleStationSelect = (station) => {
    setFormData(prev => ({
      ...prev,
      stationId: station.id,
      stationName: station.station
    }));
    setStationSearch(station.station);
    setShowStationDropdown(false);
  };


  // Clear selection functions
  const clearSupplierSelection = () => {
    setFormData(prev => ({
      ...prev,
      supplierId: '',
      supplierName: ''
    }));
    setSupplierSearch('');
    setShowSupplierDropdown(false);
  };

  const clearBrokerSelection = () => {
    setFormData(prev => ({
      ...prev,
      brokerId: '',
      brokerName: ''
    }));
    setBrokerSearch('');
    setShowBrokerDropdown(false);
  };

  const clearVarietySelection = () => {
    setFormData(prev => ({
      ...prev,
      varietyId: '',
      varietyName: ''
    }));
    setVarietySearch('');
    setShowVarietyDropdown(false);
  };

  const clearMixingGroupSelection = () => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: '',
      mixingGroupName: ''
    }));
    setMixingGroupSearch('');
    setShowMixingGroupDropdown(false);
  };

  const clearStationSelection = () => {
    setFormData(prev => ({
      ...prev,
      stationId: '',
      stationName: ''
    }));
    setStationSearch('');
    setShowStationDropdown(false);
  };

  // Handle rate calculation
  const handleRateTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      selectedRateType: type,
      candyRate: type !== 'CANDY' ? '' : prev.candyRate,
      quintalRate: type !== 'QUINTAL' ? '' : prev.quintalRate,
      ratePerKg: type !== 'PER_KG' ? '' : prev.ratePerKg
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.orderDate) {
      setError('Order date is required');
      return;
    }

    if (!formData.supplierId) {
      setError('Please select a supplier');
      return;
    }

    if (!formData.varietyId) {
      setError('Please select a variety');
      return;
    }

    if (!formData.mixingGroupId) {
      setError('Please select a mixing group');
      return;
    }

    if (!formData.stationId) {
      setError('Please select a station');
      return;
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    // Validate based on selected rate type
    // Validate based on selected rate type
switch(formData.selectedRateType) {
  case 'CANDY':
    if (!formData.candyRate || parseFloat(formData.candyRate) <= 0) {
      setError('Please enter a valid candy rate');
      return;
    }
    // Ensure rate per kg is calculated
    if (!formData.ratePerKg || parseFloat(formData.ratePerKg) <= 0) {
      setError('Please ensure rate per kg is calculated from candy rate');
      return;
    }
    break;
  case 'QUINTAL':
    if (!formData.quintalRate || parseFloat(formData.quintalRate) <= 0) {
      setError('Please enter a valid quintal rate');
      return;
    }
    // Ensure rate per kg is calculated
    if (!formData.ratePerKg || parseFloat(formData.ratePerKg) <= 0) {
      setError('Please ensure rate per kg is calculated from quintal rate');
      return;
    }
    break;
  case 'PER_KG':
    if (!formData.ratePerKg || parseFloat(formData.ratePerKg) <= 0) {
      setError('Please enter a valid rate per kg');
      return;
    }
    break;
  default:
    setError('Please select a rate type');
    return;
}

    try {
      // Prepare payload
      
      const payload = {
  orderNo: formData.orderNo ? formData.orderNo.trim() : "",
  orderDate: formData.orderDate,

  supplierId: Number(formData.supplierId),
  brokerId: formData.brokerId ? Number(formData.brokerId) : null,
  varietyId: Number(formData.varietyId),
  mixingGroupId: Number(formData.mixingGroupId),
  stationId: Number(formData.stationId),

  expectedDeliveryDate: formData.expectedDeliveryDate || null,

  orderType: formData.orderType,
  packingType: formData.packingType,

  quantity: Number(formData.quantity),

  candyRate: formData.candyRate !== undefined ? Number(formData.candyRate) : null,
  quintalRate: formData.quintalRate !== undefined ? Number(formData.quintalRate) : null,
  ratePerKg: formData.ratePerKg !== undefined ? Number(formData.ratePerKg) : null,

  selectedRateType: formData.selectedRateType,

  approxLotValue: formData.approxLotValue !== undefined ? Number(formData.approxLotValue) : null,

  paymentMode: formData.paymentMode || null,
  currency: formData.currency || "RUPEES",

  staple: formData.staple || null, 
  moist: formData.moist !== undefined ? Number(formData.moist) : null,
  mic: formData.mic !== undefined ? Number(formData.mic) : null,
  str: formData.str !== undefined ? Number(formData.str) : null,
  rd: formData.rd !== undefined ? Number(formData.rd) : null,

  remarks: formData.remarks || null,
};

      if (editingOrder) {
        // Update existing order
        await purchaseOrderService.update(editingOrder.id, payload);
        setSuccess('Purchase order updated successfully!');
      } else {
        // Create new order
        await purchaseOrderService.create(payload);
        setSuccess('Purchase order created successfully!');
      }
      
      // Refresh orders list
      fetchPurchaseOrders();
      
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
      
      setError(`Failed to save purchase order: ${errorMsg}`);
    }
  };

  const handleEdit = (order) => {
    if (!order || !order.id) {
      setError('Invalid purchase order data');
      return;
    }
    
    setEditingOrder(order);
    setFormData({
      orderNo: order.orderNo || '',
      orderDate: order.orderDate || new Date().toISOString().split('T')[0],
      
      supplierId: order.supplierId || '',
      supplierName: getSupplierName(order.supplierId),
      brokerId: order.brokerId || '',
      brokerName: order.brokerId ? getBrokerName(order.brokerId) : '',
      varietyId: order.varietyId || '',
      varietyName: getVarietyName(order.varietyId),
      mixingGroupId: order.mixingGroupId || '',
      mixingGroupName: getMixingGroupName(order.mixingGroupId),
      stationId: order.stationId || '',
      stationName: getStationName(order.stationId),
      companyBrokerId: order.companyBrokerId || '',
      companyBrokerName: order.companyBrokerId ? getCompanyBrokerName(order.companyBrokerId) : '',
      
      expectedDeliveryDate: order.expectedDeliveryDate || '',
      
      orderType: order.orderType || 'SPOT',
      packingType: order.packingType || 'Bale',
      
      quantity: order.quantity || '',
      
      candyRate: order.candyRate || '',
      quintalRate: order.quintalRate || '',
      ratePerKg: order.ratePerKg || '',
      
      selectedRateType: order.selectedRateType || 'PER_KG',
      
      approxLotValue: order.approxLotValue || '',
      
      paymentMode: order.paymentMode || '',
      currency: order.currency || 'RUPEES',
      
      staple: order.staple || '',
      moist: order.moist || '',
      mic: order.mic || '',
      str: order.str || '',
      rd: order.rd || '',
      
      remarks: order.remarks || ''
    });
    
    setSupplierSearch(getSupplierName(order.supplierId));
    setBrokerSearch(order.brokerId ? getBrokerName(order.brokerId) : '');
    setVarietySearch(getVarietyName(order.varietyId));
    setMixingGroupSearch(getMixingGroupName(order.mixingGroupId));
    setStationSearch(getStationName(order.stationId));
    setCompanyBrokerSearch(order.companyBrokerId ? getCompanyBrokerName(order.companyBrokerId) : '');
    
    setShowModal(true);
  };

  const handleView = (order) => {
    if (!order || !order.id) {
      setError('Invalid purchase order data');
      return;
    }
    
    setViewingOrder(order);
    setShowViewModal(true);
  };

  const handleDelete = async (id, orderNo) => {
    if (!id || !orderNo) {
      setError('Invalid purchase order data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete purchase order "${orderNo}"?`)) {
      return;
    }

    try {
      await purchaseOrderService.delete(id);
      setSuccess('Purchase order deleted successfully!');
      fetchPurchaseOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete purchase order');
    }
  };

  const resetForm = () => {
    setFormData({
      orderNo: '',
      orderDate: new Date().toISOString().split('T')[0],
      
      supplierId: '',
      supplierName: '',
      brokerId: '',
      brokerName: '',
      varietyId: '',
      varietyName: '',
      mixingGroupId: '',
      mixingGroupName: '',
      stationId: '',
      stationName: '',
      companyBrokerId: '',
      companyBrokerName: '',
      
      expectedDeliveryDate: '',
      
      orderType: 'SPOT',
      packingType: 'Bale',
      
      quantity: '',
      
      candyRate: '',
      quintalRate: '',
      ratePerKg: '',
      
      selectedRateType: 'PER_KG',
      
      approxLotValue: '',
      
      paymentMode: '',
      currency: 'RUPEES',
      
      staple: '',
      moist: '',
      mic: '',
      str: '',
      rd: '',
      
      remarks: ''
    });
    
    setSupplierSearch('');
    setBrokerSearch('');
    setVarietySearch('');
    setMixingGroupSearch('');
    setStationSearch('');
    setCompanyBrokerSearch('');
    
    setShowSupplierDropdown(false);
    setShowBrokerDropdown(false);
    setShowVarietyDropdown(false);
    setShowMixingGroupDropdown(false);
    setShowStationDropdown(false);
    setShowCompanyBrokerDropdown(false);
    
    setEditingOrder(null);
    setViewingOrder(null);
  };

  const openCreateModal = () => {
    resetForm();
    fetchNextOrderNumber(); // Fetch next order number
    setShowModal(true);
  };

  const exportOrders = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Order No,Order Date,Supplier,Variety,Mixing Group,Station,Quantity,Rate Type,Rate,Approx Lot Value,Order Type,Payment Mode,Created Date\n" +
        filteredOrders.map(order => {
          const supplierName = getSupplierName(order.supplierId);
          const varietyName = getVarietyName(order.varietyId);
          const mixingGroupName = getMixingGroupName(order.mixingGroupId);
          const stationName = getStationName(order.stationId);
          
          let rate = '';
          switch(order.selectedRateType) {
            case 'CANDY': rate = `₹${order.candyRate}/candy`; break;
            case 'QUINTAL': rate = `₹${order.quintalRate}/quintal`; break;
            case 'PER_KG': rate = `₹${order.ratePerKg}/kg`; break;
          }
          
          return `"${order.orderNo}","${order.orderDate}","${supplierName}","${varietyName}","${mixingGroupName}","${stationName}","${order.quantity}","${order.selectedRateType}","${rate}","${order.approxLotValue ? '₹' + order.approxLotValue : 'N/A'}","${order.orderType}","${order.paymentMode || 'N/A'}","${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}"`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Purchase orders exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export purchase orders');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Purchase Order Management</h1>
            <p className="text-gray-600">Create and manage purchase orders with suppliers, brokers, and specifications</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Create New Order
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
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by order number, supplier, variety, mixing group, or station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={exportOrders}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchPurchaseOrders();
                fetchSuppliers();
                fetchBrokers();
                fetchVarieties();
                fetchMixingGroups();
                fetchStations();
                fetchCompanyBrokers();
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

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Purchase Orders ({filteredOrders.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredOrders.length} of {purchaseOrders.length} orders
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading purchase orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">🛍️</span>
            <p className="text-gray-600 mb-2">No purchase orders found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first purchase order
              </button>
            )}
          </div>
        ) : (
          /* Orders Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ORDER DETAILS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SUPPLIER & BROKER
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SPECIFICATIONS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QUANTITY & RATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {order.orderNo}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(order.orderDate)}
                          </div>
                          <div className="text-xs mt-1">
                            <span className={`px-2 py-1 rounded-full ${order.orderType === 'SPOT' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {order.orderType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">🏢</span>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {getSupplierName(order.supplierId)}
                          </div>
                        </div>
                        {order.brokerId && (
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">👤</span>
                            <div className="text-sm text-gray-600 truncate">
                              {getBrokerName(order.brokerId)}
                            </div>
                          </div>
                        )}
                        {order.companyBrokerId && (
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">🚚</span>
                            <div className="text-sm text-gray-600 truncate">
                              {getCompanyBrokerName(order.companyBrokerId)}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">📦</span>
                          <div className="text-sm font-medium text-gray-900">
                            {getVarietyName(order.varietyId)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">📊</span>
                          <div className="text-sm text-gray-600">
                            {getMixingGroupName(order.mixingGroupId)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">📍</span>
                          <div className="text-sm text-gray-600">
                            {getStationName(order.stationId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">⚖️</span>
                          <div className="text-sm font-medium text-gray-900">
                            {order.quantity} units
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">💰</span>
                          <div className="text-sm text-green-700 font-semibold">
                            {(() => {
                              switch(order.selectedRateType) {
                                case 'CANDY': return `₹${order.candyRate}/candy`;
                                case 'QUINTAL': return `₹${order.quintalRate}/quintal`;
                                case 'PER_KG': return `₹${order.ratePerKg}/kg`;
                                default: return 'N/A';
                              }
                            })()}
                          </div>
                        </div>
                        {order.approxLotValue && (
                          <div className="text-sm text-blue-700">
                            ~₹{parseFloat(order.approxLotValue).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(order)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(order.id, order.orderNo)}
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

      {/* Create/Edit Purchase Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
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
                    {/* Order Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Order Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Number {!editingOrder && '(Auto-generated)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                            {orderNoLoading ? (
                              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                                <span className="w-4 h-4 animate-spin inline-block mr-2 text-gray-400">↻</span>
                                <span className="text-gray-500">Generating order number...</span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                name="orderNo"
                                value={formData.orderNo}
                                onChange={handleInputChange}
                                required
                                readOnly={!editingOrder}
                                className={`w-full pl-10 pr-4 py-2 border ${!editingOrder ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                placeholder={editingOrder ? "Edit order number" : "Auto-generated"}
                              />
                            )}
                          </div>
                         
                        </div>

                        {/* Order Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Date *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="orderDate"
                              value={formData.orderDate}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Expected Delivery Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Delivery Date
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⏰</span>
                            <input
                              type="date"
                              name="expectedDeliveryDate"
                              value={formData.expectedDeliveryDate}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Order Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Type *
                          </label>
                          <select
                            name="orderType"
                            value={formData.orderType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="SPOT">SPOT</option>
                            <option value="F.O.R">F.O.R</option>
                          </select>
                        </div>

                        {/* Packing Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Packing Type *
                          </label>
                          <select
                            name="packingType"
                            value={formData.packingType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Bale">Bale</option>
                            <option value="Bora">Bora</option>
                          </select>
                        </div>

                        {/* Payment Mode */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Mode
                          </label>
                          <input
                            type="text"
                            name="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Cash, Bank Transfer, etc."
                          />
                        </div>

                        {/* Currency */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency *
                          </label>
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="RUPEES">RUPEES</option>
                            <option value="USD">USD</option>
                            <option value="EURO">EURO</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Quantity and Rate Section */}
<div className="bg-gray-50 p-4 rounded-lg">
  <h4 className="text-lg font-semibold text-gray-800 mb-4">Quantity & Rate</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Quantity */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Quantity *
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          onWheel={(e) => e.target.blur()}
          required
          min="0"
          step="0.01"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter quantity"
        />
      </div>
    </div>

    {/* Candy Rate */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Candy Rate (₹/candy)
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
  {/* <p className="mt-1 text-xs text-gray-500">1 candy = 356 kg</p> */}
</div>

{/* Quintal Rate */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Quintal Rate (₹/quintal)
  </label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
    <input
      type="number"
      name="quintalRate"
      value={formData.quintalRate}
      onChange={handleInputChange}
      onWheel={(e) => e.target.blur()}
      min="0"
      step="0.01"
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Auto-calculated from rate per kg"
      readOnly
    />
  </div>
  {/* <p className="mt-1 text-xs text-gray-500">1 quintal = 100 kg (Auto-calculated)</p> */}
</div>

{/* Rate Per Kg */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Rate Per Kg (₹/kg) *
  </label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
    <input
      type="number"
      name="ratePerKg"
      value={formData.ratePerKg}
      onChange={handleInputChange}
      onWheel={(e) => e.target.blur()}
      required
      min="0"
      step="0.01"
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Enter or calculated from candy rate"
    />
  </div>
  {/* <p className="mt-1 text-xs text-gray-500">Calculated: Candy Rate ÷ 356</p> */}
</div>

{/* Approx Lot Value */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Approx Lot Value (₹)
  </label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
    <input
      type="number"
      name="approxLotValue"
      value={formData.approxLotValue}
      onChange={handleInputChange}
      onWheel={(e) => e.target.blur()}
      min="0"
      step="0.01"
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Auto-calculated"
      readOnly
    />
  </div>
  {/* <p className="mt-1 text-xs text-gray-500">Calculated: Rate/kg × Quantity</p> */}
</div>

    {/* Rate Type Selection for Display/Radio */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Rate Type for Display *
      </label>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, selectedRateType: 'CANDY' }))}
          className={`px-4 py-2 rounded-lg border ${formData.selectedRateType === 'CANDY' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={formData.selectedRateType === 'CANDY'}
              onChange={() => {}}
              className="mr-2"
            />
            Candy Rate
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, selectedRateType: 'QUINTAL' }))}
          className={`px-4 py-2 rounded-lg border ${formData.selectedRateType === 'QUINTAL' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={formData.selectedRateType === 'QUINTAL'}
              onChange={() => {}}
              className="mr-2"
            />
            Quintal Rate
          </div>
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, selectedRateType: 'PER_KG' }))}
          className={`px-4 py-2 rounded-lg border ${formData.selectedRateType === 'PER_KG' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
        >
          <div className="flex items-center">
            <input
              type="radio"
              checked={formData.selectedRateType === 'PER_KG'}
              onChange={() => {}}
              className="mr-2"
            />
            Per Kg Rate
          </div>
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Selected for display: <span className="font-medium">{formData.selectedRateType}</span>
      </p>
    </div>
  </div>
</div>

                    {/* Quality Parameters */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Quality Parameters</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Staple
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                            <input
                              type="text"
                              name="staple"
                              value={formData.staple}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Staple"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Moist (%)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💧</span>
                            <input
                              type="number"
                              name="moist"
                              value={formData.moist}
                              onChange={handleInputChange}
                              onWheel={(e) => e.target.blur()}
                              min="0"
                              max="100"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Moisture"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mic
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🌡️</span>
                            <input
                              type="number"
                              name="mic"
                              value={formData.mic}
                              onChange={handleInputChange}
                              onWheel={(e) => e.target.blur()}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Mic"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Str
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💨</span>
                            <input
                              type="number"
                              name="str"
                              value={formData.str}
                              onChange={handleInputChange}
                              onWheel={(e) => e.target.blur()}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Strength"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rd
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚡</span>
                            <input
                              type="number"
                              name="rd"
                              value={formData.rd}
                              onChange={handleInputChange}
                              onWheel={(e) => e.target.blur()}
                              min="0"
                              step="0.01"
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Rd"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Supplier Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Supplier Details</h4>
                      <div className="space-y-4">
                        {/* Supplier Autocomplete */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supplier *
                          </label>
                          <div className="relative" ref={supplierRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🏢</span>
                            <input
                              type="text"
                              value={supplierSearch}
                              onChange={(e) => {
                                setSupplierSearch(e.target.value);
                                setShowSupplierDropdown(true);
                              }}
                              onFocus={() => setShowSupplierDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Type to search suppliers..."
                              required
                            />
                            {formData.supplierId && (
                              <button
                                type="button"
                                onClick={clearSupplierSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Supplier Dropdown */}
                            {showSupplierDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {supplierLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading suppliers...
                                  </div>
                                ) : filteredSuppliers.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {supplierSearch ? 'No suppliers found' : 'No suppliers available'}
                                  </div>
                                ) : (
                                  filteredSuppliers.map((supplier) => (
                                    <div
                                      key={supplier.id}
                                      onClick={() => handleSupplierSelect(supplier)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.supplierId === supplier.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{supplier.accountName}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{supplier.code} | Place: {supplier.place || 'N/A'}
                                          </div>
                                        </div>
                                        {formData.supplierId === supplier.id && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.supplierId && supplierSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a supplier from the list</p>
                          )}
                        </div>

                        {/* Broker Autocomplete */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Broker (Optional)
                          </label>
                          <div className="relative" ref={brokerRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">👤</span>
                            <input
                              type="text"
                              value={brokerSearch}
                              onChange={(e) => {
                                setBrokerSearch(e.target.value);
                                setShowBrokerDropdown(true);
                              }}
                              onFocus={() => setShowBrokerDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Type to search brokers..."
                            />
                            {formData.brokerId && (
                              <button
                                type="button"
                                onClick={clearBrokerSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Broker Dropdown */}
                            {showBrokerDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {brokerLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading brokers...
                                  </div>
                                ) : filteredBrokers.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {brokerSearch ? 'No brokers found' : 'No brokers available'}
                                  </div>
                                ) : (
                                  filteredBrokers.map((broker) => (
                                    <div
                                      key={broker.id}
                                      onClick={() => handleBrokerSelect(broker)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.brokerId === broker.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{broker.brokerName}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{broker.brokerCode}
                                          </div>
                                        </div>
                                        {formData.brokerId === broker.id && (
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
                    </div>

                    {/* Variety and Specifications Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Product Specifications</h4>
                      <div className="space-y-4">
                        {/* Variety Autocomplete */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Variety *
                          </label>
                          <div className="relative" ref={varietyRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📦</span>
                            <input
                              type="text"
                              value={varietySearch}
                              onChange={(e) => {
                                setVarietySearch(e.target.value);
                                setShowVarietyDropdown(true);
                              }}
                              onFocus={() => setShowVarietyDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Type to search varieties..."
                              required
                            />
                            {formData.varietyId && (
                              <button
                                type="button"
                                onClick={clearVarietySelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Variety Dropdown */}
                            {showVarietyDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {varietyLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading varieties...
                                  </div>
                                ) : filteredVarieties.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {varietySearch ? 'No varieties found' : 'No varieties available'}
                                  </div>
                                ) : (
                                  filteredVarieties.map((variety) => (
                                    <div
                                      key={variety.id}
                                      onClick={() => handleVarietySelect(variety)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.varietyId === variety.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{variety.variety}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{variety.code}
                                          </div>
                                        </div>
                                        {formData.varietyId === variety.id && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.varietyId && varietySearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a variety from the list</p>
                          )}
                        </div>

                        {/* Mixing Group Autocomplete */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mixing Group *
                          </label>
                          <div className="relative" ref={mixingGroupRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📊</span>
                            <input
                              type="text"
                              value={mixingGroupSearch}
                              onChange={(e) => {
                                setMixingGroupSearch(e.target.value);
                                setShowMixingGroupDropdown(true);
                              }}
                              onFocus={() => setShowMixingGroupDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Type to search mixing groups..."
                              required
                            />
                            {formData.mixingGroupId && (
                              <button
                                type="button"
                                onClick={clearMixingGroupSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Mixing Group Dropdown */}
                            {showMixingGroupDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {mixingGroupLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading mixing groups...
                                  </div>
                                ) : filteredMixingGroups.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {mixingGroupSearch ? 'No mixing groups found' : 'No mixing groups available'}
                                  </div>
                                ) : (
                                  filteredMixingGroups.map((group) => (
                                    <div
                                      key={group.id}
                                      onClick={() => handleMixingGroupSelect(group)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.mixingGroupId === group.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{group.mixingName}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{group.mixingCode}
                                          </div>
                                        </div>
                                        {formData.mixingGroupId === group.id && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.mixingGroupId && mixingGroupSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a mixing group from the list</p>
                          )}
                        </div>

                        {/* Station Autocomplete */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Station *
                          </label>
                          <div className="relative" ref={stationRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📍</span>
                            <input
                              type="text"
                              value={stationSearch}
                              onChange={(e) => {
                                setStationSearch(e.target.value);
                                setShowStationDropdown(true);
                              }}
                              onFocus={() => setShowStationDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Type to search stations..."
                              required
                            />
                            {formData.stationId && (
                              <button
                                type="button"
                                onClick={clearStationSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Station Dropdown */}
                            {showStationDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {stationLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading stations...
                                  </div>
                                ) : filteredStations.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {stationSearch ? 'No stations found' : 'No stations available'}
                                  </div>
                                ) : (
                                  filteredStations.map((station) => (
                                    <div
                                      key={station.id}
                                      onClick={() => handleStationSelect(station)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.stationId === station.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{station.station}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{station.code}
                                          </div>
                                        </div>
                                        {formData.stationId === station.id && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.stationId && stationSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a station from the list</p>
                          )}
                        </div>

                       
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Remarks</h4>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">📝</span>
                        <textarea
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add any remarks or special instructions..."
                        />
                      </div>
                    </div>

                    {/* Display existing order info when editing */}
                    {editingOrder && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <div className="font-medium">
                              {editingOrder.createdAt ? new Date(editingOrder.createdAt).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Last Updated:</span>
                            <div className="font-medium">
                              {editingOrder.updatedAt ? new Date(editingOrder.updatedAt).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Status:</span>
                            <div className="font-medium">{editingOrder.status || 'Active'}</div>
                          </div>
                        </div>
                      </div>
                    )}
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
    disabled={!formData.orderNo || !formData.orderDate || !formData.supplierId || !formData.varietyId || 
             !formData.mixingGroupId || !formData.stationId || !formData.quantity ||
             !formData.ratePerKg || parseFloat(formData.ratePerKg) <= 0}
  >
    {editingOrder ? 'Update Order' : 'Create Order'}
  </button>
</div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Purchase Order Details Modal */}
      {showViewModal && viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Purchase Order Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Order Details */}
              <div className="space-y-6">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">#</span>
                      <h4 className="text-2xl font-bold text-gray-900">{viewingOrder.orderNo}</h4>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">📅</span>
                        <span className="text-sm text-gray-600">Order Date: {formatDate(viewingOrder.orderDate)}</span>
                      </div>
                      {viewingOrder.expectedDeliveryDate && (
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-1">⏰</span>
                          <span className="text-sm text-gray-600">Expected Delivery: {formatDate(viewingOrder.expectedDeliveryDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${viewingOrder.orderType === 'SPOT' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {viewingOrder.orderType}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800`}>
                      {viewingOrder.packingType}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Supplier & Broker Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Supplier & Broker Information</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Supplier</div>
                          <div className="font-medium text-gray-900">
                            {getSupplierName(viewingOrder.supplierId)}
                          </div>
                        </div>
                        {viewingOrder.brokerId && (
                          <div>
                            <div className="text-sm text-gray-500">Broker</div>
                            <div className="font-medium text-gray-900">
                              {getBrokerName(viewingOrder.brokerId)}
                            </div>
                          </div>
                        )}
                        {viewingOrder.paymentMode && (
                          <div>
                            <div className="text-sm text-gray-500">Payment Mode</div>
                            <div className="font-medium text-gray-900">{viewingOrder.paymentMode}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-gray-500">Currency</div>
                          <div className="font-medium text-gray-900">{viewingOrder.currency}</div>
                        </div>
                      </div>
                    </div>

                    {/* Product Specifications */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Product Specifications</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Variety</div>
                          <div className="font-medium text-gray-900">
                            {getVarietyName(viewingOrder.varietyId)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Mixing Group</div>
                          <div className="font-medium text-gray-900">
                            {getMixingGroupName(viewingOrder.mixingGroupId)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Station</div>
                          <div className="font-medium text-gray-900">
                            {getStationName(viewingOrder.stationId)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Quantity & Rate Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Quantity & Rate</h5>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Quantity</div>
                            <div className="font-bold text-gray-900 text-xl">
                              {viewingOrder.quantity} units
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Rate Type</div>
                            <div className="font-medium text-gray-900">{viewingOrder.selectedRateType}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Rate Amount</div>
                          <div className="font-bold text-green-700 text-xl">
                            {(() => {
                              switch(viewingOrder.selectedRateType) {
                                case 'CANDY': return `₹${viewingOrder.candyRate} / candy`;
                                case 'QUINTAL': return `₹${viewingOrder.quintalRate} / quintal`;
                                case 'PER_KG': return `₹${viewingOrder.ratePerKg} / kg`;
                                default: return 'N/A';
                              }
                            })()}
                          </div>
                        </div>
                        {viewingOrder.approxLotValue && (
                          <div>
                            <div className="text-sm text-gray-500">Approximate Lot Value</div>
                            <div className="font-bold text-blue-700 text-xl">
                              ₹{parseFloat(viewingOrder.approxLotValue).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quality Parameters */}
                    {(viewingOrder.staple || viewingOrder.moist || viewingOrder.mic || viewingOrder.str || viewingOrder.rd) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-lg font-semibold text-gray-800 mb-3">Quality Parameters</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {viewingOrder.staple && (
                            <div>
                              <div className="text-sm text-gray-500">Staple</div>
                              <div className="font-medium text-gray-900">{viewingOrder.staple}</div>
                            </div>
                          )}
                          {viewingOrder.moist && (
                            <div>
                              <div className="text-sm text-gray-500">Moist (%)</div>
                              <div className="font-medium text-gray-900">{viewingOrder.moist}</div>
                            </div>
                          )}
                          {viewingOrder.mic && (
                            <div>
                              <div className="text-sm text-gray-500">Mic</div>
                              <div className="font-medium text-gray-900">{viewingOrder.mic}</div>
                            </div>
                          )}
                          {viewingOrder.str && (
                            <div>
                              <div className="text-sm text-gray-500">Str</div>
                              <div className="font-medium text-gray-900">{viewingOrder.str}</div>
                            </div>
                          )}
                          {viewingOrder.rd && (
                            <div>
                              <div className="text-sm text-gray-500">Rd</div>
                              <div className="font-medium text-gray-900">{viewingOrder.rd}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {viewingOrder.remarks && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="text-lg font-semibold text-gray-800 mb-3">Remarks</h5>
                        <div className="text-gray-700">
                          {viewingOrder.remarks}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Timestamps</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Created Date</div>
                          <div className="font-medium text-gray-900">
                            {viewingOrder.createdAt ? new Date(viewingOrder.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingOrder.createdAt ? new Date(viewingOrder.createdAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Last Updated</div>
                          <div className="font-medium text-gray-900">
                            {viewingOrder.updatedAt ? new Date(viewingOrder.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingOrder.updatedAt ? new Date(viewingOrder.updatedAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingOrder);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Order
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

export default PurchaseOrderManagement;
