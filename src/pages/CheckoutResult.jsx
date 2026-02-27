import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ShoppingBag, Home, Copy, MessageCircle } from 'lucide-react';
import { ordersAPI } from '../services/api';

export function CheckoutSuccess() {
    const [params] = useSearchParams();
    const orderId = params.get('order_id');
    const [order, setOrder] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (orderId) {
            ordersAPI.getById(orderId).then(setOrder).catch(console.error);
        }
    }, [orderId]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isTransfer = order?.payment_method === 'transferencia';
    const isCash = order?.payment_method === 'efectivo';

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div className="checkout-result">
                <div className="checkout-result-icon success">
                    <CheckCircle size={48} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '12px' }}>
                    ¡Pedido confirmado!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '24px' }}>
                    Tu pedido #{orderId} fue registrado correctamente.
                </p>

                {(isTransfer || isCash) && (
                    <div className="stat-card-v2" style={{ maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left', border: '2px solid var(--primary-400)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={20} className="text-primary" />
                            {isTransfer ? 'Instrucciones de Transferencia' : 'Instrucciones de Pago en Efectivo'}
                        </h3>

                        {isTransfer ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Por favor, realizá la transferencia por el total y envianos el comprobante.</p>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alias</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>diazdiegokservice</span>
                                        <button onClick={() => handleCopy('diazdiegokservice')} className="btn btn-ghost btn-icon">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CVU</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>0000003100027551540180</span>
                                        <button onClick={() => handleCopy('0000003100027551540180')} className="btn btn-ghost btn-icon">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                {copied && <div style={{ color: 'var(--success)', fontSize: '0.8rem', textAlign: 'center' }}>¡Copiado al portapapeles!</div>}

                                <hr style={{ margin: '20px 0', borderColor: 'var(--border-subtle)' }} />

                                <a
                                    href={`https://wa.me/5493435508586?text=Hola!%20Envío%20el%20comprobante%20del%20pedido%20%23${orderId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-whatsapp"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <MessageCircle size={18} /> Enviar comprobante por WhatsApp
                                </a>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Acercate a nuestro local en Paraná para abonar en efectivo y retirar tu pedido.
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                                    📍 <strong>Ubicación:</strong> Paraná, Entre Ríos<br />
                                    ⏰ <strong>Horario:</strong> Consultanos por WhatsApp para coordinar el retiro.
                                </p>

                                <hr style={{ margin: '20px 0', borderColor: 'var(--border-subtle)' }} />

                                <a
                                    href={`https://wa.me/5493435508586?text=Hola!%20Realicé%20un%20pedido%20%23${orderId}%20para%20pagar%20en%20efectivo.%20Cuándo%20puedo%20pasar?`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-whatsapp"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <MessageCircle size={18} /> Coordinar retiro por WhatsApp
                                </a>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/perfil" className="btn btn-primary">
                        <ShoppingBag size={18} /> Ver mis pedidos
                    </Link>
                    <Link to="/" className="btn btn-secondary">
                        <Home size={18} /> Ir al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function CheckoutFailure() {
    const [params] = useSearchParams();
    const orderId = params.get('order_id');

    return (
        <div className="container">
            <div className="checkout-result">
                <div className="checkout-result-icon failure">
                    <XCircle size={48} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '12px' }}>
                    Pago no procesado
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '24px' }}>
                    Hubo un problema con tu pago. Podés intentar nuevamente o contactarnos por WhatsApp.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/carrito" className="btn btn-primary">Intentar de nuevo</Link>
                    <a href="https://wa.me/5493435508586?text=Hola!%20Tuve%20un%20problema%20con%20mi%20pago" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Contactar por WhatsApp</a>
                </div>
            </div>
        </div>
    );
}

export function CheckoutPending() {
    return (
        <div className="container">
            <div className="checkout-result">
                <div className="checkout-result-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                    <Clock size={48} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '12px' }}>Pago pendiente</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '24px' }}>
                    Tu pago está siendo procesado. Te notificaremos cuando se acredite.
                </p>
                <Link to="/perfil" className="btn btn-primary"><ShoppingBag size={18} /> Ver mis pedidos</Link>
            </div>
        </div>
    );
}
