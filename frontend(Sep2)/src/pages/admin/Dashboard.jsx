import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage Purchase
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-10 flex items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          👋 Hello Admin, Welcome Back!
        </h2>
      </div>
    </div>
  );
};

export default AdminDashboard;
