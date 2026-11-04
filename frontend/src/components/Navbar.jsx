import React, { useState, useEffect } from 'react';
import { Activity, Clock, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Navbar({ activeTitle }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isOnline, setIsOnline] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        setIsOnline(res.status === 200);
        setModelLoaded(res.data.model_loaded);
      } catch (err) {
        setIsOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between select-none shadow-sm">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold text-slate-800">{activeTitle}</h2>
      </div>

      <div className="flex items-center space-x-6 text-sm">
        {/* Clock */}
        <div className="flex items-center space-x-2 text-slate-500 font-medium">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="font-mono text-xs">{currentTime}</span>
        </div>

        {/* Engine Status */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
          <Cpu className="w-3.5 h-3.5 text-accent-blue" />
          <span>Inference: <strong className="font-semibold">CPU ONNX</strong></span>
        </div>

        {/* Backend Connectivity */}
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Backend Ready</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-full text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
