import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  Map as MapIcon, 
  FileText, 
  Briefcase, 
  Users, 
  Package, 
  Inbox, 
  Upload, 
  Sparkles, 
  BarChart3, 
  History, 
  Bell, 
  Settings, 
  UserCog, 
  LogOut,
  Activity,
  Shield,
  ChevronRight,
  Droplet
} from 'lucide-react';

const menuSections = [
  {
    title: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: FileText, label: 'Cases', path: '/reports' },
      { icon: Target, label: 'Tasks', path: '/tasks' },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { icon: Users, label: 'Volunteers', path: '/volunteers' },
      { icon: Package, label: 'Inventory', path: '/resources' },
      { icon: Droplet, label: 'Blood Bank', path: '/blood-bank' },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { icon: Bell, label: 'Alerts', path: '/alerts', count: 2 },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: UserCog, label: 'User Management', path: '/users' },
    ]
  }
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-[40] w-[260px] bg-white border-r border-[#f0f0f0] transition-all duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}
        flex flex-col h-full
      `}>
        {/* Logo Section */}
        <div className="h-20 flex items-center px-7 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a73e8] flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-[19px] font-bold text-[#1e293b] tracking-tight leading-none">SevaSyncAI</h1>
              <p className="text-[10px] text-[#94a3b8] font-semibold tracking-widest mt-1">COMMAND CENTER</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 space-y-7 overflow-y-auto pb-10">
           {menuSections.map((section) => (
             <div key={section.title} className="space-y-1">
               <h3 className="px-4 text-[11px] font-bold text-[#94a3b8] tracking-[0.1em] mb-3">{section.title}</h3>
               {section.items.map((item) => (
                  <NavLink 
                    key={item.label} 
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-[#f0f7ff] text-[#1a73e8] font-semibold' 
                        : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#1e293b]'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={19} className="transition-colors" />
                      <span className="text-[14px]">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#34a853] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">{item.badge}</span>
                    )}
                    {item.count && (
                      <span className="bg-[#ea4335] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.count}</span>
                    )}
                  </NavLink>
               ))}
             </div>
           ))}
        </div>

        {/* User Profile */}
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] group hover:bg-white transition-all cursor-pointer">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#1a73e8] font-bold shadow-sm uppercase">
                 {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-[13px] font-bold text-[#1e293b] truncate">{user?.name || 'Authorized User'}</p>
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    <span className="text-[11px] text-[#64748b] font-medium">NGO Admin</span>
                 </div>
              </div>
              <ChevronRight size={14} className="text-[#94a3b8] group-hover:translate-x-1 transition-transform" />
           </div>
        </div>

        {/* System Status (Condensed) */}
        <div className="px-7 py-4 border-t border-[#f0f0f0]">
           <div className="flex items-center justify-between text-[#94a3b8]">
              <span className="text-[10px] font-bold uppercase tracking-widest">System Status</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
           </div>
        </div>
      </div>

      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="lg:hidden fixed inset-0 z-[35] bg-black/40 backdrop-blur-[2px]" 
        />
      )}
    </>
  );
};

export default Sidebar;
