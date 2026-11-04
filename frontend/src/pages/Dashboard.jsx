import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Scan, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  Activity, 
  RefreshCw, 
  Database,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, logsRes] = await Promise.all([
        api.getStats(),
        api.getTrends(),
        api.getHistory(5, 0)
      ]);
      setStats(statsRes.data);
      setTrends(trendsRes.data);
      setRecentLogs(logsRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !stats) {
    return <LoadingSpinner text="Aggregating vision statistics..." />;
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time telemetry and deep learning recognition metrics</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Registered Users"
          value={stats?.total_registered_users ?? 0}
          subtitle="Consenting individuals enrolled"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Recognition Events"
          value={stats?.total_recognition_events ?? 0}
          subtitle="Total frames evaluated"
          icon={Scan}
          color="cyan"
        />
        <StatCard
          title="Known Match Rate"
          value={`${stats?.match_accuracy_rate ?? 0}%`}
          subtitle={`${stats?.known_recognitions ?? 0} confirmed identifications`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Avg Inference Latency"
          value={`${stats?.average_latency_ms ?? 0} ms`}
          subtitle="OpenCV CPU pipeline"
          icon={Zap}
          color="purple"
        />
      </div>

      {/* Main Trends Chart & Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Recognition Activity Trends</h3>
              <p className="text-xs text-slate-500">7-day timeline of known vs unknown faces detected</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center space-x-1.5 text-accent-blue">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-blue"></span>
                <span>Known</span>
              </span>
              <span className="flex items-center space-x-1.5 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Unknown</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="knownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#48CAE4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#48CAE4" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="unknownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1C2541', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Area type="monotone" dataKey="known" stroke="#00B4D8" fillOpacity={1} fill="url(#knownGradient)" />
                  <Area type="monotone" dataKey="unknown" stroke="#F59E0B" fillOpacity={1} fill="url(#unknownGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No activity logs recorded yet. Start live recognition to populate trends.
              </div>
            )}
          </div>
        </div>

        {/* Architecture & Engine Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-slate-800">ML Engine Diagnostics</h3>
            <p className="text-xs text-slate-500 mt-0.5">Underlying computer vision pipelines</p>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-blue-100/70 text-blue-700">
                <Scan className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">YuNet Face Detector</p>
                <p className="text-[11px] text-slate-500 mt-0.5">CNN model with 5-point facial landmark regression</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-cyan-100/70 text-cyan-700">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">SFace Deep Embeddings</p>
                <p className="text-[11px] text-slate-500 mt-0.5">128-dimensional L2-normalized feature representation</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">SQLite + Cosine Matcher</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Threshold calibrated at 0.363 for high confidence</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('live')}
            className="w-full py-3 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Scan className="w-4 h-4 text-accent-cyan" />
            <span>Launch Live Recognition</span>
          </button>
        </div>
      </div>

      {/* Recent Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Recent Recognition Activity</h3>
            <p className="text-xs text-slate-500">Live timeline of verified and unknown face scans</p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-accent-blue hover:underline"
          >
            View All Logs &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentLogs.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Classification</th>
                  <th className="px-6 py-3.5">Similarity Score</th>
                  <th className="px-6 py-3.5">Latency</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log) => {
                  const isKnown = log.recognition_status === 'recognized';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{log.recognized_name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isKnown ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isKnown ? 'Recognized' : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {log.similarity_score !== null ? log.similarity_score.toFixed(4) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{log.latency_ms} ms</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              No recognition events logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
