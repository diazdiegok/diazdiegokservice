import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';
import { ProductImageWithFallback } from '../components/Products/ProductImage';

export default function Cart() {
    const { items, total, count, updateQuantity, removeItem, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '55vh',
                    textAlign: 'center',
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '60px 48px',
                        maxWidth: '520px',
                        width: '100%',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-60px', left: '50%',
                            transform: 'translateX(-50%)',
                            width: '300px', height: '300px',
                            background: 'radial-gradient(circle, rgba(76,175,80,0.12) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />
                        <div style={{
                            width: '90px', height: '90px',
                            background: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 28px',
                            border: '2px solid rgba(76,175,80,0.3)',
                            animation: 'float 3s ease-in-out infinite',
                        }}>
                            <ShoppingBag size={40} strokeWidth={1.5} style={{ color: 'var(--primary-400)' }} />
                        </div>
                        <h1 style={{
                            fontSize: '1.8rem', fontWeight: 800,
                            color: 'var(--text-primary)',
                            marginBottom: '12px', letterSpacing: '-0.5px',
                        }}>
                            Tu carrito está vacío
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)', fontSize: '1rem',
                            lineHeight: 1.6, marginBottom: '36px', maxWidth: '360px', margin: '0 auto 36px',
                        }}>
                            Explorá nuestro catálogo y encontrá la tecnología que necesitás. ¡Tenemos las mejores marcas!
                        </p>
                        <Link to="/catalogo" className="btn btn-primary btn-lg" style={{ padding: '14px 40px', fontSize: '1rem' }}>
                            <ShoppingCart size={20} /> Ver Catálogo
                        </Link>
                        <div style={{
                            display: 'flex', gap: '12px', marginTop: '36px',
                            justifyContent: 'center', flexWrap: 'wrap',
                        }}>
                            {[
                                { emoji: '🚚', text: 'Envíos a todo el país' },
                                { emoji: '🔒', text: 'Compra segura' },
                                { emoji: '⭐', text: 'Garantía asegurada' },
                            ].map(({ emoji, text }) => (
                                <div key={text} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.78rem', color: 'var(--text-muted)',
                                    background: 'rgba(255,255,255,0.04)',
                                    borderRadius: '20px', padding: '6px 14px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}>
                                    <span>{emoji}</span> {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '16px', paddingBottom: '80px' }}>
            <div className="page-header">
                <div className="breadcrumb">
                    <Link to="/">Inicio</Link> / <span>Carrito</span>
                </div>
                <h1>Carrito de Compras</h1>
                <p>{count} producto{count !== 1 ? 's' : ''} en tu carrito</p>
            </div>

            <div className="cart-container">
                <div className="cart-items">
                    {items.map((item, i) => (
                        <div key={item.id} className="cart-item" style={{ animation: `fadeInUp 0.3s ease ${i * 0.05}s both` }}>
                            <div className="cart-item-image">
                                <ProductImageWithFallback product={item} size="cart" />
                            </div>
                            <div className="cart-item-info">
                                <div>
                                    <Link to={`/producto/${item.product_id}`} className="cart-item-name" style={{ textDecoration: 'none' }}>
                                        {item.name}
                                    </Link>
                                    <div className="cart-item-price">{formatPrice(item.price)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div className="cart-item-controls">
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                            <Minus size={14} />
                                        </button>
                                        <span className="cart-item-qty">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
                                        <button className="btn btn-ghost btn-icon" onClick={() => removeItem(item.id)} title="Eliminar">
                                            <Trash2 size={18} style={{ color: 'var(--error)' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={clearCart} className="btn btn-ghost" style={{ color: 'var(--error)', alignSelf: 'flex-start' }}>
                        <Trash2 size={16} /> Vaciar carrito
                    </button>
                </div>

                <div className="cart-summary">
                    <h3>Resumen de compra</h3>
                    <div className="cart-summary-row">
                        <span>Productos ({count})</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Envío</span>
                        <span style={{ color: 'var(--success)' }}>A coordinar</span>
                    </div>
                    <div className="cart-summary-total">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                    <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px' }}>
                        Continuar pago <ArrowRight size={20} />
                    </Link>
                    <Link to="/catalogo" className="btn btn-ghost" style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}>
                        Seguir comprando
                    </Link>
                </div>
            </div>
        </div>
    );
}
