import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CustomerManagement from './pages/CustomerManagement';
import SupplierManagement from './pages/SupplierManagement';
import Transactions from './pages/Transactions';
import Payments from './pages/Payments';
import Ledger from './pages/Ledger';
import useAuthStore from './store/authStore';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role && user?.role !== 'Admin') return <Navigate to="/" />;

  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<ProtectedRoute role="Admin"><UserManagement /></ProtectedRoute>} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="payments" element={<Payments />} />
          <Route path="ledger/:type/:id" element={<Ledger />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
