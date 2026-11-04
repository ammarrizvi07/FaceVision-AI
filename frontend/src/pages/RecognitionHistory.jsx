import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  RefreshCw, 
  Filter, 
  Clock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function RecognitionHistory() {
  const [logs, setLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const filter = statusFilter === 'all' ? null : statusFilter;
      const res = await api.getHistory(100, 0, filter);
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching recognition history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all recognition history logs?')) return;
    try {
      await api.clearHistory();
      await fetchLogs();
    } catch (err) {
      alert('Error clearing history: ' + err.message);
    }
  };

  const filteredLogs = logs.filter((l) => 
    l.recognized_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Recognition History Logs</h2>
          <p className="text-sm text-slate-500 mt-1">Audit trail of all face recognition events with confidence scores</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="all">All Events</option>
            <option value="recognized">Recognized Only</option>
            <option value="unknown">Unknown Only</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue w-48 bg-white"
            />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving audit history..." />
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Log ID</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Cosine Similarity</th>
                  <th className="px-6 py-3.5">Latency</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isKnown = log.recognition_status === 'recognized';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{log.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{log.recognized_name}</td>
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
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-sm">
            No recognition history matches found.
          </div>
        )}
      </div>
    </div>
  );
}
