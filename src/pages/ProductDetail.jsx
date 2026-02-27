import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Package, Shield, ChevronRight, CheckCircle, Flame } from 'lucide-react';
import { productsAPI, formatPrice } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductImageWithFallback } from '../components/Products/ProductImage';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addToCart, items: cartItems, getItemQuantity } = useCart();
    const toast = useToast();

    const isInCart = product && cartItems.some(i => i.product_id === product.id);

    useEffect(() => {
        setLoading(true);
        productsAPI.getById(id)
            .then(data => {
                setProduct(data);
                document.title = `${data.name} — DiazDiegokTechnology`;
                return productsAPI.getAll({ category: data.category_slug, limit: 4 });
            })
            .then(data => setRelated(data.filter(p => String(p.id) !== String(id)).slice(0, 3)))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = async () => {
        try {
            await addToCart(product.id, quantity, product);
            toast.success(`${product.name} agregado al carrito 🛒`);
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '40px' }}><div className="loading-spinner" /></div>;
    if (!product) return (
        <div className="container"><div className="empty-state">
            <h2>Producto no encontrado</h2>
            <Link to="/catalogo" className="btn btn-primary">Volver al catálogo</Link>
        </div></div>
    );

    const specs = product.specs || {};

    return (
        <div className="product-detail-page">
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">Inicio</Link> / <Link to="/catalogo">Catálogo</Link> / <Link to={`/catalogo?category=${product.category_slug}`}>{product.category_name}</Link> / <span>{product.name}</span>
                </div>

                <div className="product-detail-container">
                    <div className="product-detail-gallery">
                        <div className="main-image-card" style={{ position: 'relative' }}>
                            {product.featured ? <span className="product-card-badge glow-pulse" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={14} /> HOT</span> : null}
                            <ProductImageWithFallback product={product} size="detail" />
                        </div>
                    </div>

                    <div className="product-detail-content">
                        <div className="product-header-info">
                            <span className="product-category-label">{product.category_name}</span>
                            <h1 className="product-title-main">{product.name}</h1>
                            <div className="product-price-tag">{formatPrice(product.price)}</div>
                        </div>

                        <div className="product-description-box">
                            <p>{product.description}</p>
                        </div>

                        {Object.keys(specs).length > 0 && (
                            <div className="product-specifications">
                                <h3>Especificaciones Técnicas</h3>
                                <div className="specs-list">
                                    {Object.entries(specs).map(([key, value]) => (
                                        <div key={key} className="spec-row">
                                            <span className="spec-label">{key}</span>
                                            <span className="spec-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="product-purchase-controls">
                            <div className="quantity-selector">
                                <span className="control-label">Cantidad:</span>
                                <div className="qty-controls">
                                    <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                    <span className="qty-number">{quantity}</span>
                                    <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={product.stock === 0}>+</button>
                                </div>
                                <span className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                                </span>
                            </div>

                            <div className="action-buttons-group">
                                <button
                                    className={`btn btn-primary btn-lg btn-buy ${isInCart ? 'btn-in-cart' : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                >
                                    {isInCart ? (
                                        <><CheckCircle size={20} /> En el carrito ({getItemQuantity(product.id)})</>
                                    ) : (
                                        <><ShoppingCart size={20} /> Agregar al carrito</>
                                    )}
                                </button>
                                <a
                                    href={`https://wa.me/5493435508586?text=Hola!%20Quiero%20consultar%20sobre%20${encodeURIComponent(product.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary btn-lg btn-whatsapp-detail"
                                >
                                    <MessageCircle size={20} /> Consultar
                                </a>
                            </div>
                        </div>

                        <div className="trust-badges">
                            <div className="badge-item">
                                <Package size={18} />
                                <span>Envíos rápidos en Paraná</span>
                            </div>
                            <div className="badge-item">
                                <Shield size={18} />
                                <span>Garantía Oficial</span>
                            </div>
                            <div className="badge-item">
                                <CheckCircle size={18} />
                                <span>Servicio Técnico Propio</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <div className="related-section">
                        <div className="section-title-wrapper">
                            <h2 className="section-title">Productos <span>Relacionados</span></h2>
                        </div>
                        <div className="products-grid related-grid">
                            {related.map((p, i) => (
                                <Link
                                    to={`/producto/${p.id}`}
                                    key={p.id}
                                    className={`card product-card ${p.stock === 0 ? 'out-of-stock' : ''}`}
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                >
                                    <div className="product-card-image">
                                        <ProductImageWithFallback product={p} size="card" />
                                    </div>
                                    <div className="product-card-body">
                                        <span className="product-card-category">{p.category_name}</span>
                                        <h3 className="product-card-name">{p.name}</h3>
                                        <div className="product-card-footer">
                                            <span className="product-card-price">{formatPrice(p.price)}</span>
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
