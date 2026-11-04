import React from 'react';
import { 
  LayoutDashboard, 
  ScanFace, 
  UserPlus, 
  Users, 
  History, 
  Settings, 
  ShieldCheck,
  Camera
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Recognition', icon: ScanFace },
    { id: 'register', label: 'Register Face', icon: UserPlus },
    { id: 'users', label: 'Registered Users', icon: Users },
    { id: 'history', label: 'Recognition Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 text-white flex flex-col border-r border-navy-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center text-navy-900 shadow-lg shadow-accent-cyan/20">
            <Camera className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">FaceVision AI</h1>
            <p className="text-xs text-slate-400 font-medium">CV & Deep Learning</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Core System
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-navy-800 text-accent-cyan shadow-sm border-l-4 border-accent-cyan pl-2.5'
                  : 'text-slate-300 hover:bg-navy-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-accent-cyan' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Biometric Privacy Badge */}
      <div className="p-4 m-4 rounded-xl bg-navy-800/80 border border-navy-700/60">
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Privacy Shield</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Biometrics processed on local CPU. Zero cloud uploads.
        </p>
      </div>

      {/* Footer Version */}
      <div className="px-6 py-4 border-t border-navy-800 text-xs text-slate-500 flex justify-between items-center">
        <span>YuNet &bull; SFace</span>
        <span className="font-mono bg-navy-800 px-2 py-0.5 rounded text-[10px] text-slate-400">v1.0.0</span>
      </div>
    </aside>
  );
}
