// frontend/src/pages/admin/transaction-cotton/IssueEntryManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import issueService from '../../services/admin1/transaction-cotton/issueService';
import mixingGroupService from '../../services/admin1/master/mixingGroupService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';

const IssueEntryManagement = () => {
  const navigate = useNavigate();
  // ────────────────────────────────────────────────
  //          ✅ SYNC CACHING (FIX #1)
  // ────────────────────────────────────────────────
  const mixingGroupCacheRef = useRef({});
  const pendingRequestsRef = useRef({});
  // ────────────────────────────────────────────────
  //                  STATES
  // ────────────────────────────────────────────────
  const [issues, setIssues] = useState([]);
  const [mixingGroups, setMixingGroups] = useState([]);
  const [availableLots, setAvailableLots] = useState([]);
  const [availableBales, setAvailableBales] = useState([]);
  const [selectedLotDetails, setSelectedLotDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [mixingGroupLoading, setMixingGroupLoading] = useState(false);
  const [balesLoading, setBalesLoading] = useState(false);
  const [issueNoLoading, setIssueNoLoading] = useState(false);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDates, setReportDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [editingIssue, setEditingIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    issueNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    mixingNo: '',
    mixingGroupId: '',           
    mixingGroupName: '',
    toMixingGroupId: '',
    toMixingGroupName: '',
    lotId: '',
    lotNo: '',
    issueQty: '',
    selectedBales: [],
    totalBales: 0,
    totalWeight: 0,
    totalValue: 0
  });

  // Dropdown states
  const [showFromMixingGroupDropdown, setShowFromMixingGroupDropdown] = useState(false);
  const [showToMixingGroupDropdown, setShowToMixingGroupDropdown] = useState(false);
  const [showLotDropdown, setShowLotDropdown] = useState(false);
  const [fromMixingGroupSearch, setFromMixingGroupSearch] = useState('');
  const [toMixingGroupSearch, setToMixingGroupSearch] = useState('');
  const [lotSearch, setLotSearch] = useState('');

  const [mixingGroupNames, setMixingGroupNames] = useState({});

  const fromMixingGroupRef = useRef(null);
  const toMixingGroupRef = useRef(null);
  const lotRef = useRef(null);

  // ────────────────────────────────────────────────
  //                  EFFECTS
  // ────────────────────────────────────────────────
  // useEffect(() => {
  //   fetchIssues();
  //   fetchMixingGroups();
  //   fetchAvailableLots();
  // }, []);
  // ✅ IMPROVED: Fetch mixing groups first (warm cache), then issues
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchMixingGroups();      // Load and cache all groups FIRST
        await fetchAvailableLots();
        await fetchIssues();            // Load issues LAST (cache is now warm)
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromMixingGroupRef.current && !fromMixingGroupRef.current.contains(event.target)) {
        setShowFromMixingGroupDropdown(false);
      }
      if (toMixingGroupRef.current && !toMixingGroupRef.current.contains(event.target)) {
        setShowToMixingGroupDropdown(false);
      }
      if (lotRef.current && !lotRef.current.contains(event.target)) {
        setShowLotDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ────────────────────────────────────────────────
  //                  DATA FETCHING
  // ────────────────────────────────────────────────
  // const fetchMixingGroupName = async (id) => {
  //   if (!id || mixingGroupNames[id]) return mixingGroupNames[id];
  //   try {
  //     const res = await mixingGroupService.getById(id);
  //     const name = res.mixingName || `Group ${id}`;
  //     setMixingGroupNames(prev => ({ ...prev, [id]: name }));
  //     return name;
  //   } catch {
  //     return `Group ${id}`;
  //   }
  // };
  // ✅ FIXED: Use synchronous cache + request deduplication
  const fetchMixingGroupName = async (id) => {
    if (!id) return '';
    
    // ✅ Step 1: Check synchronous cache first (instant)
    if (mixingGroupCacheRef.current[id]) {
      return mixingGroupCacheRef.current[id];
    }
    
    // ✅ Step 2: If request is already pending, wait for existing request
    if (pendingRequestsRef.current[id]) {
      return pendingRequestsRef.current[id];
    }
    
    try {
      // ✅ Step 3: Create the promise and track it
      const promise = (async () => {
        const res = await mixingGroupService.getById(id);
        const name = res.mixingName || `Group ${id}`;
        
        // Update synchronous cache immediately
        mixingGroupCacheRef.current[id] = name;
        
        // Also update state for component display
        setMixingGroupNames(prev => ({ ...prev, [id]: name }));
        
        return name;
      })();
      
      // Mark request as pending
      pendingRequestsRef.current[id] = promise;
      
      // Wait for result
      const result = await promise;
      
      // Clean up pending request
      delete pendingRequestsRef.current[id];
      
      return result;
    } catch {
      const fallback = `Group ${id}`;
      mixingGroupCacheRef.current[id] = fallback;
      delete pendingRequestsRef.current[id];
      return fallback;
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await issueService.getAll();
      const issuesData = Array.isArray(response) ? response : (response.issues || []);

      const processed = await Promise.all(issuesData.map(async (issue) => {
        const [fromName, toName] = await Promise.all([
          fetchMixingGroupName(issue.mixingGroupId),
          fetchMixingGroupName(issue.toMixingGroupId)
        ]);

        return {
          id: issue.id,
          issueNumber: issue.issueNumber,
          issueDate: issue.issueDate,
          mixingNo: issue.mixingNo,
          mixingGroupId: issue.mixingGroupId,
          mixingGroupName: fromName,
          toMixingGroupId: issue.toMixingGroupId,
          toMixingGroupName: toName,
          issueQty: issue.issueQty,
          lotNo: issue.IssueItems?.[0]?.InwardLotWeightment?.lotNo || '',
          issuedBales: (issue.IssueItems || []).map(item => ({
            id: item.weightmentId,
            baleNo: item.InwardLotWeightment?.baleNo || `B${item.weightmentId}`,
            baleWeight: Number(item.issueWeight || item.InwardLotWeightment?.baleWeight || 0),
            baleValue: Number(item.InwardLotWeightment?.baleValue || 0),
            lotNo: item.InwardLotWeightment?.lotNo || ''
          })),
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt
        };
      }));

      setIssues(processed);
    } catch (err) {
      setError('Failed to load issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  // const fetchMixingGroups = async () => {
  //   setMixingGroupLoading(true);
  //   try {
  //     const res = await mixingGroupService.getAll();
  //     const groups = Array.isArray(res) ? res : [];
  //     setMixingGroups(groups);

  //     const names = {};
  //     groups.forEach(g => { if (g.id) names[g.id] = g.mixingName || `Group ${g.id}`; });
  //     setMixingGroupNames(names);
  //   } catch {
  //     // silent fail
  //   } finally {
  //     setMixingGroupLoading(false);
  //   }
  // };
  // ✅ IMPROVED: Pre-populate cache from fetched groups
  const fetchMixingGroups = async () => {
    setMixingGroupLoading(true);
    try {
      const res = await mixingGroupService.getAll();
      const groups = Array.isArray(res) ? res : [];
      setMixingGroups(groups);

      const names = {};
      groups.forEach(g => { 
        if (g.id) {
          const name = g.mixingName || `Group ${g.id}`;
          names[g.id] = name;
          // ✅ Pre-populate the synchronous ref cache
          mixingGroupCacheRef.current[g.id] = name;
        }
      });
      setMixingGroupNames(names);
    } catch (err) {
      console.error('Error fetching mixing groups:', err);
    } finally {
      setMixingGroupLoading(false);
    }
  };

  const fetchAvailableLots = async () => {
    setLotsLoading(true);
    try {
      const res = await inwardLotService.getAll();
      setAvailableLots(Array.isArray(res) ? res : []);
    } catch {
      setAvailableLots([]);
    } finally {
      setLotsLoading(false);
    }
  };

  const fetchAvailableBales = async (lotId) => {
    if (!lotId) return;
    setBalesLoading(true);
    try {
      const lot = await inwardLotService.getById(lotId);
      setSelectedLotDetails(lot);

      const weightments = lot.weightments || lot.InwardLotWeightments || [];
      const available = weightments.filter(w => !w.isIssued);

      setAvailableBales(available.map(w => ({
        id: w.id,
        baleNo: w.baleNo || `B${w.id}`,
        baleWeight: Number(w.baleWeight || w.grossWeight || 0),
        grossWeight: Number(w.grossWeight || 0),
        baleValue: Number(w.baleValue || 0),
        lotNo: lot.lotNo
      })));
    } catch {
      setAvailableBales([]);
    } finally {
      setBalesLoading(false);
    }
  };

  const fetchNextIssueNumber = async () => {
    setIssueNoLoading(true);
    try {
      const next = await issueService.getNextIssueNo();
      setFormData(prev => ({ ...prev, issueNumber: next || '' }));
    } catch {
      const yy = new Date().getFullYear().toString().slice(-2);
      const nextYy = String(Number(yy) + 1).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        issueNumber: `ISSUE/${yy}-${nextYy}/${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      }));
    } finally {
      setIssueNoLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  //                  REPORT GENERATION (SIMPLE PDF)
  // ────────────────────────────────────────────────
  const handleGenerateReport = async () => {
    if (!reportDates.startDate || !reportDates.endDate) {
      setError("Please select both start and end dates");
      return;
    }
    
    setReportGenerating(true);
    setShowReportModal(false);
    
    try {
      // Fetch report data
      const data = await issueService.getDailyIssueReport(reportDates.startDate, reportDates.endDate);
      
      if (!data || data.length === 0) {
        throw new Error('No data found for the selected date range');
      }
      
      // Process data
      const groupedByVariety = {};
      data.forEach(issue => {
        (issue.IssueItems || []).forEach(item => {
          const weightment = item.InwardLotWeightment;
          const inwardLot = weightment?.inwardLot;
          const inwardEntry = inwardLot?.InwardEntry || inwardLot?.inwardEntry;
          const po = inwardEntry?.purchaseOrder;
          
          const varietyName = po?.variety?.varietyName || 'OTHER';
          const lotNo = inwardLot?.lotNo || 'UNKNOWN';
          const partyName = po?.supplier?.supplierName || '';
          const godownName = inwardLot?.godown?.godownName || '';

          if (!groupedByVariety[varietyName]) groupedByVariety[varietyName] = {};
          if (!groupedByVariety[varietyName][lotNo]) {
            groupedByVariety[varietyName][lotNo] = {
              lotNo, partyName, qty: 0, issueWt: 0, issueValue: 0, godown: godownName, mixingNo: issue.mixingNo
            };
          }

          const lotGroup = groupedByVariety[varietyName][lotNo];
          lotGroup.qty += 1;
          lotGroup.issueWt += Number(item.issueWeight || 0);
          lotGroup.issueValue += Number(weightment?.baleValue || 0);
        });
      });

      const finalData = {};
      Object.keys(groupedByVariety).forEach(v => {
        finalData[v] = Object.values(groupedByVariety[v]);
      });

      if (Object.keys(finalData).length === 0) {
        throw new Error('No valid data to generate report');
      }

      // Open print window with report
      openPrintWindow(finalData, reportDates.startDate, reportDates.endDate);
      
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.message || "Failed to generate report");
      setShowReportModal(true);
    } finally {
      setReportGenerating(false);
    }
  };

  const openPrintWindow = (reportData, startDate, endDate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Please allow pop-ups to generate report');
      return;
    }

    const htmlContent = generateReportHTML(reportData, startDate, endDate);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
      // Optional: Close after print or keep open
      // printWindow.onafterprint = () => printWindow.close();
    };
  };

  const generateReportHTML = (reportData, startDate, endDate) => {
    const allLots = Object.values(reportData).flat();
    const totalQty = allLots.reduce((sum, item) => sum + item.qty, 0);
    const totalWt = allLots.reduce((sum, item) => sum + item.issueWt, 0);
    const totalValue = allLots.reduce((sum, item) => sum + item.issueValue, 0);

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatValue = (value) => {
      return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Daily Issue Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, Helvetica, sans-serif;
          padding: 15mm;
          width: 210mm;
          background: white;
          margin: 0 auto;
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0;
        }
        
        .report-title {
          font-size: 11px;
          font-weight: bold;
          border-bottom: 1px solid #9ca3af;
          display: inline-block;
          padding: 0 30px;
          margin: 5px 0 0 0;
        }
        
        .info-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: bold;
        }
        
        .date-info {
          color: #1e3a8a;
        }
        
        .mixing-no {
          border-bottom: 1px solid black;
          padding: 0 15px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        
        th {
          padding: 4px 0;
          text-align: left;
        }
        
        .table-header {
          border-top: 2px solid #b91c1c;
          border-bottom: 2px solid #b91c1c;
          color: #1e3a8a;
        }
        
        .sl-no { width: 40px; }
        .lot-no { text-align: left; }
        .party-name { text-align: left; padding-left: 8px; }
        .qty { text-align: right; width: 50px; }
        .issue-wt { text-align: right; width: 80px; }
        .issue-value { text-align: right; width: 110px; }
        .godown { text-align: left; width: 65px; padding-left: 15px; }
        
        .variety-row td {
          padding: 6px 0;
          font-weight: bold;
          color: #1e3a8a;
          border-bottom: 1px solid #e5e7eb;
          text-transform: uppercase;
        }
        
        .data-row {
          border-bottom: 1px solid #f3f4f6;
        }
        
        .data-row td {
          padding: 4px 0;
        }
        
        .total-row {
          border-top: 1px dotted black;
        }
        
        .total-row td {
          padding: 4px 0;
          font-weight: bold;
        }
        
        .total-values {
          border-bottom: 2px double black;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
          margin-bottom: 60px;
          padding: 0 15px;
        }
        
        .signature-item {
          text-align: center;
        }
        
        .signature-label {
          font-weight: bold;
          margin-bottom: 40px;
          font-size: 11px;
        }
        
        .signature-line {
          border-top: 1px solid black;
          width: 130px;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 16px;
          border-top: 1px solid #b91c1c;
          font-size: 9px;
          display: flex;
          justify-content: space-between;
          text-transform: uppercase;
        }
        
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1 class="company-name">Kayaar Exports Private Limited.,</h1>
        <p class="report-title">Daily Issue LotNo Wise As on ${formatDate(endDate)}</p>
      </div>

      <div class="info-bar">
        <div>Date : <span class="date-info">${formatDate(endDate)}</span> &nbsp; & Time : <span class="date-info">${currentTime}</span></div>
        <div>Mixing No: &nbsp; <span class="mixing-no">${allLots[0]?.mixingNo || ''}</span></div>
      </div>

      <table>
        <thead>
          <tr class="table-header">
            <th class="sl-no">Sl.No</th>
            <th class="lot-no">Lot No</th>
            <th class="party-name">Party Name</th>
            <th class="qty">Qty</th>
            <th class="issue-wt">Issue Wt</th>
            <th class="issue-value">Issue Value</th>
            <th class="godown">Godown</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(reportData).map((variety) => `
            <tr class="variety-row">
              <td colspan="7">${variety}</td>
            </tr>
            ${reportData[variety].map((item, idx) => `
              <tr class="data-row">
                <td class="sl-no">${idx + 1}</td>
                <td class="lot-no">${item.lotNo}</td>
                <td class="party-name" style="text-transform: uppercase;">${item.partyName}</td>
                <td class="qty">${item.qty}</td>
                <td class="issue-wt">${item.issueWt.toFixed(2)}</td>
                <td class="issue-value">${formatValue(item.issueValue)}</td>
                <td class="godown" style="text-transform: uppercase;">${item.godown}</td>
              </tr>
            `).join('')}
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3" style="text-align: right;">&nbsp;</td>
            <td class="qty total-values">${totalQty}</td>
            <td class="issue-wt total-values">${totalWt.toFixed(2)}</td>
            <td class="issue-value total-values">${formatValue(totalValue)}</td>
            <td class="godown">&nbsp;</td>
          </tr>
        </tfoot>
      </table>

      <div class="signatures">
        <div class="signature-item">
          <p class="signature-label">Prepared by</p>
          <div class="signature-line"></div>
        </div>
        <div class="signature-item">
          <p class="signature-label">Verified by</p>
          <div class="signature-line"></div>
        </div>
        <div class="signature-item">
          <p class="signature-label">Approved by</p>
          <div class="signature-line"></div>
        </div>
      </div>

      <div class="footer">
        <div>Start Date : ${formatDate(startDate)} &nbsp;&nbsp;&nbsp; End Date : ${formatDate(endDate)}</div>
        <div style="font-weight: bold;">&lt;&lt;&lt; End of Statement &gt;&gt;&gt;</div>
        <div>Page 1 of 1</div>
      </div>
      
      <script>
        // Auto-trigger print when window loads
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>`;
  };

  const formatDateForFilename = (dateStr) => {
    if (!dateStr) return 'report';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  // ────────────────────────────────────────────────
  //                  FILTERS & HELPERS
  // ────────────────────────────────────────────────
  const filteredMixingGroups = mixingGroups.filter(g =>
    !fromMixingGroupSearch.trim() && !toMixingGroupSearch.trim() ||
    (fromMixingGroupSearch || toMixingGroupSearch).toLowerCase().includes(g.mixingName?.toLowerCase() || '') ||
    (fromMixingGroupSearch || toMixingGroupSearch).includes(g.code || g.mixingCode || '')
  );

  const filteredLots = availableLots.filter(lot =>
    !lotSearch.trim() || lot.lotNo?.toLowerCase().includes(lotSearch.toLowerCase())
  );

  const filteredIssues = issues.filter(issue =>
    !searchTerm.trim() ||
    issue.issueNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.mixingGroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.toMixingGroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.mixingNo?.toString().includes(searchTerm) ||
    issue.lotNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ────────────────────────────────────────────────
  //                  HANDLERS
  // ────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'issueNumber' && !editingIssue) return;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'mixingNo' || name === 'issueQty') ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleLotSelect = (lot) => {
    setFormData(prev => ({
      ...prev,
      lotId: lot.id,
      lotNo: lot.lotNo,
      selectedBales: []
    }));
    setLotSearch(lot.lotNo);
    setShowLotDropdown(false);
    fetchAvailableBales(lot.id);
  };

  const handleBaleSelect = (bale) => {
    setFormData(prev => {
      const selected = prev.selectedBales.some(b => b.id === bale.id);
      let newSelected = selected
        ? prev.selectedBales.filter(b => b.id !== bale.id)
        : [...prev.selectedBales, bale];

      return {
        ...prev,
        selectedBales: newSelected,
        issueQty: newSelected.length,
        totalBales: newSelected.length,
        totalWeight: newSelected.reduce((sum, b) => sum + (b.baleWeight || 0), 0),
        totalValue: newSelected.reduce((sum, b) => sum + (b.baleValue || 0), 0)
      };
    });
  };

  const handleFromMixingGroupSelect = (group) => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: group.id,
      mixingGroupName: group.mixingName || `Group ${group.id}`
    }));
    setFromMixingGroupSearch(group.mixingName || `Group ${group.id}`);
    setShowFromMixingGroupDropdown(false);
  };

  const handleToMixingGroupSelect = (group) => {
    setFormData(prev => ({
      ...prev,
      toMixingGroupId: group.id,
      toMixingGroupName: group.mixingName || `Group ${group.id}`
    }));
    setToMixingGroupSearch(group.mixingName || `Group ${group.id}`);
    setShowToMixingGroupDropdown(false);
  };

  const clearFromMixingGroupSelection = () => {
    setFormData(prev => ({ ...prev, mixingGroupId: '', mixingGroupName: '' }));
    setFromMixingGroupSearch('');
  };

  const clearToMixingGroupSelection = () => {
    setFormData(prev => ({ ...prev, toMixingGroupId: '', toMixingGroupName: '' }));
    setToMixingGroupSearch('');
  };

  const clearLotSelection = () => {
    setFormData(prev => ({
      ...prev,
      lotId: '', lotNo: '', selectedBales: [], totalBales: 0, totalWeight: 0, totalValue: 0
    }));
    setLotSearch('');
    setAvailableBales([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.issueDate) return setError('Issue date is required');
    if (!formData.mixingGroupId) return setError('Select from mixing group');
    if (!formData.toMixingGroupId) return setError('Select to mixing group');
    if (!formData.lotId || !formData.lotNo) return setError('Select a lot');
    if (!formData.selectedBales.length) return setError('Select at least one bale');

    try {
      const payload = {
        issueNumber: formData.issueNumber.trim(),
        issueDate: formData.issueDate,
        mixingNo: Number(formData.mixingNo) || 0,
        mixingGroupId: Number(formData.mixingGroupId),
        toMixingGroupId: Number(formData.toMixingGroupId),
        items: formData.selectedBales.map(b => ({
          weightmentId: Number(b.id),
          issueWeight: Number(b.baleWeight) || 0
        }))
      };

      if (editingIssue) {
        await issueService.update(editingIssue.id, payload);
        setSuccess('Issue updated successfully');
      } else {
        await issueService.create(payload);
        setSuccess('Issue created successfully');
      }

      await fetchIssues();
      resetForm();
      setShowModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save issue');
    }
  };

  const handleEdit = async (issue) => {
    setEditingIssue(issue);

    const lot = availableLots.find(l => l.lotNo === issue.lotNo);
    let lotId = '';
    if (lot) {
      lotId = lot.id;
      await fetchAvailableBales(lot.id);
    }

    setFormData({
      issueNumber: issue.issueNumber,
      issueDate: issue.issueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      mixingNo: issue.mixingNo || '',
      mixingGroupId: issue.mixingGroupId || '',
      mixingGroupName: issue.mixingGroupName || '',
      toMixingGroupId: issue.toMixingGroupId || '',
      toMixingGroupName: issue.toMixingGroupName || '',
      lotId,
      lotNo: issue.lotNo || '',
      issueQty: issue.issueQty || issue.issuedBales?.length || 0,
      selectedBales: issue.issuedBales || [],
      totalBales: issue.issuedBales?.length || 0,
      totalWeight: issue.issuedBales?.reduce((s, b) => s + b.baleWeight, 0) || 0,
      totalValue: issue.issuedBales?.reduce((s, b) => s + (b.baleValue || 0), 0) || 0
    });

    setFromMixingGroupSearch(issue.mixingGroupName || '');
    setToMixingGroupSearch(issue.toMixingGroupName || '');
    setLotSearch(issue.lotNo || '');
    setShowModal(true);
  };

  const handleView = (issue) => {
    setViewingIssue(issue);
    setShowViewModal(true);
  };

  const handleDelete = async (id, issueNo) => {
    if (!window.confirm(`Delete issue ${issueNo}?`)) return;
    try {
      await issueService.delete(id);
      setSuccess('Issue deleted');
      fetchIssues();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete issue');
    }
  };

  const resetForm = () => {
    setFormData({
      issueNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      mixingNo: '',
      mixingGroupId: '',
      mixingGroupName: '',
      toMixingGroupId: '',
      toMixingGroupName: '',
      lotId: '',
      lotNo: '',
      issueQty: '',
      selectedBales: [],
      totalBales: 0,
      totalWeight: 0,
      totalValue: 0
    });
    setFromMixingGroupSearch('');
    setToMixingGroupSearch('');
    setLotSearch('');
    setAvailableBales([]);
    setSelectedLotDetails(null);
    setEditingIssue(null);
  };

  const openCreateModal = () => {
    resetForm();
    fetchNextIssueNumber();
    setShowModal(true);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';
  const formatNumber = (n, dec = 2) => (n ?? 0).toFixed(dec);

  // ────────────────────────────────────────────────
  //                  RENDER
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Issue Entry Management</h1>
            <p className="text-gray-600 mt-1">Manage bale issues between mixing groups</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            + New Issue
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <span className="mr-3">⚠</span> {error}
          <button className="ml-auto" onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
          <span className="mr-3">✓</span> {success}
          <button className="ml-auto" onClick={() => setSuccess('')}>×</button>
        </div>
      )}
      {reportGenerating && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center">
          <span className="mr-3">⏳</span> Generating report, please wait...
        </div>
      )}

      {/* Search & Actions */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >×</button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <span>📊</span> Report
            </button>
            <button
              onClick={() => {
                fetchIssues();
                fetchMixingGroups();
                fetchAvailableLots();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">Loading...</div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No issues found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue No / Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mixing Groups</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredIssues.map(issue => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{issue.issueNumber}</div>
                      <div className="text-sm text-gray-500">{formatDate(issue.issueDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>From: {issue.mixingGroupName}</div>
                      <div>To: {issue.toMixingGroupName}</div>
                    </td>
                    <td className="px-6 py-4">
                      {issue.lotNo}
                    </td>
                    <td className="px-6 py-4">
                      {issue.issueQty} bales
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleView(issue)} className="text-blue-600 mr-3">View</button>
                      <button onClick={() => handleEdit(issue)} className="text-blue-600 mr-3">Edit</button>
                      <button onClick={() => handleDelete(issue.id, issue.issueNumber)} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ──────────────── MODAL ──────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingIssue ? 'Edit Issue' : 'New Issue'}</h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Issue Number</label>
                      <input
                        type="text"
                        name="issueNumber"
                        value={formData.issueNumber}
                        readOnly={!editingIssue}
                        className="w-full border rounded px-3 py-2 bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Issue Date *</label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Mixing No</label>
                      <input
                        type="number"
                        name="mixingNo"
                        value={formData.mixingNo}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>

                    {/* Lot selection */}
                    <div ref={lotRef}>
                      <label className="block text-sm font-medium mb-1">Lot Number *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={lotSearch}
                          onChange={e => { setLotSearch(e.target.value); setShowLotDropdown(true); }}
                          onFocus={() => setShowLotDropdown(true)}
                          placeholder="Search lot..."
                          className="w-full pl-10 pr-10 py-2 border rounded"
                          required
                        />
                        {formData.lotNo && (
                          <button type="button" onClick={clearLotSelection} className="absolute right-3 top-1/2 -translate-y-1/2">×</button>
                        )}
                        {showLotDropdown && (
                          <div className="absolute w-full bg-white border rounded mt-1 max-h-60 overflow-auto shadow-lg z-10">
                            {filteredLots.map(lot => (
                              <div
                                key={lot.id}
                                onClick={() => handleLotSelect(lot)}
                                className={`p-3 cursor-pointer hover:bg-blue-50 ${formData.lotNo === lot.lotNo ? 'bg-blue-100' : ''}`}
                              >
                                {lot.lotNo} ({lot.qty} bales)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">From Mixing Group *</label>
                      <div ref={fromMixingGroupRef} className="relative">
                        <input
                          type="text"
                          value={fromMixingGroupSearch}
                          onChange={e => { setFromMixingGroupSearch(e.target.value); setShowFromMixingGroupDropdown(true); }}
                          onFocus={() => setShowFromMixingGroupDropdown(true)}
                          className="w-full pl-10 pr-10 py-2 border rounded"
                          required
                        />
                        {formData.mixingGroupId && <button type="button" onClick={clearFromMixingGroupSelection} className="absolute right-3 top-1/2 -translate-y-1/2">×</button>}
                        {showFromMixingGroupDropdown && (
                          <div className="absolute w-full bg-white border rounded mt-1 max-h-60 overflow-auto shadow-lg z-10">
                            {filteredMixingGroups.map(g => (
                              <div
                                key={g.id}
                                onClick={() => handleFromMixingGroupSelect(g)}
                                className={`p-3 cursor-pointer hover:bg-blue-50 ${formData.mixingGroupId === g.id ? 'bg-blue-100' : ''}`}
                              >
                                {g.mixingName || g.id}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">To Mixing Group *</label>
                      <div ref={toMixingGroupRef} className="relative">
                        <input
                          type="text"
                          value={toMixingGroupSearch}
                          onChange={e => { setToMixingGroupSearch(e.target.value); setShowToMixingGroupDropdown(true); }}
                          onFocus={() => setShowToMixingGroupDropdown(true)}
                          className="w-full pl-10 pr-10 py-2 border rounded"
                          required
                        />
                        {formData.toMixingGroupId && <button type="button" onClick={clearToMixingGroupSelection} className="absolute right-3 top-1/2 -translate-y-1/2">×</button>}
                        {showToMixingGroupDropdown && (
                          <div className="absolute w-full bg-white border rounded mt-1 max-h-60 overflow-auto shadow-lg z-10">
                            {filteredMixingGroups.map(g => (
                              <div
                                key={g.id}
                                onClick={() => handleToMixingGroupSelect(g)}
                                className={`p-3 cursor-pointer hover:bg-blue-50 ${formData.toMixingGroupId === g.id ? 'bg-blue-100' : ''}`}
                              >
                                {g.mixingName || g.id}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right column - Bale selection */}
                  <div className="space-y-6">
                    <div className="border rounded p-4 bg-gray-50">
                      <h3 className="font-medium mb-3">Available Bales {formData.lotNo ? `(${availableBales.length})` : ''}</h3>
                      {balesLoading ? (
                        <div>Loading bales...</div>
                      ) : availableBales.length > 0 ? (
                        <div className="max-h-80 overflow-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2">Select</th>
                                <th className="p-2">Bale No</th>
                                <th className="p-2">Weight (kg)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {availableBales.map(bale => {
                                const selected = formData.selectedBales.some(s => s.id === bale.id);
                                return (
                                  <tr
                                    key={bale.id}
                                    onClick={() => handleBaleSelect(bale)}
                                    className={`cursor-pointer ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                  >
                                    <td className="p-2 text-center">{selected ? '✔' : ''}</td>
                                    <td className="p-2">{bale.baleNo}</td>
                                    <td className="p-2">{formatNumber(bale.baleWeight)}</td>
                                   </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {formData.lotNo ? 'No available bales' : 'Select lot first'}
                        </div>
                      )}
                    </div>

                    <div className="border rounded p-4 bg-gray-50">
                      <h3 className="font-medium mb-3">Selected Bales ({formData.selectedBales.length})</h3>
                      {formData.selectedBales.length > 0 ? (
                        <div className="max-h-60 overflow-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2">Bale No</th>
                                <th className="p-2">Weight (kg)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData.selectedBales.map(b => (
                                <tr key={b.id}>
                                  <td className="p-2">{b.baleNo}</td>
                                  <td className="p-2">{formatNumber(b.baleWeight)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">No bales selected</div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Bales</div>
                        <div className="text-xl font-bold">{formData.totalBales}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Weight</div>
                        <div className="text-xl font-bold">{formatNumber(formData.totalWeight)} kg</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Value</div>
                        <div className="text-xl font-bold">₹{formatNumber(formData.totalValue)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-5 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={formData.selectedBales.length === 0}
                  >
                    {editingIssue ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold">Issue Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-600">×</button>
            </div>
            <div className="space-y-4">
              <p><strong>Issue No:</strong> {viewingIssue.issueNumber}</p>
              <p><strong>Date:</strong> {formatDate(viewingIssue.issueDate)}</p>
              <p><strong>Lot No:</strong> {viewingIssue.lotNo}</p>
              <p><strong>From:</strong> {viewingIssue.mixingGroupName}</p>
              <p><strong>To:</strong> {viewingIssue.toMixingGroupName}</p>
              <p><strong>Total Bales:</strong> {viewingIssue.issueQty}</p>
              
              {viewingIssue.issuedBales && viewingIssue.issuedBales.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2 mt-4 text-gray-800 border-b pb-2">Selected Bales</h3>
                  <div className="max-h-60 overflow-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left border-b">Bale No</th>
                          <th className="p-2 text-left border-b">Weight (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingIssue.issuedBales.map(bale => (
                          <tr key={bale.id} className="hover:bg-gray-50 border-b last:border-0">
                            <td className="p-2">{bale.baleNo}</td>
                            <td className="p-2">{formatNumber(bale.baleWeight)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-5 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Generate Daily Issue Report</h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={reportDates.startDate}
                  onChange={e => setReportDates(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={reportDates.endDate}
                  onChange={e => setReportDates(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={reportGenerating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold disabled:opacity-50"
              >
                {reportGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueEntryManagement;
