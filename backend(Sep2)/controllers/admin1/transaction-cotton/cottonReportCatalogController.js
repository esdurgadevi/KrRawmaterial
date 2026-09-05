import { buildCatalogReport, getOptions, publicDefinitions } from "../../../services/reports/catalog/reportCatalog.js";

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

export const getDefinitions = (req, res) => res.json({ reports: publicDefinitions() });
export const getReportOptions = async (req, res) => { try { res.json({ options: await getOptions(req.params.source) }); } catch (error) { res.status(500).json({ message: error.message || "Failed to load filter options" }); } };
export const generateCatalogReport = async (req, res) => { try { res.json(await buildCatalogReport(req.params.reportId, normalizeQueryParams(req.query))); } catch (error) { res.status(error.statusCode || 500).json({ message: error.message || "Failed to generate report" }); } };
