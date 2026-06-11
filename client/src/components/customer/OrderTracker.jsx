/**
 * OrderTracker — visual stepper for order status.
 */
import React from 'react';

const STEPS = [
  { key: 'pending',           label: 'Order Placed',    icon: '📋' },
  { key: 'confirmed',         label: 'Confirmed',        icon: '✅' },
  { key: 'preparing',         label: 'Preparing',        icon: '👨‍🍳' },
  { key: 'out_for_delivery',  label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered',         label: 'Delivered',        icon: '🎉' },
];

const STATUS_ORDER = {
  pending: 0, confirmed: 1, preparing: 2, out_for_delivery: 3, delivered: 4,
};

const OrderTracker = ({ status, history = [], estimatedDelivery }) => {
  const currentIdx = STATUS_ORDER[status] ?? 0;

  return (
    <div style={{
      background: 'var(--clr-surface)',
      border: '1px solid var(--clr-border)',
      borderRadius: 16, padding: '24px',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.1rem', marginBottom: 24,
        color: 'var(--clr-text)',
      }}>Order Status</h3>

      {/* Stepper */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        {/* Progress line */}
        <div style={{
          position: 'absolute', top: 20, left: '10%', right: '10%',
          height: 3, background: 'var(--clr-border)', borderRadius: 3,
        }} />
        <div style={{
          position: 'absolute', top: 20, left: '10%',
          height: 3, borderRadius: 3,
          background: 'linear-gradient(90deg, var(--clr-primary), var(--clr-accent))',
          width: `${(currentIdx / (STEPS.length - 1)) * 80}%`,
          transition: 'width 0.5s ease',
        }} />

        {/* Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-around', position: 'relative' }}>
          {STEPS.map((step, idx) => {
            const done    = idx < currentIdx;
            const active  = idx === currentIdx;
            const future  = idx > currentIdx;
            return (
              <div key={step.key} style={{ textAlign: 'center', width: 60 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  margin: '0 auto 8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                  background: done    ? 'rgba(76,175,80,0.15)' :
                              active  ? 'rgba(232,69,10,0.15)' :
                              'var(--clr-surface-2)',
                  border: `2px solid ${
                    done   ? 'var(--clr-success)' :
                    active ? 'var(--clr-primary)' :
                    'var(--clr-border)'
                  }`,
                  transition: 'all 0.3s ease',
                  boxShadow: active ? '0 0 12px rgba(232,69,10,0.4)' : 'none',
                }}>
                  {done ? '✓' : step.icon}
                </div>
                <span style={{
                  fontSize: '0.68rem', fontWeight: active ? 700 : 400,
                  color: done ? 'var(--clr-success)' :
                         active ? 'var(--clr-primary-light)' :
                         'var(--clr-text-dim)',
                  lineHeight: 1.2,
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ETA */}
      {estimatedDelivery && status !== 'delivered' && (
        <div style={{
          background: 'rgba(232,69,10,0.08)',
          border: '1px solid rgba(232,69,10,0.2)',
          borderRadius: 10, padding: '10px 16px',
          marginBottom: 16, fontSize: '0.85rem',
          color: 'var(--clr-primary-light)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⏱</span>
          Estimated delivery by {new Date(estimatedDelivery).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}

      {/* Status history */}
      {history.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Timeline
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...history].reverse().map((h, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '8px 0', borderBottom: i < history.length - 1 ? '1px solid rgba(58,58,58,0.5)' : 'none',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                  background: i === 0 ? 'var(--clr-primary)' : 'var(--clr-border)',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--clr-text)', fontWeight: i === 0 ? 600 : 400 }}>
                    {h.note}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-dim)', marginTop: 2 }}>
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
