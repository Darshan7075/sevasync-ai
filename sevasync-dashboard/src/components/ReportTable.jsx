import React, { useState, useMemo } from 'react';
import { 
  Search, Download, ChevronLeft, ChevronRight, 
  ChevronDown, ChevronUp, Flame, AlertCircle, 
  Trash2, CheckCircle2, RefreshCcw, Info, Sparkles
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    'Resolved': 'bg-[#e6f4ea] text-[#137333]', // Google Green
    'In Progress': 'bg-[#e8f0fe] text-[#1967d2]', // Google Blue
    'Pending': 'bg-[#fef7e0] text-[#b06000]' // Google Yellow/Brown
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

const UrgencyBadge = ({ level }) => {
  if (level === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#fce8e6] text-[#c5221f]">
        High priority
      </span>
    );
  }
  if (level === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#fef7e0] text-[#b06000]">
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#f1f3f4] text-[#5f6368]">
      Low
    </span>
  );
};

const ReportTable = ({ reports, onReportClick, onDelete, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const itemsPerPage = 8;

  const processedReports = useMemo(() => {
    let result = [...(reports || [])];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => 
        (r.area || '').toLowerCase().includes(lowerSearch) ||
        (r.issue || '').toLowerCase().includes(lowerSearch) ||
        String(r.id).toLowerCase().includes(lowerSearch)
      );
    }
    return result;
  }, [reports, searchTerm]);

  const totalPages = Math.ceil(processedReports.length / itemsPerPage);
  const paginatedReports = processedReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div className="google-card flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-[#dadce0] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-medium text-[#202124]">Reports</h3>
          <p className="text-[13px] text-[#5f6368]">Review and manage community assistance reports</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]" size={16} />
            <input 
              type="text" 
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 bg-[#f1f3f4] border-transparent rounded-md text-[14px] w-full md:w-64 outline-none focus:bg-white focus:ring-1 ring-[#1a73e8] transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="btn-google-ghost" title="Download CSV">
             <Download size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
            <tr>
              <th className="px-6 py-3 text-[12px] font-medium text-[#5f6368] uppercase tracking-wider">Report ID</th>
              <th className="px-6 py-3 text-[12px] font-medium text-[#5f6368] uppercase tracking-wider">Area</th>
              <th className="px-6 py-3 text-[12px] font-medium text-[#5f6368] uppercase tracking-wider">Issue</th>
              <th className="px-6 py-3 text-[12px] font-medium text-[#5f6368] uppercase tracking-wider">Urgency</th>
              <th className="px-6 py-3 text-[12px] font-medium text-[#5f6368] uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dadce0]">
            {paginatedReports.map((report) => (
              <React.Fragment key={report.id}>
                <tr 
                  onClick={() => { onReportClick(report); toggleRow(report.id); }}
                  className={`group cursor-pointer transition-all ${
                    expandedRow === report.id ? 'bg-[#f1f3f4]' : 'hover:bg-[#f8f9fa]'
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-[14px] text-[#1a73e8] font-medium hover:underline">#{report.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-[14px] text-[#3c4043] font-medium">{report.area}</span>
                       <span className="text-[12px] text-[#5f6368]">{report.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[14px] text-[#3c4043]">{report.issue}</span>
                  </td>
                  <td className="px-6 py-4">
                    <UrgencyBadge level={report.urgency} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-[#5f6368]">
                       <StatusBadge status={report.status || 'Pending'} />
                       <ChevronDown size={18} className={`transition-transform duration-200 ${expandedRow === report.id ? 'rotate-180 text-[#1a73e8]' : ''}`} />
                    </div>
                  </td>
                </tr>
                
                {expandedRow === report.id && (
                  <tr className="bg-[#f8f9fa]">
                    <td colSpan="5" className="px-6 py-6 border-b border-[#dadce0]">
                       <div className="flex flex-col lg:flex-row gap-8">
                          <div className="flex-1 space-y-6">
                             <div>
                               <h5 className="text-[12px] font-medium text-[#5f6368] uppercase tracking-wider mb-2">Description</h5>
                               <p className="text-[14px] text-[#3c4043] bg-white p-4 rounded-md border border-[#dadce0] leading-relaxed">
                                  {report.description || 'No additional details provided.'}
                               </p>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-white border border-[#dadce0] p-3 rounded-md shadow-sm">
                                  <h5 className="text-[11px] font-medium text-[#5f6368] uppercase mb-1">Group</h5>
                                  <p className="text-[14px] text-[#3c4043]">{report.group || 'Not specified'}</p>
                                </div>
                                 <div className="bg-white border border-[#dadce0] p-3 rounded-md shadow-sm">
                                   <h5 className="text-[11px] font-medium text-[#5f6368] uppercase mb-1">Affected</h5>
                                   <p className="text-[14px] text-[#3c4043]">{report.people} people</p>
                                </div>
                             </div>
                             
                             {report.explanation && (
                               <div className="bg-[#e8f0fe] border border-[#1a73e8]/20 p-4 rounded-xl flex items-start gap-4">
                                  <div className="p-2 bg-white rounded-lg text-[#1a73e8] shadow-sm">
                                     <Sparkles size={18} />
                                  </div>
                                  <div>
                                     <h5 className="text-[12px] font-bold text-[#1a73e8] uppercase mb-1 tracking-wider">AI Tactical Insight</h5>
                                     <p className="text-[13px] text-[#1967d2] leading-relaxed">{report.explanation}</p>
                                  </div>
                               </div>
                             )}
                          </div>
                          <div className="lg:w-64 space-y-3">
                             <h5 className="text-[12px] font-medium text-[#5f6368] uppercase tracking-wider mb-2">Actions</h5>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onUpdateStatus(report.id, 'In Progress'); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#dadce0] rounded-md bg-white hover:bg-[#f8f9fa] text-[#3c4043] text-[14px] font-medium transition-all"
                             >
                                <RefreshCcw size={16} className="text-[#1a73e8]" />
                                Start progress
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onUpdateStatus(report.id, 'Resolved'); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#dadce0] rounded-md bg-white hover:bg-[#f8f9fa] text-[#3c4043] text-[14px] font-medium transition-all"
                             >
                                <CheckCircle2 size={16} className="text-[#34a853]" />
                                Resolve report
                             </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(report.id); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#dadce0] rounded-md bg-white hover:bg-[#fce8e6] text-[#ea4335] text-[14px] font-medium transition-all"
                             >
                                <Trash2 size={16} />
                                Delete
                             </button>
                          </div>
                       </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
        <p className="text-[13px] text-[#5f6368]">
          Showing {Math.min(processedReports.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(processedReports.length, currentPage * itemsPerPage)} of {processedReports.length} reports
        </p>
        
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-1.5 text-[#5f6368] hover:bg-[#f1f3f4] rounded-md disabled:opacity-30 transition-all border border-transparent hover:border-[#dadce0]"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1.5 text-[#5f6368] hover:bg-[#f1f3f4] rounded-md disabled:opacity-30 transition-all border border-transparent hover:border-[#dadce0]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};


export default ReportTable;
