// components/finalInvoice/FinalInvoice.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  message,
  Card,
  Tabs,
  Row,
  Col,
  Tooltip,
  Divider,
  Statistic,
  Radio
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import finalInvoiceService from '../../services/admin1/transaction-cotton/finalInvoiceService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';
import purchaseOrderService from '../../services/admin1/transaction-cotton/purchaseOrderService';

const { TabPane } = Tabs;
const { Option } = Select;

const FinalInvoice = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  // State management
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [availableLots, setAvailableLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [totals, setTotals] = useState({
    totalWeight: 0,
    totalQuantity: 0,
    totalInvoiceValue: 0,
    totalFreight: 0,
    totalAssessValue: 0,
    totalTax: 0,
    totalNetAmount: 0,
    totalIGST: 0,
    totalSGST: 0,
    totalCGST: 0
  });

  // Fetch all invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await finalInvoiceService.getAllFinalInvoices();
      setInvoices(data || []);
    } catch (error) {
      message.error('Failed to fetch invoices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available lots
  const fetchAvailableLots = async () => {
    try {
      const data = await inwardLotService.getAll();
      setAvailableLots(data || []);
    } catch (error) {
      message.error('Failed to fetch lots');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchAvailableLots();
  }, []);

  // Calculate totals whenever invoice details change
  useEffect(() => {
    calculateTotals();
  }, [invoiceDetails]);

  const calculateTotals = () => {
    const newTotals = invoiceDetails.reduce((acc, detail) => {
      const weight = Number(detail.weight ?? detail.nettWeight) || 0;
      const qty = Number(detail.quantity ?? detail.qty) || 0;
      const assessValue = Number(detail.assessValue) || 0;
      const invValue = Number(detail.invValue) || assessValue;
      const freight = Number(detail.freight) || 0;
      const taxAmount = Number(detail.tax ?? detail.TaxRs) || 0;
      const igst = Number(detail.igst ?? detail.igstAmount) || 0;
      const sgst = Number(detail.sgst ?? detail.sgstAmount) || 0;
      const cgst = Number(detail.cgst ?? detail.cgstAmount) || 0;
      const roundOff = Number(detail.roundOff) || 0;
      const netAmount = Number(detail.netAmount) || (invValue + taxAmount);
      
      return {
        totalWeight: acc.totalWeight + weight,
        totalQuantity: acc.totalQuantity + qty,
        totalInvoiceValue: acc.totalInvoiceValue + invValue,
        totalFreight: acc.totalFreight + freight,
        totalAssessValue: acc.totalAssessValue + assessValue,
        totalTax: acc.totalTax + taxAmount,
        totalIGST: acc.totalIGST + igst,
        totalSGST: acc.totalSGST + sgst,
        totalCGST: acc.totalCGST + cgst,
        totalRoundOff: acc.totalRoundOff + roundOff,
        totalTDS: acc.totalTDS + (Number(detail.tds) || 0),
        totalNetAmount: acc.totalNetAmount + netAmount
      };
    }, {
      totalWeight: 0,
      totalQuantity: 0,
      totalInvoiceValue: 0,
      totalFreight: 0,
      totalAssessValue: 0,
      totalTax: 0,
      totalIGST: 0,
      totalSGST: 0,
      totalCGST: 0,
      totalRoundOff: 0,
      totalTDS: 0,
      totalNetAmount: 0
    });
    setTotals(newTotals);
  };

  // Helper to recalculate item according to PDF rules:
  // 1. quintalRateOC = Math.ceil(candyRate * 0.2812 * 100) / 100  (e.g., 54877 * 0.2812 = 15431.4124 -> 15431.42)
  // 2. quintalRate / rateKg = quintalRateOC / 100 (154.3142)
  // 3. assessValue = Math.round(weight * rateKg * 100) / 100
  // 4. invValueOC / invValue = assessValue + roundOff (e.g. 1255037.39 + (-1) = 1255036.39)
  // 5. Upcountry = 5% IGST (assessValue * 0.05)
  // 6. netAmount = invValue + tax (e.g. 1255036.39 + 62751.87 = 1317788.26)
  const recalculateDetailItem = (detail, tcType = 'UPCOUNTRY') => {
    const factor = Number(detail.factor) || 1;
    const candyRateOC = Number(detail.candyRateOC) || 0;
    const candyRate = candyRateOC * factor;
    
    // Calculate quintalRateOC: if fraction has > 2 decimals, round up to 2 decimal places (54877 * 0.2812 = 15431.4124 -> 15431.42)
    const rawQuintalRate = candyRate * 0.2812;
    const quintalRateOC = Math.ceil(rawQuintalRate * 100) / 100;
    const quintalRate = quintalRateOC / 100;
    const rateKg = quintalRate;
    
    const weight = Number(detail.weight ?? detail.nettWeight) || 0;
    const assessValue = Math.round((weight * rateKg) * 100) / 100;
    const freight = 0.00;

    // Round Off entered by user
    const roundOff = detail.roundOff !== undefined && detail.roundOff !== null ? Number(detail.roundOff) : 0;
    
    // invValueOC & invValue = assessValue + roundOff
    const invoiceValue = Math.round((assessValue + roundOff) * 100) / 100;

    const isUpcountry = String(tcType).toUpperCase().includes('UPCOUNTRY');
    
    let igstPercent = 0;
    let sgstPercent = 0;
    let cgstPercent = 0;
    let igst = 0;
    let sgst = 0;
    let cgst = 0;

    if (isUpcountry) {
      igstPercent = 5.00;
      igst = Math.round((assessValue * 0.05) * 100) / 100;
    } else {
      sgstPercent = 2.50;
      cgstPercent = 2.50;
      sgst = Math.round((assessValue * 0.025) * 100) / 100;
      cgst = Math.round((assessValue * 0.025) * 100) / 100;
    }

    const tax = igst + sgst + cgst;
    // netAmount = invValue + tax
    const netAmount = Math.round((invoiceValue + tax) * 100) / 100;

    const tdsPercent = Number(detail.tdsPercent) || 0;
    const tds = Math.round(((candyRate * tdsPercent) / 100) * 100) / 100;

    return {
      ...detail,
      factor,
      candyRateOC,
      candyRate,
      quintalRateOC,
      quintalRate,
      rateKgOC: rateKg,
      ratePerKgOC: rateKg,
      rateKg: rateKg,
      ratePerKg: rateKg,
      assessValueOC: assessValue,
      assessValue: assessValue,
      roundOff,
      invValueOC: invoiceValue,
      invValue: invoiceValue,
      freight,
      taxType: isUpcountry ? 'IGST' : 'GST',
      taxPercent: 5.00,
      tax: tax,
      Tax: 5.00,
      TaxRs: tax,
      gstPercent: isUpcountry ? 0 : 5.00,
      gst: isUpcountry ? 0 : 5.00,
      igstPercent,
      igst,
      igstAmount: igst,
      sgstPercent,
      sgst,
      sgstAmount: sgst,
      cgstPercent,
      cgst,
      cgstAmount: cgst,
      tdsPercent,
      tds,
      netAmount
    };
  };

  // Handle Factor change
  const handleFactorChange = (index, value) => {
    const updatedDetails = [...invoiceDetails];
    const detail = updatedDetails[index];
    detail.factor = Number(value) || 1;
    
    const currentTcType = form.getFieldValue('tcType') || 'UPCOUNTRY';
    updatedDetails[index] = recalculateDetailItem(detail, currentTcType);
    
    setInvoiceDetails(updatedDetails);
  };

  // Handle Round Off change in details
  const handleRoundOffChange = (index, value) => {
    const updatedDetails = [...invoiceDetails];
    const detail = updatedDetails[index];
    detail.roundOff = value !== undefined && value !== null ? Number(value) : 0;
    
    const currentTcType = form.getFieldValue('tcType') || 'UPCOUNTRY';
    updatedDetails[index] = recalculateDetailItem(detail, currentTcType);
    
    setInvoiceDetails(updatedDetails);
  };

  // Handle TDS percentage change in details
  const handleTdsPercentChange = (index, value) => {
    const updatedDetails = [...invoiceDetails];
    const detail = updatedDetails[index];
    detail.tdsPercent = Number(value) || 0;
    
    const currentTcType = form.getFieldValue('tcType') || 'UPCOUNTRY';
    updatedDetails[index] = recalculateDetailItem(detail, currentTcType);
    
    setInvoiceDetails(updatedDetails);
  };

  // Handle lot selection
  const handleAddLot = async () => {
    if (!selectedLotId) {
      message.warning('Please select a lot first');
      return;
    }
    const lotId = selectedLotId;

    try {
      const lotData = await inwardLotService.getById(lotId);
      
      if (invoiceDetails.some(d => d.inwardLotId === lotData.id)) {
        message.warning('This lot is already added');
        return;
      }

      // Find PO number from availableLots
      const lotFromList = availableLots.find(l => l.id === lotId);
      const poNo = lotFromList?.purchaseOrderNo;
      
      let poData = null;
      if (poNo) {
        const allPOs = await purchaseOrderService.getAll();
        poData = allPOs.find(p => p.orderNo === poNo);
      }

      const poCandyRate = poData?.candyRate ? Number(poData.candyRate) : (Number(lotData.candyRate) || 0);
      const currentTcType = form.getFieldValue('tcType') || 'UPCOUNTRY';

      const initialDetail = {
        inwardLotId: lotData.id,
        finalInvoiceId: editingId || null,
        lotNo: lotData.lotNo,
        partyName: lotData.supplier || '',
        supplier: lotData.supplier || '',
        broker: lotData.broker || '',
        variety: lotData.variety || '',
        mixingGroup: lotData.mixingGroup || '',
        station: lotData.station || '',
        companyBroker: lotData.companyBroker || '',
        nettWeight: Number(lotData.nettWeight) || 0,
        weight: Number(lotData.nettWeight) || 0,
        qty: Number(lotData.qty) || 0,
        quantity: Number(lotData.qty) || 0,
        freight: 0.00,
        paymentMode: poData?.paymentMode || '',
        currency: poData?.currency || 'RUPEES',
        candyRateOC: poCandyRate,
        candyRate: poCandyRate,
        factor: 1.000,
        tdsPercent: 0,
        tds: 0.00,
        insurance: 0.00,
        charityBale: 0.00,
        charity: 0.00,
        eduCessPercent: null,
        eduCess: 0.00,
        hsCessPercent: null,
        hsCess: 0.00,
        tngstPercent: null,
        tngst: 0.00,
        commissionValue: 0.00,
        roundOff: 0.00,
        permitNo: '',
        transport: '',
        lrNo: '',
        lrDate: null,
        totalLRValue: 0.00,
        lrPercent: null,
        lrValue: 0.00,
        serviceTaxPercent: null,
        serviceTax: 0.00,
        eduCess2Percent: null,
        eduCess2: 0.00,
        hsCess2Percent: null,
        hsCess2: 0.00,
        companyBrokerId: null,
        compBrokerCom: 0.00,
        tcsPercent: null,
        tcsAmount: 0.00,
        remarks: ''
      };

      const newDetail = recalculateDetailItem(initialDetail, currentTcType);

      setInvoiceDetails([...invoiceDetails, newDetail]);
      setSelectedLotId(null);
      message.success('Lot added successfully');
    } catch (error) {
      message.error('Failed to fetch lot details');
      console.error(error);
    }
  };

  // Handle detail removal
  const handleRemoveDetail = (index) => {
    const newDetails = invoiceDetails.filter((_, i) => i !== index);
    setInvoiceDetails(newDetails);
  };

  // Handle TC Type change for auto-generating voucher number & recalculating tax
  const handleTcTypeChange = async (value) => {
    try {
      console.log("TC Type changed to:", value);
      const nextVoucherNo = await finalInvoiceService.getNextVoucherNo(value);
      
      form.setFieldsValue({ 
        voucherNo: nextVoucherNo 
      });
      
      if (invoiceDetails.length > 0) {
        const updatedDetails = invoiceDetails.map(detail => recalculateDetailItem(detail, value));
        setInvoiceDetails(updatedDetails);
      }

      form.validateFields(['voucherNo']);
    } catch (error) {
      message.error('Failed to generate voucher number');
      console.error(error);
    }
  };

  // Generate voucher number when modal opens with default TC Type
  const handleOpenModal = async () => {
    resetForm();
    setModalVisible(true);
    
    setTimeout(async () => {
      try {
        const defaultTcType = 'UPCOUNTRY';
        const nextVoucherNo = await finalInvoiceService.getNextVoucherNo(defaultTcType);
        
        form.setFieldsValue({ 
          tcType: defaultTcType,
          voucherNo: nextVoucherNo 
        });
        
        form.validateFields(['voucherNo', 'tcType']);
      } catch (error) {
        message.error('Failed to generate voucher number');
        console.error(error);
      }
    }, 100);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    if (invoiceDetails.length === 0) {
      message.warning('Please add at least one lot');
      return;
    }

    try {
      const headData = {
        voucherNo: values.voucherNo,
        invoiceDate: dayjs(values.invoiceDate).format('YYYY-MM-DD'),
        tcType: values.tcType || 'UPCOUNTRY',
        weight: totals.totalWeight,
        quantity: totals.totalQuantity,
        invoiceValue: totals.totalInvoiceValue,
        freight: totals.totalFreight,
        billNo: values.billNo,
        billDate: values.billDate ? dayjs(values.billDate).format('YYYY-MM-DD') : null,
        
        insurance: 0,
        charity: 0,
        eduCess: 0,
        hrSecCess: 0,
        cst: 0,
        tngst: 0,
        vat: 0,
        commission: 0,
        tcs: 0,
        roundOff: 0.33,
        
        netAmount: totals.totalNetAmount,
        remarks: values.remarks,
        deliveryType: 'SPOT',
        
        totalLRValue: 0,
        lrValue: 0,
        serviceTax: 0,
        eduCess2: 0,
        hrSecCess2: 0,
        tds: values.tds !== undefined && values.tds !== null ? Number(values.tds) : totals.totalTDS,
        sgst: totals.totalSGST,
        cgst: totals.totalCGST,
        igst: totals.totalIGST
      };

      const detailsData = invoiceDetails.map(detail => ({
        inwardLotId: detail.inwardLotId,
        finalInvoiceId: editingId || null,
        
        lotNo: detail.lotNo,
        partyName: detail.partyName || detail.supplier || '',
        weight: detail.weight || detail.nettWeight || 0,
        quantity: detail.quantity || detail.qty || 0,
        paymentMode: detail.paymentMode || '',
        currency: detail.currency || 'RUPEES',
        factor: detail.factor,
        candyRateOC: detail.candyRateOC,
        candyRate: detail.candyRate,
        quintalRateOC: detail.quintalRateOC,
        quintalRate: detail.quintalRate,
        rateKgOC: detail.rateKgOC || detail.ratePerKgOC || 0,
        rateKg: detail.rateKg || detail.ratePerKg || 0,
        assessValueOC: detail.assessValueOC,
        assessValue: detail.assessValue,
        freight: 0.00,
        insurance: detail.insurance,
        charityBale: detail.charityBale,
        charity: detail.charity,
        gstPercent: detail.gstPercent || detail.gst || 0,
        sgstPercent: detail.sgstPercent || detail.sgst || 0,
        sgst: detail.sgst || detail.sgstAmount || 0,
        cgstPercent: detail.cgstPercent || detail.cgst || 0,
        cgst: detail.cgst || detail.cgstAmount || 0,
        igstPercent: detail.igstPercent || detail.igst || 0,
        igst: detail.igst || detail.igstAmount || 0,
        eduCessPercent: detail.eduCessPercent,
        eduCess: detail.eduCess,
        hsCessPercent: detail.hsCessPercent,
        hsCess: detail.hsCess,
        tngstPercent: detail.tngstPercent,
        tngst: detail.tngst,
        taxType: detail.taxType,
        taxPercent: detail.taxPercent,
        tax: detail.tax,
        commissionValue: detail.commissionValue,
        roundOff: detail.roundOff,
        netAmount: detail.netAmount,
        invValueOC: detail.invValueOC,
        invValue: detail.invValue,
        permitNo: detail.permitNo,
        transport: detail.transport,
        lrNo: detail.lrNo,
        lrDate: detail.lrDate,
        totalLRValue: detail.totalLRValue,
        lrPercent: detail.lrPercent,
        lrValue: detail.lrValue,
        serviceTaxPercent: detail.serviceTaxPercent,
        serviceTax: detail.serviceTax,
        eduCess2Percent: detail.eduCess2Percent,
        eduCess2: detail.eduCess2,
        hsCess2Percent: detail.hsCess2Percent,
        hsCess2: detail.hsCess2,
        tdsPercent: detail.tdsPercent,
        tds: detail.tds,
        companyBrokerId: detail.companyBrokerId,
        compBrokerCom: detail.compBrokerCom || 0.00,
        tcsPercent: detail.tcsPercent,
        tcsAmount: detail.tcsAmount,
        remarks: detail.remarks,
        
        // Additional UI display fields
        nettWeight: detail.nettWeight || detail.weight || 0,
        qty: detail.qty || detail.quantity || 0,
        ratePerKg: detail.ratePerKg || detail.rateKg || 0,
        Tax: detail.Tax,
        TaxRs: detail.TaxRs,
        gst: detail.gst,
        sgstAmount: detail.sgstAmount || detail.sgst || 0,
        cgstAmount: detail.cgstAmount || detail.cgst || 0,
        igstAmount: detail.igstAmount || detail.igst || 0,
        supplier: detail.supplier,
        broker: detail.broker,
        variety: detail.variety,
        mixingGroup: detail.mixingGroup,
        station: detail.station,
        companyBroker: detail.companyBroker
      }));

      const payload = {
        ...headData,
        details: detailsData
      };

      if (editingId) {
        await finalInvoiceService.updateFinalInvoice(editingId, payload);
        message.success('Invoice updated successfully');
      } else {
        await finalInvoiceService.createFinalInvoice(payload);
        message.success('Invoice created successfully');
      }

      setModalVisible(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      message.error(editingId ? 'Failed to update invoice' : 'Failed to create invoice');
      console.error(error);
    }
  };

  // Reset form
  const resetForm = () => {
    form.resetFields();
    setInvoiceDetails([]);
    setEditingId(null);
    setSelectedLotId(null);
  };

  // Format details from DB for display
  const formatInvoiceDetails = (details = []) => {
    return details.map(d => ({
      ...d,
      partyName: d.partyName || d.supplier || '',
      supplier: d.partyName || d.supplier || '',
      weight: d.weight ?? d.nettWeight ?? 0,
      nettWeight: d.weight ?? d.nettWeight ?? 0,
      quantity: d.quantity ?? d.qty ?? 0,
      qty: d.quantity ?? d.qty ?? 0,
      rateKgOC: d.rateKgOC ?? d.ratePerKgOC ?? 0,
      ratePerKgOC: d.rateKgOC ?? d.ratePerKgOC ?? 0,
      rateKg: d.rateKg ?? d.ratePerKg ?? 0,
      ratePerKg: d.rateKg ?? d.ratePerKg ?? 0,
      taxPercent: d.taxPercent ?? d.Tax ?? 0,
      Tax: d.taxPercent ?? d.Tax ?? 0,
      tax: d.tax ?? d.TaxRs ?? 0,
      TaxRs: d.tax ?? d.TaxRs ?? 0,
      gstPercent: d.gstPercent ?? d.gst ?? 0,
      gst: d.gstPercent ?? d.gst ?? 0,
      sgstPercent: d.sgstPercent ?? d.sgst ?? 0,
      sgst: d.sgstPercent ?? d.sgst ?? 0,
      cgstPercent: d.cgstPercent ?? d.cgst ?? 0,
      cgst: d.cgstPercent ?? d.cgst ?? 0,
      igstPercent: d.igstPercent ?? d.igst ?? 0,
      igst: d.igstPercent ?? d.igst ?? 0,
      sgstAmount: d.sgst ?? d.sgstAmount ?? 0,
      cgstAmount: d.cgst ?? d.cgstAmount ?? 0,
      igstAmount: d.igst ?? d.igstAmount ?? 0,
    }));
  };

  // Handle edit
  const handleEdit = async (id) => {
    try {
      const invoice = await finalInvoiceService.getFinalInvoiceById(id);
      setEditingId(id);
      
      form.setFieldsValue({
        ...invoice,
        invoiceDate: invoice.invoiceDate ? dayjs(invoice.invoiceDate) : null,
        billDate: invoice.billDate ? dayjs(invoice.billDate) : null
      });

      setInvoiceDetails(formatInvoiceDetails(invoice.details));
      setModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch invoice details');
      console.error(error);
    }
  };

  // Handle view
  const handleView = async (id) => {
    try {
      const invoice = await finalInvoiceService.getFinalInvoiceById(id);
      setSelectedInvoice({
        ...invoice,
        details: formatInvoiceDetails(invoice.details)
      });
      setViewModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch invoice details');
      console.error(error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await finalInvoiceService.deleteFinalInvoice(id);
      message.success('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      message.error('Failed to delete invoice');
      console.error(error);
    }
  };

  // Table columns for list view
  const columns = [
    {
      title: 'Voucher No.',
      dataIndex: 'voucherNo',
      key: 'voucherNo',
      sorter: (a, b) => a.voucherNo - b.voucherNo
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'TC Type',
      dataIndex: 'tcType',
      key: 'tcType'
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (val) => val ? Number(val).toFixed(3) : '-'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Invoice Value',
      dataIndex: 'invoiceValue',
      key: 'invoiceValue',
      render: (val) => val ? `₹${Number(val).toFixed(2)}` : '-'
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (val) => val ? `₹${Number(val).toFixed(2)}` : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleView(record.id)}>
            View
          </Button>
          <Button type="default" size="small" onClick={() => handleEdit(record.id)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this invoice?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Details table columns with editable TDS fields ordered per user request
  const detailColumns = [
    {
      title: 'Lot No',
      dataIndex: 'lotNo',
      key: 'lotNo',
      fixed: 'left',
      width: 120,
    },
    {
      title: 'Party Name',
      dataIndex: 'partyName',
      key: 'partyName',
      width: 150,
      render: (val, record) => val || record.supplier || '-',
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (val, record) => Number(record.weight ?? record.nettWeight ?? 0).toFixed(3),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (val, record) => Number(record.quantity ?? record.qty ?? 0),
    },
    {
      title: 'Payment Mode',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      width: 120,
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
    },
    {
      title: 'Factor',
      dataIndex: 'factor',
      key: 'factor',
      width: 100,
      render: (val, record, index) => (
        <InputNumber
          value={val}
          onChange={(value) => handleFactorChange(index, value)}
          min={0}
          step={0.001}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Candy Rate (OC)',
      dataIndex: 'candyRateOC',
      key: 'candyRateOC',
      width: 120,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Candy Rate',
      dataIndex: 'candyRate',
      key: 'candyRate',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Quintal Rate (OC)',
      dataIndex: 'quintalRateOC',
      key: 'quintalRateOC',
      width: 120,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Quintal Rate',
      dataIndex: 'quintalRate',
      key: 'quintalRate',
      width: 100,
      render: (val) => Number(val || 0).toFixed(4),
    },
    {
      title: 'Rate/Kg (OC)',
      dataIndex: 'rateKgOC',
      key: 'rateKgOC',
      width: 120,
      render: (val, record) => Number(record.rateKgOC ?? record.ratePerKgOC ?? 0).toFixed(4),
    },
    {
      title: 'Rate/Kg',
      dataIndex: 'rateKg',
      key: 'rateKg',
      width: 100,
      render: (val, record) => Number(record.rateKg ?? record.ratePerKg ?? 0).toFixed(4),
    },
    {
      title: 'Assess Value (OC)',
      dataIndex: 'assessValueOC',
      key: 'assessValueOC',
      width: 120,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Assess Value',
      dataIndex: 'assessValue',
      key: 'assessValue',
      width: 120,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Freight',
      dataIndex: 'freight',
      key: 'freight',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Insurance',
      dataIndex: 'insurance',
      key: 'insurance',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Charity Bale',
      dataIndex: 'charityBale',
      key: 'charityBale',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Charity',
      dataIndex: 'charity',
      key: 'charity',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'GST %',
      dataIndex: 'gstPercent',
      key: 'gstPercent',
      width: 70,
      render: (val, record) => {
        const value = record.gstPercent ?? record.gst;
        return value ? `${Number(value).toFixed(2)}%` : '0.00%';
      },
    },
    {
      title: 'SGST %',
      dataIndex: 'sgstPercent',
      key: 'sgstPercent',
      width: 70,
      render: (val, record) => {
        const value = record.sgstPercent ?? record.sgst;
        return value ? `${Number(value).toFixed(2)}%` : '0.00%';
      },
    },
    {
      title: 'SGST Amt',
      dataIndex: 'sgst',
      key: 'sgst',
      width: 100,
      render: (val, record) => Number(record.sgst ?? record.sgstAmount ?? 0).toFixed(2),
    },
    {
      title: 'CGST %',
      dataIndex: 'cgstPercent',
      key: 'cgstPercent',
      width: 70,
      render: (val, record) => {
        const value = record.cgstPercent ?? record.cgst;
        return value ? `${Number(value).toFixed(2)}%` : '0.00%';
      },
    },
    {
      title: 'CGST Amt',
      dataIndex: 'cgst',
      key: 'cgst',
      width: 100,
      render: (val, record) => Number(record.cgst ?? record.cgstAmount ?? 0).toFixed(2),
    },
    {
      title: 'IGST %',
      dataIndex: 'igstPercent',
      key: 'igstPercent',
      width: 70,
      render: (val, record) => {
        const value = record.igstPercent ?? record.igst;
        return value ? `${Number(value).toFixed(2)}%` : '0.00%';
      },
    },
    {
      title: 'IGST Amt',
      dataIndex: 'igst',
      key: 'igst',
      width: 100,
      render: (val, record) => Number(record.igst ?? record.igstAmount ?? 0).toFixed(2),
    },
    {
      title: 'Edu Cess %',
      dataIndex: 'eduCessPercent',
      key: 'eduCessPercent',
      width: 80,
      render: (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'Edu Cess',
      dataIndex: 'eduCess',
      key: 'eduCess',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'HS Cess %',
      dataIndex: 'hsCessPercent',
      key: 'hsCessPercent',
      width: 80,
      render: (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'HS Cess',
      dataIndex: 'hsCess',
      key: 'hsCess',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'TNGST %',
      dataIndex: 'tngstPercent',
      key: 'tngstPercent',
      width: 80,
      render: (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'TNGST',
      dataIndex: 'tngst',
      key: 'tngst',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Tax Type',
      dataIndex: 'taxType',
      key: 'taxType',
      width: 100,
      render: (val) => val || '0',
    },
    {
      title: 'Tax %',
      dataIndex: 'taxPercent',
      key: 'taxPercent',
      width: 70,
      render: (val, record) => {
        const value = record.taxPercent ?? record.Tax;
        return value ? `${Number(value).toFixed(2)}%` : '0.00%';
      },
    },
    {
      title: 'Tax Amount',
      dataIndex: 'tax',
      key: 'tax',
      width: 100,
      render: (val, record) => Number(record.tax ?? record.TaxRs ?? 0).toFixed(2),
    },
    {
      title: 'Commission',
      dataIndex: 'commissionValue',
      key: 'commissionValue',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Round Off',
      dataIndex: 'roundOff',
      key: 'roundOff',
      width: 100,
      render: (val, record, index) => (
        <InputNumber
          value={val}
          onChange={(value) => handleRoundOffChange(index, value)}
          step={0.01}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      width: 120,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Inv Value OC',
      dataIndex: 'invValueOC',
      key: 'invValueOC',
      width: 120,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Inv Value',
      dataIndex: 'invValue',
      key: 'invValue',
      width: 120,
      render: (val, record) => Number(record.netAmount || 0).toFixed(2),
      /*render: (val) => Number(val || 0).toFixed(2),*/
    },
    {
      title: 'Permit No',
      dataIndex: 'permitNo',
      key: 'permitNo',
      width: 120,
      render: (val) => val || '0',
    },
    {
      title: 'Transport',
      dataIndex: 'transport',
      key: 'transport',
      width: 120,
      render: (val) => val || '0',
    },
    {
      title: 'LR No',
      dataIndex: 'lrNo',
      key: 'lrNo',
      width: 120,
      render: (val) => val || '0',
    },
    {
      title: 'LR Date',
      dataIndex: 'lrDate',
      key: 'lrDate',
      width: 100,
      render: (val) => (val ? dayjs(val).format('DD/MM/YYYY') : '0'),
    },
    {
      title: 'Total LR Value',
      dataIndex: 'totalLRValue',
      key: 'totalLRValue',
      width: 120,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'LR Percent',
      dataIndex: 'lrPercent',
      key: 'lrPercent',
      width: 80,
      render: (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'LR Value',
      dataIndex: 'lrValue',
      key: 'lrValue',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Service Tax %',
      dataIndex: 'serviceTaxPercent',
      key: 'serviceTaxPercent',
      width: 100,
      render: (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'Service Tax',
      dataIndex: 'serviceTax',
      key: 'serviceTax',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Edu Cess 2 %',
      dataIndex: 'eduCess2Percent',
      key: 'eduCess2Percent',
      width: 90,
      render: (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'Edu Cess 2',
      dataIndex: 'eduCess2',
      key: 'eduCess2',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'HS Cess 2 %',
      dataIndex: 'hsCess2Percent',
      key: 'hsCess2Percent',
      width: 90,
      render: (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'HS Cess 2',
      dataIndex: 'hsCess2',
      key: 'hsCess2',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'TDS %',
      dataIndex: 'tdsPercent',
      key: 'tdsPercent',
      width: 100,
      render: (val, record, index) => (
        <InputNumber
          value={val}
          onChange={(value) => handleTdsPercentChange(index, value)}
          min={0}
          max={100}
          step={0.01}
          style={{ width: '100%' }}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
        />
      ),
    },
    {
      title: 'TDS',
      dataIndex: 'tds',
      key: 'tds',
      width: 100,
      render: (val) => `₹${Number(val || 0).toFixed(2)}`,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
      render: (val) => val || '0',
    },
    {
      title: 'Company Broker ID',
      dataIndex: 'companyBrokerId',
      key: 'companyBrokerId',
      width: 120,
      render: (val) => val || '0',
    },
    {
      title: 'TCS %',
      dataIndex: 'tcsPercent',
      key: 'tcsPercent',
      width: 80,
      render: (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%',
    },
    {
      title: 'TCS Amount',
      dataIndex: 'tcsAmount',
      key: 'tcsAmount',
      width: 100,
      render: (val) => Number(val || 0).toFixed(2),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record, index) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveDetail(index)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <h2>Final Invoices</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            Create Final Invoice
          </Button>
        </div>

        {/* Search */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="voucherNo">
              <Input placeholder="Voucher No." prefix={<SearchOutlined />} />
            </Form.Item>
            <Form.Item name="fromDate">
              <DatePicker placeholder="From Date" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="toDate">
              <DatePicker placeholder="To Date" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">Search</Button>
                <Button icon={<ReloadOutlined />} onClick={() => searchForm.resetFields()}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? 'Edit Final Invoice' : 'Create Final Invoice'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          resetForm();
        }}
        footer={null}
        width={1400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ tcType: 'UPCOUNTRY' }}
        >
          {/* Head Section */}
          <Card title="Head" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item
                  name="voucherNo"
                  label="Voucher No."
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input 
                    style={{ 
                      width: '100%', 
                      fontWeight: 'bold',
                      color: '#1890ff',
                      backgroundColor: '#f5f5f5'
                    }} 
                    disabled 
                    placeholder="Auto-generated"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="invoiceDate"
                  label="Invoice Date"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="tcType" label="TC Type">
                  <Select onChange={handleTcTypeChange}>
                    <Option value="UPCOUNTRY">UPCOUNTRY</Option>
                    <Option value="LOCAL">LOCAL</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Insurance" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Form.Item name="insurance" noStyle initialValue={0}>
                      <InputNumber
                        min={0}
                        step={0.01}
                        style={{ width: '120px' }}
                        placeholder="0"
                      />
                    </Form.Item>
                    <Form.Item name="insuranceType" noStyle initialValue="SPOT">
                      <Radio.Group>
                        <Radio value="SPOT">SPOT</Radio>
                        <Radio value="FOR">FOR</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </div>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Charity" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="Weight" 
                  value={totals.totalWeight.toFixed(3)} 
                  suffix="kg"
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Quantity" 
                  value={totals.totalQuantity} 
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Invoice Value" 
                  value={totals.totalInvoiceValue.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Freight" 
                  value={totals.totalFreight.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
              <Col span={4}>
                <Form.Item name="billNo" label="Bill No.">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="billDate" label="Bill Date">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="Edu.Cess" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Hr.Sec.Cess" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="CST" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="TNEST" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="VAT" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Commission" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="TCS" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Round Off" 
                  value="0.33" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Net Amount" 
                  value={totals.totalNetAmount.toFixed(2)} 
                  prefix="₹"
                  valueStyle={{ color: '#3f8600', fontSize: '16px' }}
                />
              </Col>
              <Col span={8}>
                <Form.Item name="remarks" label="Remarks">
                  <Input placeholder="-" />
                </Form.Item>
              </Col>
            </Row>

            {/* Service Tax & TDS Section */}
            <Divider orientation="left">Service Tax & TDS</Divider>
            
            <Row gutter={16}>
              <Col span={4}>
                <Statistic 
                  title="Total LR Value" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="LR Value" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Service Tax" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Educ. Cess" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Hr.Sec.Cess" 
                  value="0" 
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={4}>
                <Form.Item name="tds" label="TDS">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="SGST" 
                  value={totals.totalSGST.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="CGST" 
                  value={totals.totalCGST.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="IGST" 
                  value={totals.totalIGST.toFixed(2)} 
                  prefix="₹"
                />
              </Col>
            </Row>
          </Card>

          {/* Details Section */}
          <Card title="Details" style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <Select
                placeholder="Select Lot No"
                style={{ flex: 1 }}
                showSearch
                value={selectedLotId}
                optionFilterProp="children"
                onChange={(value) => setSelectedLotId(value)}
                allowClear
              >
                {availableLots
                  .filter(lot => !invoiceDetails.some(detail => detail.inwardLotId === lot.id))
                  .map(lot => (
                  <Option key={lot.id} value={lot.id}>
                    {lot.lotNo} - {lot.supplier} (Qty: {lot.qty}, Wt: {lot.nettWeight})
                  </Option>
                ))}
              </Select>
              <Button type="primary" onClick={handleAddLot}>
                Add
              </Button>
            </div>

            <Table
              dataSource={invoiceDetails}
              columns={detailColumns}
              rowKey={(record, index) => index}
              pagination={false}
              scroll={{ x: 'max-content', y: 400 }}
              size="small"
              bordered
            />
          </Card>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {editingId ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={`Invoice #${selectedInvoice?.voucherNo}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={1400}
      >
        {selectedInvoice && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Head" key="1">
              <Card bordered={false}>
                <Row gutter={16}>
                  <Col span={4}><strong>Voucher No.:</strong> {selectedInvoice.voucherNo}</Col>
                  <Col span={4}><strong>Invoice Date:</strong> {dayjs(selectedInvoice.invoiceDate).format('DD/MM/YYYY')}</Col>
                  <Col span={4}><strong>TC Type:</strong> {selectedInvoice.tcType || '-'}</Col>
                  <Col span={4}><strong>Insurance:</strong> 0 SPOT FOR</Col>
                  <Col span={4}><strong>Charity:</strong> 0</Col>
                </Row>
                <Row gutter={16} style={{ marginTop: '10px' }}>
                  <Col span={4}><strong>Weight:</strong> {Number(selectedInvoice.weight).toFixed(3)}</Col>
                  <Col span={4}><strong>Quantity:</strong> {selectedInvoice.quantity}</Col>
                  <Col span={4}><strong>Invoice Value:</strong> ₹{Number(selectedInvoice.invoiceValue).toFixed(2)}</Col>
                  <Col span={4}><strong>Freight:</strong> ₹{Number(selectedInvoice.freight).toFixed(2)}</Col>
                  <Col span={4}><strong>Bill No.:</strong> {selectedInvoice.billNo || '-'}</Col>
                  <Col span={4}><strong>Bill Date:</strong> {selectedInvoice.billDate ? dayjs(selectedInvoice.billDate).format('DD/MM/YYYY') : '-'}</Col>
                </Row>
                <Row gutter={16} style={{ marginTop: '10px' }}>
                  <Col span={4}><strong>Edu.Cess:</strong> 0</Col>
                  <Col span={4}><strong>Hr.Sec.Cess:</strong> 0</Col>
                  <Col span={4}><strong>CST:</strong> 0</Col>
                  <Col span={4}><strong>TNEST:</strong> 0</Col>
                  <Col span={4}><strong>VAT:</strong> 0</Col>
                  <Col span={4}><strong>Commission:</strong> 0</Col>
                </Row>
                <Row gutter={16} style={{ marginTop: '10px' }}>
                  <Col span={4}><strong>TCS:</strong> 0</Col>
                  <Col span={4}><strong>Round Off:</strong> 0.33</Col>
                  <Col span={8}><strong>Net Amount:</strong> ₹{Number(selectedInvoice.netAmount).toFixed(2)}</Col>
                  <Col span={8}><strong>Remarks:</strong> {selectedInvoice.remarks || '-'}</Col>
                </Row>

                <Divider orientation="left">Service Tax & TDS</Divider>
                
                <Row gutter={16}>
                  <Col span={4}><strong>Total LR Value:</strong> 0</Col>
                  <Col span={4}><strong>LR Value:</strong> 0</Col>
                  <Col span={4}><strong>Service Tax:</strong> 0</Col>
                  <Col span={4}><strong>Educ. Cess:</strong> 0</Col>
                  <Col span={4}><strong>Hr.Sec.Cess:</strong> 0</Col>
                  <Col span={4}><strong>TDS:</strong> ₹{Number(selectedInvoice.tds || 0).toFixed(2)}</Col>
                </Row>
                <Row gutter={16} style={{ marginTop: '10px' }}>
                  <Col span={4}><strong>SGST:</strong> ₹{Number(selectedInvoice.sgst || 0).toFixed(2)}</Col>
                  <Col span={4}><strong>CGST:</strong> ₹{Number(selectedInvoice.cgst || 0).toFixed(2)}</Col>
                  <Col span={4}><strong>IGST:</strong> ₹{Number(selectedInvoice.igst || 0).toFixed(2)}</Col>
                </Row>
              </Card>
            </TabPane>

            <TabPane tab="Details" key="2">
              <Table
                dataSource={selectedInvoice.details}
                columns={detailColumns.filter(col => col.title !== 'Actions')}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
                size="small"
                bordered
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default FinalInvoice;
