import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services';

const PAYMENT_METHODS = [
  { id: 'cod',      label: 'Cash on Delivery', icon: '💵' },
  { id: 'razorpay', label: 'Razorpay (UPI/Card)', icon: '💳' },
  { id: 'stripe',   label: 'Stripe (International)', icon: '🌐' },
];

const CheckoutPage = () => {
  const { items, subtotal, TAX, DELIVERY, total, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('cod');
  const [form, setForm] = useState({
    delivery_name:    user?.name || '',
    delivery_phone:   user?.phone || '',
    delivery_address: user?.address || '',
    delivery_notes:   '',
  });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleMockPayment = async () => {
    // Mock Razorpay/Stripe — in production, open the payment SDK here
    return new Promise(resolve => setTimeout(() => resolve(`PAY_${Date.now()}`), 1500));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.delivery_address.trim()) { toast.error('Please enter delivery address'); return; }
    if (!form.delivery_phone.trim())   { toast.error('Please enter phone number'); return; }

    setLoading(true);
    try {
      let payment_id = null;

      if (payMethod !== 'cod') {
        toast.info('Processing payment...');
        payment_id = await handleMockPayment();
        toast.success('Payment successful!');
      }

      const orderPayload = {
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        ...form,
        payment_method: payMethod,
        payment_id,
      };

      const { data } = await orderService.placeOrder(orderPayload);
      clearCart();
      toast.success('🎉 Order placed successfully!');
      navigate(`/orders/${data.data.order_id}/track`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', padding: '88px 24px 60px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 32 }}>Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            <div>
              {/* Delivery details */}
              <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 20 }}>📍 Delivery Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="label">Full Name</label>
                    <input name="delivery_name" value={form.delivery_name} onChange={handleChange} className="input" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input name="delivery_phone" value={form.delivery_phone} onChange={handleChange} className="input" placeholder="9876543210" required />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="label">Delivery Address</label>
                  <textarea name="delivery_address" value={form.delivery_address} onChange={handleChange} className="input" rows={3} placeholder="House No, Street, Area, City..." required style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="label">Special Instructions (Optional)</label>
                  <input name="delivery_notes" value={form.delivery_notes} onChange={handleChange} className="input" placeholder="e.g. Ring doorbell twice" />
                </div>
              </div>

              {/* Payment method */}
              <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 16, padding: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 20 }}>💳 Payment Method</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <label key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                      background: payMethod===pm.id ? 'rgba(232,69,10,0.1)' : 'var(--clr-surface-2)',
                      border: `1px solid ${payMethod===pm.id ? 'var(--clr-primary)' : 'var(--clr-border)'}` }}>
                      <input type="radio" name="payment" value={pm.id} checked={payMethod===pm.id} onChange={e=>setPayMethod(e.target.value)} style={{ accentColor: 'var(--clr-primary)' }} />
                      <span style={{ fontSize: '1.2rem' }}>{pm.icon}</span>
                      <span style={{ fontWeight: 500 }}>{pm.label}</span>
                      {pm.id!=='cod' && <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'var(--clr-text-muted)', background:'var(--clr-surface-3)', padding:'2px 8px', borderRadius:99 }}>Mock</span>}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 16, padding: '24px', position: 'sticky', top: 88 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 200, overflowY: 'auto' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--clr-text-muted)' }}>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price*item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <hr style={{ borderColor: 'var(--clr-border)', margin: '12px 0' }} />
              {[['Subtotal',`₹${subtotal.toFixed(2)}`],['GST (5%)',`₹${TAX.toFixed(2)}`],['Delivery',`₹${DELIVERY}`]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:'0.88rem', color:'var(--clr-text-muted)' }}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <hr style={{ borderColor: 'var(--clr-border)', margin: '12px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'1.1rem', marginBottom:20 }}>
                <span>Total</span><span style={{ color:'var(--clr-primary-light)' }}>₹{total.toFixed(2)}</span>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'1rem' }}>
                {loading ? '⏳ Processing...' : payMethod==='cod' ? '🎉 Place Order' : '💳 Pay & Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
