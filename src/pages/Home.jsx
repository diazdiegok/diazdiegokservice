import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Shield, Zap, MessageCircle, MapPin, ChevronRight, Smartphone, Users, Star, Clock, Flame } from 'lucide-react';
import { productsAPI, formatPrice } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getCategoryIcon } from '../utils/categories';
import { ProductImageWithFallback } from '../components/Products/ProductImage';

const STATS = [
    { icon: Users, number: '500+', label: 'Clientes satisfechos' },
    { icon: Star, number: '4.9', label: 'Calificación promedio' },
    { icon: Wrench, number: '3+', label: 'Años de experiencia' },
    { icon: Clock, number: '24h', label: 'Respuesta en WhatsApp' },
];

function CategorySkeleton() {
    return (
        <div className="categories-grid">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-category-card">
                    <div className="skeleton skeleton-icon" />
                    <div className="skeleton skeleton-text" />
                </div>
            ))}
        </div>
    );
}

function ProductSkeleton() {
    return (
        <div className="products-grid">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-product-card">
                    <div className="skeleton skeleton-product-image" />
                    <div className="skeleton-product-body">
                        <div className="skeleton skeleton-line short" />
                        <div className="skeleton skeleton-line full" />
                        <div className="skeleton skeleton-line full" />
                        <div className="skeleton skeleton-line short" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, items: cartItems, getItemQuantity } = useCart();
    const toast = useToast();

    useEffect(() => {
        Promise.all([
            productsAPI.getAll({ featured: 'true', limit: 8 }),
            productsAPI.getCategories()
        ]).then(([prods, cats]) => {
            setFeatured(prods);
            setCategories(cats);
        }).catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const isInCart = (productId) => cartItems.some(i => i.product_id === productId);

    const handleAddToCart = async (e, productId, productData = null) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await addToCart(productId, 1, productData);
            toast.success('Producto agregado al carrito 🛒');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="hero-badge">
                                <Zap size={14} /> Envíos a todo el país ✈️
                            </div>
                            <h1 className="hero-title">
                                Tecnología Premium <span>al alcance de tu mano</span> en Paraná
                            </h1>
                            <p className="hero-subtitle">
                                Descubrí lo último en Apple, Samsung y las mejores marcas del mundo.
                                Calidad garantizada, asesoramiento personalizado y el mejor servicio técnico de la región.
                            </p>
                            <div className="hero-cta">
                                <Link to="/catalogo" className="btn btn-primary btn-lg">
                                    Explorar Catálogo <ArrowRight size={20} />
                                </Link>
                                <a href="https://wa.me/5493435508586?text=Hola!%20Quiero%20consultar%20sobre%20productos" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
                                    <MessageCircle size={20} /> Consultar WhatsApp
                                </a>
                            </div>
                            <div className="hero-location">
                                <MapPin size={16} /> Paraná, Entre Ríos, Argentina
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="hero-image-container">
                                <img
                                    src="/logo.png"
                                    alt="DiazDiegokService Technology"
                                    className="hero-main-img"
                                    style={{ borderRadius: '50%', objectFit: 'contain' }}
                                />
                                <div className="hero-blob" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {STATS.map(({ icon: Icon, number, label }) => (
                            <div key={label} className="stat-item">
                                <div className="stat-icon">
                                    <Icon size={22} />
                                </div>
                                <div className="stat-number">{number}</div>
                                <div className="stat-label">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Nuestras <span>Categorías</span></h2>
                        <p className="section-subtitle">Encontrá todo lo que necesitás en tecnología</p>
                    </div>
                    {loading ? <CategorySkeleton /> : (
                        <div className="categories-grid">
                            {categories.map((cat, i) => {
                                const Icon = getCategoryIcon(cat.slug);
                                return (
                                    <Link to={`/catalogo?category=${cat.slug}`} key={cat.id} className="category-card" style={{ animationDelay: `${i * 0.1}s`, animation: 'fadeInUp 0.5s ease both' }}>
                                        <div className="category-card-icon">
                                            <Icon size={28} />
                                        </div>
                                        <span className="category-card-name">{cat.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Productos <span>Destacados</span></h2>
                        <p className="section-subtitle">Los más vendidos y mejor calificados</p>
                    </div>
                    {loading ? <ProductSkeleton /> : (
                        <div className="products-grid">
                            {featured.map((product, i) => (
                                <Link
                                    to={`/producto/${product.id}`}
                                    key={product.id}
                                    className={`card product-card ${product.stock === 0 ? 'out-of-stock' : ''}`}
                                    style={{ animationDelay: `${i * 0.1}s`, animation: 'fadeInUp 0.5s ease both' }}
                                >
                                    <div className="product-card-image">
                                        {product.featured && <span className="product-card-badge glow-pulse" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={14} /> HOT</span>}
                                        {product.stock === 0 && <span className="stock-badge">Sin stock</span>}
                                        <ProductImageWithFallback product={product} size="card" />
                                    </div>
                                    <div className="product-card-body">
                                        <span className="product-card-category">{product.category_name}</span>
                                        <h3 className="product-card-name">{product.name}</h3>
                                        <p className="product-card-desc">{product.description}</p>
                                        <div className="product-card-footer">
                                            <span className="product-card-price">{formatPrice(product.price)}</span>
                                            <button
                                                className={`btn btn-sm ${isInCart(product.id) ? 'btn-in-cart' : 'btn-primary'}`}
                                                onClick={(e) => handleAddToCart(e, product.id, product)}
                                                disabled={product.stock === 0}
                                                title={product.stock === 0 ? 'Sin stock' : ''}
                                            >
                                                {isInCart(product.id) ? `✓ En carrito (${getItemQuantity(product.id)})` : 'Agregar'}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: '48px' }}>
                        <Link to="/catalogo" className="btn btn-secondary btn-lg">
                            Ver todo el catálogo <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Repairs / Services Section */}
            <section className="section services-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Servicio <span>Técnico</span></h2>
                        <p className="section-subtitle">Reparamos tu celular y notebook con garantía en Paraná</p>
                    </div>
                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon"><Smartphone size={28} /></div>
                            <h3>Reparación de Celulares</h3>
                            <p>Pantallas, baterías, puertos de carga, liberaciones, software y más. Todas las marcas y modelos.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon"><Wrench size={28} /></div>
                            <h3>Reparación de Notebooks</h3>
                            <p>Cambio de disco, memoria RAM, teclados, limpieza y mantenimiento.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon"><Zap size={28} /></div>
                            <h3>Diagnóstico Gratuito</h3>
                            <p>Te diagnosticamos tu equipo sin costo. Consultanos por WhatsApp o acercate a nuestro local.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon"><Shield size={28} /></div>
                            <h3>Garantía en Reparaciones</h3>
                            <p>Todas nuestras reparaciones cuentan con garantía. Trabajamos con repuestos de calidad.</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '48px' }}>
                        <a href="https://wa.me/5493435508586?text=Hola!%20Necesito%20reparar%20mi%20equipo" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                            <MessageCircle size={20} /> Consultá por tu reparación
                        </a>
                    </div>
                </div>
            </section>

            {/* WhatsApp Float Button */}
            <a href="https://wa.me/5493435508586?text=Hola!%20Quiero%20consultar" target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="Chateá con nosotros">
                <MessageCircle size={28} />
            </a>
        </div>
    );
}
