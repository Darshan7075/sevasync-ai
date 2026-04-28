import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import VolunteersPage from './pages/VolunteersPage.jsx';
import NGOsPage from './pages/NGOsPage.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import BloodBankPage from './pages/BloodBankPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import GenericModule from './pages/GenericModule.jsx';
import { reportService, volunteerService, bloodService, resourceService } from './services/api.js';
import { useAuth } from './context/AuthContext';
import { 
  Activity, Droplet, History, Bell, 
  Settings as SettingsIcon, UserCog, Upload, Briefcase, Map as MapIcon,
  MessageSquare
} from 'lucide-react';
import './index.css';

const cityCoordinates = {
  Bhopal: [23.2599, 77.4126],
  Indore: [22.7196, 75.8577],
  Ahmedabad: [23.0225, 72.5714],
  Surat: [21.1702, 72.8311],
  Vadodara: [22.3072, 73.1812],
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.7041, 77.1025],
  Pune: [18.5204, 73.8567],
  Rajkot: [22.3039, 70.8022],
  Navsari: [20.9467, 72.9520]
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-white h-screen">
      <div className="w-10 h-10 border-2 border-[#f1f3f4] border-t-[#1a73e8] rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Layout = ({ isSidebarOpen, toggleSidebar, isCrisisMode, toggleCrisisMode }) => {
  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased transition-colors duration-500 ${isCrisisMode ? 'bg-[#1a0b0b]' : 'bg-[#f8fafc]'}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Navbar toggleSidebar={toggleSidebar} isCrisisMode={isCrisisMode} toggleCrisisMode={toggleCrisisMode} />
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <Outlet />
        </main>
      </div>

      {/* FLOATING TACTICAL CHAT */}
      <div className="fixed bottom-8 right-8 z-[100]">
         <button 
           onClick={() => alert('ESTABLISHING ENCRYPTED COMMS LINK... Mission Frequency: 442.8MHz Secure.')}
           className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${isCrisisMode ? 'bg-red-600' : 'bg-blue-600'}`}
         >
            <MessageSquare size={28} />
         </button>
      </div>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [reports, setReports] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [bloodDonors, setBloodDonors] = useState([]);
  const [bloodInventory, setBloodInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCrisisMode = () => setIsCrisisMode(!isCrisisMode);

  const fetchBackendData = async () => {
    try {
      const [reportsRes, volunteersRes, bloodRes, inventoryRes, resourcesRes] = await Promise.all([
        reportService.getAll(),
        volunteerService.getAll(),
        bloodService.getDonors(),
        bloodService.getInventory(),
        resourceService.getAll()
      ]);
      
      let hasData = false;
      if (reportsRes.data && reportsRes.data.length > 0) {
        setReports(reportsRes.data);
        hasData = true;
      }
      if (volunteersRes.data && volunteersRes.data.length > 0) {
        setVolunteers(volunteersRes.data);
        hasData = true;
      }
      if (bloodRes.data && bloodRes.data.length > 0) {
        setBloodDonors(bloodRes.data);
        hasData = true;
      }
      if (inventoryRes.data && inventoryRes.data.length > 0) {
        setBloodInventory(inventoryRes.data);
        hasData = true;
      }
      if (resourcesRes.data && resourcesRes.data.length > 0) {
        setResources(resourcesRes.data);
        hasData = true;
      }
      return hasData;
    } catch (error) {
      console.warn("Backend connection failed, falling back to CSV data.");
      return false;
    }
  };

  useEffect(() => {
    const Papa = window.Papa;
    if (!Papa) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      await fetchBackendData();
      
      try {
        const [reportsData, volunteersData, resourcesData, ngosData, bloodData] = await Promise.all([
          fetch('/community_reports_1000.csv').then(res => res.text()),
          fetch('/volunteers_final_am_pm.csv').then(res => res.text()),
          fetch('/resources_500.csv').then(res => res.text()),
          fetch('/ngos_300.csv').then(res => res.text()),
          fetch('/blood_group_3000_names.csv').then(res => res.text())
        ]);

        const parseCSV = (data, mappingFn) => {
          return new Promise((resolve) => {
            Papa.parse(data, {
              header: true,
              skipEmptyLines: true,
              complete: (result) => {
                resolve(result.data.map(mappingFn));
              }
            });
          });
        };

        const [parsedBlood, parsedReports, parsedVolunteers, parsedResources, parsedNGOs] = await Promise.all([
          parseCSV(bloodData, (row, idx) => ({
            id: (idx + 1).toString(),
            name: (row.donor_name || 'Anonymous').trim(),
            bloodGroup: (row.blood_group || '').trim(),
            city: (row.city || '').trim(),
            available: (row.availability || '').trim() === 'Available',
            lastDonation: row.last_donation_date
          })),
          parseCSV(reportsData, (row, idx) => {
            const score = parseInt(row.urgency_score) || 0;
            const areaName = (row.area_name || '').trim();
            const city = (row.city || 'Vadodara').trim();
            const coords = cityCoordinates[areaName] || cityCoordinates[city] || [22.3072 + (Math.random() - 0.5) * 0.1, 73.1812 + (Math.random() - 0.5) * 0.1];

            return {
              id: row.report_id || (1000 + idx).toString(),
              area: areaName,
              city: city,
              issue: row.issue_type,
              people: parseInt(row.people_affected) || 0,
              urgency: score >= 8 ? 'High' : score >= 5 ? 'Medium' : 'Low',
              lat: coords[0],
              lng: coords[1],
              description: row.description,
              status: 'Pending'
            };
          }),
          parseCSV(volunteersData, (row, idx) => {
            const historyCount = parseInt(row.task_history) || 0;
            return {
              id: row.volunteer_id || (idx + 1).toString(),
              name: row.name || `Agent ${idx}`,
              role: row.skill || "Generalist",
              city: row.location || "Unspecified",
              status: historyCount > 30 ? "Mission Active" : "Active",
              rating: parseFloat(row.rating_reliability) || 4.5,
              history: historyCount
            };
          }),
          parseCSV(resourcesData, (row) => ({
            id: row.resource_id,
            type: row.type,
            quantity: parseInt(row.quantity) || 0,
            location: row.location,
            expiry: row.expiry_availability
          })),
          parseCSV(ngosData, (row) => ({
            ...row,
            activeMissions: parseInt(row.activeMissions) || 0,
            members: parseInt(row.members) || 10
          }))
        ]);

        setReports(prev => {
          const backendIds = new Set(prev.map(r => r.id.toString()));
          const newCsvReports = parsedReports.filter(r => !backendIds.has(r.id.toString()) && r.lat && r.lng);
          return [...prev, ...newCsvReports];
        });

        setVolunteers(prev => {
          const backendIds = new Set(prev.map(v => v.id.toString()));
          const newCsvVolunteers = parsedVolunteers.filter(v => !backendIds.has(v.id.toString()) && v.name);
          return [...prev, ...newCsvVolunteers];
        });

        setBloodDonors(prev => prev.length > 0 ? prev : parsedBlood);
        setResources(parsedResources.filter(res => res.type));
        setNgos(parsedNGOs.filter(n => n.name));
      } catch (error) {
        console.error("Error loading CSV data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const sharedProps = { 
    reports, setReports, 
    volunteers, setVolunteers, 
    resources, setResources, 
    ngos, setNgos, 
    bloodDonors, setBloodDonors,
    bloodInventory, setBloodInventory,
    cityCoordinates, isLoading, isCrisisMode, toggleCrisisMode 
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isCrisisMode={isCrisisMode} toggleCrisisMode={toggleCrisisMode} /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard {...sharedProps} />} />
          <Route path="/reports" element={<ReportsPage {...sharedProps} />} />
          <Route path="/tasks" element={<TasksPage {...sharedProps} />} />
          <Route path="/volunteers" element={<VolunteersPage {...sharedProps} />} />
          <Route path="/ngos" element={<NGOsPage {...sharedProps} />} />
          <Route path="/resources" element={<ResourcesPage {...sharedProps} />} />
          <Route path="/blood-bank" element={<BloodBankPage {...sharedProps} />} />
          <Route path="/alerts" element={<AlertsPage {...sharedProps} />} />
          <Route path="/settings" element={<SettingsPage {...sharedProps} />} />
          <Route path="/users" element={<UsersPage {...sharedProps} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
