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
import VolunteerDashboard from './pages/VolunteerDashboard.jsx';

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

const Layout = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-[#f8fafc]">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('reports');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    const handleReportsStorage = (e) => {
      if (e.key === 'reports' && e.newValue) {
        setReports(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleReportsStorage);
    return () => window.removeEventListener('storage', handleReportsStorage);
  }, []);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [bloodDonors, setBloodDonors] = useState([]);
  const [bloodInventory, setBloodInventory] = useState([]);
  const [supplyOrders, setSupplyOrders] = useState(() => {
    const saved = localStorage.getItem('supplyOrders');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'REQ-9912', volunteer: 'Active Agent', item: '50x Food Packages', status: 'Delivered', time: '2h ago', urgency: 'Low', location: 'Vadodara' },
      { id: 'REQ-9943', volunteer: 'Active Agent', item: '10x Medical Kits', status: 'Transit', time: '15m ago', urgency: 'High', location: 'Surat' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('supplyOrders', JSON.stringify(supplyOrders));
  }, [supplyOrders]);

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('tactical_alerts');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, type: 'CRITICAL', category: 'Mission', title: 'New Emergency Report', message: 'Medical emergency reported in Sector-07. Urgent triage required.', time: '2m ago', iconName: 'ShieldAlert', color: 'text-rose-500', bg: 'bg-rose-50' },
      { id: 2, type: 'SUCCESS', category: 'Logistics', title: 'Resource Dispatched', message: '120 units of Food Packs successfully dispatched to Ahmedabad Hub.', time: '14m ago', iconName: 'Truck', color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { id: 3, type: 'INFO', category: 'Personnel', title: 'Task Completed', message: 'Agent Rahul Sharma finished the debris clearance mission in Bhopal.', time: '1h ago', iconName: 'CheckCircle2', color: 'text-blue-500', bg: 'bg-blue-50' },
      { id: 4, type: 'WARNING', category: 'Resources', title: 'Low Stock Alert', message: 'Oxygen Cylinders in Surat storage falling below 15% threshold.', time: '3h ago', iconName: 'AlertTriangle', color: 'text-amber-500', bg: 'bg-amber-50' },
      { id: 5, type: 'SUCCESS', category: 'Resources', title: 'Inventory Restored', message: 'Blood Bank Inventory updated. 50 units of O+ added to central stock.', time: '5h ago', iconName: 'RefreshCw', color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { id: 6, type: 'INFO', category: 'Mission', title: 'New Volunteer Request', message: 'Devansh Panchal applied for Field Lead role in Sector-02.', time: '6h ago', iconName: 'UserPlus', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('tactical_alerts', JSON.stringify(notifications));
  }, [notifications]);

  const [emergencyRequests, setEmergencyRequests] = useState(() => {
    const saved = localStorage.getItem('blood_emergency_requests');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, type: 'AB+', volume: '5 Units', urgency: 'CRITICAL', target: 'VADODARA CIVIL HOSPITAL', sector: 'SECTOR 7 • DISPATCH NODE', status: 'Pending' },
      { id: 2, type: 'O-', volume: '8 Units', urgency: 'HIGH', target: 'AHMEDABAD CIVIL HOSPITAL', sector: 'SECTOR 2 • DISPATCH NODE', status: 'Pending' },
      { id: 3, type: 'B+', volume: '12 Units', urgency: 'MEDIUM', target: 'SURAT EMERGENCY CLINIC', sector: 'SECTOR 4 • SUPPLY NODE', status: 'Pending' },
      { id: 4, type: 'A+', volume: '3 Units', urgency: 'LOW', target: 'RAJKOT METRO HOSPITAL', sector: 'SECTOR 9 • REGIONAL NODE', status: 'Pending' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('blood_emergency_requests', JSON.stringify(emergencyRequests));
  }, [emergencyRequests]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'supplyOrders' && e.newValue) {
        setSupplyOrders(JSON.parse(e.newValue));
      }
      if (e.key === 'tactical_alerts' && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
      if (e.key === 'blood_emergency_requests' && e.newValue) {
        setEmergencyRequests(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const { user } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        setReports(prev => {
           const prevMap = new Map(prev.map(r => [r.id.toString(), r]));
           reportsRes.data.forEach(r => prevMap.set(r.id.toString(), r));
           return Array.from(prevMap.values());
        });
        hasData = true;
      }
      if (volunteersRes.data && volunteersRes.data.length > 0) {
        setVolunteers(volunteersRes.data.map(v => ({
          id: v.id,
          name: v.name,
          role: v.skill,
          city: v.location,
          status: v.availability,
          rating: v.rating,
          history: v.tasks_completed
        })));
        hasData = true;
      }
      if (bloodRes.data && bloodRes.data.length > 0) {
        setBloodDonors(bloodRes.data.map(d => ({
          id: d.id,
          name: d.name,
          bloodGroup: d.blood_group,
          city: d.city,
          available: d.availability === 'Available',
          lastDonation: d.last_donation_date,
          contact: d.contact
        })));
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

        setBloodDonors(prev => {
          const backendIds = new Set(prev.map(d => d.id.toString()));
          const newCsvDonors = parsedBlood.filter(d => !backendIds.has(d.id.toString()) && d.name);
          return [...prev, ...newCsvDonors];
        });
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

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/global_app');
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'notification') {
          const actionData = JSON.parse(payload.message);
          if (actionData.type === 'CLAIM_MISSION') {
             setReports(prev => prev.map(r => r.id.toString() === actionData.missionId.toString() ? { ...r, status: 'In Progress' } : r));
             setNotifications(prev => [
               {
                 id: Date.now(),
                 type: 'INFO',
                 category: 'Mission',
                 title: 'Mission Claimed',
                 message: `Mission ${actionData.missionId} claimed by ${actionData.volunteer}`,
                 time: 'Just Now',
                 iconName: 'Users',
                 color: 'text-indigo-500',
                 bg: 'bg-indigo-50'
               },
               ...prev
             ]);
             alert(`[TELEMETRY] Mission claimed by ${actionData.volunteer}`);
          } else if (actionData.type === 'UPDATE_STATUS') {
             setReports(prev => prev.map(r => r.id.toString() === actionData.missionId.toString() ? { ...r, status: actionData.status } : r));
             setNotifications(prev => [
               {
                 id: Date.now(),
                 type: 'SUCCESS',
                 category: 'Mission',
                 title: 'Mission Status Updated',
                 message: `Mission ${actionData.missionId} status updated to ${actionData.status}`,
                 time: 'Just Now',
                 iconName: 'CheckCircle2',
                 color: 'text-emerald-500',
                 bg: 'bg-emerald-50'
               },
               ...prev
             ]);
             alert(`[TELEMETRY] Mission status updated: ${actionData.status}`);
          }
        }
      } catch (e) {
        console.warn("Telemetry frame parse error.");
      }
    };
    return () => ws.close();
  }, []);


  const sharedProps = { 
    reports, setReports, 
    volunteers, setVolunteers, 
    resources, setResources, 
    ngos, setNgos, 
    bloodDonors, setBloodDonors,
    bloodInventory, setBloodInventory,
    supplyOrders, setSupplyOrders,
    notifications, setNotifications,
    emergencyRequests, setEmergencyRequests,
    cityCoordinates, isLoading
  };


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/volunteer-dashboard" element={<ProtectedRoute><VolunteerDashboard {...sharedProps} /></ProtectedRoute>} />

        <Route element={<ProtectedRoute><Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /></ProtectedRoute>}>
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
