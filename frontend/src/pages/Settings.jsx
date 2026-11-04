import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  Cpu, 
  Database, 
  ShieldCheck, 
  CheckCircle2,
  Info
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function Settings() {
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSettings().then((res) => {
      setSettingsData(res.data);
      setLoading(false);
    }).catch((err) => {
      console.error('Error fetching settings:', err);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    }
  };

  if (loading || !settingsData) {
    return <LoadingSpinner text="Loading system configuration..." />;
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">Calibrate recognition sensitivity, sampling rates, and privacy policies</p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Settings saved successfully! Runtime parameters updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ML Inference Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-accent-blue" />
            <h3 className="font-bold text-slate-800">Machine Learning Sensitivity</h3>
          </div>

          {/* Similarity Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
              <label>Default Cosine Similarity Threshold</label>
              <span className="font-mono text-accent-blue font-bold text-base">
                {settingsData.similarity_threshold}
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.55"
              step="0.005"
              value={settingsData.similarity_threshold}
              onChange={(e) => setSettingsData({ ...settingsData, similarity_threshold: parseFloat(e.target.value) })}
              className="w-full accent-accent-blue cursor-pointer"
            />
            <p className="text-xs text-slate-400">
              Threshold benchmark for OpenCV SFace: 0.363. Increasing reduces False Acceptances; decreasing reduces False Rejections.
            </p>
          </div>

          {/* Detection Confidence */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
              <label>Face Detector Confidence Threshold (YuNet)</label>
              <span className="font-mono text-slate-800 font-bold text-base">
                {settingsData.detection_confidence}
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={settingsData.detection_confidence}
              onChange={(e) => setSettingsData({ ...settingsData, detection_confidence: parseFloat(e.target.value) })}
              className="w-full accent-navy-900 cursor-pointer"
            />
            <p className="text-xs text-slate-400">
              Filters out noisy candidate proposals before landmark alignment.
            </p>
          </div>
        </div>

        {/* Laptop Performance Tuning */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-800">Performance & Privacy Controls</h3>
          </div>

          {/* Save Unknown Faces Toggle */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settingsData.save_unknown_faces}
              onChange={(e) => setSettingsData({ ...settingsData, save_unknown_faces: e.target.checked })}
              className="w-4 h-4 rounded text-accent-blue mt-0.5 accent-accent-blue"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800">Retain Anonymous Unknown Scans</span>
              <p className="text-xs text-slate-400 mt-0.5">
                When disabled, unknown faces are evaluated in RAM without saving any biometric or image data to disk.
              </p>
            </div>
          </label>

          {/* Retention period */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700">Audit Log Retention (Days)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={settingsData.retention_days}
              onChange={(e) => setSettingsData({ ...settingsData, retention_days: parseInt(e.target.value) })}
              className="w-32 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-navy-900 text-white font-semibold text-sm rounded-xl hover:bg-navy-800 shadow-md flex items-center space-x-2"
          >
            <Save className="w-4 h-4 text-accent-cyan" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
