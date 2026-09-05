// import express from "express";
// import axios from "axios";
// import { protect } from "../../../middlewares/authMiddleware.js";

// const router = express.Router();

// // Get products from external API
// router.get("/external", protect, async (req, res) => {
//   try {
//     console.log("Attempting to fetch products from external API...");
    
//     const response = await axios.get("https://krexports.org/kres/products");

//     console.log("✅ External API response received:", response.status);
//     console.log("   Found", response.data.data.length, "products");

//     res.status(200).json({
//       success: true,
//       products: response.data.data, // Use response.data.data
//     });
//   } catch (error) {
//     console.error("❌ Error fetching from external API:");
//     console.error("  Message:", error.message);
//     console.error("  Code:", error.code);
//     if (error.response) {
//       console.error("  Status:", error.response.status);
//       console.error("  Response:", error.response.data);
//     }
    
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch products from external source",
//       error: error.message,
//     });
//   }
// });

// export default router;


import express from "express";
import axios from "axios";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Get products from external API
router.get("/external", protect, async (req, res) => {
  try {
    console.log("Attempting to fetch products from external API...");
    
    const response = await axios.get("https://krexports.org/kres/products");

    console.log("✅ External API response received:", response.status);
    console.log("   Found", response.data.data.length, "products");

    res.status(200).json({
      success: true,
      products: response.data.data,  // ← Extract from response.data.data, not response.data.products
    });
  } catch (error) {
    console.error("❌ Error fetching from external API:");
    console.error("  Message:", error.message);
    console.error("  Code:", error.code);
    if (error.response) {
      console.error("  Status:", error.response.status);
      console.error("  Response:", error.response.data);
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to fetch products from external source",
      error: error.message,
    });
  }
});

export default router;