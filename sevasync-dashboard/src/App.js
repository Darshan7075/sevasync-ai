
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Navbar Component */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
          
          <footer className="px-8 py-10 bg-white border-t border-slate-100">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 font-medium text-xs">
              <p>© 2026 SevaSync AI Platform. Empowering NGOs with intelligent coordination.</p>
              <div className="flex gap-8 uppercase tracking-widest">
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-600 transition-colors">System Health</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
