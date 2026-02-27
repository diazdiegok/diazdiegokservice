import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, ShoppingBag, Users, Plus, Edit2, Trash2,
    Save, X, LayoutDashboard, Settings, DollarSign,
    TrendingUp, Clock, ChevronRight, BarChart2, Wrench, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productsAPI, ordersAPI, adminAPI, repairsAPI, formatPrice, formatDate, orderStatusLabels } from '../services/api';
import { ProductImageWithFallback } from '../components/Products/ProductImage';
import '../styles/admin.css';

const PAYMENT_METHOD_LABELS = {
    mercadopago: { label: 'MercadoPago', icon: '💳' },
    modo: { label: 'MODO', icon: '📱' },
    transferencia: { label: 'Transferencia', icon: '🏦' },
    efectivo: { label: 'Efectivo', icon: '💵' },
};

function PaymentMethodBadge({ method }) {
    const info = PAYMENT_METHOD_LABELS[method] || { label: method || 'No especificado', icon: '❓' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
            borderRadius: '6px', color: 'var(--text-secondary)', letterSpacing: '0.3px'
        }}>
            {info.icon} {info.label.toUpperCase()}
        </span>
    );
}

export default function Admin() {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [salesChart, setSalesChart] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [repairs, setRepairs] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        loadInitialData();
    }, [user, navigate]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Use allSettled to be more resilient to individual endpoint failures
            const results = await Promise.allSettled([
                productsAPI.getAll(),
                productsAPI.getCategories(),
                ordersAPI.getAllAdmin(),
                adminAPI.getStats(),
                adminAPI.getSalesChart(),
                adminAPI.getTopProducts(),
                repairsAPI.getAllAdmin()
            ]);

            if (results[0].status === 'fulfilled') setProducts(results[0].value);
            if (results[1].status === 'fulfilled') setCategories(results[1].value);
            if (results[2].status === 'fulfilled') setOrders(results[2].value);
            if (results[3].status === 'fulfilled') setStats(results[3].value);
            if (results[4].status === 'fulfilled') setSalesChart(results[4].value);
            if (results[5].status === 'fulfilled') setTopProducts(results[5].value);
            if (results[6].status === 'fulfilled') setRepairs(results[6].value);

            if (results.some(r => r.status === 'rejected')) {
                console.error('Some data failed to load');
                toast.info('Algunos datos no se pudieron cargar, reintenta en un momento');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error crítico al cargar el panel');
        } finally {
            setLoading(false);
        }
    };

    const handleRepairStatusUpdate = async (id, status) => {
        try {
            await repairsAPI.updateStatus(id, status);
            toast.success('Estado de reparación actualizado');
            const repairList = await repairsAPI.getAllAdmin();
            setRepairs(repairList);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            await ordersAPI.updateStatus(orderId, status);
            toast.success('Pedido actualizado');
            // Refresh orders and stats
            const [ords, dashboardStats] = await Promise.all([
                ordersAPI.getAllAdmin(),
                adminAPI.getStats()
            ]);
            setOrders(ords);
            setStats(dashboardStats);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleMarkAsPaid = async (orderId) => {
        if (!window.confirm('¿Confirmar que el pedido fue pagado?')) return;
        try {
            await ordersAPI.markAsPaid(orderId);
            toast.success('Pedido marcado como pagado');
            // Refresh data
            const [ords, dashboardStats] = await Promise.all([
                ordersAPI.getAllAdmin(),
                adminAPI.getStats()
            ]);
            setOrders(ords);
            setStats(dashboardStats);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await productsAPI.delete(id);
            toast.success('Producto borrado');
            loadInitialData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSaveProduct = async () => {
        try {
            if (editingProduct.id) {
                await productsAPI.update(editingProduct.id, editingProduct);
            } else {
                await productsAPI.create(editingProduct);
            }
            toast.success('¡Operación exitosa! ✅');
            setEditingProduct(null);
            loadInitialData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!user || user.role !== 'admin') return null;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Productos', icon: ShoppingBag, count: products.length },
        { id: 'orders', label: 'Pedidos', icon: Package, count: orders.length },
        { id: 'repairs', label: 'Reparaciones', icon: Wrench, count: repairs.length },
        { id: 'categories', label: 'Categorías', icon: BarChart2, disabled: false, count: categories.length }
    ];

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => !item.disabled && setTab(item.id)}
                        className={`admin-nav-item ${tab === item.id ? 'active' : ''} ${item.disabled ? 'disabled-nav' : ''}`}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', opacity: 0.6 }}>
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
            </aside>

            <main className="admin-main-content">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="loading-spinner" /></div>
                ) : (
                    <>
                        {tab === 'dashboard' && stats && (
                            <section style={{ animation: 'fadeInUp 0.4s ease' }}>
                                <div className="admin-section-header">
                                    <div className="admin-section-title">
                                        <h2>Resumen General</h2>
                                        <p>Métricas clave de tu negocio hoy</p>
                                    </div>
                                    <div className="admin-actions">
                                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/catalogo')}>Ver Tienda</button>
                                    </div>
                                </div>

                                <div className="dashboard-grid">
                                    <div className="stat-card-v2">
                                        <div className="stat-card-header">
                                            <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-400)' }}>
                                                <DollarSign size={24} />
                                            </div>
                                            <span className="stat-trend trend-up">+12%</span>
                                        </div>
                                        <div className="stat-value-v2">{formatPrice(stats.revenue)}</div>
                                        <div className="stat-label-v2">Ingresos Totales</div>
                                    </div>

                                    <div className="stat-card-v2">
                                        <div className="stat-card-header">
                                            <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                                <ShoppingBag size={24} />
                                            </div>
                                            <span className="stat-trend trend-up">{stats.orders} total</span>
                                        </div>
                                        <div className="stat-value-v2">{stats.orders}</div>
                                        <div className="stat-label-v2">Pedidos Realizados</div>
                                    </div>

                                    <div className="stat-card-v2">
                                        <div className="stat-card-header">
                                            <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                                                <Clock size={24} />
                                            </div>
                                            <span className="stat-trend" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>Pendiente</span>
                                        </div>
                                        <div className="stat-value-v2">{stats.pendingOrders}</div>
                                        <div className="stat-label-v2">Pedidos por Procesar</div>
                                    </div>

                                    <div className="stat-card-v2">
                                        <div className="stat-card-header">
                                            <div className="stat-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                                                <Users size={24} />
                                            </div>
                                        </div>
                                        <div className="stat-value-v2">{stats.users}</div>
                                        <div className="stat-label-v2">Clientes Registrados</div>
                                    </div>
                                </div>

                                <div className="admin-analytics-row">
                                    {/* Sales Chart (CSS Based) */}
                                    <div className="admin-table-container analytics-card">
                                        <div className="card-header-v2">
                                            <h3>Tendencia de Ventas</h3>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Últimos 7 días</span>
                                        </div>
                                        <div className="analytics-chart-container">
                                            <div className="chart-y-axis">
                                                <span>{formatPrice(Math.max(...salesChart.map(d => d.total), 1000000))}</span>
                                                <span>{formatPrice(Math.max(...salesChart.map(d => d.total), 1000000) / 2)}</span>
                                                <span>$0</span>
                                            </div>
                                            <div className="chart-bars">
                                                {salesChart.map((day, idx) => {
                                                    const max = Math.max(...salesChart.map(d => d.total), 1);
                                                    const height = (day.total / max) * 100;
                                                    return (
                                                        <div key={idx} className="chart-bar-item">
                                                            <div className="bar-wrapper">
                                                                <div className="bar" style={{ height: `${height}%` }}>
                                                                    <div className="bar-tooltip">{formatPrice(day.total)}</div>
                                                                </div>
                                                            </div>
                                                            <span className="bar-label">{day.date.split('-').slice(1).reverse().join('/')}</span>
                                                        </div>
                                                    );
                                                })}
                                                {salesChart.length === 0 && (
                                                    <div className="empty-chart">Sin datos de ventas recientes</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Products */}
                                    <div className="admin-table-container analytics-card">
                                        <div className="card-header-v2">
                                            <h3>Artículos Estrella</h3>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Por ingresos</span>
                                        </div>
                                        <div className="top-products-list">
                                            {topProducts.map((p, idx) => {
                                                const maxRev = Math.max(...topProducts.map(tp => tp.total_revenue), 1);
                                                const width = (p.total_revenue / maxRev) * 100;
                                                return (
                                                    <div key={idx} className="top-product-item">
                                                        <div className="product-info">
                                                            <span className="product-name">{p.name}</span>
                                                            <span className="product-revenue">{formatPrice(p.total_revenue)}</span>
                                                        </div>
                                                        <div className="revenue-progress-bg">
                                                            <div className="revenue-progress-fill" style={{ width: `${width}%` }}></div>
                                                        </div>
                                                        <div className="product-footer">
                                                            <span>{p.total_sold} unidades vendidas</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {topProducts.length === 0 && (
                                                <div className="empty-chart">Sin ventas registradas</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
                                    {/* Recent Orders Overview */}
                                    <div className="admin-table-container">
                                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0 }}>Pedidos Recientes</h3>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setTab('orders')}>Ver Todos</button>
                                        </div>
                                        <table className="admin-table-v2">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Cliente</th>
                                                    <th>Total</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.slice(0, 5).map(order => (
                                                    <tr key={order.id}>
                                                        <td style={{ color: 'var(--text-muted)' }}>#{order.id}</td>
                                                        <td style={{ fontWeight: 600 }}>{order.user_name || order.shipping_name}</td>
                                                        <td style={{ color: 'var(--primary-400)', fontWeight: 700 }}>{formatPrice(order.total)}</td>
                                                        <td>
                                                            <span className={`status-pill status-${order.status}`}>
                                                                {orderStatusLabels[order.status]}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Quick Product Stats */}
                                    <div className="admin-table-container">
                                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0 }}>Stock Crítico</h3>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setTab('products')}>Gestionar</button>
                                        </div>
                                        <div style={{ padding: '4px' }}>
                                            {products.filter(p => p.stock < 5).slice(0, 6).map(p => (
                                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden' }}>
                                                        <ProductImageWithFallback product={p} size="cart" />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: p.stock === 0 ? 'var(--error)' : 'var(--warning)' }}>
                                                            {p.stock === 0 ? 'AGOTADO' : `Sólo ${p.stock} unidades`}
                                                        </div>
                                                    </div>
                                                    <button className="btn btn-ghost btn-xs" onClick={() => { setTab('products'); setEditingProduct(p); }}>
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {tab === 'products' && (
                            <section style={{ animation: 'fadeInRight 0.3s ease' }}>
                                <div className="admin-section-header">
                                    <div className="admin-section-title">
                                        <h2>Gestión de Stock</h2>
                                        <p>Editá catálogo, precios y disponibilidad</p>
                                    </div>
                                    <button className="btn btn-primary" onClick={() => setEditingProduct({ name: '', description: '', price: 0, stock: 0, category_id: categories[0]?.id, featured: 0 })}>
                                        <Plus size={18} /> Nuevo Producto
                                    </button>
                                </div>

                                {editingProduct && (
                                    <div className="edit-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-2xl)', padding: '32px', width: '100%', maxWidth: '800px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                                <h3>{editingProduct.id ? 'Refinar Producto' : 'Crear Nuevo Activo'}</h3>
                                                <button className="btn btn-ghost" onClick={() => setEditingProduct(null)}><X size={20} /></button>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <div className="form-group">
                                                        <label className="form-label">Nombre del Producto</label>
                                                        <input className="form-input" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Descripción Detallada</label>
                                                        <textarea className="form-input" rows={4} value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                        <div className="form-group">
                                                            <label className="form-label">Precio (centavos)</label>
                                                            <input className="form-input" type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) })} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">Stock Unidades</label>
                                                            <input className="form-input" type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    <div className="form-group">
                                                        <label className="form-label">Categoría</label>
                                                        <select className="form-input" value={editingProduct.category_id} onChange={(e) => setEditingProduct({ ...editingProduct, category_id: parseInt(e.target.value) })}>
                                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label">Imagen URL</label>
                                                        <input className="form-input" value={editingProduct.image_url || ''} onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })} />
                                                    </div>
                                                    <div style={{ flex: 1, border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {editingProduct.image_url ? (
                                                            <img src={editingProduct.image_url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin imagen</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-ghost" onClick={() => setEditingProduct(null)}>Descartar</button>
                                                <button className="btn btn-primary" onClick={handleSaveProduct}><Save size={18} /> Guardar Cambios</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="admin-table-container">
                                    <table className="admin-table-v2">
                                        <thead>
                                            <tr>
                                                <th>Vista</th>
                                                <th>Producto</th>
                                                <th>Categoría</th>
                                                <th>Precio</th>
                                                <th>Disponibilidad</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                                                        No se encontraron productos en el catálogo
                                                    </td>
                                                </tr>
                                            ) : products.map(p => (
                                                <tr key={p.id}>
                                                    <td>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                                            <ProductImageWithFallback product={p} size="cart" />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p.id}</div>
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)' }}>{p.category_name}</td>
                                                    <td style={{ fontWeight: 600 }}>{formatPrice(p.price)}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.stock > 0 ? 'var(--success)' : 'var(--error)' }}></div>
                                                            {p.stock} un.
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingProduct(p)}><Edit2 size={16} /></button>
                                                            <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteProduct(p.id)} style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {tab === 'orders' && (
                            <section style={{ animation: 'fadeInRight 0.3s ease' }}>
                                <div className="admin-section-header">
                                    <div className="admin-section-title">
                                        <h2>Ventas y Despachos</h2>
                                        <p>Monitoreá y procesá los pedidos de tus clientes</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {orders.length === 0 ? (
                                        <div className="stat-card-v2" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                            Todavía no hay pedidos registrados
                                        </div>
                                    ) : orders.map(order => (
                                        <div key={order.id} className="stat-card-v2" style={{ padding: '0', overflow: 'hidden' }}>
                                            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '44px', height: '44px', background: 'var(--bg-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-400)' }}>
                                                        #{order.id}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{order.user_name || order.shipping_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(order.created_at)} · {order.user_email || order.shipping_email}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{formatPrice(order.total)}</div>
                                                        <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                                                            {order.payment_status !== 'approved' && (
                                                                <button
                                                                    onClick={() => handleMarkAsPaid(order.id)}
                                                                    style={{
                                                                        padding: '2px 8px',
                                                                        fontSize: '0.65rem',
                                                                        borderRadius: '4px',
                                                                        background: 'var(--primary-400)',
                                                                        color: '#000',
                                                                        fontWeight: 700,
                                                                        border: 'none',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    MARCAR PAGADO
                                                                </button>
                                                            )}
                                                            {order.payment_status === 'approved' && (
                                                                <div className="status-pill status-approved" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>PAGO OK</div>
                                                            )}
                                                            <PaymentMethodBadge method={order.payment_method} />
                                                        </div>
                                                    </div>
                                                    <select
                                                        className="form-input"
                                                        style={{ width: 'auto', padding: '8px 12px', borderRadius: '10px' }}
                                                        value={order.status}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    >
                                                        {Object.entries(orderStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ padding: '20px' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '12px' }}>Productos</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {order.items?.map(item => (
                                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                                    <span><strong>{item.quantity}x</strong> {item.name}</span>
                                                                    <span style={{ color: 'var(--text-secondary)' }}>{formatPrice(item.price * item.quantity)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {order.shipping_address && (
                                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>Envío y Pago</h4>
                                                            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                                                <div>📍 {order.shipping_address}, {order.shipping_city}</div>
                                                                <div>👤 {order.shipping_name}</div>
                                                                <div>📞 {order.shipping_phone}</div>
                                                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                                                                    <PaymentMethodBadge method={order.payment_method} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {tab === 'repairs' && (
                            <section style={{ animation: 'fadeInRight 0.3s ease' }}>
                                <div className="admin-section-header">
                                    <div className="admin-section-title">
                                        <h2>Solicitudes de Taller</h2>
                                        <p>Gestioná los ingresos por reparaciones técnicas</p>
                                    </div>
                                </div>

                                <div className="admin-table-container">
                                    <table className="admin-table-v2">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Cliente</th>
                                                <th>Equipo</th>
                                                <th>Falla</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {repairs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                                                        No hay solicitudes de reparación pendientes
                                                    </td>
                                                </tr>
                                            ) : repairs.map(r => (
                                                <tr key={r.id}>
                                                    <td>{formatDate(r.created_at)}</td>
                                                    <td>
                                                        <div style={{ fontWeight: 700 }}>{r.customer_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.customer_email}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '0.9rem' }}><strong>{r.device_type}</strong></div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.device_brand} {r.device_model}</div>
                                                    </td>
                                                    <td style={{ maxWidth: '250px', fontSize: '0.85rem' }}>{r.issue_description}</td>
                                                    <td>
                                                        <select
                                                            className="form-input"
                                                            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                                                            value={r.status}
                                                            onChange={(e) => handleRepairStatusUpdate(r.id, e.target.value)}
                                                        >
                                                            <option value="pending">Pendiente</option>
                                                            <option value="in_progress">En reparacion</option>
                                                            <option value="completed">Listo / Entregado</option>
                                                            <option value="cancelled">Cancelado</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <a
                                                            href={`https://wa.me/${r.customer_phone?.replace(/\D/g, '')}?text=Hola%20${r.customer_name}!%20Te%20contacto%20de%20DiazDiegokService%20por%20tu%20${r.device_type}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-whatsapp btn-xs"
                                                            style={{ padding: '4px 8px' }}
                                                        >
                                                            <MessageCircle size={14} /> WhatsApp
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}
                        {tab === 'categories' && (
                            <section style={{ animation: 'fadeInRight 0.3s ease' }}>
                                <div className="admin-section-header">
                                    <div className="admin-section-title">
                                        <h2>Categorías del Sistema</h2>
                                        <p>Organización estructural de tus productos</p>
                                    </div>
                                    <button className="btn btn-ghost" disabled>
                                        <Plus size={18} /> Nueva Categoría (Próximamente)
                                    </button>
                                </div>

                                <div className="admin-table-container">
                                    <table className="admin-table-v2">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Slug</th>
                                                <th>Productos en esta categoría</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map(c => (
                                                <tr key={c.id}>
                                                    <td>{c.id}</td>
                                                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                                                    <td style={{ color: 'var(--text-muted)' }}>{c.slug}</td>
                                                    <td>{products.filter(p => p.category_id === c.id).length} ítems</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
