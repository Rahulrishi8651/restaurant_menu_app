import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, loading }      = useAuth();
  const toast                   = useToast();
  const navigate                = useNavigate();
  const location                = useLocation();
  const from                    = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) { toast.success('Welcome back!'); navigate(from, { replace: true }); }
    else toast.error(result.message);
  };

  return (
    <div style={{ minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,69,10,0.15) 0%, transparent 70%), var(--clr-bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🍽️</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:4 }}>Welcome Back</h1>
          <p style={{ color:'var(--clr-text-muted)' }}>Sign in to your account</p>
        </div>
        <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:20, padding:'32px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', marginTop:8 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:20, color:'var(--clr-text-muted)', fontSize:'0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--clr-primary-light)', fontWeight:600 }}>Sign up</Link>
          </p>
        </div>
        <p style={{ textAlign:'center', marginTop:16, fontSize:'0.8rem', color:'var(--clr-text-dim)' }}>
          Admin? <Link to="/admin/login" style={{ color:'var(--clr-text-muted)' }}>Admin Login →</Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'' });
  const { register, loading } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const result = await register(form);
    if (result.success) { toast.success('Account created!'); navigate('/'); }
    else toast.error(result.message);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,69,10,0.15) 0%, transparent 70%), var(--clr-bg)' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🍽️</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:4 }}>Create Account</h1>
          <p style={{ color:'var(--clr-text-muted)' }}>Join us for great food</p>
        </div>
        <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:20, padding:'32px' }}>
          <form onSubmit={handleSubmit}>
            {[['name','Name','text','Your Name'],['email','Email','email','you@example.com'],['password','Password','password','Min. 6 characters'],['phone','Phone (optional)','tel','9876543210'],['address','Address (optional)','text','Your delivery address']].map(([name,label,type,placeholder])=>(
              <div key={name} className="form-group">
                <label className="label">{label}</label>
                <input type={type} value={form[name]} onChange={e=>setForm(f=>({...f,[name]:e.target.value}))}
                  className="input" placeholder={placeholder} required={!['phone','address'].includes(name)} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px' }}>
              {loading ? 'Creating...' : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:20, color:'var(--clr-text-muted)', fontSize:'0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--clr-primary-light)', fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
