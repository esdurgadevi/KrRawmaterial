import { escapeHtml, formatDate, formatDateTime, groupRows } from "./reportHelpers";

const printStyles = `
  @page { size: A4 landscape; margin: 15mm 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; }
  .report-header { text-align: center; margin-bottom: 12px; }
  .company-name { margin: 0; font-size: 16pt; font-weight: 700; }
  .report-title { margin: 5px 0 10px; font-size: 12pt; font-weight: 700; }
  .report-meta { display: flex; justify-content: space-between; text-align: left; font-size: 9pt; }
  .generated-on { margin-top: 5px; text-align: right; font-size: 8pt; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  thead { display: table-header-group; }
  th, td { border: 0.5px solid #9ca3af; overflow-wrap: anywhere; padding: 5px 4px; vertical-align: top; }
  th { background: #f3f4f6; font-size: 9pt; font-weight: 700; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  td.numeric, th.numeric { text-align: right; }
  td.center, th.center { text-align: center; }
  .group-row td { background: #e5e7eb; font-weight: 700; padding: 6px 5px; }
  .totals { break-inside: avoid; page-break-inside: avoid; margin-top: 10px; }
  .totals-title { margin: 0 0 4px; font-size: 9pt; font-weight: 700; }
  .totals-grid { display: grid; grid-template-columns: repeat(3, max-content); gap: 4px 28px; }
  .footer { break-inside: avoid; page-break-inside: avoid; display: flex; gap: 24px; margin-top: 30px; }
  .signature { flex: 1; min-height: 38px; border-top: 1px solid #374151; padding-top: 4px; font-size: 8pt; }
  .print-info { display: flex; justify-content: space-between; margin-top: 8px; color: #6b7280; font-size: 7.5pt; }
  .empty-state { margin: 36px 0; color: #4b5563; font-size: 10pt; text-align: center; }
  @media print { .no-print { display: none; } }
`;

const alignmentClass = (column) => {
  if (column.align === "right") return "numeric";
  if (column.align === "center") return "center";
  return "";
};

export const buildReportHtml = (report) => {
  const columns = report.columns || [];
  const rows = report.rows || [];
  const groups = groupRows(rows, report.groupBy);
  const headerCells = columns
    .map((column) => `<th class="${alignmentClass(column)}">${escapeHtml(column.label)}</th>`)
    .join("");
  const bodyRows = groups
    .map((group) => {
      const groupHeader = group.label
        ? `<tr class="group-row"><td colspan="${columns.length}">${escapeHtml(group.label)}</td></tr>`
        : "";
      const groupRowsHtml = group.rows
        .map(
          (row) =>
            `<tr>${columns
              .map(
                (column) =>
                  `<td class="${alignmentClass(column)}">${escapeHtml(row[column.key])}</td>`
              )
              .join("")}</tr>`
        )
        .join("");
      return `${groupHeader}${groupRowsHtml}`;
    })
    .join("");
  const totals = Object.entries(report.totals || {})
    .map(([label, value]) => `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</div>`)
    .join("");
  const generatedAt = formatDateTime();

  return `<!doctype html>
    <html><head><meta charset="utf-8"><title>${escapeHtml(report.reportTitle)}</title><style>${printStyles}</style></head>
    <body>
      <header class="report-header">
        <p class="company-name">Kayaar Exports Private Limited</p>
        <p class="report-title">${escapeHtml(report.reportTitle)}</p>
        <div class="report-meta"><span>From Date : ${escapeHtml(formatDate(report.fromDate))}</span><span>To Date : ${escapeHtml(formatDate(report.toDate))}</span></div>
        <div class="generated-on">Generated On : ${escapeHtml(generatedAt)}</div>
      </header>
      ${rows.length ? `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>` : '<p class="empty-state">No records found for the selected date range.</p>'}
      ${rows.length && totals ? `<section class="totals"><p class="totals-title">Totals</p><div class="totals-grid">${totals}</div></section>` : ""}
      <footer class="footer"><div class="signature">Prepared By</div><div class="signature">Verified By</div><div class="signature">Approved By</div></footer>
      <div class="print-info"><span>Printed On : ${escapeHtml(generatedAt)}</span><span>Page 1 of 1</span></div>
    </body></html>`;
};
