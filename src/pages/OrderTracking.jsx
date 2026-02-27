import { useState } from 'react';
import { ordersAPI, formatPrice, formatDate, orderStatusLabels } from '../services/api';
import { Package, Search, Mail, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function OrderTracking() {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderId || !email) return;

        setLoading(true);
        try {
            const data = await ordersAPI.trackById(orderId, email);
            setOrder(data);
        } catch (err) {
            toast.error(err.message);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '600px' }}>
            <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary-400)' }}>
                    <Search size={32} />
                </div>
                <h1>Seguí tu pedido</h1>
                <p>Ingresá los datos de tu compra para ver el estado actual</p>
            </div>

            <form onSubmit={handleTrack} className="stat-card-v2" style={{ padding: '32px', marginBottom: '40px' }}>
                <div className="form-group">
                    <label className="form-label">Número de Pedido</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>#</span>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: 123"
                            style={{ paddingLeft: '32px' }}
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Email con el que compraste</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Buscando...' : 'Consultar Estado'}
                </button>
            </form>

            {order && (
                <div className="stat-card-v2" style={{ padding: '0', overflow: 'hidden', animation: 'fadeInUp 0.4s ease' }}>
                    <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ESTADO DEL PEDIDO #{order.id}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className={`status-pill status-${order.status}`} style={{ fontSize: '1rem', padding: '4px 12px' }}>
                                    {orderStatusLabels[order.status]}
                                </div>
                                {order.payment_status === 'approved' && (
                                    <div className="status-pill status-approved" style={{ fontSize: '0.8rem' }}>PAGO OK</div>
                                )}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatPrice(order.total)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(order.created_at)}</div>
                        </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Productos</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            {order.items?.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                    <span><strong>{item.quantity}x</strong> {item.name}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                <MapPin size={16} className="text-primary" />
                                <span>{order.shipping_address}, {order.shipping_city}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                <Package size={16} className="text-primary" />
                                <span>Metodo de pago: <span style={{ textTransform: 'capitalize' }}>{order.payment_method}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
