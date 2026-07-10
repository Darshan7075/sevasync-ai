const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'sevasync-dashboard', 'src', 'pages', 'VolunteerDashboard.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const replacements = [
  { old: /bg-\[#020617\]/g, new: 'bg-[#f8fafc]' },
  { old: /text-slate-100/g, new: 'text-slate-900' },
  { old: /bg-\[#0b0f19\]/g, new: 'bg-white' },
  { old: /border-white\/10/g, new: 'border-slate-200' },
  { old: /border-white\/5/g, new: 'border-slate-100' },
  { old: /bg-white\/5/g, new: 'bg-white shadow-sm' },
  { old: /bg-white\/10/g, new: 'bg-slate-50' },
  { old: /from-slate-950 via-\[#0d1527\] to-indigo-950\/30/g, new: 'from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]' },
  { old: /text-white/g, new: 'text-slate-900' },
  { old: /text-slate-400/g, new: 'text-slate-500' },
  { old: /text-slate-300/g, new: 'text-slate-600' },
  { old: /text-slate-200/g, new: 'text-slate-700' },
  { old: /bg-slate-900\/50/g, new: 'bg-white shadow-sm' },
  { old: /bg-slate-900/g, new: 'bg-white' },
  { old: /bg-blue-600 text-slate-900/g, new: 'bg-blue-600 text-white' },
  { old: /text-slate-900 shadow-lg/g, new: 'text-white shadow-lg' },
  { old: /bg-emerald-500 text-slate-900/g, new: 'bg-emerald-500 text-white' },
  { old: /bg-emerald-600 text-slate-900/g, new: 'bg-emerald-600 text-white' },
  { old: /bg-rose-500 text-slate-900/g, new: 'bg-rose-500 text-white' },
  { old: /cartocdn\.com\/dark_all/g, new: 'cartocdn.com/rastertiles/voyager' },
  { old: /bg-\[#0f172a\]/g, new: 'bg-white' },
  { old: /hover:bg-white\/5/g, new: 'hover:bg-slate-50' },
];

replacements.forEach(r => {
  content = content.replace(r.old, r.new);
});

// Manual revert for specific known primary buttons that got messed up by text-white -> text-slate-900
content = content.replace(/text-slate-900 rounded-2xl flex items-center justify-center/g, 'text-white rounded-2xl flex items-center justify-center');
content = content.replace(/bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-slate-900/g, 'bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully changed VolunteerDashboard to Pristine Light theme!');
