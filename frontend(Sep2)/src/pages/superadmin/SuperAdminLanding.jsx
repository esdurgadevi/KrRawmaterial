import React from "react";
import { useNavigate } from "react-router-dom";

const SuperAdminLanding = () => {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Simple top bar */}
      <div style={{
        background: "#1e3a5f",
        color: "white",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>KR Exports — Super Admin</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, opacity: 0.85 }}>{user?.name || "Super Admin"}</span>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              borderRadius: 6,
              padding: "6px 16px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 56px)",
        padding: "40px 16px",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1f2937", marginBottom: 8, textAlign: "center" }}>
          Select Module
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 40, textAlign: "center" }}>
          Choose a module to access its dashboard
        </p>

        {/* Two cards */}
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>

          {/* Raw Material */}
          <div
            onClick={() => navigate("/admin/dashboard")}
            style={{
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: 12,
              padding: "36px 48px",
              textAlign: "center",
              cursor: "pointer",
              minWidth: 220,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Icon */}
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="30" height="30" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#1e3a5f", marginBottom: 6 }}>
              Raw Material
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              Purchase &amp; Inventory
            </div>
          </div>

          {/* QC */}
          <div
            onClick={() => navigate("/admin1/dashboard")}
            style={{
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: 12,
              padding: "36px 48px",
              textAlign: "center",
              cursor: "pointer",
              minWidth: 220,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0f766e";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,118,110,0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Icon */}
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: "#f0fdf9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="30" height="30" fill="none" stroke="#0f766e" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#134e4a", marginBottom: 6 }}>
              QC
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              Quality Control
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuperAdminLanding;
