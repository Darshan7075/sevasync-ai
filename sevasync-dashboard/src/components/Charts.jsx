import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, AreaChart, Area 
} from 'recharts';

const Charts = ({ urgencyData, issueData, type }) => {
  // Mock data for Radar Chart (Multi-Vector Risk)
  const radarData = [
    { subject: 'Medical', A: 120, fullMark: 150 },
    { subject: 'Logistics', A: 98, fullMark: 150 },
    { subject: 'Agents', A: 86, fullMark: 150 },
    { subject: 'Finance', A: 99, fullMark: 150 },
    { subject: 'Comms', A: 85, fullMark: 150 },
    { subject: 'Food', A: 65, fullMark: 150 },
  ];

  const renderDonut = () => (
    <div className="bg-slate-50/80 border border-slate-200 p-8 rounded-2xl shadow-inner">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex justify-between">
         <span>Urgency Distribution</span>
         <span className="text-blue-500">Live</span>
      </h3>
      <div className="h-[180px]">
        {urgencyData.some(d => d.value > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                 {urgencyData.map((d, i) => (
                    <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor={d.color} stopOpacity={0.8}/>
                       <stop offset="95%" stopColor={d.color} stopOpacity={0.2}/>
                    </linearGradient>
                 ))}
              </defs>
              <Pie 
                data={urgencyData} 
                innerRadius={65} 
                outerRadius={85} 
                paddingAngle={10}
                dataKey="value"
                stroke="none"
              >
                {urgencyData.map((entry, index) => <Cell key={index} fill={`url(#grad-${index})`} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-700 text-[10px] font-black uppercase tracking-widest italic">
            Syncing...
          </div>
        )}
      </div>
    </div>
  );

  const renderRadar = () => (
    <div className="bg-slate-50/80 border border-slate-200 p-8 rounded-2xl shadow-inner w-full">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Risk Vector Analysis</h3>
      <div className="h-[220px]">
         <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
               <PolarGrid stroke="#1e293b" />
               <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 900, fill: '#475569' }} />
               <Radar name="System Risk" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} 
                 itemStyle={{ color: '#fff' }}
                 labelStyle={{ color: '#94a3b8' }}
               />
            </RadarChart>
         </ResponsiveContainer>
      </div>
    </div>
  );

  const renderBar = () => (
    <div className="bg-slate-50/80 border border-slate-200 p-8 rounded-2xl shadow-inner w-full">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Sector Hazard Clustering</h3>
      <div className="h-[180px]">
        {issueData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={issueData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 900, fill: '#475569', textTransform: 'uppercase'}} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} 
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[10, 10, 4, 4]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-700 text-[10px] font-black uppercase tracking-widest italic">
            Awaiting data stream...
          </div>
        )}
      </div>
    </div>
  );

  if (type === 'donut') return renderDonut();
  if (type === 'radar') return renderRadar();
  if (type === 'bar') return renderBar();

  return (
    <div className="space-y-8 h-full">
      {renderDonut()}
      {renderRadar()}
      {renderBar()}
    </div>
  );
};

export default Charts;
