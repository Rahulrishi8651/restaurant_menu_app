import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import StatsCard from '../../components/admin/StatsCard';
import { LoadingSpinner } from '../../components/common/index.jsx';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

const DashboardPage = () => {
  const [stats,     setStats]     = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [period,    setPeriod]    = useState(30);

  useEffect(() => {
    Promise.all([adminService.getDashboard(), adminService.getAnalytics(period)])
      .then(([s, a]) => { setStats(s.data.data); setAnalytics(a.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}><LoadingSpinner size={48} /></div>;

  const { orders: o, revenue: r, top_items, recent_orders } = stats;
  const fmtCurrency = v => `₹${parseFloat(v).toLocaleString('en-IN', { maximumFractionDigits:0 })}`;

  return (
    <div style={{ padding:'32px' }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:4, textAlign:'center' }}>Dashboard</h1>
        <p style={{ color:'var(--clr-text-muted)' }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <StatsCard title="Total Orders"    value={o.total_orders}     icon="📦" color="var(--clr-primary)" subtitle={`${o.active_orders} active`} />
        <StatsCard title="Today's Revenue" value={fmtCurrency(r.today_revenue)}  icon="💰" color="var(--clr-success)" subtitle="Today" />
        <StatsCard title="Monthly Revenue" value={fmtCurrency(r.monthly_revenue)} icon="📈" color="#2196F3" subtitle="This month" />
        <StatsCard title="Total Profit"    value={fmtCurrency(r.total_profit)}   icon="🏆" color="var(--clr-accent)" subtitle="All time" />
      </div>

      {/* Secondary stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
        {[
          ['Pending',         o.pending_orders,         '⏳', '#FF9800'],
          ['Preparing',       o.preparing_orders,       '👨‍🍳', '#FF9800'],
          ['Out for Delivery',o.out_for_delivery,       '🛵', 'var(--clr-primary-light)'],
          ['Delivered',       o.delivered_orders,       '✅', 'var(--clr-success)'],
        ].map(([title, value, icon, color]) => (
          <StatsCard key={title} title={title} value={value} icon={icon} color={color} />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:28 }}>
        {/* Area chart */}
        <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:16, padding:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem' }}>Revenue Trend</h3>
            <div style={{ display:'flex', gap:6 }}>
              {[7,30,90].map(d => (
                <button key={d} onClick={() => setPeriod(d)}
                  style={{ padding:'4px 12px', borderRadius:8, cursor:'pointer', fontSize:'0.78rem', fontWeight:600,
                    background: period===d ? 'var(--clr-primary)' : 'var(--clr-surface-2)',
                    border: `1px solid ${period===d ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                    color: period===d ? '#fff' : 'var(--clr-text-muted)' }}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics?.daily || []} margin={{ top:5, right:10, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8450A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E8450A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,58,58,0.5)" />
              <XAxis dataKey="date" tick={{ fill:'#9E9E9E', fontSize:11 }} tickFormatter={v => new Date(v).toLocaleDateString('en',{month:'short',day:'numeric'})} />
              <YAxis tick={{ fill:'#9E9E9E', fontSize:11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background:'var(--clr-surface-2)', border:'1px solid var(--clr-border)', borderRadius:8 }}
                labelStyle={{ color:'var(--clr-text-muted)', fontSize:'0.8rem' }}
                labelFormatter={v => new Date(v).toLocaleDateString()}
                formatter={v => [`₹${parseFloat(v).toFixed(0)}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#E8450A" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top items */}
        <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:16, padding:'24px' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', marginBottom:20 }}>🔥 Top Selling</h3>
          {top_items?.map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i<top_items.length-1 ? '1px solid rgba(58,58,58,0.5)' : 'none' }}>
              <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--clr-surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:700, color:'var(--clr-text-muted)', flexShrink:0 }}>
                {i+1}
              </span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:500, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.item_name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--clr-text-muted)' }}>{item.total_sold} sold</div>
              </div>
              <div style={{ fontWeight:600, color:'var(--clr-primary-light)', fontSize:'0.85rem' }}>₹{parseFloat(item.total_revenue).toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly bar chart */}
      <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:16, padding:'24px', marginBottom:28 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', marginBottom:20 }}>Monthly Revenue (12 months)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics?.monthly || []} margin={{ top:5, right:10, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(58,58,58,0.5)" />
            <XAxis dataKey="month" tick={{ fill:'#9E9E9E', fontSize:11 }} />
            <YAxis tick={{ fill:'#9E9E9E', fontSize:11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background:'var(--clr-surface-2)', border:'1px solid var(--clr-border)', borderRadius:8 }}
              formatter={v => [`₹${parseFloat(v).toFixed(0)}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#E8450A" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent orders */}
      <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:16, padding:'24px' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', marginBottom:20 }}>Recent Orders</h3>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--clr-border)' }}>
                {['Order #','Customer','Amount','Payment','Status','Time'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', color:'var(--clr-text-muted)', fontWeight:600, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent_orders?.map(order => {
                const SMAP = { pending:'#FF9800', confirmed:'#2196F3', preparing:'#FF9800', out_for_delivery:'#FF6B35', delivered:'#4CAF50', cancelled:'#F44336' };
                return (
                  <tr key={order.id} style={{ borderBottom:'1px solid rgba(58,58,58,0.5)' }}>
                    <td style={{ padding:'12px' }}><span style={{ fontWeight:600, color:'var(--clr-primary-light)' }}>{order.order_number}</span></td>
                    <td style={{ padding:'12px' }}>{order.customer_name || 'Guest'}</td>
                    <td style={{ padding:'12px', fontWeight:700 }}>₹{parseFloat(order.total_amount).toFixed(0)}</td>
                    <td style={{ padding:'12px', textTransform:'capitalize', color:'var(--clr-text-muted)' }}>{order.payment_method}</td>
                    <td style={{ padding:'12px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, background:`${SMAP[order.status]}20`, color:SMAP[order.status], textTransform:'capitalize' }}>
                        {order.status.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td style={{ padding:'12px', color:'var(--clr-text-muted)', fontSize:'0.8rem' }}>{new Date(order.created_at).toLocaleTimeString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
