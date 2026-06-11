/**
 * HomePage — Hero banner + featured dishes + categories.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { menuService } from '../../services';
import MenuCard from '../../components/customer/MenuCard';
import { LoadingSpinner } from '../../components/common/index.jsx';

const HERO_DISHES = [
  { emoji: '🍛', label: 'Butter Chicken' },
  { emoji: '🍚', label: 'Biryani' },
  { emoji: '🍕', label: 'Pizza' },
  { emoji: '🍔', label: 'Burgers' },
];

const HomePage = () => {
  const [featured, setFeatured]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          menuService.getItems({ is_featured: 'true', limit: 8 }),
          menuService.getCategories(),
        ]);
        setFeatured(featRes.data.data.items);
        setCategories(catRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(232,69,10,.3) 0%, transparent 70%), var(--clr-bg)`,
        display: 'flex', alignItems: 'center',
        padding: '0 24px', paddingTop: 68,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '80px 0 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(232,69,10,0.12)', border: '1px solid rgba(232,69,10,0.3)',
                borderRadius: 999, padding: '6px 16px', marginBottom: 24,
                fontSize: '0.8rem', color: 'var(--clr-primary-light)', fontWeight: 600,
              }}>
                🔥 Fresh & Hot — Delivered in 45 mins
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900,
                lineHeight: 1.1, color: '#fff', marginBottom: 20,
              }}>
                Authentic Flavours,<br />
                <span style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Delivered to You
                </span>
              </h1>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
                Experience the rich culinary heritage of India. From smoky tandoor delights to creamy curries — every dish crafted with love.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/menu" className="btn btn-primary btn-lg">Explore Menu →</Link>
                <Link to="/register" className="btn btn-outline btn-lg">Get Started</Link>
              </div>
              <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
                {[['500+', 'Happy Customers'], ['50+', 'Menu Items'], ['4.8★', 'Rating']].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{n}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {HERO_DISHES.map(({ emoji, label }, i) => (
                <div key={label} onClick={() => navigate('/menu')} style={{
                  background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                  borderRadius: 20, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                  transform: i % 2 === 1 ? 'translateY(20px)' : 'none',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--clr-primary)'; e.currentTarget.style.transform = i%2===1?'translateY(14px)':'translateY(-6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.transform = i%2===1?'translateY(20px)':'none'; }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section style={{ padding: '60px 24px', background: 'var(--clr-surface)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', textAlign: 'center', marginBottom: 8 }}>Browse by Category</h2>
            <p style={{ color: 'var(--clr-text-muted)', textAlign: 'center', marginBottom: 36 }}>Find exactly what you're craving</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {categories.map(cat => (
                <Link key={cat.id} to={`/menu?category=${cat.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', background: 'var(--clr-surface-2)',
                  border: '1px solid var(--clr-border)', borderRadius: 99,
                  color: 'var(--clr-text)', fontSize: '0.9rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--clr-primary)'; e.currentTarget.style.color='var(--clr-primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--clr-border)'; e.currentTarget.style.color='var(--clr-text)'; }}>
                  <span>{cat.icon}</span> {cat.name}
                  <span style={{ background: 'var(--clr-surface-3)', padding: '1px 7px', borderRadius: 99, fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>{cat.item_count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>🔥 Featured Dishes</h2>
              <p style={{ color: 'var(--clr-text-muted)' }}>Our chef's hand-picked favourites</p>
            </div>
            <Link to="/menu" className="btn btn-outline">View All →</Link>
          </div>
          {loading ? <LoadingSpinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {featured.map(item => <MenuCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      {/* Why us */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid var(--clr-border)', background: 'rgba(232,69,10,0.03)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {[['⚡','45 Min Delivery','Fast and reliable'],['👨‍🍳','Master Chefs','20+ years experience'],['🌿','Fresh Ingredients','Sourced daily'],['💳','Secure Payments','Multiple options']].map(([icon, title, desc]) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
                <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{title}</h4>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
