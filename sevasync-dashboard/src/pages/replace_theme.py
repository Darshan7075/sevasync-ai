import re

def replace_theme(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = {
        'bg-slate-950': 'bg-[#f8fafc]',
        'text-white': 'text-slate-900',
        'bg-white/5': 'bg-white shadow-sm',
        'border-white/10': 'border-slate-200',
        'border-white/5': 'border-slate-100',
        'bg-slate-900/50': 'bg-slate-50',
        'bg-slate-800/50': 'bg-slate-100',
        'text-slate-200': 'text-slate-800',
        'text-slate-300': 'text-slate-700',
        'text-slate-400': 'text-slate-500',
        'text-slate-500': 'text-slate-400',
        'hover:bg-white/10': 'hover:bg-slate-100',
        'hover:bg-white/5': 'hover:bg-slate-50',
        'from-slate-950': 'from-[#f8fafc]',
        'via-[#0d1527]': 'via-white',
        'to-indigo-950/30': 'to-slate-100',
        'bg-slate-900 text-slate-900 shadow-lg': 'bg-slate-900 text-white shadow-lg',
        'bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-slate-900': 'bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white',
        'bg-blue-600 text-slate-900': 'bg-blue-600 text-white',
        'bg-emerald-600 text-slate-900': 'bg-emerald-600 text-white',
        'bg-rose-600 text-slate-900': 'bg-rose-600 text-white',
        'bg-slate-900 text-slate-900': 'bg-slate-900 text-white',
        'bg-slate-800 text-slate-900': 'bg-slate-800 text-white',
        'cartocdn.com/dark_all': 'cartocdn.com/rastertiles/voyager',
        'bg-[#0f172a] text-slate-900': 'bg-white text-slate-900',
        'placeholder:text-slate-600': 'placeholder:text-slate-400',
        'bg-slate-900': 'bg-white', # Make sure to do this after the text-white specific rules
        'bg-white text-slate-900 shadow-lg': 'bg-slate-900 text-white shadow-lg', # Fix Active state text color inversion
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

replace_theme('VolunteerDashboard.jsx')
