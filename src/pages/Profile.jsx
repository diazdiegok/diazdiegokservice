import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, Mail, Phone, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI, authAPI, formatPrice, formatDate, orderStatusLabels } from '../services/api';

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '', city: user.city || '' });
        ordersAPI.getAll()
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user, navigate]);

    const handleSaveProfile = async () => {
        try {
            const updated = await authAPI.updateProfile(form);
            updateUser(updated);
            setEditing(false);
            toast.success('Perfil actualizado ✅');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!user) return null;

    return (
        <div className="container" style={{ paddingTop: '16px', paddingBottom: '80px' }}>
            <div className="page-header">
                <h1>Mi Cuenta</h1>
            </div>

            <div className="profile-grid">
                {/* Sidebar */}
                <aside className="profile-sidebar">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{user.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{user.email}</p>

                        {editing ? (
                            <div style={{ textAlign: 'left' }}>
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Teléfono</label>
                                    <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dirección</label>
                                    <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ciudad</label>
                                    <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Guardar</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                    {user.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <Phone size={14} /> {user.phone}
                                        </div>
                                    )}
                                    {user.address && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <MapPin size={14} /> {user.address}
                                        </div>
                                    )}
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ width: '100%' }}>
                                    Editar perfil
                                </button>
                            </>
                        )}
                    </div>
                </aside>

                {/* Orders */}
                <main>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>
                        <Package size={24} style={{ color: 'var(--primary-400)' }} /> Mis Pedidos
                    </h2>

                    {loading ? (
                        <div className="loading-spinner" />
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><Package size={36} /></div>
                            <h2>No tenés pedidos aún</h2>
                            <p>Cuando hagas tu primera compra, aparecerá aquí</p>
                            <Link to="/catalogo" className="btn btn-primary">Ver Catálogo</Link>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} style={{ cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Pedido #{order.id}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(order.created_at)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className={`order-status ${order.status}`}>{orderStatusLabels[order.status] || order.status}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{formatPrice(order.total)}</span>
                                        {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>
                                {expandedOrder === order.id && order.items && (
                                    <div style={{ animation: 'fadeIn 0.2s ease' }}>
                                        {order.items.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
                                                <span>{item.name} x{item.quantity}</span>
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                        {order.shipping_address && (
                                            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <MapPin size={14} /> {order.shipping_address}, {order.shipping_city}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Package size={14} /> <span style={{ textTransform: 'capitalize' }}>{order.payment_method}</span>
                                                    {order.payment_status === 'approved' && <span className="status-pill status-approved" style={{ fontSize: '0.65rem' }}>PAGO OK</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </main>
            </div>
        </div>
    );
}
