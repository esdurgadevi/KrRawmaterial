import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../services/auth/authService";

const AdminSidebar1 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState(""); // currently open section
  const navigate = useNavigate();

  // ================= Sidebar Items =================
  const dashboardItem = [
    { to: "/admin1/dashboard", icon: "📊", label: "Dashboard" },
  ];

  const masterItems = [
    { to: "/admin1/spinning", icon: "📍", label: "Spinning" },
    { to: "/admin1/simplex", icon: "📍", label:"Simplex"},
  ];

  const transactionQCItems = [
    { to: "/admin1/qc-entry", icon: "📋", label: "QC Entry" },
    { to: "/admin1/spinning-lf", icon: "🧵", label: "Spinning Long Frame"},
    { to: "/admin1/breaker-drwaing", icon: "⚙️", label: "Breaker Drawing"},
    { to: "/admin1/finisher-drawing", icon: "🔧", label: "Finisher Drawing"},
    { to: "/admin1/comber-entry", icon: "🪶", label: "Comber Entry"},
    { to: "/admin1/lap-former", icon: "📦", label: "Lap Former"},
    { to: "/admin1/auto-coner", icon: "🔄", label: "Auto Coner"},
    { to: "/admin1/qc-simplex", icon: "📊", label: "QC Simplex"},
    { to: "/admin1/qc-carding", icon: "🧰", label: "QC Carding"},
    { to: "/admin1/qc-blowroom", icon: "💨", label: "QC Blow Room"},
  ];

  const qcReportsItem = { to: "/admin1/qc-reports", icon: "📊", label: "QC Reports" };

  // ================= Logout =================
  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsOpen(false);
  };

  // ================= Render =================
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#11101d] text-white
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#1d1b31]">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-indigo-500">🛡️</span>
            <span className="text-xl font-bold">Mill Exports Quality Check</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Menu */}
        <nav className="p-3 overflow-y-auto h-full">
          <ul className="space-y-1.5">
            {/* Dashboard */}
            {dashboardItem.map((item, i) => (
              <SidebarLink key={i} item={item} setIsOpen={setIsOpen} />
            ))}

            {/* Master Section */}
            <SidebarSection
              title="Master"
              open={openSection === "master"}
              onClick={() =>
                setOpenSection(openSection === "master" ? "" : "master")
              }
              items={masterItems}
              setIsOpen={setIsOpen}
            />

            {/* Transaction QC Section */}
            <SidebarSection
              title="Transaction QC"
              open={openSection === "transaction"}
              onClick={() =>
                setOpenSection(openSection === "transaction" ? "" : "transaction")
              }
              items={transactionQCItems}
              setIsOpen={setIsOpen}
            />

            {/* QC Reports Standalone Top-Level Tab */}
            <SidebarLink item={qcReportsItem} setIsOpen={setIsOpen} />

            {/* Logout */}
            <li className="pt-4 mt-3 border-t border-[#1d1b31]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 w-full
                  text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
              >
                <span className="text-lg">🚪</span>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-[#11101d] p-2 rounded-lg"
        >
          <span className="text-white text-xl">☰</span>
        </button>
      )}
    </>
  );
};

/* ---------------- Sidebar Section Component ---------------- */
const SidebarSection = ({ title, open, onClick, items, setIsOpen }) => (
  <li>
    <button
      onClick={onClick}
      className="flex justify-between items-center w-full px-4 py-3
        text-gray-300 hover:bg-white/10 rounded-xl"
    >
      <span>{title}</span>
      <span
        className={`text-lg transition-transform ${
          open ? "rotate-180 inline-block" : ""
        }`}
      >
        ▼
      </span>
    </button>

    {open && (
      <ul className="ml-4 mt-1 space-y-1">
        {items.map((item, i) => (
          <SidebarLink key={i} item={item} setIsOpen={setIsOpen} />
        ))}
      </ul>
    )}
  </li>
);

/* ---------------- Sidebar Link Component ---------------- */
const SidebarLink = ({ item, setIsOpen }) => {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium
          ${
            isActive
              ? "bg-white text-[#11101d]"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <span className="text-lg">{Icon}</span>
        {item.label}
      </NavLink>
    </li>
  );
};

export default AdminSidebar1;
