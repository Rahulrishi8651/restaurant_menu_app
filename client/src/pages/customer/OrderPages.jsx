import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../../services';
import { LoadingSpinner } from '../../components/common/index.jsx';
import OrderTracker from '../../components/customer/OrderTracker';

const STATUS_STYLE = {
  pending:          { color:'#FF9800', bg:'rgba(255,152,0,.12)' },
  confirmed:        { color:'#2196F3', bg:'rgba(33,150,243,.12)' },
  preparing:        { color:'#FF9800', bg:'rgba(255,152,0,.12)' },
  out_for_delivery: { color:'#FF6B35', bg:'rgba(232,69,10,.12)' },
  delivered:        { color:'#4CAF50', bg:'rgba(76,175,80,.12)' },
  cancelled:        { color:'#F44336', bg:'rgba(244,67,54,.12)' },
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then(r => setOrders(r.data.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ paddingTop:120 }}><LoadingSpinner /></div>;

  return (
    <div style={{ paddingTop:68, minHeight:'100vh', padding:'88px 24px 60px' }}>
      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:32 }}>My Orders</h1>
        {orders.length===0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'var(--clr-text-muted)' }}>
            <div style={{ fontSize:'3rem', marginBottom:16 }}>📦</div>
            <h3>No orders yet</h3>
            <p style={{ marginBottom:24 }}>Start by exploring our menu</p>
            <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {orders.map(order => {
              const s = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
              return (
                <Link key={order.id} to={`/orders/${order.id}/track`} style={{ textDecoration:'none' }}>
                  <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:14, padding:'20px', display:'flex', gap:16, alignItems:'center', transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--clr-primary)'; e.currentTarget.style.transform='translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--clr-border)'; e.currentTarget.style.transform='none'; }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, marginBottom:4 }}>{order.order_number}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--clr-text-muted)', marginBottom:8 }}>
                        {order.items?.slice(0,2).map(i=>`${i.item_name} ×${i.quantity}`).join(', ')}
                        {order.items?.length>2 && ` +${order.items.length-2} more`}
                      </div>
                      <div style={{ fontSize:'0.78rem', color:'var(--clr-text-dim)' }}>
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', fontWeight:700, color:'var(--clr-primary-light)', marginBottom:8 }}>
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </div>
                      <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:99, fontSize:'0.75rem', fontWeight:700, background:s.bg, color:s.color }}>
                        {order.status.replace(/_/g,' ')}
                      </span>
                    </div>
                    <span style={{ color:'var(--clr-text-dim)', fontSize:'1.2rem' }}>›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderService.trackOrder(id)
      .then(r => setOrder(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ paddingTop:120 }}><LoadingSpinner /></div>;

  if (error) return (
    <div style={{ paddingTop:68, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:16 }}>❌</div>
        <h2 style={{ marginBottom:8 }}>{error}</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop:16 }}>My Orders</Link>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop:68, minHeight:'100vh', padding:'88px 24px 60px' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        <div style={{ marginBottom:24 }}>
          <Link to="/orders" style={{ color:'var(--clr-text-muted)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>← Back to Orders</Link>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', marginBottom:4 }}>Track Order</h1>
            <p style={{ color:'var(--clr-text-muted)', fontSize:'0.9rem' }}>{order.order_number}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:'var(--clr-primary-light)' }}>
              ₹{parseFloat(order.total_amount).toFixed(2)}
            </div>
          </div>
        </div>
        <OrderTracker status={order.status} history={order.history} estimatedDelivery={order.estimated_delivery} />
        {/* Items */}
        <div style={{ marginTop:20, background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:16, padding:'20px' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', marginBottom:16 }}>Items Ordered</h3>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i<order.items.length-1 ? '1px solid var(--clr-border)' : 'none' }}>
              {item.image_url && <img src={item.image_url} alt={item.item_name} style={{ width:44, height:44, borderRadius:8, objectFit:'cover' }} />}
              <div style={{ flex:1, fontSize:'0.9rem' }}>{item.item_name}</div>
              <div style={{ color:'var(--clr-text-muted)', fontSize:'0.85rem' }}>× {item.quantity}</div>
            </div>
          ))}
          <div style={{ marginTop:16, fontSize:'0.85rem', color:'var(--clr-text-muted)' }}>
            📍 {order.delivery_address}
          </div>
        </div>
      </div>
    </div>
  );
};
