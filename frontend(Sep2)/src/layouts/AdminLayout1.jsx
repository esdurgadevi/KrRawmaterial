import AdminSidebar1 from "../components/Sidebar/AdminSidebar1";
import { Outlet } from "react-router-dom";

const AdminLayout1 = () => {
  return (
    <div className="flex">
      <AdminSidebar1 />
      <div className="lg:ml-64 flex-1 p-2 bg-gray-100 min-h-screen">  
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout1;
