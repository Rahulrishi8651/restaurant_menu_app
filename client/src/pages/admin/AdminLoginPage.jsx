import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminLoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { adminLogin, loading } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await adminLogin(email, password);
    if (result.success) { toast.success('Welcome, Admin!'); navigate('/admin/dashboard'); }
    else toast.error(result.message);
  };

  const fillDemo = () => { setEmail('admin@restaurantos.com'); setPassword('Admin@123'); };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px',
      background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(33,150,243,0.15) 0%, transparent 70%), var(--clr-bg)' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🔐</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:4 }}>Admin Panel</h1>
          <p style={{ color:'var(--clr-text-muted)' }}>Gupta Family Restaurant Management</p>
        </div>
        <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:20, padding:'32px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Admin Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" placeholder="admin@example.com" required />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px' }}>
              {loading ? 'Signing in...' : '→ Access Dashboard'}
            </button>
          </form>
          <button onClick={fillDemo} style={{ width:'100%', marginTop:12, padding:'10px', background:'rgba(33,150,243,0.1)', border:'1px solid rgba(33,150,243,0.25)', borderRadius:8, color:'#64B5F6', fontSize:'0.82rem', cursor:'pointer' }}>
            Fill Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
