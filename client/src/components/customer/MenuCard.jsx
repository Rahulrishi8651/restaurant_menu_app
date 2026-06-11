/**
 * MenuCard — displays a single menu item with add-to-cart.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const SPICE_ICONS = ['', '🌶', '🌶🌶', '🌶🌶🌶'];
const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

const MenuCard = ({ item }) => {
  const { addItem, isInCart, getQty, updateQty, removeItem } = useCart();
  const toast = useToast();
  const [imgErr, setImgErr] = useState(false);

  const inCart = isInCart(item.id);
  const qty    = getQty(item.id);

  const handleAdd = (e) => {
    e.preventDefault();
    addItem({
      id:       item.id,
      name:     item.name,
      price:    parseFloat(item.price),
      image_url: item.image_url,
      is_veg:   item.is_veg,
    });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div style={{
      background: 'var(--clr-surface)',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      transition: 'all 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(232,69,10,0.5)';
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--clr-border)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      {/* Image */}
      <Link to={`/menu/${item.id}`} style={{ display: 'block', position: 'relative' }}>
        <div style={{ paddingTop: '65%', position: 'relative', overflow: 'hidden' }}>
          <img
            src={imgErr ? PLACEHOLDER : (item.image_url || PLACEHOLDER)}
            alt={item.name}
            onError={() => setImgErr(true)}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
          />
          {/* Badges */}
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            <span className={`badge badge-${item.is_veg ? 'veg' : 'nonveg'}`}>
              {item.is_veg ? '● Veg' : '● Non-Veg'}
            </span>
            {item.tags?.includes('bestseller') && (
              <span className="badge badge-hot">🔥 Bestseller</span>
            )}
            {item.tags?.includes('new') && (
              <span className="badge badge-new">✦ New</span>
            )}
          </div>
          {/* Spice level */}
          {item.spice_level > 0 && (
            <span style={{
              position: 'absolute', top: 10, right: 10,
              fontSize: '0.85rem',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 6px', borderRadius: 6,
            }}>
              {SPICE_ICONS[item.spice_level]}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link to={`/menu/${item.id}`}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem', fontWeight: 600,
            marginBottom: 4, lineHeight: 1.3,
            color: 'var(--clr-text)',
          }}>{item.name}</h3>
        </Link>
        <p style={{
          color: 'var(--clr-text-muted)', fontSize: '0.8rem',
          lineHeight: 1.4, marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.description}
        </p>

        {/* Rating */}
        {item.rating_count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <span style={{ color: 'var(--clr-accent)', fontSize: '0.8rem' }}>★</span>
            <span style={{ color: 'var(--clr-text)', fontSize: '0.8rem', fontWeight: 600 }}>
              {parseFloat(item.rating).toFixed(1)}
            </span>
            <span style={{ color: 'var(--clr-text-dim)', fontSize: '0.75rem' }}>
              ({item.rating_count})
            </span>
            {item.prep_time_min && (
              <>
                <span style={{ color: 'var(--clr-border)', margin: '0 4px' }}>·</span>
                <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem' }}>
                  ⏱ {item.prep_time_min} min
                </span>
              </>
            )}
          </div>
        )}

        {/* Price + Cart */}
        <div style={{
          marginTop: 'auto', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem', fontWeight: 700,
            color: 'var(--clr-primary-light)',
          }}>
            ₹{parseFloat(item.price).toFixed(0)}
          </span>

          {!inCart ? (
            <button onClick={handleAdd} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px',
              background: 'var(--clr-primary)', color: '#fff',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-primary-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--clr-primary)'}
            >
              + Add
            </button>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: 'var(--clr-surface-2)',
              border: '1px solid var(--clr-primary)',
              borderRadius: 8, overflow: 'hidden',
            }}>
              <button onClick={() => qty === 1 ? removeItem(item.id) : updateQty(item.id, qty - 1)}
                style={{ width: 32, height: 32, color: 'var(--clr-primary)', fontWeight: 700, fontSize: '1rem' }}>
                −
              </button>
              <span style={{ width: 28, textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                {qty}
              </span>
              <button onClick={() => updateQty(item.id, qty + 1)}
                style={{ width: 32, height: 32, color: 'var(--clr-primary)', fontWeight: 700, fontSize: '1rem' }}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
