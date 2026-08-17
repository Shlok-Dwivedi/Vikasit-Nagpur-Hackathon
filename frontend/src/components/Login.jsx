import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Building2 
} from 'lucide-react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState('authority'); // 'authority' or 'citizen'
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // If Supabase credentials are not configured yet, use secure demo auth
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setLoading(false);
        const demoUser = {
          email: email || (role === 'authority' ? 'officer@nagpur.gov.in' : 'citizen@example.com'),
          role: role,
          name: fullName || (role === 'citizen' ? 'Civic Vendor / Citizen' : 'Officer Deshmukh'),
          department: role === 'authority' ? (department || 'Nagpur Municipal Corp') : 'General Citizen Access',
          token: 'demo-session-token-' + Date.now()
        };
        setMessage({ type: 'success', text: `Authentication successful as ${role.toUpperCase()}!` });
        if (onLoginSuccess) {
          onLoginSuccess(demoUser);
        }
      }, 700);
      return;
    }

    // Real Supabase Auth Execution
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              department: role === 'authority' ? department : null
            }
          }
        });

        if (error) throw error;

        setMessage({ 
          type: 'success', 
          text: 'Account created! Please check your email for activation link.' 
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        const authUser = {
          email: data.user.email,
          role: data.user.user_metadata?.role || role,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          department: data.user.user_metadata?.department || (role === 'authority' ? 'Municipal Corp' : null),
          token: data.session?.access_token
        };

        setMessage({ type: 'success', text: 'Welcome back! Authentication successful.' });
        if (onLoginSuccess) {
          onLoginSuccess(authUser);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'An authentication error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = (demoRole) => {
    setRole(demoRole);
    const demoUser = {
      email: demoRole === 'authority' ? 'officer.deshmukh@nagpur.gov.in' : 'ramesh.fruits@gmail.com',
      role: demoRole,
      name: demoRole === 'authority' ? 'Officer Deshmukh' : 'Ramesh Kumar (Vendor)',
      department: demoRole === 'authority' ? 'Nagpur Municipal Corp - Zoning Division' : 'Citizen Portal',
      token: 'demo-token-' + Date.now()
    };
    if (onLoginSuccess) {
      onLoginSuccess(demoUser);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        
        {/* Brand Header */}
        <div className="auth-header">
          <div className="brand-badge">
            <Building2 size={14} />
            <span>Viksit Vyapari Civic Portal</span>
          </div>
          <h1>{mode === 'login' ? 'Sign In to Portal' : 'Create Account'}</h1>
          <p>Role-based access for Municipal Officers & Registered Citizens</p>
        </div>

        {/* Role Selector: Citizen vs Authority */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'citizen' ? 'active citizen' : ''}`}
            onClick={() => setRole('citizen')}
          >
            <User size={16} />
            <span>Citizen / Vendor</span>
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'authority' ? 'active authority' : ''}`}
            onClick={() => setRole('authority')}
          >
            <ShieldCheck size={16} />
            <span>Authority / Officer</span>
          </button>
        </div>

        {/* Tab Switcher: Login / Signup */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setMessage(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setMessage(null); }}
          >
            Register
          </button>
        </div>

        {/* Status Alert Message */}
        {message && (
          <div className={`status-msg ${message.type}`}>
            {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Auth Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-container">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && role === 'authority' && (
            <div className="form-group">
              <label>Department / Authority ID</label>
              <div className="input-container">
                <ShieldCheck size={18} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanitation / Public Works"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-container">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                placeholder={role === 'citizen' ? 'vendor@gmail.com' : 'officer@nagpur.gov.in'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? `Sign In as ${role === 'citizen' ? 'Citizen' : 'Officer'}` : 'Register Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        {/* Quick Demo Access Buttons */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginBottom: '10px', fontWeight: '600' }}>
            ⚡ Instant 1-Click Demo Login:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              type="button" 
              className="quick-act-btn" 
              onClick={() => handleQuickDemoAccess('authority')}
              style={{ fontSize: '0.78rem' }}
            >
              <ShieldCheck size={14} color="#34d399" />
              <span>Officer Access</span>
            </button>
            <button 
              type="button" 
              className="quick-act-btn" 
              onClick={() => handleQuickDemoAccess('citizen')}
              style={{ fontSize: '0.78rem' }}
            >
              <User size={14} color="#60a5fa" />
              <span>Citizen Access</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
