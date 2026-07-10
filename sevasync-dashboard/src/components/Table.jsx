import React, { useState, useMemo } from 'react';
import { User, Package, MapPin, Activity, Search, X } from 'lucide-react';

const Table = ({ title, data, type }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isVolunteers = type === 'volunteers';
  const Icon = isVolunteers ? User : Package;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item => {
      const name = (isVolunteers ? item.name : item.type) || '';
      const sub = (isVolunteers ? item.role : item.location) || '';
      return name.toLowerCase().includes(lowerSearch) || sub.toLowerCase().includes(lowerSearch);
    });
  }, [data, searchTerm, isVolunteers]);

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-6 border-b border-[#dadce0] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-medium text-[#202124] flex items-center gap-2">
            <Icon size={18} className="text-[#1a73e8]" />
            {title}
          </h3>
          <span className="text-[12px] text-[#5f6368] bg-[#f1f3f4] px-2 py-0.5 rounded-full font-medium">
             {filteredData.length} total
          </span>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]" />
          <input 
            type="text" 
            placeholder={`Search ${isVolunteers ? 'volunteers' : 'resources'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f1f3f4] border-transparent rounded-md pl-9 pr-8 py-2 text-[14px] text-[#3c4043] placeholder:text-[#5f6368] outline-none focus:bg-white focus:ring-1 ring-[#1a73e8] transition-all shadow-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[360px]">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9fa] border-b border-[#dadce0] sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-[12px] font-medium text-[#5f6368] uppercase tracking-wider">{isVolunteers ? 'Name' : 'Type'}</th>
              <th className="px-6 py-3 text-[12px] font-medium text-[#5f6368] uppercase tracking-wider text-center">Location</th>
              <th className="px-6 py-3 text-[12px] font-medium text-[#5f6368] uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]">
            {filteredData.map((item, idx) => (
              <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                <td className="px-6 py-4 truncate">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8] text-[12px] font-medium shrink-0">
                       {(isVolunteers ? item.name : item.type)?.[0]}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#3c4043] truncate">{isVolunteers ? item.name : item.type}</p>
                      <p className="text-[12px] text-[#5f6368] truncate">{isVolunteers ? item.role : `Quantity: ${item.quantity}`}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center truncate">
                  <span className="text-[12px] text-[#5f6368]">{isVolunteers ? item.city : item.location}</span>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#34a853]" />
                      <span className="text-[11px] font-medium uppercase">{isVolunteers ? item.status : 'Avail'}</span>
                   </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-[14px] text-[#5f6368] italic">
                   No results found for "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-[#f8f9fa] border-t border-[#dadce0]">
         <button className="w-full py-2 text-[13px] font-medium text-[#1a73e8] hover:bg-[#1a73e8]/5 rounded-md transition-all">
            See all logs
         </button>
      </div>
    </div>
  );
};


export default Table;
