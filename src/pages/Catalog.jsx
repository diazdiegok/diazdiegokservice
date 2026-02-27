import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Grid3X3, Flame } from 'lucide-react';
import { productsAPI, formatPrice } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getCategoryIcon } from '../utils/categories';
import { ProductImageWithFallback } from '../components/Products/ProductImage';

// Debounce hook
function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export default function Catalog() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [sort, setSort] = useState('default');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const { addToCart, items: cartItems, getItemQuantity } = useCart();
    const toast = useToast();

    const activeCategory = searchParams.get('category') || '';
    const debouncedSearch = useDebounce(search, 400);

    useEffect(() => {
        productsAPI.getCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (activeCategory) params.category = activeCategory;
        if (debouncedSearch) params.search = debouncedSearch;
        if (sort !== 'default') params.sort = sort;

        productsAPI.getAll(params)
            .then(data => {
                // Client-side price filter
                let filtered = data;
                if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
                if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
                setProducts(filtered);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [activeCategory, sort, debouncedSearch, minPrice, maxPrice]);

    // Sync search with URL
    useEffect(() => {
        if (debouncedSearch) {
            searchParams.set('search', debouncedSearch);
        } else {
            searchParams.delete('search');
        }
        setSearchParams(searchParams, { replace: true });
    }, [debouncedSearch]);

    const handleCategoryClick = (slug) => {
        if (slug === activeCategory) {
            searchParams.delete('category');
        } else {
            searchParams.set('category', slug);
        }
        setSearchParams(searchParams);
    };

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
        <div className="container" style={{ paddingTop: '16px', paddingBottom: '80px' }}>
            <div className="page-header">
                <div className="breadcrumb">
                    <Link to="/">Inicio</Link> / <span>Catálogo</span>
                </div>
                <h1>Catálogo de Productos</h1>
                <p>Encontrá la mejor tecnología al mejor precio</p>
            </div>

            <div className="catalog-layout">
                {/* Sidebar Filters */}
                <aside className="catalog-sidebar">
                    <div className="filter-card">
                        <div className="filter-section">
                            <h3 className="filter-title">Búsqueda</h3>
                            <div className="search-bar">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="¿Qué buscas?"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            {(search || activeCategory || minPrice || maxPrice || sort !== 'default') && (
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', marginTop: 'var(--space-3)', padding: '8px', fontSize: '13px' }}
                                    onClick={() => {
                                        setSearch('');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setSort('default');
                                        searchParams.delete('category');
                                        searchParams.delete('search');
                                        setSearchParams(searchParams, { replace: true });
                                    }}
                                >
                                    Borrar todos los filtros
                                </button>
                            )}
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Categorías</h3>
                            <div className="filter-options">
                                <div
                                    className={`filter-option ${!activeCategory ? 'active' : ''}`}
                                    onClick={() => { searchParams.delete('category'); setSearchParams(searchParams); }}
                                >
                                    <Grid3X3 size={16} /> TODAS
                                </div>
                                {categories.map(cat => {
                                    const Icon = getCategoryIcon(cat.slug);
                                    return (
                                        <div
                                            key={cat.id}
                                            className={`filter-option ${activeCategory === cat.slug ? 'active' : ''}`}
                                            onClick={() => handleCategoryClick(cat.slug)}
                                        >
                                            <Icon size={16} /> {cat.name.toUpperCase()}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Precio</h3>
                            <div className="price-range-inputs">
                                <div className="price-input-wrapper">
                                    <span className="price-input-label">Mín</span>
                                    <span>$</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={e => setMinPrice(e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <div className="price-input-wrapper">
                                    <span className="price-input-label">Máx</span>
                                    <span>$</span>
                                    <input
                                        type="number"
                                        placeholder="Sin límite"
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Ordenar por</h3>
                            <select
                                className="sort-select"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="default">Más relevantes</option>
                                <option value="price_asc">Menor precio</option>
                                <option value="price_desc">Mayor precio</option>
                                <option value="newest">Más nuevos</option>
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <main className="catalog-main">
                    <div className="catalog-toolbar">
                        <p className="results-count">
                            {loading ? 'Buscando productos...' : (
                                <>
                                    Mostrando <strong>{products.length}</strong> producto{products.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </p>
                    </div>

                    {loading ? (
                        <div className="products-grid">
                            {[...Array(6)].map((_, i) => (
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
                    ) : products.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><Search size={48} /></div>
                            <h2>No encontramos coincidencias</h2>
                            <p>Probá ajustando los filtros o buscando con otras palabras.</p>
                            <button className="btn btn-secondary" onClick={() => {
                                setSearch('');
                                setMinPrice('');
                                setMaxPrice('');
                                searchParams.delete('category');
                                setSearchParams(searchParams);
                            }}>
                                Limpiar todo
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map((product, i) => (
                                <Link
                                    to={`/producto/${product.id}`}
                                    key={product.id}
                                    className={`card product-card tilt-hover ${product.stock === 0 ? 'out-of-stock' : ''}`}
                                    style={{ animationDelay: `${(i % 6) * 0.1}s`, animation: 'fadeInUp 0.5s ease both' }}
                                >
                                    <div className="product-card-image">
                                        {product.featured ? <span className="product-card-badge glow-pulse" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={14} /> HOT</span> : null}
                                        {product.stock === 0 && <span className="stock-badge">AGOTADO</span>}
                                        <ProductImageWithFallback product={product} size="card" />
                                    </div>
                                    <div className="product-card-body">
                                        <span className="product-card-category">{product.category_name}</span>
                                        <h3 className="product-card-name">{product.name}</h3>
                                        <div className="product-card-footer">
                                            <div className="product-price-container">
                                                <span className="product-card-price">{formatPrice(product.price)}</span>
                                                {product.stock > 0 && product.stock < 5 && (
                                                    <span className="stock-warning">¡Últimas {product.stock}!</span>
                                                )}
                                            </div>
                                            <button
                                                className={`btn btn-icon ${isInCart(product.id) ? 'btn-in-cart' : 'btn-primary'}`}
                                                onClick={(e) => handleAddToCart(e, product.id, product)}
                                                disabled={product.stock === 0}
                                                title="Agregar al carrito"
                                            >
                                                {isInCart(product.id) ? '✓' : '+'}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
