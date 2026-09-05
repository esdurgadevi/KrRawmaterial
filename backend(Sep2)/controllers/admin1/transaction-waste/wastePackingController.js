import * as wastePackingService from "../../../services/admin1/transaction-waste/wastePackingService.js";

export const createWastePacking = async (req, res) => {
  try {
    const packing = await wastePackingService.create(req.body);
    res.status(201).json({
      message: "Waste packing created successfully",
      packing,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWastePackings = async (req, res) => {
  try {
    const packings = await wastePackingService.getAll();
    res.status(200).json({
      message: "Waste packings retrieved successfully",
      packings,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWastePackingById = async (req, res) => {
  try {
    const packing = await wastePackingService.getById(req.params.id);
    res.status(200).json({
      message: "Waste packing retrieved successfully",
      packing,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWastePacking = async (req, res) => {
  try {
    const packing = await wastePackingService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Waste packing updated successfully",
      packing,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWastePacking = async (req, res) => {
  try {
    await wastePackingService.remove(req.params.id);
    res.status(200).json({
      message: "Waste packing deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPackingDetailsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate query parameters are required (format: YYYY-MM-DD)",
      });
    }

    const report = await wastePackingService.getPackingDetailsReport(startDate, endDate);

    res.status(200).json({
      message: "Waste packing details report retrieved successfully",
      report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTypeWisePackingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate query parameters are required (format: YYYY-MM-DD)",
      });
    }

    const report = await wastePackingService.getTypeWisePackingReport(startDate, endDate);

    res.status(200).json({
      message: "Waste type wise packing report retrieved successfully",
      report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getStockAbstractReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate query parameters are required (format: YYYY-MM-DD)",
      });
    }

    const report = await wastePackingService.getStockAbstractReport(startDate, endDate);

    res.status(200).json({
      message: "Waste stock abstract report retrieved successfully",
      report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getClosingStockValueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate query parameters are required (format: YYYY-MM-DD)",
      });
    }

    const report = await wastePackingService.getClosingStockValueReport(startDate, endDate);

    res.status(200).json({
      message: "Waste closing stock value report retrieved successfully",
      report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getYearlyStockAbstractReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Both startDate and endDate are required (format: YYYY-MM-DD)" });
    }
    const report = await wastePackingService.getYearlyStockAbstractReport(startDate, endDate);
    res.status(200).json({ message: "Yearly stock abstract report retrieved successfully", report });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getNextPackingId = async (req, res) => {
  try {
    const nextId = await wastePackingService.getNextId();
    res.status(200).json({ nextId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const bulkImportWastePackings = async (req, res) => {
  try {
    const result = await wastePackingService.bulkImport(req.body);
    res.status(200).json({
      message: "Waste packings bulk imported successfully",
      importedCount: result.importedCount,
    });
  } catch (error) {
    console.error("Bulk Import Waste Packings Error:", error);
    const msg = error.errors && Array.isArray(error.errors)
      ? error.errors.map((e) => e.message).join("; ")
      : error.message;
    res.status(400).json({ message: msg });
  }
};
