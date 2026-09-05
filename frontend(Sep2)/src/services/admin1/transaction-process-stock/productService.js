import axios from "axios";

const productService = {
  getProducts: async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("📡 Calling API with token:", token ? "✅ Present" : "❌ Missing");
      
      const response = await axios.get("https://krexports.org/krerm/products/external", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      console.log("✅ API Response Status:", response.status);
      console.log("✅ API Response Data:", response.data);
      
      return response.data.products || [];
    } catch (error) {
      console.error("❌ API Error:", error.message);
      console.error("❌ Full Error:", error);
      return [];
    }
  },
};

export default productService;
