import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Calendar, 
  Fingerprint, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function RegisteredUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (user, e) => {
    if (e) e.stopPropagation();
    
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete ' + user.name + '?\n\nThis will permanently delete all ' + user.sample_count + ' facial embeddings from the database. This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setDeleteStatus('Deleting ' + user.name + '...');
      await api.deleteUser(user.id);
      setDeleteStatus('User ' + user.name + ' and all facial embeddings successfully deleted!');
      setTimeout(() => setDeleteStatus(''), 4000);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
      setDeleteStatus('');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.identifier && u.identifier.toLowerCase().includes(q));
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Registered Users Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage enrolled participants and biometric template records</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue w-64 bg-white"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm"
            title="Refresh users list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Feedback Banner */}
      {deleteStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-sm font-semibold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{deleteStatus}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading enrolled users..." />
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-navy-900 to-navy-700 text-accent-cyan flex items-center justify-center font-bold text-lg shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{user.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {user.identifier ? 'ID: ' + user.identifier : 'No ID assigned'}
                    </p>
                  </div>
                </div>

                {/* Prominent Delete Button */}
                <button
                  onClick={(e) => handleDeleteUser(user, e)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                  title="Delete user and wipe biometric embeddings"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Embeddings</span>
                  <span className="font-semibold text-slate-700">{user.sample_count} templates</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Enrolled Date</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Consent: {user.consent_version}</span>
                </span>
                <button
                  onClick={() => setSelectedUser(user)}
                  className="text-accent-blue font-semibold hover:underline"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
          <Fingerprint className="w-12 h-12 mx-auto text-slate-300" />
          <h4 className="font-bold text-slate-700">No Registered Users Found</h4>
          <p className="text-xs">
            {searchQuery ? 'No users matched your search.' : 'You have not enrolled any faces yet. Go to "Register Face" to register one.'}
          </p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Participant Details</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Name</span>
                <span className="font-bold text-slate-800 text-sm">{selectedUser.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Identifier / Student ID</span>
                <span className="font-semibold text-slate-700">{selectedUser.identifier || 'None'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Consent Timestamp</span>
                <span className="font-semibold text-slate-700">{new Date(selectedUser.consent_timestamp).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Biometric Embeddings Saved</span>
                <span className="font-semibold text-slate-700">{selectedUser.sample_count} vectors (128-d SFace)</span>
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={(e) => {
                  const target = selectedUser;
                  setSelectedUser(null);
                  handleDeleteUser(target, e);
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
              >
                Delete User
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
