import db from "../../../models/index.js";
import axios from "axios";
import { Op } from "sequelize";
const { CountwiseClosing } = db;

// External API URL for products
const EXTERNAL_API_URL = "https://krexports.org/kres/product"; // Change this to your external API

export const getProductsFromExternalAPI = async () => {
  try {
    console.log("Fetching from:", EXTERNAL_API_URL);
    const response = await axios.get(EXTERNAL_API_URL);
    
    console.log("API Response:", response.data); // DEBUG: Log the full response
    
    // Try different response structures
    let products = [];
    
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (response.data.products && Array.isArray(response.data.products)) {
      products = response.data.products;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      products = response.data.data;
    } else {
      console.warn("Could not parse products from response:", response.data);
      return [];
    }
    
    console.log("Parsed products:", products);
    return products;
  } catch (error) {
    console.error("Error fetching products from external API:", error.message);
    console.error("Full error:", error);
    return [];
  }
};


export const createCountwiseClosing = async (data) => {
  if (!data.date || !data.productName || data.closingKgs === undefined) {
    throw new Error("Date, product name, and closing kgs are required");
  }

  return await CountwiseClosing.create({
    date: data.date,
    productName: data.productName.trim(),
    closingKgs: parseFloat(data.closingKgs),
  });
};

export const getAllCountwiseClosing = async () => {
  return await CountwiseClosing.findAll({
    order: [["date", "DESC"]],
  });
};

export const getCountwiseClosingById = async (id) => {
  const record = await CountwiseClosing.findByPk(id);
  if (!record) {
    throw new Error("Countwise Closing record not found");
  }
  return record;
};

export const updateCountwiseClosing = async (id, data) => {
  const record = await CountwiseClosing.findByPk(id);
  if (!record) {
    throw new Error("Countwise Closing record not found");
  }

  const updateData = {};
  if (data.date) updateData.date = data.date;
  if (data.productName) updateData.productName = data.productName.trim();
  if (data.closingKgs !== undefined) updateData.closingKgs = parseFloat(data.closingKgs);

  return await record.update(updateData);
};

export const deleteCountwiseClosing = async (id) => {
  const record = await CountwiseClosing.findByPk(id);
  if (!record) {
    throw new Error("Countwise Closing record not found");
  }
  await record.destroy();
  return { message: "Countwise Closing record deleted successfully" };
};

export const getCountwiseClosingReport = async (startDate, endDate) => {
  const records = await CountwiseClosing.findAll({
        where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [["date", "ASC"]]
  });
  
  return {
    data: records
  };
};

export const getProductStockReport = async (startDate, endDate) => {
  const records = await CountwiseClosing.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [["date", "ASC"]]
  });
  
  // Group by productName and calculate totals
  const groupedByProduct = {};
  records.forEach(record => {
    const productName = record.productName || 'Unknown';
    if (!groupedByProduct[productName]) {
      groupedByProduct[productName] = {
        productName,
        totalQuantity: 0,
        totalWeight: 0,
        totalRecords: 0
      };
    }
    groupedByProduct[productName].totalQuantity += record.quantity || 0;
    groupedByProduct[productName].totalWeight += record.closingKgs || 0;
    groupedByProduct[productName].totalRecords += 1;
  });
  
  return {
    data: Object.values(groupedByProduct)
  };
};


// import db from "../../../models/index.js";
// import axios from "axios";
// import { Op } from "sequelize"; 

// const { CountwiseClosing } = db;

// // External API URL for products
// const EXTERNAL_API_URL = "https://krexports.org/kres/product";

// // Store token in memory (you can use a more persistent storage if needed)
// let cachedToken = null;
// let tokenExpiry = null;

// // Function to get authentication token
// const getAuthToken = async () => {
//   try {
//     // Check if we have a valid cached token
//     if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
//       console.log("Using cached token");
//       return cachedToken;
//     }

//     console.log("Fetching new authentication token...");
    
//     // ⚠️ CONFIGURE THESE WITH YOUR ACTUAL CREDENTIALS
//     const loginResponse = await axios.post(EXTERNAL_LOGIN_URL, {
//       email: "your-email@example.com", // CHANGE THIS
//       password: "your-password", // CHANGE THIS
//     });

//     cachedToken = loginResponse.data.token || loginResponse.data.access_token;
//     tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // Cache for 24 hours
    
//     console.log("Authentication token obtained:", cachedToken);
//     return cachedToken;
//   } catch (error) {
//     console.error("Error getting authentication token:", error.message);
//     throw new Error("Failed to authenticate with external API");
//   }
// };

// export const getProductsFromExternalAPI = async () => {
//   try {
//     console.log("Fetching from:", EXTERNAL_API_URL);
    
//     // Get authentication token
//     const token = await getAuthToken();
    
//     // Make request with authentication header
//     const response = await axios.get(EXTERNAL_API_URL, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
    
//     console.log("API Response:", response.data);
    
//     // Try different response structures
//     let products = [];
    
//     if (Array.isArray(response.data)) {
//       products = response.data;
//     } else if (response.data.products && Array.isArray(response.data.products)) {
//       products = response.data.products;
//     } else if (response.data.data && Array.isArray(response.data.data)) {
//       products = response.data.data;
//     } else if (response.data.result && Array.isArray(response.data.result)) {
//       products = response.data.result;
//     } else {
//       console.warn("Could not parse products from response:", response.data);
//       return [];
//     }
    
//     console.log("Parsed products:", products);
//     return products;
//   } catch (error) {
//     console.error("Error fetching products from external API:", error.message);
//     console.error("Full error:", error);
//     return [];
//   }
// };

// export const createCountwiseClosing = async (data) => {
//   if (!data.date || !data.productName || data.closingKgs === undefined) {
//     throw new Error("Date, product name, and closing kgs are required");
//   }

//   return await CountwiseClosing.create({
//     date: data.date,
//     productName: data.productName.trim(),
//     closingKgs: parseFloat(data.closingKgs),
//   });
// };

// export const getAllCountwiseClosing = async () => {
//   return await CountwiseClosing.findAll({
//     order: [["date", "DESC"]],
//   });
// };

// export const getCountwiseClosingById = async (id) => {
//   const record = await CountwiseClosing.findByPk(id);
//   if (!record) {
//     throw new Error("Countwise Closing record not found");
//   }
//   return record;
// };

// export const updateCountwiseClosing = async (id, data) => {
//   const record = await CountwiseClosing.findByPk(id);
//   if (!record) {
//     throw new Error("Countwise Closing record not found");
//   }

//   const updateData = {};
//   if (data.date) updateData.date = data.date;
//   if (data.productName) updateData.productName = data.productName.trim();
//   if (data.closingKgs !== undefined) updateData.closingKgs = parseFloat(data.closingKgs);

//   return await record.update(updateData);
// };

// export const deleteCountwiseClosing = async (id) => {
//   const record = await CountwiseClosing.findByPk(id);
//   if (!record) {
//     throw new Error("Countwise Closing record not found");
//   }
//   await record.destroy();
//   return { message: "Countwise Closing record deleted successfully" };
// };

// export const getCountwiseClosingReport = async (startDate, endDate) => {
//   const records = await CountwiseClosing.findAll({
//     where: {
//       date: {
//         [db.Sequelize.Op.between]: [startDate, endDate]
//       }
//     },
//     order: [["date", "ASC"]]
//   });
  
//   return {
//     data: records
//   };
// };

// export const getProductStockReport = async (startDate, endDate) => {
//   const records = await CountwiseClosing.findAll({
//     where: {
//       date: {
//         [db.Sequelize.Op.between]: [startDate, endDate]
//       }
//     },
//     order: [["date", "ASC"]]
//   });
  
//   // Group by productName and calculate totals
//   const groupedByProduct = {};
//   records.forEach(record => {
//     const productName = record.productName || 'Unknown';
//     if (!groupedByProduct[productName]) {
//       groupedByProduct[productName] = {
//         productName,
//         totalQuantity: 0,
//         totalWeight: 0,
//         totalRecords: 0
//       };
//     }
//     groupedByProduct[productName].totalQuantity += record.quantity || 0;
//     groupedByProduct[productName].totalWeight += record.closingKgs || 0;
//     groupedByProduct[productName].totalRecords += 1;
//   });
  
//   return {
//     data: Object.values(groupedByProduct)
//   };
// };