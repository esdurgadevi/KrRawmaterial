import React, { useState } from "react";
import transactionCottonReportService from "../../services/admin1/transaction-cotton/transactionCottonReportService";
import { printReport } from "../../utils/reports/reportPrinter";
import { reportDefinitions } from "../../utils/reports";

const reportTypeOptions = [
  { value: "purchase-order", label: "Purchase Order Report" },
  { value: "gate-inward", label: "Gate Inward Report" },
  { value: "inward-lot", label: "Inward Lot Report" },
  { value: "issue", label: "Issue Report" },
  { value: "lot-test-result", label: "Lot Test Result Report" },
  { value: "location-transfer", label: "Location Transfer Report" },
  { value: "lot-allowance", label: "Lot Allowance Report" },
  { value: "lot-rejection", label: "Lot Rejection Report" },
  { value: "final-invoice", label: "Final Invoice Report" },
];

const TransactionContentReports = () => {
  const [reportType, setReportType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportPreview, setReportPreview] = useState(null);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async (event) => {
    event.preventDefault();
    setError("");

    if (!reportType || !fromDate || !toDate) {
      setError("Report type, From Date and To Date are required.");
      return;
    }
    if (fromDate > toDate) {
      setError("From Date must be earlier than or equal to To Date.");
      return;
    }

    setGenerating(true);
    try {
      const report = await transactionCottonReportService.getReport({ reportType, fromDate, toDate });
      const definition = reportDefinitions[reportType];
      if (!definition) throw new Error("Unsupported report type");

      const preparedReport = definition.prepare(report);
      setReportPreview({
        title: preparedReport.reportTitle,
        rowCount: preparedReport.rows.length,
        totals: preparedReport.totals,
      });
      printReport(preparedReport);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Transaction - Cotton</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Transaction Cotton Reports</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Select a report and date range to open its print-ready report. Use your browser&apos;s print dialog to save it as a PDF.
          </p>
        </div>

        <form onSubmit={handleGenerateReport} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="report-type" className="mb-2 block text-sm font-medium text-slate-700">Report Type</label>
                <select id="report-type" value={reportType} onChange={(event) => setReportType(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200">
                  <option value="">Select a report type</option>
                  {reportTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="from-date" className="mb-2 block text-sm font-medium text-slate-700">From Date</label>
                <input id="from-date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
              </div>
              <div>
                <label htmlFor="to-date" className="mb-2 block text-sm font-medium text-slate-700">To Date</label>
                <input id="to-date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
              </div>
            </div>
            {error && <p role="alert" className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-8 flex justify-center">
              <button type="submit" disabled={generating} className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60">
                {generating ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Generated Report</h2>
            <p className="mt-1 text-sm text-slate-500">The printable report opens in a new browser tab.</p>
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              {!reportPreview ? <p className="text-sm text-slate-500">No report generated yet.</p> : (
                <div className="space-y-3 text-sm">
                  <p className="font-semibold text-slate-900">{reportPreview.title}</p>
                  <p className="text-slate-600">{reportPreview.rowCount} record{reportPreview.rowCount === 1 ? "" : "s"} returned for the selected date range.</p>
                  {Object.entries(reportPreview.totals).map(([label, value]) => <div key={label} className="flex justify-between gap-4 rounded-md bg-white px-3 py-2"><span className="text-slate-600">{label}</span><span className="font-semibold text-slate-900">{value}</span></div>)}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionContentReports;
