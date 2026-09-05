import React, { useEffect, useMemo, useState, useRef } from "react";
import { getQCDefinitions, getQCOptions, getQCReport } from "../../services/admin2/transaction-qc/qcReportCatalogService";
import { printReport } from "../../utils/reports/reportPrinter";
import { exportReportToCSV } from "../../utils/reports/csvExporter";
import MultiSelectCheckboxDropdown from "../../components/Common/MultiSelectCheckboxDropdown";

const QCReportsCatalog = () => {
  const [definitions, setDefinitions] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [values, setValues] = useState({});
  const [options, setOptions] = useState({});
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Load report definitions on mount
  useEffect(() => {
    getQCDefinitions()
      .then((items) => {
        setDefinitions(items);
        if (items.length > 0) {
          setSelectedReportId(items[0].id);
        }
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load QC report catalogue"));
  }, []);

  // Click outside to close custom report search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Currently selected report definition object
  const selectedReport = useMemo(() => {
    return definitions.find((r) => r.id === selectedReportId) || null;
  }, [definitions, selectedReportId]);

  // Filtered reports for type-to-search dropdown
  const filteredReports = useMemo(() => {
    if (!reportSearchTerm.trim()) return definitions;
    const term = reportSearchTerm.toLowerCase();
    return definitions.filter((r) => r.name.toLowerCase().includes(term));
  }, [definitions, reportSearchTerm]);

  // Load options for dynamic filters (states, lots, machines, counts)
  useEffect(() => {
    if (!selectedReport) return;
    setReportData(null);
    setError("");

    const filterSelects = selectedReport.parameters?.filter((p) => p.type === "select" && p.source) || [];
    filterSelects.forEach((parameter) => {
      if (!options[parameter.source]) {
        getQCOptions(parameter.source)
          .then((items) => setOptions((prev) => ({ ...prev, [parameter.source]: items })))
          .catch(() => setOptions((prev) => ({ ...prev, [parameter.source]: [] })));
      }
    });
  }, [selectedReport]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setReportData(null);

    if (!selectedReport) return;

    if (!values.fromDate || !values.toDate) {
      setError("Please select both From Date and To Date.");
      return;
    }

    setGenerating(true);
    try {
      const queryParams = Object.fromEntries(
        Object.entries(values).filter(([, val]) => val !== "" && val !== undefined && val !== null)
      );
      const data = await getQCReport(selectedReport.id, queryParams);
      setReportData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectAll = (paramKey, source) => {
    const opts = options[source] || [];
    const allVals = opts.map(o => o.value).join(",");
    setValues(prev => ({ ...prev, [paramKey]: allVals }));
  };

  const handleClear = () => {
    setValues({});
    setReportData(null);
    setError("");
  };

  const handlePrint = () => {
    if (!reportData) return;
    printReport({
      ...reportData,
      companyName: "Kayaar Exports Private Limited",
      fromDate: values.fromDate,
      toDate: values.toDate
    });
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    exportReportToCSV({
      ...reportData,
      companyName: "Kayaar Exports Private Limited",
      fromDate: values.fromDate,
      toDate: values.toDate
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Transaction - QC Reports</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">QC Testing Reports</h1>
            <p className="mt-1 text-sm text-slate-500">Select a QC report, adjust parameters, and generate or print report statements.</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
              Company: Kayaar Exports Private Limited
            </span>
          </div>
        </header>

        {/* Filter & Selection Control Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Searchable Select Report Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Select Report <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg cursor-pointer flex items-center justify-between shadow-sm hover:border-blue-500 focus:outline-none"
                >
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {selectedReport ? selectedReport.name : "Select a report..."}
                  </span>
                  <span className="text-slate-400 text-xs ml-2">▼</span>
                </div>

                {/* Dropdown Panel with Filter Search Bar */}
                {isDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <input
                        type="text"
                        value={reportSearchTerm}
                        onChange={(e) => setReportSearchTerm(e.target.value)}
                        placeholder="Type to search report name..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      {filteredReports.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">No matching reports found</div>
                      ) : (
                        filteredReports.map((report) => (
                          <div
                            key={report.id}
                            onClick={() => {
                              setSelectedReportId(report.id);
                              setIsDropdownOpen(false);
                              setReportSearchTerm("");
                            }}
                            className={`p-2.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                              selectedReportId === report.id
                                ? "bg-blue-600 text-white"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {report.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filters */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={values.fromDate || ""}
                  onChange={(e) => setValues(prev => ({ ...prev, fromDate: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={values.toDate || ""}
                  onChange={(e) => setValues(prev => ({ ...prev, toDate: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Dynamic Filter Parameters (State, Lot, Machine, Count, Mic) */}
              {selectedReport?.parameters?.filter(p => p.key !== "fromDate" && p.key !== "toDate").map((param) => {
                if (param.type === "text") {
                  return (
                    <div key={param.key}>
                      <label className="block text-sm font-bold text-slate-800 mb-1">{param.label}</label>
                      <input
                        type="text"
                        value={values[param.key] || ""}
                        onChange={(e) => setValues(prev => ({ ...prev, [param.key]: e.target.value }))}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${param.label.toLowerCase()}...`}
                      />
                    </div>
                  );
                }

                if (param.type === "select") {
                  const opts = options[param.source] || [];
                  return (
                    <MultiSelectCheckboxDropdown
                      key={param.key}
                      label={param.label}
                      options={opts}
                      selectedValues={values[param.key]}
                      onChange={(newVals) => setValues(prev => ({ ...prev, [param.key]: newVals }))}
                    />
                  );
                }

                return null;
              })}

            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            {/* Controls / Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClear}
                className="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-bold"
              >
                Clear / Exit
              </button>
              <button
                type="submit"
                disabled={generating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-bold flex items-center shadow-md disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  "OK / View Report"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Report Preview Display Area */}
        {reportData && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 overflow-hidden">
            {/* Header & Print Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{reportData.companyName || "Kayaar Exports Private Limited"}</h2>
                <h3 className="text-base font-semibold text-blue-700 mt-0.5">{reportData.reportTitle}</h3>
                {(reportData.fromDate || reportData.toDate) && (
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Statement Period: {reportData.fromDate || "-"} to {reportData.toDate || "-"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition shadow flex items-center gap-2"
                >
                  <span>📊</span> Export to CSV
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition shadow flex items-center gap-2"
                >
                  <span>🖨️</span> Print Report
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-100">
                  <tr>
                    {reportData.columns?.map((col) => (
                      <th
                        key={col.key}
                        className={`px-3 py-2.5 font-bold text-slate-700 uppercase tracking-wider ${
                          col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {!reportData.rows || reportData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={reportData.columns?.length || 1} className="px-4 py-8 text-center text-sm font-semibold text-slate-500 bg-slate-50">
                        ⚠️ No Data Found for selected filters
                      </td>
                    </tr>
                  ) : (
                    reportData.rows.map((row, idx) => {
                    if (row.isGroupHeader) {
                      return (
                        <tr key={idx} className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-300">
                          <td colSpan={reportData.columns?.length || 1} className="px-3 py-2 text-left text-sm">
                            {row.groupTitle}
                          </td>
                        </tr>
                      );
                    }

                    if (row.isSubHeader) {
                      return (
                        <tr key={idx} className="bg-slate-100 font-bold text-slate-800">
                          <td colSpan={reportData.columns?.length || 1} className="px-3 py-2 text-center bg-slate-200">
                            {row.subHeaderText}
                          </td>
                        </tr>
                      );
                    }

                    if (row.isAverageRow) {
                      return (
                        <tr key={idx} className="bg-blue-50/80 font-bold text-slate-900 border-t border-b-2 border-slate-400">
                          {reportData.columns?.map((col) => (
                            <td
                              key={col.key}
                              className={`px-3 py-2 whitespace-nowrap ${
                                col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                              }`}
                            >
                              {row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : ""}
                            </td>
                          ))}
                        </tr>
                      );
                    }

                    if (row.isTotalRow) {
                      return (
                        <tr key={idx} className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-b-4 border-slate-700">
                          {reportData.columns?.map((col) => (
                            <td
                              key={col.key}
                              className={`px-3 py-2.5 whitespace-nowrap ${
                                col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                              }`}
                            >
                              {row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : ""}
                            </td>
                          ))}
                        </tr>
                      );
                    }

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        {reportData.columns?.map((col) => (
                          <td
                            key={col.key}
                            className={`px-3 py-2 whitespace-nowrap ${
                              col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                            }`}
                          >
                            {row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : "-"}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>

            {/* Signature Block Footer */}
            {reportData.signatures && (
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {reportData.signatures.map((sig, idx) => (
                  <div key={idx} className="space-y-12">
                    <div className="h-10 border-b border-dashed border-slate-300"></div>
                    <p className="text-xs font-bold text-slate-700">{sig.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QCReportsCatalog;
