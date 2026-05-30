import { Navigate } from 'react-router-dom';
import { getToken } from '../../services/api';

const AdminRoute = ({ children }) => {
  const token = getToken();
  
  // Check if admin is logged in via sessionStorage
  const adminData = sessionStorage.getItem('yogaflow_admin');

  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const admin = JSON.parse(adminData);
    if (admin.role !== 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;
