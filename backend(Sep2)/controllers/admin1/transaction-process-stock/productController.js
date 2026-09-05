const catchAsync = require("../../utils/catchAsync");
const axios = require("axios");

const getExternalProducts = catchAsync(async (req, res) => {
  try {
    const response = await axios.get("https://krexports.org/kres/products", {
      timeout: 5000, // 5 second timeout
    });
    
    res.status(200).json({
      success: true,
      products: response.data,
    });
  } catch (error) {
    console.error("Error fetching from external API:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products from external source",
      error: error.message,
    });
  }
});

module.exports = {
  getExternalProducts,
};