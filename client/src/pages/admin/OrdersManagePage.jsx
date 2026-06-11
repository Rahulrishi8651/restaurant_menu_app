import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services';
import { LoadingSpinner } from '../../components/common/index.jsx';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['','pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
const STATUS_LABELS = { pending:'Pending', confirmed:'Confirmed', preparing:'Preparing', out_for_delivery:'Out for Delivery', delivered:'Delivered', cancelled:'Cancelled' };
const STATUS_COLORS = { pending:'#FF9800', confirmed:'#2196F3', preparing:'#FF9800', out_for_delivery:'#FF6B35', delivered:'#4CAF50', cancelled:'#F44336' };
const NEXT_STATUS   = { pending:'confirmed', confirmed:'preparing', preparing:'out_for_delivery', out_for_delivery:'delivered' };

const OrdersManagePage = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination]   = useState({});
  const [page, setPage]         = useState(1);
  const [updating, setUpdating] = useState(null);
  const [expandedId, setExpandedId]   = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getOrders({ page, limit:15, status:filterStatus, search });
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }, [page, filterStatus, search]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await adminService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status → ${STATUS_LABELS[newStatus]}`);
      load();
    } catch(e) { toast.error('Failed to update status'); } finally { setUpdating(null); }
  };

  return (
    <div style={{ padding:'32px' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:24, textAlign:'center' }}>Order Management</h1>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <form onSubmit={e=>{e.preventDefault();setSearch(searchInput);setPage(1);}} style={{ display:'flex', gap:8 }}>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} className="input" placeholder="Search order # or customer..." style={{ width:260 }} />
          <button type="submit" className="btn btn-ghost">Search</button>
          {search && <button type="button" className="btn btn-ghost" onClick={()=>{setSearch('');setSearchInput('');}}>✕</button>}
        </form>
        <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1);}} className="input" style={{ width:180 }}>
          <option value="">All Statuses</option>
          {STATUSES.slice(1).map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:16, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
              <thead style={{ background:'var(--clr-surface-2)' }}>
                <tr>
                  {['Order #','Customer','Items','Amount','Payment','Status','Time','Actions'].map(h=>(
                    <th key={h} style={{ padding:'14px 16px', textAlign:'left', color:'var(--clr-text-muted)', fontWeight:600, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order=>(
                  <tr key={order.id} style={{ borderTop:'1px solid var(--clr-border)', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--clr-surface-2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ fontWeight:700, color:'var(--clr-primary-light)', cursor:'pointer' }} onClick={()=>setExpandedId(expandedId===order.id?null:order.id)}>
                        {order.order_number}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ fontWeight:500 }}>{order.customer_name||'Guest'}</div>
                      <div style={{ color:'var(--clr-text-dim)', fontSize:'0.78rem' }}>{order.customer_phone}</div>
                    </td>
                    <td style={{ padding:'14px 16px', color:'var(--clr-text-muted)' }}>{order.item_count}</td>
                    <td style={{ padding:'14px 16px', fontWeight:700 }}>₹{parseFloat(order.total_amount).toFixed(0)}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ textTransform:'uppercase', fontSize:'0.72rem', color:'var(--clr-text-muted)' }}>{order.payment_method}</span>
                      <div style={{ fontSize:'0.72rem', color: order.payment_status==='paid'?'var(--clr-success)':'var(--clr-warning)' }}>{order.payment_status}</div>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ padding:'4px 12px', borderRadius:99, fontSize:'0.75rem', fontWeight:700,
                        background:`${STATUS_COLORS[order.status]||'#9E9E9E'}1A`,
                        color: STATUS_COLORS[order.status]||'#9E9E9E' }}>
                        {STATUS_LABELS[order.status]||order.status}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px', color:'var(--clr-text-muted)', fontSize:'0.8rem' }}>
                      {new Date(order.created_at).toLocaleDateString()}<br/>
                      <span style={{ fontSize:'0.75rem' }}>{new Date(order.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      {NEXT_STATUS[order.status] && (
                        <button onClick={()=>handleStatusUpdate(order.id, NEXT_STATUS[order.status])}
                          disabled={updating===order.id}
                          style={{ padding:'6px 12px', borderRadius:8, cursor:'pointer', fontSize:'0.78rem', fontWeight:600,
                            background:'rgba(232,69,10,0.12)', border:'1px solid rgba(232,69,10,0.3)', color:'var(--clr-primary-light)',
                            opacity: updating===order.id ? 0.6 : 1 }}>
                          {updating===order.id ? '...' : `→ ${STATUS_LABELS[NEXT_STATUS[order.status]]}`}
                        </button>
                      )}
                      {order.status!=='cancelled' && order.status!=='delivered' && (
                        <button onClick={()=>handleStatusUpdate(order.id,'cancelled')}
                          style={{ marginLeft:6, padding:'6px 10px', borderRadius:8, cursor:'pointer', fontSize:'0.75rem',
                            background:'rgba(244,67,54,0.08)', border:'1px solid rgba(244,67,54,0.2)', color:'var(--clr-error)' }}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length===0 && (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--clr-text-muted)' }}>No orders found</div>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > 15 && (
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:24 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn btn-ghost btn-sm">← Prev</button>
              <span style={{ padding:'8px 16px', color:'var(--clr-text-muted)', fontSize:'0.85rem' }}>Page {page} of {Math.ceil(pagination.total/15)}</span>
              <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(pagination.total/15)} className="btn btn-ghost btn-sm">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersManagePage;
