/**
 * StatsCard — dashboard KPI card.
 */
import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, color = 'var(--clr-primary)', trend }) => (
  <div style={{
    background: 'var(--clr-surface)',
    border: '1px solid var(--clr-border)',
    borderRadius: 16, padding: '20px',
    transition: 'all 0.25s ease',
    cursor: 'default',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.borderColor = color;
    e.currentTarget.style.transform = 'translateY(-3px)';
    e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`;
  }}
  onMouseLeave={e => {
    e.currentTarget.style.borderColor = 'var(--clr-border)';
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{
          fontSize: '0.75rem', color: 'var(--clr-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          fontWeight: 600, marginBottom: 8,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.9rem', fontWeight: 700,
          color: 'var(--clr-text)', lineHeight: 1,
          marginBottom: 6,
        }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
            {subtitle}
          </div>
        )}
        {trend !== undefined && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: '0.78rem', fontWeight: 600, marginTop: 6,
            color: trend >= 0 ? 'var(--clr-success)' : 'var(--clr-error)',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}1A`, // 10% opacity
        border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </div>
);

export default StatsCard;
