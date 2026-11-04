import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, 
  Camera, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  Info,
  Sparkles
} from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';
import api from '../services/api';

export default function RegisterFace({ setActiveTab }) {
  const {
    videoRef,
    isActive,
    hasPermission,
    startCamera,
    stopCamera,
    captureFrame,
    error: cameraError
  } = useWebcam();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [samples, setSamples] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Auto-start camera on Step 2
  useEffect(() => {
    if (step === 2 && !isActive) {
      startCamera();
    }
  }, [step, isActive, startCamera]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCaptureSample = () => {
    const frame = captureFrame();
    if (!frame) {
      alert('Could not capture frame. Ensure camera is active.');
      return;
    }
    if (samples.length >= 10) {
      alert('Maximum of 10 samples reached.');
      return;
    }
    setSamples([...samples, frame]);
  };

  const handleRemoveSample = (index) => {
    setSamples(samples.filter((_, i) => i !== index));
  };

  const handleSubmitRegistration = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        identifier: identifier.trim() || null,
        notes: notes.trim() || null,
        consent_given: consentGiven,
        consent_version: 'v1.0-explicit-opt-in',
        face_samples: samples
      };

      const res = await api.registerUser(payload);
      setSuccessResult(res.data);
      setStep(4); // Success step
      stopCamera();
    } catch (err) {
      console.error('Registration failed:', err);
      const detail = err.response?.data?.detail || err.message || 'Registration failed';
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Biometric Face Registration</h2>
        <p className="text-sm text-slate-500 mt-1">Enroll a consenting participant into the local face recognition template database</p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between relative select-none">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-0"></div>
        {[
          { num: 1, title: 'Consent & Info' },
          { num: 2, title: 'Sample Capture' },
          { num: 3, title: 'Review & Enroll' }
        ].map((s) => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="flex flex-col items-center bg-slate-50 px-4 z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                isDone 
                  ? 'bg-emerald-500 text-white' 
                  : isCurrent 
                  ? 'bg-navy-900 text-accent-cyan ring-4 ring-navy-900/10' 
                  : 'bg-white border-2 border-slate-300 text-slate-400'
              }`}>
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
              </div>
              <span className={`text-xs mt-2 font-semibold ${isCurrent ? 'text-navy-900' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Enrollment Error</h4>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* STEP 1: Details & Explicit Consent */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-lg text-slate-800">1. Participant Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Syed Rizvi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                Student / Employee ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. CS-2026-081"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">
              Notes / Department (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Year ML Lab"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          {/* Consent Agreement Box */}
          <div className="p-5 rounded-2xl bg-navy-900 text-white space-y-4">
            <div className="flex items-center space-x-2 text-accent-cyan font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Explicit Biometric Consent Agreement</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              By enrolling, you grant consent for this system to compute mathematical facial embeddings (128-dimensional vectors) from your camera feed. These numerical vectors are stored strictly in a local SQLite database on this laptop and are never uploaded to any remote server or cloud service. You may permanently delete your data at any time from the Registered Users dashboard.
            </p>
            <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-navy-800">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-4 h-4 rounded text-accent-cyan mt-0.5 accent-accent-cyan cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-200">
                I explicitly understand and consent to the extraction and local storage of my facial embeddings.
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (!name.trim()) {
                  alert('Please enter a participant name.');
                  return;
                }
                if (!consentGiven) {
                  alert('Biometric consent is mandatory before taking face samples.');
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-2.5 bg-navy-900 text-white font-semibold text-sm rounded-xl hover:bg-navy-800 shadow-md transition-all flex items-center space-x-2"
            >
              <span>Proceed to Camera Capture</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Guided Camera Sample Capture */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-800">2. Capture Facial Samples</h3>
              <p className="text-xs text-slate-500">Capture 3 to 10 clear photos (look straight, slight smile, turn slightly)</p>
            </div>
            <div className="px-3.5 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
              Samples: <span className="text-accent-blue">{samples.length}</span> / 10
            </div>
          </div>

          {/* Camera View */}
          <div className="relative rounded-2xl overflow-hidden bg-navy-900 aspect-video flex items-center justify-center max-w-lg mx-auto shadow-inner border border-navy-800">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

            {/* Oval Alignment Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-2 border-dashed border-accent-cyan/60 rounded-[100px]"></div>
            </div>
          </div>

          {/* Capture Trigger */}
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleCaptureSample}
              disabled={samples.length >= 10}
              className="px-8 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-navy-900 font-extrabold text-sm rounded-full shadow-lg shadow-accent-cyan/20 hover:opacity-95 transition-all flex items-center space-x-2"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Capture Sample ({samples.length + 1})</span>
            </button>
            <p className="text-xs text-slate-400">Position face inside oval frame with good illumination.</p>
          </div>

          {/* Thumbnail Strip */}
          {samples.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Captured Thumbnails</h4>
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {samples.map((img, i) => (
                  <div key={i} className="relative group shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200">
                    <img src={img} alt={`Sample ${i+1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveSample(i)}
                      className="absolute inset-0 bg-rose-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              &larr; Back
            </button>
            <button
              onClick={() => {
                if (samples.length < 3) {
                  alert('Please capture at least 3 distinct samples for reliable biometric matching.');
                  return;
                }
                setStep(3);
              }}
              disabled={samples.length < 3}
              className={`px-6 py-2.5 font-semibold text-sm rounded-xl shadow-md transition-all ${
                samples.length >= 3
                  ? 'bg-navy-900 text-white hover:bg-navy-800'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Review Enrollment &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-lg text-slate-800">3. Review and Complete Enrollment</h3>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Name</span>
                <p className="font-bold text-slate-800 text-base">{name}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Identifier</span>
                <p className="font-semibold text-slate-700">{identifier || 'None assigned'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Sample Count</span>
                <p className="font-semibold text-accent-blue">{samples.length} valid images</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Consent Status</span>
                <p className="font-semibold text-emerald-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Opt-in Verified</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              &larr; Retake Samples
            </button>
            <button
              onClick={handleSubmitRegistration}
              disabled={isSubmitting}
              className="px-8 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Generating Facial Embeddings...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Finalize & Save Registration</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success Modal */}
      {step === 4 && successResult && (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-lg text-center space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Registration Successful!</h3>
            <p className="text-xs text-slate-500 mt-1">
              User <strong>{successResult.name}</strong> has been enrolled with <strong>{successResult.sample_count}</strong> high-dimensional facial embeddings.
            </p>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <button
              onClick={() => setActiveTab('live')}
              className="w-full py-3 bg-navy-900 text-white font-semibold rounded-xl text-sm hover:bg-navy-800 shadow-md"
            >
              Test in Live Recognition
            </button>
            <button
              onClick={() => {
                setName('');
                setIdentifier('');
                setNotes('');
                setConsentGiven(false);
                setSamples([]);
                setSuccessResult(null);
                setStep(1);
              }}
              className="w-full py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Register Another Face
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
