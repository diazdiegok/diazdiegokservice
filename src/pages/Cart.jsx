import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';
import { ProductImageWithFallback } from '../components/Products/ProductImage';

export default function Cart() {
    const { items, total, count, updateQuantity, removeItem, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="container">
                <div className="empty-state">
                    <div className="empty-state-icon"><ShoppingBag size={36} /></div>
                    <h2>Tu carrito está vacío</h2>
                    <p>Agregá productos desde nuestro catálogo para empezar</p>
                    <Link to="/catalogo" className="btn btn-primary">Ver Catálogo</Link>
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
