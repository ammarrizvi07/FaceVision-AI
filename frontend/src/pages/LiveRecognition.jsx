import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  Play, 
  Square, 
  Sliders, 
  Activity, 
  ShieldAlert, 
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';
import api from '../services/api';

export default function LiveRecognition() {
  const {
    videoRef,
    isActive,
    hasPermission,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame,
  } = useWebcam();

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [faces, setFaces] = useState([]);
  const [fps, setFps] = useState(0);
  const [serverLatency, setServerLatency] = useState(0);
  const [threshold, setThreshold] = useState(0.363);
  const [frameInterval, setFrameInterval] = useState(150); // ms between frames
  const canvasRef = useRef(null);
  const recognizingRef = useRef(false);
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(null);

  // Maintain ref synchronization
  useEffect(() => {
    recognizingRef.current = isRecognizing;
  }, [isRecognizing]);

  // Load default threshold from settings
  useEffect(() => {
    api.getSettings().then((res) => {
      if (res.data?.similarity_threshold) {
        setThreshold(res.data.similarity_threshold);
      }
    }).catch((err) => console.warn('Could not load settings:', err));
  }, []);

  // Calculate local FPS
  useEffect(() => {
    fpsTimerRef.current = setInterval(() => {
      const now = performance.now();
      const delta = (now - lastFrameTimeRef.current) / 1000;
      if (delta > 0) {
        setFps(Math.round(frameCountRef.current / delta));
      }
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }, 1000);

    return () => clearInterval(fpsTimerRef.current);
  }, []);

  // Frame Recognition Loop
  useEffect(() => {
    let timeoutId = null;

    const runRecognitionLoop = async () => {
      if (recognizingRef.current && isActive) {
        const frameData = captureFrame();
        if (frameData) {
          try {
            const startReq = performance.now();
            const res = await api.recognizeFrame(frameData, threshold);
            const latency = Math.round(performance.now() - startReq);
            setServerLatency(res.data.processing_time_ms || latency);
            setFaces(res.data.faces || []);
            frameCountRef.current += 1;
          } catch (err) {
            console.error('Frame recognition error:', err);
          }
        }
      }

      if (recognizingRef.current) {
        timeoutId = setTimeout(runRecognitionLoop, frameInterval);
      }
    };

    if (isRecognizing && isActive) {
      runRecognitionLoop();
    } else {
      setFaces([]);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRecognizing, isActive, captureFrame, threshold, frameInterval]);

  // Render bounding boxes & landmarks on overlay canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    const width = video.clientWidth;
    const height = video.clientHeight;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (!faces || faces.length === 0 || !video.videoWidth || !video.videoHeight) return;

    // Scale factors between raw video pixels and displayed container
    const scaleX = width / video.videoWidth;
    const scaleY = height / video.videoHeight;

    faces.forEach((face) => {
      const bbox = face.bounding_box;
      const x = bbox.x * scaleX;
      const y = bbox.y * scaleY;
      const w = bbox.width * scaleX;
      const h = bbox.height * scaleY;

      const isKnown = face.status === 'recognized';
      const boxColor = isKnown ? '#00E5FF' : '#F59E0B';
      const bgColor = isKnown ? 'rgba(0, 229, 255, 0.9)' : 'rgba(245, 158, 11, 0.9)';

      // Draw bounding box corners
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      // Render Facial Landmarks (eyes, nose, mouth)
      if (face.landmarks) {
        ctx.fillStyle = '#FFFFFF';
        face.landmarks.forEach(([lx, ly]) => {
          ctx.beginPath();
          ctx.arc(lx * scaleX, ly * scaleY, 3, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      // Draw Label Header
      const labelText = isKnown 
        ? `${face.name} (${(face.similarity * 100).toFixed(1)}%)`
        : `Unknown (${(face.similarity * 100).toFixed(1)}%)`;

      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      const textWidth = ctx.measureText(labelText).width;
      const labelHeight = 24;

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, Math.max(0, y - labelHeight), textWidth + 16, labelHeight);

      ctx.fillStyle = isKnown ? '#0B132B' : '#FFFFFF';
      ctx.fillText(labelText, x + 8, Math.max(16, y - 7));
    });
  }, [faces, videoRef]);

  const toggleRecognition = () => {
    if (!isActive) {
      alert('Please start the camera before enabling live recognition.');
      return;
    }
    setIsRecognizing(!isRecognizing);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Live Face Recognition</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time deep learning inference using webcam video stream</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {!isActive ? (
            <button
              onClick={() => startCamera()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-md transition-all"
            >
              <Camera className="w-4 h-4 text-accent-cyan" />
              <span>Start Camera</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsRecognizing(false);
                stopCamera();
              }}
              className="flex items-center space-x-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 shadow-md transition-all"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}

          <button
            onClick={toggleRecognition}
            disabled={!isActive}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all ${
              !isActive
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isRecognizing
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-accent-blue text-navy-900 hover:bg-cyan-300'
            }`}
          >
            {isRecognizing ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-navy-900" />}
            <span>{isRecognizing ? 'Stop Recognition' : 'Start Recognition'}</span>
          </button>
        </div>
      </div>

      {/* Camera Permission Alert */}
      {hasPermission === false && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Camera Access Denied</h4>
            <p className="text-xs text-rose-700 mt-1">
              Please click the camera lock icon in your browser URL bar, grant permission to access the webcam, and refresh or click Start Camera.
            </p>
          </div>
        </div>
      )}

      {/* Main Viewport & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Viewport */}
        <div className="lg:col-span-3 bg-navy-900 rounded-3xl overflow-hidden shadow-xl border border-navy-800 relative flex flex-col items-center justify-center min-h-[480px]">
          {/* Video element */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-contain ${!isActive ? 'hidden' : 'block'}`}
          />

          {/* Canvas Overlay for Bounding Boxes */}
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full h-full pointer-events-none ${!isActive ? 'hidden' : 'block'}`}
          />

          {/* Idle Camera Placeholder */}
          {!isActive && (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-navy-800 flex items-center justify-center text-slate-500">
                <Camera className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Camera is Off</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Click the "Start Camera" button above to activate your webcam. Ensure your browser is allowed camera permissions.
                </p>
              </div>
            </div>
          )}

          {/* HUD Overlay when active */}
          {isActive && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none select-none">
              <div className="flex items-center space-x-2 bg-navy-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-navy-700/60 text-xs font-semibold text-white">
                <span className={`w-2.5 h-2.5 rounded-full ${isRecognizing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                <span>{isRecognizing ? 'Recognition Live' : 'Camera Active (Standby)'}</span>
              </div>

              <div className="flex items-center space-x-3 bg-navy-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-navy-700/60 text-xs text-slate-300 font-mono">
                <span>FPS: <strong className="text-accent-cyan">{fps}</strong></span>
                <span>&bull;</span>
                <span>Latency: <strong className="text-emerald-400">{serverLatency}ms</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Live Tuning Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <Sliders className="w-5 h-5 text-accent-blue" />
            <h3 className="font-bold text-slate-800">Inference Controls</h3>
          </div>

          {/* Device Selector */}
          {devices.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Camera Source</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  if (isActive) startCamera(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cosine Threshold Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>Similarity Threshold</span>
              <span className="font-mono text-accent-blue font-bold">{threshold}</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.55"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-accent-blue cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-tight">
              Higher value = stricter matching. SFace default benchmark is 0.363.
            </p>
          </div>

          {/* Frame Interval */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>Sampling Frequency</span>
              <span className="font-mono text-slate-600 font-bold">{Math.round(1000 / frameInterval)} FPS</span>
            </div>
            <input
              type="range"
              min="80"
              max="400"
              step="20"
              value={frameInterval}
              onChange={(e) => setFrameInterval(parseInt(e.target.value))}
              className="w-full accent-navy-900 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-tight">
              Throttling saves laptop CPU usage without sacrificing responsive detection.
            </p>
          </div>

          {/* Current Detected Subjects */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Frame Subjects</h4>
            {faces.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {faces.map((f, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      f.status === 'recognized'
                        ? 'bg-cyan-50/70 border-cyan-200 text-cyan-900'
                        : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${f.status === 'recognized' ? 'bg-cyan-500' : 'bg-amber-500'}`} />
                      <span className="font-bold">{f.name}</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {(f.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No faces detected in current frame.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
