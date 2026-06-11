import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=80&q=70';

const CartPage = () => {
  const { items, updateQty, removeItem, subtotal, TAX, DELIVERY, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: '/checkout' } }); return; }
    navigate('/checkout');
  };

  if (items.length === 0) return (
    <div style={{ paddingTop: 68, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: 24 }}>Add some delicious dishes to get started</p>
        <Link to="/menu" className="btn btn-primary btn-lg">Browse Menu</Link>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', padding: '88px 24px 60px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Your Cart</h1>
          <button onClick={clearCart} style={{ color: 'var(--clr-error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Clear All</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(item => (
              <div key={item.id} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 14, padding: '16px', display: 'flex', gap: 16, alignItems: 'center' }}>
                <img src={item.image_url || PLACEHOLDER} alt={item.name} onError={e => e.target.src=PLACEHOLDER}
                  style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: 'var(--clr-primary-light)', fontWeight: 700 }}>₹{item.price}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => item.quantity===1 ? removeItem(item.id) : updateQty(item.id, item.quantity-1)}
                    style={{ width: 36, height: 36, color: 'var(--clr-primary)', fontWeight: 700, fontSize: '1.1rem' }}>−</button>
                  <span style={{ width: 32, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity+1)}
                    style={{ width: 36, height: 36, color: 'var(--clr-primary)', fontWeight: 700, fontSize: '1.1rem' }}>+</button>
                </div>
                <div style={{ width: 70, textAlign: 'right', fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(0)}</div>
                <button onClick={() => removeItem(item.id)} style={{ color: 'var(--clr-text-dim)', fontSize: '1.1rem', padding: 4 }}>✕</button>
              </div>
            ))}
          </div>
          {/* Summary */}
          <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 16, padding: '24px', position: 'sticky', top: 88 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 20 }}>Order Summary</h3>
            {[['Subtotal', `₹${subtotal.toFixed(2)}`], ['GST (5%)', `₹${TAX.toFixed(2)}`], ['Delivery', `₹${DELIVERY}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <hr style={{ borderColor: 'var(--clr-border)', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>
              <span>Total</span><span style={{ color: 'var(--clr-primary-light)' }}>₹{total.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              Proceed to Checkout →
            </button>
            <Link to="/menu" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
