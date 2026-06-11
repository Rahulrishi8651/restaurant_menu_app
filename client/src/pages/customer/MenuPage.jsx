import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuService } from '../../services';
import MenuCard from '../../components/customer/MenuCard';
import { LoadingSpinner } from '../../components/common/index.jsx';

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]       = useState(true);
  const currentCategory = searchParams.get('category') || '';
  const currentSearch   = searchParams.get('search') || '';
  const currentVeg      = searchParams.get('is_veg') === 'true';
  const currentPage     = parseInt(searchParams.get('page') || '1');
  const [searchInput, setSearchInput] = useState(currentSearch);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 12, sort: 'rating', order: 'DESC',
        ...(currentCategory && { category: currentCategory }),
        ...(currentSearch   && { search: currentSearch }),
        ...(currentVeg      && { is_veg: 'true' }) };
      const { data } = await menuService.getItems(params);
      setItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [currentCategory, currentSearch, currentVeg, currentPage]);

  useEffect(() => { menuService.getCategories().then(r => setCategories(r.data.data)); }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page'); setSearchParams(p);
  };

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh' }}>
      <div style={{ background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: 20 }}>Our Menu</h1>
          <form onSubmit={e => { e.preventDefault(); updateParam('search', searchInput); }}
            style={{ display: 'flex', gap: 10, marginBottom: 20, maxWidth: 480 }}>
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search dishes..." className="input" style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary">Search</button>
            {currentSearch && <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); updateParam('search', ''); }}>✕</button>}
          </form>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {[{ slug: '', name: 'All', icon: '🍽️' }, ...categories].map(cat => (
              <button key={cat.slug ?? 'all'} onClick={() => updateParam('category', cat.slug)}
                style={{ padding: '7px 18px', borderRadius: 99, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                  background: currentCategory === (cat.slug??'') ? 'var(--clr-primary)' : 'var(--clr-surface-2)',
                  border: `1px solid ${currentCategory===(cat.slug??'') ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                  color: currentCategory === (cat.slug??'') ? '#fff' : 'var(--clr-text)', transition: 'all 0.2s' }}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
          <button onClick={() => updateParam('is_veg', currentVeg ? '' : 'true')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 99, cursor: 'pointer',
              background: currentVeg ? 'rgba(76,175,80,0.15)' : 'var(--clr-surface-2)',
              border: `1px solid ${currentVeg ? 'var(--clr-success)' : 'var(--clr-border)'}`,
              color: currentVeg ? 'var(--clr-success)' : 'var(--clr-text)', fontSize: '0.85rem' }}>
            {currentVeg ? '✓' : '○'} Veg Only
          </button>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? <LoadingSpinner /> : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--clr-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🍽️</div>
            <h3>No dishes found</h3><p>Try a different search or category</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--clr-text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>{pagination.total} dishes found</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {items.map(item => <MenuCard key={item.id} item={item} />)}
            </div>
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
                  <button key={pg} onClick={() => { const p=new URLSearchParams(searchParams); p.set('page',pg); setSearchParams(p); }}
                    style={{ width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                      background: pg===currentPage ? 'var(--clr-primary)' : 'var(--clr-surface-2)',
                      border: `1px solid ${pg===currentPage ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                      color: pg===currentPage ? '#fff' : 'var(--clr-text)' }}>{pg}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
