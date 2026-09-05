// src/utils/reports/csvExporter.js

/**
 * Utility to export report data to a downloadable CSV file matching table columns, values, and headers.
 * @param {Object} report - Report data object containing reportTitle, companyName, columns, rows, fromDate, toDate
 */
export const exportReportToCSV = (report) => {
  if (!report) return;

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  let csvRows = [];

  // Company Name & Report Header
  csvRows.push([escapeCSV(report.companyName || "Kayaar Exports Private Limited")]);
  csvRows.push([escapeCSV(report.reportTitle || "Report")]);
  
  if (report.fromDate || report.toDate) {
    csvRows.push([escapeCSV(`Statement Period: ${report.fromDate || "-"} to ${report.toDate || "-"}`)]);
  }
  
  csvRows.push([]); // Blank line separator

  const columns = report.columns || [];

  // Table Headers
  if (columns.length > 0) {
    const headers = columns.map(col => escapeCSV(col.label || col.key));
    csvRows.push(headers);
  }

  // Table Data Rows
  if (Array.isArray(report.rows)) {
    report.rows.forEach(row => {
      if (row.isGroupHeader) {
        csvRows.push([escapeCSV(row.groupHeaderTitle || row.groupTitle || row.subHeaderText || "")]);
      } else if (row.isSubHeader) {
        csvRows.push([escapeCSV(row.subHeaderText || row.label || "")]);
      } else {
        const rowData = columns.map(col => {
          const val = row[col.key];
          return escapeCSV(val !== undefined && val !== null ? val : "");
        });
        csvRows.push(rowData);
      }
    });
  }

  const csvString = csvRows.map(r => r.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const fileName = (report.reportTitle || "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
