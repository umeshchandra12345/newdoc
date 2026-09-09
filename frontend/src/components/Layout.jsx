import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useTheme } from '../context/ThemeContext';

const pageTitles = {
  '/dashboard': 'Executive Dashboard',
  '/carbon-accounting': 'Carbon Accounting',
  '/scope-1': 'Scope 1 Direct Emissions',
  '/scope-2': 'Scope 2 Purchased Energy',
  '/scope-3': 'Scope 3 Value Chain',
  '/products': 'Product Carbon Footprint',
  '/suppliers': 'Supplier Intelligence',
  '/ai-insights': 'AI Climate Insights',
  '/decarbonization': 'Decarbonization Planner',
  '/regulatory': 'Regulatory & Compliance',
  '/reports': 'Environmental Reports',
  '/settings': 'Platform Settings',
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportingYear, setReportingYear] = useState(2026);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const { brandName } = useTheme();

  const currentTitle = pageTitles[location.pathname] || brandName;


  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <TopNav
          title={currentTitle}
          reportingYear={reportingYear}
          onYearChange={setReportingYear}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="page-container">
          <Outlet context={{ reportingYear, setReportingYear, searchTerm, setSearchTerm }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
