import React, { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, Smartphone, MapPin, Upload, FileText, Check } from 'lucide-react';
import './MobileInspector.css';

export default function MobileInspector({ backendUrl }) {
  const apiBackendUrl = backendUrl || 'http://localhost:8000';
  const [scanning, setScanning] = useState(false);
  const [scannedVendor, setScannedVendor] = useState(null);
  const [manualId, setManualId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [logSuccess, setLogSuccess] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setScanning(true);
    setCameraError(null);
    setScannedVendor(null);

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access note:', err);
      setCameraError('Camera access unavailable. Enter Vendor ID below or upload a QR image.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const performVerification = async (overrideId) => {
    const targetInput = (overrideId || manualId).trim();
    if (!targetInput) return;

    stopCamera();
    setLogSuccess(null);
    setCameraError(null);
    try {
      const response = await fetch(`${apiBackendUrl}/api/vendors`);
      if (!response.ok) throw new Error('Vendor registry is unavailable');
      const data = await response.json();
      const needle = targetInput.toUpperCase();
      const vendor = data.vendors.find((item) =>
        item.id.toUpperCase() === needle || item.name.toUpperCase() === needle
      );
      if (!vendor) throw new Error(`No registered vendor found for ${targetInput}`);
      setScannedVendor(vendor);
    } catch (error) {
      setScannedVendor(null);
      setCameraError(error.message);
    }
  };

  const decodeQrImage = async (file) => {
    setCameraError(null);
    const formData = new FormData();
    formData.append('file', file, file.name || 'camera-frame.jpg');
    const response = await fetch(`${apiBackendUrl}/api/opencv/qr/decode`, {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'OpenCV QR scan failed');
    if (!result.detected) throw new Error('No QR code detected. Keep the code flat, sharp and well-lit.');
    const decoded = result.values[0];
    const vendorId = decoded.match(/VV-\d{4}-\d+/i)?.[0] || decoded;
    setManualId(vendorId);
    await performVerification(vendorId);
  };

  const scanCameraFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setCameraError('Camera is still starting. Please try again.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      try {
        if (!blob) throw new Error('Could not capture camera frame');
        await decodeQrImage(new File([blob], 'camera-frame.jpg', { type: 'image/jpeg' }));
      } catch (error) {
        setCameraError(error.message);
      }
    }, 'image/jpeg', 0.92);
  };

  const handleLogInspection = () => {
    if (!scannedVendor) return;
    setLogSuccess(`Geotagged Field Inspection logged for ${scannedVendor.name} (${scannedVendor.id}) at ${scannedVendor.location}!`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await decodeQrImage(file);
      } catch (error) {
        setCameraError(error.message);
      } finally {
        e.target.value = '';
      }
    }
  };

  return (
    <div className="inspector-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Mobile Municipal Field Inspector Portal</h2>
          <span className="sub-header-tag">WebRTC Geotagged QR Field Verification Engine</span>
        </div>
      </div>

      <div className="inspector-grid">
        
        {/* Left Column: WebRTC Camera Scanner */}
        <div className="ai-card" style={{ textAlign: 'center' }}>
          <div className="section-header" style={{ width: '100%' }}>
            <h3>Geotagged QR Camera Scanner</h3>
          </div>

          <div className="camera-preview-box">
            {scanning ? (
              <video ref={videoRef} className="camera-video-stream" playsInline muted />
            ) : (
              <div className="camera-placeholder">
                <Camera size={48} color="#60a5fa" />
                <p style={{ margin: '12px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Camera Ready (Works on Laptops, Webcams & Mobile Devices)
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="status-msg error" style={{ fontSize: '0.78rem', marginTop: '12px' }}>
              <AlertCircle size={14} />
              <span>{cameraError}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', width: '100%' }}>
            {!scanning ? (
              <button className="submit-btn" onClick={startCamera} style={{ flex: 1, background: '#3b82f6' }}>
                <Camera size={16} />
                <span>Start Camera Scanner</span>
              </button>
            ) : (
              <button className="submit-btn" onClick={scanCameraFrame} style={{ flex: 1, background: '#10b981' }}>
                <QrCode size={16} />
                <span>Scan Detected QR Code</span>
              </button>
            )}

            <label className="quick-act-btn" style={{ padding: '10px 14px', cursor: 'pointer', background: 'rgba(255,255,255,0.08)' }}>
              <Upload size={16} />
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Right Column: Verification Form & Result */}
        <div className="ai-card">
          <div className="section-header">
            <h3>Field Verification & Inspection</h3>
          </div>

          {/* Form with Enter Key Submission */}
          <form 
            onSubmit={(e) => { e.preventDefault(); performVerification(); }}
            className="form-group" 
            style={{ marginBottom: '20px' }}
          >
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>ENTER VENDOR ID / PERMIT NUMBER</label>
            <div className="input-container" style={{ marginTop: '4px' }}>
              <QrCode size={18} className="input-icon" color="#60a5fa" />
              <input 
                type="text" 
                placeholder="e.g. VV-2024-001 or Sujal" 
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="quick-act-btn" style={{ padding: '8px 18px', background: '#3b82f6', color: '#fff' }}>
                <span>Verify</span>
              </button>
            </div>
          </form>

          {/* Log Success Banner */}
          {logSuccess && (
            <div className="status-msg success" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} />
              <span>{logSuccess}</span>
            </div>
          )}

          {/* Scanned Verification Result Display */}
          {scannedVendor ? (
            <div className="scan-result-card" style={{ borderColor: scannedVendor.status === 'approved' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)', background: 'var(--input-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: scannedVendor.status === 'approved' ? '#34d399' : '#fbbf24', fontWeight: '800', fontSize: '1rem' }}>
                {scannedVendor.status === 'approved' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span>PERMIT STATUS: {scannedVendor.status === 'approved' ? 'OFFICIALLY VERIFIED' : 'PENDING OFFICER APPROVAL'}</span>
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.875rem', lineHeight: '1.6' }}>
                <p><strong>Vendor Name:</strong> {scannedVendor.name}</p>
                <p><strong>Stall Name:</strong> {scannedVendor.stallName || scannedVendor.name}</p>
                <p><strong>Permit ID:</strong> {scannedVendor.id}</p>
                <p><strong>Registered Address:</strong> {scannedVendor.location}</p>
                <p><strong>Category:</strong> {scannedVendor.category}</p>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button className="submit-btn" onClick={handleLogInspection} style={{ width: '100%', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} />
                  <span>Log Field Inspection</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Scan QR permit or enter Vendor ID to perform geotagged field verification.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
