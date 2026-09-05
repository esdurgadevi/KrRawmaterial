import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDefinitions, getOptions, getReport } from "../../services/admin1/transaction-cotton/cottonReportCatalogService";
import { printReport } from "../../utils/reports/reportPrinter";
import { exportReportToCSV } from "../../utils/reports/csvExporter";
import MultiSelectCheckboxDropdown from "../../components/Common/MultiSelectCheckboxDropdown";

const categories = ["Purchase", "Inward", "Issue", "Stock", "Invoice", "Others"];


const CottonReportsCatalog = () => {
  const navigate = useNavigate();
  const [definitions, setDefinitions] = useState([]);
  const [category, setCategory] = useState("Purchase");
  const [selected, setSelected] = useState(null);
  const [values, setValues] = useState({});
  const [options, setOptions] = useState({});
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => { getDefinitions().then((items) => { setDefinitions(items); setSelected(items.find((report) => report.category === "Purchase") || null); }).catch((requestError) => setError(requestError.response?.data?.message || "Failed to load report catalogue")); }, []);
  const reports = useMemo(() => definitions.filter((report) => report.category === category), [definitions, category]);
  
  useEffect(() => {
    if (!selected) return;
    setReportData(null);
    
    const filteredParams = selected.parameters?.filter((p) => p.key === "supplierIds" && p.source) || [];
    filteredParams.forEach((parameter) => {
      setOptions((current) => {
        if (current[parameter.source]) return current;
        getOptions(parameter.source)
          .then((items) => setOptions((prev) => ({ ...prev, [parameter.source]: items })))
          .catch(() => setOptions((prev) => ({ ...prev, [parameter.source]: [] })));
        return { ...current, [parameter.source]: [] };
      });
    });
  }, [selected]);

  const generate = async (event) => {
    event.preventDefault(); setError(""); setReportData(null);
    if (!selected || selected.status !== "enabled") return;
    const params = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
    const requiredParams = selected.parameters?.filter(p => p.key === "fromDate" || p.key === "toDate" || p.key === "supplierIds");
    if (requiredParams?.some((parameter) => parameter.required && !params[parameter.key])) { setError("Please complete all required filters."); return; }
    setGenerating(true);
    try { 
      const report = await getReport(selected.id, params); 
      setReportData(report);
    }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Failed to generate report"); }
    finally { setGenerating(false); }
  };
  

  const displayParameters = selected?.parameters?.filter(p => p.key === "fromDate" || p.key === "toDate" || p.key === "supplierIds") || [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Transaction - Cotton</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Cotton Reports</h1>
          <p className="mt-2 text-sm text-slate-600">Choose a category and report.</p>
        </header>
        
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => { setCategory(item); setSelected(definitions.find((report) => report.category === item) || null); setValues({}); setReportData(null); }} className={`mb-1 w-full rounded-md px-4 py-3 text-left text-sm font-semibold ${category === item ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
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
                      <button key={report.id} type="button" onClick={() => { setSelected(report); setValues({}); setReportData(null); }} className={`w-full rounded-md border px-3 py-3 text-left text-sm ${selected?.id === report.id ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}>
                        <span className="font-medium">{report.name}</span>
                        {report.status === "deferred" && <span className="mt-1 block text-xs text-amber-700">Deferred</span>}
                      </button>
                    ))}

                  </div>
                </div>
                
                <form onSubmit={generate} className="rounded-lg bg-slate-50 p-5 flex flex-col justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">{selected?.name || "Select a report"}</h2>
                    {selected?.status === "deferred" ? (
                      <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{selected.reason}</p>
                    ) : (
                      <>
                        {selected?.category === "Stock" && <p className="mt-3 rounded-md bg-blue-50 p-3 text-sm text-blue-800">Live operational stock only. It is not historical or invoice-reconciled.</p>}
                        <div className="mt-5 space-y-4">
                          {selected?.parameters?.filter(p => {
                            if (p.key === "fromDate" || p.key === "toDate") return true;
                            if (p.key === "supplierIds") {
                              return selected.id.includes("supplier") || selected.id.includes("party");
                            }
                            return false;
                          }).map((parameter) => (
                            <div key={parameter.key}>
                              {parameter.type === "date" || parameter.type === "text" ? (
                                <label className="block text-sm font-medium text-slate-700">
                                  {parameter.label}{parameter.required ? " *" : ""}
                                  <input required={parameter.required} type={parameter.type} value={values[parameter.key] || ""} onChange={(event) => setValues((current) => ({ ...current, [parameter.key]: event.target.value }))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                                </label>
                              ) : (
                                <MultiSelectCheckboxDropdown
                                  label={parameter.label}
                                  options={options[parameter.source] || []}
                                  selectedValues={values[parameter.key]}
                                  onChange={(newVals) => setValues((current) => ({ ...current, [parameter.key]: newVals }))}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                      </>
                    )}
                  </div>
                  {!selected || selected.status === "deferred" ? null : (
                    <div className="mt-6 flex gap-3">
                      <button type="submit" disabled={generating || !selected} className="flex-1 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{generating ? "Loading..." : "View Report"}</button>
                      {reportData && (
                        <>
                          <button type="button" onClick={() => exportReportToCSV({ ...reportData, fromDate: values.fromDate, toDate: values.toDate, groupBy: reportData.groupBy })} className="rounded-lg border border-emerald-600 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 flex items-center gap-1.5">
                            <span>📊</span> Export to CSV
                          </button>
                          <button type="button" onClick={() => printReport({ ...reportData, fromDate: values.fromDate, toDate: values.toDate, groupBy: reportData.groupBy })} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
                            <span>🖨️</span> Print
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {reportData && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
                <h3 className="font-semibold text-slate-900 mb-4">{reportData.reportTitle}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        {reportData.columns?.map((col) => (
                          <th key={col.key} className={`px-4 py-3 font-medium text-slate-700 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {reportData.rows?.map((row, i) => (
                        row.isSubHeader ? (
                          <tr key={i} className="bg-slate-100 font-semibold text-slate-900">
                            <td colSpan={reportData.columns?.length || 1} className="px-4 py-3">{row.subHeaderText}</td>
                          </tr>
                        ) : row.isSubtotal ? (
                          <tr key={i} className="bg-slate-50 font-semibold text-slate-900 border-y border-slate-300">
                            {reportData.columns?.map((col) => (
                              <td key={col.key} className={`px-4 py-3 whitespace-nowrap ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}>
                                {row[col.key] || ""}
                              </td>
                            ))}
                          </tr>
                        ) : (
                          <tr key={i} className="hover:bg-slate-50">
                            {reportData.columns?.map((col) => (
                              <td key={col.key} className={`px-4 py-3 text-slate-600 whitespace-nowrap ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}>
                                {reportData.groupBy === col.key && i > 0 && reportData.rows[i - 1][col.key] === row[col.key] ? "" : (row[col.key] || "")}
                              </td>
                            ))}
                          </tr>
                        )
                      ))}
                      {reportData.rows?.length === 0 && (
                        <tr>
                          <td colSpan={reportData.columns?.length || 1} className="px-4 py-8 text-center text-slate-500">No data found for the selected criteria.</td>
                        </tr>
                      )}
                    </tbody>
                    {reportData.totals && Object.keys(reportData.totals).length > 0 && (
                      <tfoot className="bg-slate-50 font-semibold text-slate-900">
                        <tr>
                          <td className="px-4 py-3" colSpan={reportData.columns?.length ? Math.max(1, reportData.columns.length - Object.keys(reportData.totals).length) : 1}>Totals</td>
                          {Object.entries(reportData.totals).map(([key, value]) => (
                            <td key={key} className="px-4 py-3 text-right">{value}</td>
                          ))}
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
export default CottonReportsCatalog;
