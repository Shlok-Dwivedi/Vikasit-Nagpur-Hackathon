import React, { useState } from 'react';
import { AlertTriangle, MapPin, ShieldCheck } from 'lucide-react';
import './EnforcementIntel.css';

export default function EnforcementIntel({ backendUrl = '' }) {
  const [location, setLocation] = useState('');
  const [violations, setViolations] = useState('');
  const [footfall, setFootfall] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async (event) => {
    event.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch(`${backendUrl}/api/pipelines/enforcement-to-zoning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('vv_officer_token') || ''}` },
        body: JSON.stringify({ location: location.trim(), violations_count: Number(violations), cv_count: Number(footfall) })
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.detail || data.error || 'Analysis failed');
      setResult(data);
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="enforcement-page">
      <div className="section-header"><div><h2>Enforcement Hotspot Review</h2><span className="sub-header-tag">Officer-only recurring violation assessment</span></div></div>
      <div className="enforcement-layout">
        <form className="enforcement-form" onSubmit={analyze}>
          <div className="enforcement-icon"><AlertTriangle size={24} /></div>
          <h3>Analyze a hotspot</h3><p>Enter an observed location and its recorded violation count.</p>
          <label>Hotspot location<input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter recorded location" /></label>
          <label>Recorded violations<input required min="0" type="number" value={violations} onChange={(event) => setViolations(event.target.value)} placeholder="0" /></label>
          <label>Observed pedestrian count<input required min="0" type="number" value={footfall} onChange={(event) => setFootfall(event.target.value)} placeholder="From CCTV/OpenCV observation" /></label>
          <button disabled={loading || !location.trim() || violations === '' || footfall === ''}>{loading ? 'Analyzing…' : 'Run Enforcement Analysis'}</button>
          {error && <div className="enforcement-error">{error}</div>}
        </form>
        <section className="enforcement-result">
          {!result ? <div className="enforcement-empty"><MapPin size={28} /><h3>No hotspot analyzed</h3><p>Pipeline results will appear here after authorized analysis.</p></div> : <>
            <span className="result-kicker"><ShieldCheck size={15} /> VERIFIED PIPELINE RESULT</span>
            <h3>{result.data.enforcement_decision}</h3>
            <p>{result.recommendation}</p>
            <dl><div><dt>Violations logged</dt><dd>{result.data.violations_logged}</dd></div><div><dt>Annual enforcement cost</dt><dd>{result.data.annual_enforcement_cost}</dd></div><div><dt>Stages completed</dt><dd>{result.executed_stages.length}</dd></div></dl>
          </>}
        </section>
      </div>
    </div>
  );
}
