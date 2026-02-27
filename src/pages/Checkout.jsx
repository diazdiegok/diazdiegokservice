import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, MapPin, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI, paymentsAPI, formatPrice } from '../services/api';

const PAYMENT_METHODS = [
    {
        id: 'mercadopago',
        label: 'MercadoPago',
        description: 'Tarjeta de crédito/débito, cuotas y más',
        icon: '💳',
        online: true,
    },
    {
        id: 'modo',
        label: 'MODO',
        description: 'Pagá con tu billetera digital MODO',
        icon: '📱',
        online: true,
    },
    {
        id: 'transferencia',
        label: 'Transferencia',
        description: 'CBU/CVU · Te enviamos el alias por email',
        icon: '🏦',
        online: false,
    },
    {
        id: 'efectivo',
        label: 'Efectivo',
        description: 'Coordinamos el pago en persona',
        icon: '💵',
        online: false,
    },
];

export default function Checkout() {
    const { items, total } = useCart();
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        shipping_name: user?.name || '',
        shipping_email: user?.email || '',
        shipping_address: user?.address || '',
        shipping_city: user?.city || 'Paraná, Entre Ríos',
        shipping_phone: user?.phone || '',
        notes: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('mercadopago');
    const [submitting, setSubmitting] = useState(false);

    if (!user && items.length === 0) {
        navigate('/catalogo');
        return null;
    }

    if (items.length === 0) {
        return (
            <div className="container">
                <div className="empty-state">
                    <h2>No hay productos en el carrito</h2>
                    <Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'shipping_phone') {
            setForm({ ...form, [name]: value.replace(/[^0-9]/g, '') });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.shipping_name || !form.shipping_address || !form.shipping_phone) {
            toast.error('Completá todos los campos obligatorios');
            return;
        }

        setSubmitting(true);
        try {
            const orderData = { ...form, payment_method: paymentMethod };
            if (!user) orderData.items = items;

            const order = await ordersAPI.create(orderData);
            toast.success('Pedido creado correctamente ✅');

            const isOnline = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.online;

            if (isOnline) {
                try {
                    const preference = await paymentsAPI.createPreference(order.id);
                    if (preference.init_point) {
                        window.location.href = preference.init_point;
                        return;
                    }
                } catch (mpErr) {
                    console.warn('MercadoPago not configured or failed:', mpErr.message);
                    toast.error('No se pudo conectar con MercadoPago. Contactanos por WhatsApp para coordinar el pago.');
                }
            }

            navigate(`/checkout/success?order_id=${order.id}`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

    return (
        <div className="container" style={{ paddingTop: '16px', paddingBottom: '80px' }}>
            <div className="page-header">
                <div className="breadcrumb">
                    <Link to="/">Inicio</Link> / <Link to="/carrito">Carrito</Link> / <span>Checkout</span>
                </div>
                <h1>Finalizar Compra</h1>
            </div>

            <div className="cart-container">
                <form onSubmit={handleSubmit} style={{ animation: 'fadeInUp 0.4s ease' }}>

                    {/* ── Shipping ── */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '24px', marginBottom: '24px' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} style={{ color: 'var(--primary-400)' }} /> Datos de envío
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Nombre completo *</label>
                                <input className="form-input" name="shipping_name" value={form.shipping_name} onChange={handleChange} placeholder="Tu nombre completo" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email de contacto *</label>
                                <input className="form-input" name="shipping_email" type="email" value={form.shipping_email} onChange={handleChange} placeholder="nombre@ejemplo.com" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Dirección *</label>
                            <input className="form-input" name="shipping_address" value={form.shipping_address} onChange={handleChange} placeholder="Calle y número" required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Ciudad</label>
                                <input className="form-input" name="shipping_city" value={form.shipping_city} onChange={handleChange} placeholder="Ciudad" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono *</label>
                                <input className="form-input" name="shipping_phone" value={form.shipping_phone} onChange={handleChange} placeholder="Tu teléfono" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notas (opcional)</label>
                            <textarea className="form-input" name="notes" value={form.notes} onChange={handleChange} placeholder="Instrucciones adicionales..." rows={3} style={{ resize: 'vertical' }} />
                        </div>
                    </div>

                    {/* ── Payment Method ── */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={20} style={{ color: 'var(--primary-400)' }} /> Método de pago
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                            Elegí cómo querés abonar tu pedido
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {PAYMENT_METHODS.map(method => {
                                const isSelected = paymentMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '14px',
                                            padding: '16px',
                                            background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                                            border: `2px solid ${isSelected ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                                            borderRadius: 'var(--radius-lg)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.6rem', lineHeight: 1, filter: isSelected ? 'none' : 'grayscale(30%)' }}>
                                            {method.icon}
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: 700,
                                                fontSize: '0.95rem',
                                                color: isSelected ? 'var(--primary-400)' : 'var(--text-primary)',
                                                marginBottom: '3px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                flexWrap: 'wrap'
                                            }}>
                                                {method.label}
                                                {method.online && (
                                                    <span style={{ fontSize: '0.6rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-400)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>
                                                        ONLINE
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                {method.description}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                background: 'var(--primary-400)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <CheckCircle size={12} color="#0a0a0a" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Context message */}
                        {(paymentMethod === 'mercadopago' || paymentMethod === 'modo') && (
                            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                                🔒 Al confirmar serás redirigido a <strong>MercadoPago</strong> donde podrás elegir tarjeta, cuotas y MODO de forma segura.
                            </div>
                        )}
                        {paymentMethod === 'transferencia' && (
                            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                                🏦 Una vez confirmado el pedido te enviaremos el <strong>CBU/CVU y alias</strong> al email indicado para que realices la transferencia.
                            </div>
                        )}
                        {paymentMethod === 'efectivo' && (
                            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                                💵 Nos comunicaremos con vos para <strong>coordinar el pago y la entrega</strong> en persona.
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: '24px' }}
                        disabled={submitting}
                    >
                        {submitting ? 'Procesando...' : (
                            selectedMethod?.online
                                ? `Confirmar y pagar con ${selectedMethod.label} →`
                                : 'Confirmar pedido'
                        )}
                    </button>
                </form>

                {/* Order Summary */}
                <div className="cart-summary">
                    <h3>Tu pedido</h3>
                    {items.map(item => (
                        <div key={item.id} className="cart-summary-row" style={{ fontSize: '0.9rem' }}>
                            <span>{item.name} x{item.quantity}</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    <div className="cart-summary-total">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    {selectedMethod && (
                        <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                            <span>{selectedMethod.icon}</span>
                            <span><strong>{selectedMethod.label}</strong> seleccionado</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
