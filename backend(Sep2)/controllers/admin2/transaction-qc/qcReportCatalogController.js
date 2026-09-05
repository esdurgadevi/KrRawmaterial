import { buildQCCatalogReport, getQCOptions, publicQCDefinitions } from "../../../services/admin2/reports/catalog/qcReportCatalog.js";

const normalizeQueryParams = (query = {}) => {
  const normalized = {};
  Object.entries(query).forEach(([key, value]) => {
    const cleanKey = key.replace(/\[\]$/, "");
    if (normalized[cleanKey]) {
      const existing = Array.isArray(normalized[cleanKey]) ? normalized[cleanKey] : [normalized[cleanKey]];
      const incoming = Array.isArray(value) ? value : [value];
      normalized[cleanKey] = [...existing, ...incoming];
    } else {
      normalized[cleanKey] = value;
    }
  });
  return normalized;
};

export const getQCDefinitions = (req, res) => {
  res.json({ reports: publicQCDefinitions() });
};

export const getQCReportOptions = async (req, res) => {  try {
    res.json({ options: await getQCOptions(req.params.source) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load filter options" });
  }
};

export const generateQCCatalogReport = async (req, res) => {
  try {
    res.json(await buildQCCatalogReport(req.params.reportId, normalizeQueryParams(req.query)));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Failed to generate report" });
  }
};
