import React, { useEffect, useState, useCallback } from 'react';
import { menuService } from '../../services';
import { LoadingSpinner } from '../../components/common/index.jsx';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = { name:'', description:'', price:'', cost_price:'', category_id:'', is_veg:false, is_featured:false, is_available:true, spice_level:0, prep_time_min:15, calories:'', tags:'' };

const MenuManagePage = () => {
  const [items, setItems]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, catRes] = await Promise.all([
        menuService.getItems({ limit:100, sort:'name' }),
        menuService.getCategories(),
      ]);
      setItems(itemsRes.data.data.items);
      setCategories(catRes.data.data);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setImageFile(null); setShowModal(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    setForm({ name:item.name, description:item.description||'', price:item.price, cost_price:item.cost_price||0,
              category_id:item.category_id||'', is_veg:item.is_veg, is_featured:item.is_featured,
              is_available:item.is_available, spice_level:item.spice_level||0,
              prep_time_min:item.prep_time_min||15, calories:item.calories||'', tags:(item.tags||[]).join(', ') });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await menuService.deleteItem(id); toast.success('Item deleted'); load(); }
    catch(e) { toast.error('Delete failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editItem) { await menuService.updateItem(editItem.id, fd); toast.success('Item updated!'); }
      else          { await menuService.createItem(fd);              toast.success('Item created!'); }
      setShowModal(false); load();
    } catch(e) { toast.error(e.response?.data?.message || 'Save failed'); } finally { setSaving(false); }
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:'32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem' }}>Menu Management</h1>
        <button onClick={openCreate} className="btn btn-primary">+ Add Item</button>
      </div>

      <div style={{ marginBottom:20 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} className="input" placeholder="Search menu items..." style={{ maxWidth:320 }} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
            <thead style={{ background:'var(--clr-surface-2)' }}>
              <tr>
                {['Item','Category','Price','Cost','Status','Actions'].map(h=>(
                  <th key={h} style={{ padding:'14px 16px', textAlign:'left', color:'var(--clr-text-muted)', fontWeight:600, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item=>(
                <tr key={item.id} style={{ borderTop:'1px solid var(--clr-border)', transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--clr-surface-2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      {item.image_url && <img src={item.image_url} alt={item.name} style={{ width:44,height:44,borderRadius:8,objectFit:'cover' }} />}
                      <div>
                        <div style={{ fontWeight:600 }}>{item.name}</div>
                        <div style={{ display:'flex', gap:6, marginTop:4 }}>
                          <span className={`badge badge-${item.is_veg?'veg':'nonveg'}`}>{item.is_veg?'Veg':'Non-Veg'}</span>
                          {item.is_featured && <span className="badge badge-hot">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'14px 16px', color:'var(--clr-text-muted)' }}>{item.category_name||'—'}</td>
                  <td style={{ padding:'14px 16px', fontWeight:700, color:'var(--clr-primary-light)' }}>₹{item.price}</td>
                  <td style={{ padding:'14px 16px', color:'var(--clr-text-muted)' }}>₹{item.cost_price||0}</td>
                  <td style={{ padding:'14px 16px' }}>
                    <span style={{ padding:'4px 10px', borderRadius:99, fontSize:'0.75rem', fontWeight:700,
                      background: item.is_available?'rgba(76,175,80,0.12)':'rgba(244,67,54,0.12)',
                      color: item.is_available?'var(--clr-success)':'var(--clr-error)' }}>
                      {item.is_available?'Available':'Unavailable'}
                    </span>
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>openEdit(item)} style={{ padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:'0.78rem', background:'rgba(33,150,243,0.1)', border:'1px solid rgba(33,150,243,0.25)', color:'#64B5F6' }}>Edit</button>
                      <button onClick={()=>handleDelete(item.id, item.name)} style={{ padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:'0.78rem', background:'rgba(244,67,54,0.08)', border:'1px solid rgba(244,67,54,0.2)', color:'var(--clr-error)' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div style={{ textAlign:'center', padding:'60px', color:'var(--clr-text-muted)' }}>No items found</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={()=>setShowModal(false)}>
          <div style={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:20, padding:32, width:'100%', maxWidth:580, maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem' }}>{editItem?'Edit Item':'Add New Item'}</h2>
              <button onClick={()=>setShowModal(false)} style={{ color:'var(--clr-text-muted)', fontSize:'1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="label">Item Name *</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" required placeholder="e.g. Butter Chicken" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="label">Description</label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="input" rows={2} placeholder="Describe the dish..." style={{ resize:'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="label">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} className="input" required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label className="label">Cost Price (₹)</label>
                  <input type="number" value={form.cost_price} onChange={e=>setForm(f=>({...f,cost_price:e.target.value}))} className="input" min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label className="label">Category</label>
                  <select value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))} className="input">
                    <option value="">Select Category</option>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Prep Time (min)</label>
                  <input type="number" value={form.prep_time_min} onChange={e=>setForm(f=>({...f,prep_time_min:e.target.value}))} className="input" min="1" />
                </div>
                <div className="form-group">
                  <label className="label">Spice Level (0-3)</label>
                  <input type="number" value={form.spice_level} onChange={e=>setForm(f=>({...f,spice_level:e.target.value}))} className="input" min="0" max="3" />
                </div>
                <div className="form-group">
                  <label className="label">Calories</label>
                  <input type="number" value={form.calories} onChange={e=>setForm(f=>({...f,calories:e.target.value}))} className="input" min="0" placeholder="Optional" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="label">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} className="input" placeholder="bestseller, new, spicy" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="label">Image Upload</label>
                  <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files[0])} style={{ color:'var(--clr-text)', fontSize:'0.85rem' }} />
                  {editItem?.image_url && !imageFile && <div style={{ marginTop:8, fontSize:'0.78rem', color:'var(--clr-text-muted)' }}>Current: {editItem.image_url}</div>}
                </div>
                <div style={{ display:'flex', gap:16 }}>
                  {[['is_veg','Vegetarian'],['is_featured','Featured'],['is_available','Available']].map(([k,l])=>(
                    <label key={k} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:'0.88rem' }}>
                      <input type="checkbox" checked={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.checked}))} style={{ accentColor:'var(--clr-primary)', width:16, height:16 }} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:24 }}>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>
                  {saving ? 'Saving...' : editItem ? 'Update Item' : 'Create Item'}
                </button>
                <button type="button" onClick={()=>setShowModal(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagePage;
