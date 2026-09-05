import React, { useEffect, useMemo, useState } from "react";
// import * as countwiseClosingService from "../../services/admin1/transaction-process-stock/countwiseClosingService";
// import * as wasteIssueService from "../../services/admin1/transaction-process-stock/wasteIssueService";
// import * as departmentKgService from "../../services/admin1/transaction-process-stock/departmentKgService";
import countwiseClosingService from "../../services/admin1/transaction-process-stock/countwiseClosingService";
import wasteIssueService from "../../services/admin1/transaction-process-stock/wasteIssueService";
import departmentKgService from "../../services/admin1/transaction-process-stock/departmentKgService";
import { printReport } from "../../utils/reports/reportPrinter";
import { exportReportToCSV } from "../../utils/reports/csvExporter";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categories = ["Stock", "Waste", "Department"];

const processStockReportDefinitions = [
  {
    id: "department-kg-detail",
    name: "Department-wise Kg Details Report",
    category: "Department",
    status: "enabled",
    parameters: [
      { key: "fromDate", label: "From Date", type: "date", required: true },
      { key: "toDate", label: "To Date", type: "date", required: true },
    ],
  },
  {
    id: "department-kg",
    name: "Department-wise Kg Summary Report",
    category: "Department",
    status: "enabled",
    parameters: [
      { key: "fromDate", label: "From Date", type: "date", required: true },
      { key: "toDate", label: "To Date", type: "date", required: true },
    ],
    handler: "departmentKgSummary",
  },
  {
    id: "countwise-closing",
    name: "Countwise Closing Report",
    category: "Stock",
    status: "enabled",
    parameters: [
      { key: "fromDate", label: "From Date", type: "date", required: true },
      { key: "toDate", label: "To Date", type: "date", required: true },
    ],
    handler: "countwiseClosing",
  },
  {
    id: "product-stock",
    name: "Product Stock Report",
    category: "Stock",
    status: "enabled",
    parameters: [
      { key: "fromDate", label: "From Date", type: "date", required: true },
      { key: "toDate", label: "To Date", type: "date", required: true },
    ],
    handler: "productStock",
  },
  {
    id: "waste-issue",
    name: "Waste Issue Report",
    category: "Waste",
    status: "enabled",
    parameters: [
      { key: "fromDate", label: "From Date", type: "date", required: true },
      { key: "toDate", label: "To Date", type: "date", required: true },
    ],
    handler: "wasteIssue",
  },

];

const ProcessStockReportsPage = () => {
  const [category, setCategory] = useState("Stock");
  const [selected, setSelected] = useState(null);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const stockReports = processStockReportDefinitions.filter((r) => r.category === "Stock");
    setSelected(stockReports[0] || null);
  }, []);

  const reports = useMemo(
    () => processStockReportDefinitions.filter((report) => report.category === category),
    [category]
  );

  const generate = async (event) => {
    event.preventDefault();
    setError("");
    setReportData(null);
    setCurrentPage(1);

    if (!selected || selected.status !== "enabled") return;

    const requiredParams = selected.parameters?.filter((p) => p.required);
    if (requiredParams?.some((p) => !values[p.key])) {
      setError("Please complete all required filters.");
      return;
    }

    setGenerating(true);
    try {
      let report = null;
      const { fromDate, toDate } = values;

      switch (selected.handler) {
        case "departmentKg":
          report = await departmentKgService.getDepartmentKgReport(fromDate, toDate);
          report = formatDepartmentKgDetailReport(report, fromDate, toDate);
          break;
        case "departmentKgSummary":
          report = await departmentKgService.getDepartmentKgReport(fromDate, toDate);
          report = formatDepartmentKgSummaryReport(report, fromDate, toDate);
          break;
        case "countwiseClosing":
          report = await countwiseClosingService.getCountwiseClosingReport(fromDate, toDate);
          report = formatCountwiseClosingReport(report, fromDate, toDate);
          break;
        case "productStock":
          report = await countwiseClosingService.getProductStockReport(fromDate, toDate);
          report = formatProductStockReport(report, fromDate, toDate);
          break;
        case "wasteIssue":
          report = await wasteIssueService.getWasteIssueReport(fromDate, toDate);
          report = formatWasteIssueReport(report, fromDate, toDate);
          break;

        default:
          throw new Error("Unknown report handler");
      }

      if (!report || !report.rows || report.rows.length === 0) {
        toast.info("No records found for the selected date range");
      } else {
        toast.success("Report generated successfully");
      }
      setReportData(report);
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message || "Failed to generate report";
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  // Format functions
  const formatCountwiseClosingReport = (data, fromDate, toDate) => {
    const rows = data.data?.map((row) => ({
      date: row.date ? new Date(row.date).toLocaleDateString() : "",
      countNo: row.countNo || "",
      productName: row.productName || "",
      quantity: row.quantity || 0,
      weight: parseFloat(row.weight || 0).toFixed(2),
      remarks: row.remarks || "",
    })) || [];

    return {
      reportTitle: "Countwise Closing Report",
      fromDate,
      toDate,
      columns: [
        { key: "date", label: "Date", align: "left" },
        { key: "countNo", label: "Count No", align: "left" },
        { key: "productName", label: "Product", align: "left" },
        { key: "quantity", label: "Quantity", align: "right" },
        { key: "weight", label: "Weight (Kg)", align: "right" },
        { key: "remarks", label: "Remarks", align: "left" },
      ],
      rows,
      totals: {
        weight: rows.reduce((sum, row) => sum + parseFloat(row.weight || 0), 0).toFixed(2),
      },
    };
  };

  const formatProductStockReport = (data, fromDate, toDate) => {
    const rows = data.data?.map((row) => ({
      productName: row.productName || "",
      totalQuantity: row.totalQuantity || 0,
      totalWeight: parseFloat(row.totalWeight || 0).toFixed(2),
      totalRecords: row.totalRecords || 0,
    })) || [];

    return {
      reportTitle: "Product Stock Report",
      fromDate,
      toDate,
      columns: [
        { key: "productName", label: "Product Name", align: "left" },
        { key: "totalQuantity", label: "Total Quantity", align: "right" },
        { key: "totalWeight", label: "Total Weight (Kg)", align: "right" },
        { key: "totalRecords", label: "Records Count", align: "right" },
      ],
      rows,
      totals: {
        totalWeight: rows.reduce((sum, row) => sum + parseFloat(row.totalWeight || 0), 0).toFixed(2),
      },
    };
  };

  const formatWasteIssueReport = (data, fromDate, toDate) => {
    const rows = data.data?.map((row) => ({
      date: row.date ? new Date(row.date).toLocaleDateString() : "",
      wasteName: row.wasteName || "",
      quantity: row.quantity || 0,
      weight: parseFloat(row.weight || 0).toFixed(2),
      issuedTo: row.issuedTo || "",
      reference: row.reference || "",
    })) || [];

    return {
      reportTitle: "Waste Issue Report",
      fromDate,
      toDate,
      columns: [
        { key: "date", label: "Date", align: "left" },
        { key: "wasteName", label: "Waste Name", align: "left" },
        { key: "quantity", label: "Quantity", align: "right" },
        { key: "weight", label: "Weight (Kg)", align: "right" },
        { key: "issuedTo", label: "Issued To", align: "left" },
        { key: "reference", label: "Reference", align: "left" },
      ],
      rows,
      totals: {
        weight: rows.reduce((sum, row) => sum + parseFloat(row.weight || 0), 0).toFixed(2),
      },
    };
  };

  const formatDepartmentKgDetailReport = (data, fromDate, toDate) => {
    const formatDate = (dateVal) => {
      if (!dateVal) return "";
      const d = new Date(dateVal);
      if (isNaN(d)) return String(dateVal);
      return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
    };

    const rows = (data.data || []).map((row) => ({
      id: row.id || "",
      date: formatDate(row.date),
      departmentName: row.departmentName || "",
      kgs: parseFloat(row.kgs || 0).toFixed(3),
    }));

    return {
      reportTitle: "Department-wise Kg Detail Report",
      fromDate,
      toDate,
      columns: [
        { key: "id", label: "ID", align: "left" },
        { key: "date", label: "Date", align: "left" },
        { key: "departmentName", label: "Deptname", align: "left" },
        { key: "kgs", label: "KGs", align: "right" },
      ],
      rows,
      totals: {
        kgs: rows.reduce((sum, row) => sum + parseFloat(row.kgs || 0), 0).toFixed(3),
      },
    };
  };

  const formatDepartmentKgSummaryReport = (data, fromDate, toDate) => {
    const rows = (data.summary || []).map((row, index) => ({
      id: index + 1,
      departmentName: row.departmentName || "",
      totalKg: parseFloat(row.totalKg || 0).toFixed(3),
    }));

    return {
      reportTitle: "Department-wise Kg Summary Report",
      fromDate,
      toDate,
      columns: [
        { key: "id", label: "ID", align: "left" },
        { key: "departmentName", label: "Department", align: "left" },
        { key: "totalKg", label: "Total Kg", align: "right" },
      ],
      rows,
      totals: {
        totalKg: rows.reduce((sum, row) => sum + parseFloat(row.totalKg || 0), 0).toFixed(3),
      },
    };
  };

  // Pagination logic
  const totalPages = Math.ceil((reportData?.rows?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = reportData?.rows?.slice(startIndex, endIndex) || [];

  // Report view
  if (reportData) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setReportData(null);
                setValues({});
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              ← Back to Filters
            </button>
          </div>

          <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              {category} Report
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{reportData.reportTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">
              From {reportData.fromDate} to {reportData.toDate}
            </p>
          </header>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="mb-4 flex gap-3 items-center justify-between flex-wrap">
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    printReport({
                      ...reportData,
                    })
                  }
                  className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                >
                  🖨️ Print Report
                </button>
                <button
                  onClick={() => exportReportToCSV(reportData)}
                  className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <span>📊</span> Export to CSV
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {reportData.columns?.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-3 font-medium text-slate-700 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                          }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedRows?.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {reportData.columns?.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-slate-600 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                            }`}
                        >
                          {row[col.key] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {paginatedRows?.length === 0 && (
                    <tr>
                      <td colSpan={reportData.columns?.length || 1} className="px-4 py-8 text-center text-slate-500">
                        No data found for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
                {reportData.totals && Object.keys(reportData.totals).length > 0 && (
                  <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td className="px-4 py-3" colSpan={reportData.columns?.length ? Math.max(1, reportData.columns.length - Object.keys(reportData.totals).length) : 1}>
                        Totals
                      </td>
                      {Object.entries(reportData.totals).map(([key, value]) => (
                        <td key={key} className="px-4 py-3 text-right">
                          {value}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, reportData.rows.length)}</span> of{" "}
                  <span className="font-medium">{reportData.rows.length}</span> records
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === page
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default filter view
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Transaction - Process Stock
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Process Stock Reports</h1>
          <p className="mt-2 text-sm text-slate-600">Choose a category and report.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm h-fit">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  const firstReport = processStockReportDefinitions.find((r) => r.category === item);
                  setSelected(firstReport || null);
                  setValues({});
                  setReportData(null);
                  setCurrentPage(1);
                }}
                className={`mb-1 w-full rounded-md px-4 py-3 text-left text-sm font-semibold transition ${category === item
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
                  }`}
              >
                {item}
              </button>
            ))}
          </aside>

          <section className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h2 className="font-semibold text-slate-900">{category} Reports</h2>
                  <div className="mt-3 space-y-2">
                    {reports.map((report) => (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => {
                          setSelected(report);
                          setValues({});
                          setReportData(null);
                          setCurrentPage(1);
                        }}
                        className={`w-full rounded-md border px-3 py-3 text-left text-sm transition ${selected?.id === report.id
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-400"
                          }`}
                      >
                        <span className="font-medium">{report.name}</span>
                        <p className="mt-1 text-xs text-slate-500">{report.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={generate} className="rounded-lg bg-slate-50 p-5 flex flex-col justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {selected?.name || "Select a report"}
                    </h2>
                    {selected?.status === "deferred" ? (
                      <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                        This report is not yet available.
                      </p>
                    ) : (
                      <>
                        <p className="mt-3 text-sm text-slate-600">{selected?.description}</p>
                        <div className="mt-5 space-y-4">
                          {selected?.parameters?.map((parameter) => (
                            <label key={parameter.key} className="block text-sm font-medium text-slate-700">
                              {parameter.label}
                              {parameter.required ? " *" : ""}
                              <input
                                required={parameter.required}
                                type={parameter.type}
                                value={values[parameter.key] || ""}
                                onChange={(event) =>
                                  setValues((current) => ({
                                    ...current,
                                    [parameter.key]: event.target.value,
                                  }))
                                }
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                              />
                            </label>
                          ))}
                        </div>
                        {error && (
                          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                            {error}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {!selected || selected.status === "deferred" ? null : (
                    <button
                      type="submit"
                      disabled={generating || !selected}
                      className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:bg-slate-800 transition"
                    >
                      {generating ? "Loading..." : "View Report"}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProcessStockReportsPage;