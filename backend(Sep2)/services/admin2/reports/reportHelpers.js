export const COMPANY_NAME = "Kayaar Exports Private Limited";

export const formatDateDisplay = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB");
};

export const formatDateTimeDisplay = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatNumber = (value, digits = 3) => {
  const number = Number(value ?? 0);
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

export const formatCurrency = (value, digits = 2) => formatNumber(value, digits);

export const toText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

export const sumBy = (rows, key) =>
  rows.reduce((total, row) => total + Number(row?.[key] ?? 0), 0);

export const createReportError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const buildTotalsRow = (totals, columns) => {
  return columns.map((column) => {
    if (column.totalsLabel) {
      return column.totalsLabel;
    }

    if (column.key && Object.prototype.hasOwnProperty.call(totals, column.key)) {
      const value = totals[column.key];
      return typeof value === "number" ? formatCurrency(value, column.totalDigits ?? 2) : toText(value);
    }

    return "";
  });
};