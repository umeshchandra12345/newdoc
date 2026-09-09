import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CarbonAccounting from './pages/CarbonAccounting';
import Scope1 from './pages/Scope1';
import Scope2 from './pages/Scope2';
import Scope3 from './pages/Scope3';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import AIInsights from './pages/AIInsights';
import Decarbonization from './pages/Decarbonization';
import Regulatory from './pages/Regulatory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Application Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/carbon-accounting" element={<CarbonAccounting />} />
            <Route path="/scope-1" element={<Scope1 />} />
            <Route path="/scope-2" element={<Scope2 />} />
            <Route path="/scope-3" element={<Scope3 />} />
            <Route path="/products" element={<Products />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/decarbonization" element={<Decarbonization />} />
            <Route path="/regulatory" element={<Regulatory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
