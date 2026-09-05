export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const formatDate = (value) => {
  if (!value) return "-";

  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : String(value);
};

export const formatDateTime = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
};

export const groupRows = (rows, groupBy) => {
  if (!groupBy) return [{ label: null, rows }];

  return rows.reduce((groups, row) => {
    const label = row[groupBy] || "Unspecified";
    const currentGroup = groups.find((group) => group.label === label);
    if (currentGroup) currentGroup.rows.push(row);
    else groups.push({ label, rows: [row] });
    return groups;
  }, []);
};

export const createReportDefinition = ({ groupBy = null } = {}) => ({
  prepare: (report) => ({
    ...report,
    columns: report.columns || [],
    rows: report.rows || [],
    totals: report.totals || {},
    groupBy,
  }),
});
