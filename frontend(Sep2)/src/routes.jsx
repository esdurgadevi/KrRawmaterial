import React from "react";
import { Navigate } from "react-router-dom";

// ================= AUTH PAGES =================
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

// ================= ADMIN LAYOUT =================
import AdminLayout from "./layouts/AdminLayout.jsx";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/admin/Dashboard.jsx";
//admin1/master
import State from "./pages/admin/State.jsx";
import Station from "./pages/admin/Station.jsx";
import Supplier from "./pages/admin/Supplier.jsx";
import MixingGroup from "./pages/admin/MixingGroup.jsx";
import MixingGroupRoutes from "./pages/admin/MixingGroupRoutes.jsx";
import Fibre from "./pages/admin/Fibre.jsx";
import Variety from "./pages/admin/Variety.jsx";
import Godown from "./pages/admin/Godown.jsx";
import CompanyBroker from "./pages/admin/CompanyBroker.jsx";
import Commodity from "./pages/admin/Commodity.jsx";
import Transport from "./pages/admin/Transport.jsx";
import PackingType from "./pages/admin/PackingType.jsx";
import Waste from "./pages/admin/Waste.jsx";
import WasteRates from "./pages/admin/WasteRate.jsx";
import WasteLot from "./pages/admin/WasteLot.jsx";
import Reports from "./pages/admin/Reports.jsx";
import Broker from "./pages/admin/Broker.jsx";
import Cost from "./pages/admin/Cost.jsx";
import WCInvoiceTypeMaster from "./pages/admin/WCInvoiceTypeMaster.jsx";
import CottonReportsCatalog from "./pages/admin/CottonReportsCatalog.jsx";
import WastePackingDetailsReportPage from "./pages/admin/WastePackingDetailsReportPage.jsx";

//admin1/transaction-cotton
import PurchaseOrderManagement from "./pages/admin/PurchaseOrderManagement.jsx";
import InwardEntryManagement from "./pages/admin/InwardEntryManagement.jsx";
import InwardLot from "./pages/admin/InwardLot.jsx";
import IssueManagement from "./pages/admin/IssueManagement.jsx";
import FinalInvoicePage from "./pages/admin/FinalInvoicePage.jsx";
import LotTestResultEntryPage from "./pages/admin/LotTestResultEntryPage.jsx";
import LocationTransferPage from "./pages/admin/LocationTransferPage.jsx";
import LotAllowancePage from "./pages/admin/LotAllowancePage.jsx";
import LotRejectedManagement from "./pages/admin/LotRejectedManagement.jsx";

//admin1/transaction-waste
import WastePackingPage from "./pages/admin/WastePackingPage.jsx";
import WasteCottonSalesPage from "./pages/admin/WasteCottonSalesPage.jsx";
import WasteCottonInvoicePage from "./pages/admin/WasteCottonInvoicePage.jsx";
import WasteEntryPage from "./pages/admin/WasteEntryPage.jsx";


//admin1/transaction-process-stock
import WasteIssuePage from "./pages/admin/WasteIssuePage.jsx";
import DepartmentKg from "./pages/admin/DepartmentKg.jsx";
import CountwiseClosing from "./pages/admin/CountwiseClosing.jsx";
import ProcessStockReport from "./pages/admin/ProcessStockReportsPage.jsx";

//admin2
import AdminLayout1 from "./layouts/AdminLayout1.jsx";
import Spinning from "./pages/admin2/SpinningCount.jsx";
import SimplexMachine from "./pages/admin2/SimplexMachine.jsx";
import QCEntry from "./pages/admin2/QCEntry.jsx";
import SpinningLongFrame from "./pages/admin2/SpinningLongFrame.jsx";
import BreakerDrawing from "./pages/admin2/BreakerDrawing.jsx";
import FinisherDrawing from "./pages/admin2/FinisherDrawing.jsx";
import ComberEntry from "./pages/admin2/ComberEntry.jsx";
import LapFormer from "./pages/admin2/LapFormer.jsx";
import AutoConer from "./pages/admin2/AutoConer.jsx";
import QCSimplex from "./pages/admin2/QCSimplex.jsx";
import QCCarding from "./pages/admin2/QCCarding.jsx";
import QCBlowRoom from "./pages/admin2/QCBlowRoom.jsx";
import QCReportsCatalog from "./pages/admin2/QCReportsCatalog.jsx";
import NotFound from "./pages/NotFound.jsx";


const ProtectedRoute = ({ children, role }) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role.toLowerCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ================= ROUTES =================
const routes = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },

      { path: "state", element: <State /> },
      { path: "station", element: <Station /> },
      { path: "supplier", element: <Supplier /> },
      { path: "broker", element:<Broker />},
      { path: "mixing_group", element: <MixingGroup /> },
      { path: "mixing_group_routes", element: <MixingGroupRoutes /> },

      { path: "fibre", element: <Fibre /> },
      { path: "variety", element: <Variety /> },

      { path: "godown", element: <Godown /> },
      { path: "company-broker", element: <CompanyBroker /> },

      { path: "wc-sales", element: <WCInvoiceTypeMaster /> },

      { path: "commodity", element: <Commodity /> },
      { path: "transport", element: <Transport /> },
      { path: "packing-type", element: <PackingType /> },

      { path: "waste", element: <Waste /> },
      { path: "waste-rates", element: <WasteRates /> },
      { path: "waste-lot", element: <WasteLot /> },
      { path: "cost-master",element:<Cost />},
      { path:"purchase-order",element:<PurchaseOrderManagement />},
      { path: "reports", element: <Reports /> },
      { path: "cotton-reports", element: <CottonReportsCatalog /> },
      { path:"inward-entries", element:<InwardEntryManagement />},
      { path:"inward-lot",element:<InwardLot />},
      { path:"issue",element:<IssueManagement />},
      { path:"lot-entry", element:<LotTestResultEntryPage />},
      { path:"location-transfer",element:<LocationTransferPage />},
      { path:"lot-allowance",element:<LotAllowancePage />},
      { path:"final-invoice",element:<FinalInvoicePage />},
      { path:"lot-reject",element:<LotRejectedManagement />},
      { path:"waste1",element:<WastePackingPage />},
      {path:"sales-order",element:<WasteCottonSalesPage/> },
      {path:"waste-order",element:<WasteCottonInvoicePage />},
      {path:"waste-entry",element:<WasteEntryPage />},
      {path:"waste-reports", element:<WastePackingDetailsReportPage />},
      {path: "waste-issue",element: <WasteIssuePage />,},
      { path: "department-kg", element: <DepartmentKg /> },
      {path: "countwise-closing", element: <CountwiseClosing />},
      {path: "process-stock-reports", element: <ProcessStockReport />},

      { path: "*", element: <NotFound /> }
    ],
  },
  {
    path: "/admin1",
    element: (
      <ProtectedRoute role="admin1">
        <AdminLayout1 />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "spinning", element:<Spinning />},
      { path: "simplex", element:<SimplexMachine />},
      { path: "qc-entry", element:<QCEntry />},
      { path: "spinning-lf", element:<SpinningLongFrame />},
      { path: "breaker-drwaing", element:<BreakerDrawing />},
      { path: "finisher-drawing", element:<FinisherDrawing />},
      { path: "comber-entry", element:<ComberEntry />},
      { path: "lap-former", element:<LapFormer />},
      { path: "auto-coner", element:<AutoConer />},
      { path: "qc-simplex", element:<QCSimplex />},
      { path: "qc-carding", element:<QCCarding />},
      { path: "qc-blowroom",element:<QCBlowRoom />},
            { path: "qc-reports", element: <QCReportsCatalog /> },
      { path: "*", element: <NotFound /> }
    ],
  },
];

export default routes;
