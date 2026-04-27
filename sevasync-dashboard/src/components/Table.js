
import React, { useState } from 'react';
import { Search, MoreVertical, Star } from 'lucide-react';

const Table = ({ title, data, type }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    if (type === 'reports') return item.area.toLowerCase().includes(searchStr) || item.issue.toLowerCase().includes(searchStr);
    if (type === 'volunteers') return item.name.toLowerCase().includes(searchStr) || item.role.toLowerCase().includes(searchStr);
    if (type === 'ngos') return item.name.toLowerCase().includes(searchStr) || item.focus.toLowerCase().includes(searchStr);
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${type}...`}
            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              {type === 'reports' && (
                <>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Issue</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </>
              )}
              {type === 'volunteers' && (
                <>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </>
              )}
              {type === 'ngos' && (
                <>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NGO Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Focus Area</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                </>
              )}
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map((item) => (
              <tr 
                key={item.id} 
                className={`hover:bg-slate-50 transition-colors ${type === 'reports' && item.urgency === 'High' ? 'bg-rose-50/30' : ''}`}
              >
                {type === 'reports' && (
                  <>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.area}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.issue}</td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                         item.urgency === 'High' ? 'bg-rose-100 text-rose-600' : 
                         item.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                       }`}>
                         {item.urgency}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${
                        item.status === 'Completed' ? 'text-emerald-500' : 
                        item.status === 'In Progress' ? 'text-blue-500' : 'text-amber-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </>
                )}
                {type === 'volunteers' && (
                  <>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.role}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.city}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{item.status}</span>
                      </div>
                    </td>
                  </>
                )}
                {type === 'ngos' && (
                  <>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.focus}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-bold">{item.members}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star size={14} fill="currentColor" /> {item.rating}
                      </div>
                    </td>
                  </>
                )}
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-slate-200 rounded text-slate-400">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
