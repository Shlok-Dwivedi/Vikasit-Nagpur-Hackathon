import React, { useState } from 'react';
import { getBackendUrl, supabase, isSupabaseConfigured, supabaseAnonKey } from '../lib/supabase';
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
  Building2,
  Key,
  Award,
  Store,
  MapPin,
  Phone,
  Tag
} from 'lucide-react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState('citizen'); // Default: 'citizen' (Vendor / Citizen)
  const [mode, setMode] = useState('register'); // Default: 'register' for Vendors
  
  // Basic Auth Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Vendor Registration Fields
  const [stallName, setStallName] = useState('');
  const [category, setCategory] = useState('Perishable Produce');
  const [customAddress, setCustomAddress] = useState(''); // Custom Address entered by Vendor
  const [phone, setPhone] = useState('');

  // Officer Fields
  const [department, setDepartment] = useState('');
  const [badgeKey, setBadgeKey] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const apiBackendUrl = getBackendUrl();

  const signInWithGoogle = async () => {
    setMessage(null);
    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase OAuth is not configured.' });
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            apikey: supabaseAnonKey
          },
          redirectTo: window.location.origin
        }
      });
      if (error) {
        setMessage({ type: 'error', text: 'Google OAuth error: ' + error.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Google OAuth error: ' + err.message });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const cleanEmail = email.trim();

    // SPECIAL OFFICER SECURITY AUTHENTICATION CHECK
    if (role === 'authority') {
      const cleanKey = badgeKey.trim().toUpperCase();
      if (!cleanKey) {
        setMessage({ type: 'error', text: 'Municipal Officer Security Passkey is required.' });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiBackendUrl}/api/auth/officer-clearance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ badge_key: cleanKey, officer_id: cleanEmail })
        });

        const clearance = await res.json();
        if (!res.ok) {
          setMessage({ type: 'error', text: 'Invalid Officer Passkey! High-security clearance denied.' });
          setLoading(false);
          return;
        }
        sessionStorage.setItem('vv_officer_token', clearance.officer_token);
      } catch (err) {
        setMessage({ type: 'error', text: 'Officer authentication service is unavailable.' });
        setLoading(false);
        return;
      }
    }

    let vendorProfileData = {
      id: null,
      name: fullName || cleanEmail.split('@')[0],
      stallName: stallName || `${fullName || 'Vendor'}'s Business`,
      category: category,
      location: customAddress,
      phone,
      status: 'approved', // INSTANT APPROVAL FOR VENDORS
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      feePaid: true,
      svanidhiTier: 'Tier 1 (₹10,000)'
    };

    // Register Vendor dynamically via Backend REST API
    if (role === 'citizen' && mode === 'register') {
      try {
        const vendorResponse = await fetch(`${apiBackendUrl}/api/vendors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: vendorProfileData.name,
            stallName: vendorProfileData.stallName,
            category: vendorProfileData.category,
            location: vendorProfileData.location,
            phone: vendorProfileData.phone
          })
        });
        const vendorResult = await vendorResponse.json();
        if (!vendorResponse.ok) throw new Error(vendorResult.detail || 'Vendor registration failed');
        vendorProfileData = vendorResult.vendor;
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
        setLoading(false);
        return;
      }
    }

    // Process Supabase Auth or Fallback
    if (isSupabaseConfigured && supabase) {
      try {
        if (mode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: {
                full_name: vendorProfileData.name,
                role: role,
                department: role === 'authority' ? (department || 'Nagpur Municipal Corp') : 'Citizen Vendor',
                vendor_data: vendorProfileData
              }
            }
          });

          if (error) throw error;
          const registeredUser = {
            email: cleanEmail,
            role: role,
            name: vendorProfileData.name,
            department: role === 'authority' ? (department || 'Municipal Zoning') : 'Citizen Vendor',
            vendorData: vendorProfileData,
            token: data?.session?.access_token
          };

          setMessage({ type: 'success', text: role === 'authority' ? 'Officer Security Clearance Granted!' : 'Vendor Application Submitted & Permit Granted!' });
          setTimeout(() => onLoginSuccess && onLoginSuccess(registeredUser), 600);
          return;

        } else {
          // Sign In
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (error) throw error;
          const loggedUser = {
            email: cleanEmail,
            role: role,
            name: data.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
            department: data.user?.user_metadata?.department || '',
            vendorData: vendorProfileData,
            token: data?.session?.access_token
          };

          setMessage({ type: 'success', text: 'Welcome back! Sign in successful.' });
          setTimeout(() => onLoginSuccess && onLoginSuccess(loggedUser), 600);
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Authentication failed.' });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setMessage({ type: 'error', text: 'Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' });
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
          <h1>{mode === 'register' ? 'Street Vendor Permit Application' : 'Sign In to Portal'}</h1>
          <p>{role === 'citizen' ? 'Submit your vending application for Instant Permit & Certificate Issuance' : 'Municipal Officer Portal Access'}</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'citizen' ? 'active citizen' : ''}`}
            onClick={() => { setRole('citizen'); setMessage(null); }}
          >
            <User size={16} />
            <span>Street Vendor / Merchant</span>
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'authority' ? 'active authority' : ''}`}
            onClick={() => { setRole('authority'); setMessage(null); }}
          >
            <ShieldCheck size={16} />
            <span>Municipal Officer</span>
          </button>
        </div>

        {/* Officer Security Clearance Alert */}
        {role === 'authority' && (
          <div className="status-msg info" style={{ fontSize: '0.75rem', background: 'rgba(5, 150, 105, 0.15)', borderColor: 'rgba(5, 150, 105, 0.3)', color: '#34d399' }}>
            <Award size={14} />
            <span>Municipal Officer High-Security Clearance Portal Active</span>
          </div>
        )}

        {/* Tab Switcher: Register / Login */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setMessage(null); }}
          >
            Vendor Application
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setMessage(null); }}
          >
            Sign In
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
          
          <div className="form-group">
            <label>Vendor Full Name</label>
            <div className="input-container">
              <User size={18} className="input-icon" />
              <input
                type="text"
                required
                placeholder="e.g. Sujal Tembhare"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* VENDOR SPECIFIC REGISTRATION FIELDS */}
          {role === 'citizen' && mode === 'register' && (
            <>
              <div className="form-group">
                <label>Stall / Business Trade Name</label>
                <div className="input-container">
                  <Store size={18} className="input-icon" color="#3b82f6" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sujal Pakodewala & Fast Food"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Vending Category</label>
                <div className="input-container">
                  <Tag size={16} className="input-icon" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)' }}
                  >
                    <option value="Pakode & Fast Food">Pakode & Fast Food</option>
                    <option value="Perishable Produce">Perishable Produce & Fruits</option>
                    <option value="Tea & Beverages">Tea & Beverages</option>
                    <option value="Textiles & Garments">Textiles & Garments</option>
                    <option value="General Handicrafts">General Handicrafts</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Vending Stall Address / Landmark (Used for Dynamic GIS Mapping)</label>
                <div className="input-container">
                  <MapPin size={18} className="input-icon" color="#10b981" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Omkar Nagar chowk, Nagpur"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mobile Contact Phone</label>
                <div className="input-container">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          {/* SPECIAL MUNICIPAL OFFICER SECURITY PASSKEY INPUT */}
          {role === 'authority' && (
            <div className="form-group">
              <label>Officer Security Passkey / Badge Code</label>
              <div className="input-container" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <Key size={18} className="input-icon" color="#34d399" />
                <input
                  type="password"
                  required
                  placeholder="Enter configured officer passkey"
                  value={badgeKey}
                  onChange={(e) => setBadgeKey(e.target.value)}
                  className="form-input"
                />
              </div>
              <span style={{ fontSize: '0.675rem', color: '#34d399', marginTop: '2px' }}>
                Required for Municipal Officer Clearance
              </span>
            </div>
          )}

          {mode === 'register' && role === 'authority' && (
            <div className="form-group">
              <label>Department / Authority ID</label>
              <div className="input-container">
                <ShieldCheck size={18} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Public Works / Zoning Division"
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
                placeholder="name@example.com"
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

          <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <span>{mode === 'register' ? 'Submit Application for Officer Approval' : `Sign In as ${role === 'citizen' ? 'Vendor' : 'Officer'}`}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        {/* Google OAuth Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 14px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <button
          type="button"
          className="submit-btn"
          style={{ background: '#fff', color: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none' }}
          onClick={signInWithGoogle}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
        </button>

      </div>
    </div>
  );
}
