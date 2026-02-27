import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Package, Settings, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { count } = useCart();
    const location = useLocation();
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
    }, [location]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!userMenuOpen) return;
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userMenuOpen]);

    const navLinks = [
        { to: '/', label: 'Inicio' },
        { to: '/catalogo', label: 'Catálogo' },
        { to: '/reparaciones', label: 'Reparaciones' },
        { to: '/rastreo', label: 'Rastreo de envíos', icon: Truck },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-inner">
                    <Link to="/" className="header-logo">
                        <span className="header-logo-text">DiazDiegok<span style={{ color: 'var(--primary-400)' }}>Technology</span></span>
                    </Link>

                    <nav className="header-nav">
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} className={`nav-link ${isActive(link.to) ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {link.label === 'Rastreo de envíos' ? (
                                    <>
                                        {link.label}
                                        {link.icon && <link.icon size={18} />}
                                    </>
                                ) : (
                                    <>
                                        {link.icon && <link.icon size={18} />}
                                        {link.label}
                                    </>
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="header-actions">
                        <Link to="/carrito" className="header-action-btn" title="Carrito">
                            <ShoppingCart size={22} />
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>

                        {user ? (
                            <div style={{ position: 'relative' }} ref={userMenuRef}>
                                <button className="header-action-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} title={user.name}>
                                    <User size={22} />
                                </button>
                                {userMenuOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '8px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-default)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '8px',
                                        minWidth: '200px',
                                        boxShadow: 'var(--shadow-xl)',
                                        zIndex: 'var(--z-dropdown)',
                                        animation: 'fadeInDown 0.2s ease'
                                    }}>
                                        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                        </div>
                                        <Link to="/perfil" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                            <Package size={16} /> Mis Pedidos
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                <Settings size={16} /> Admin Panel
                                            </Link>
                                        )}
                                        <button onClick={logout} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', color: 'var(--error)' }}>
                                            <LogOut size={16} /> Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">Ingresar</Link>
                        )}

                        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileOpen && (
                <>
                    <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)} />
                    <div className="mobile-menu">
                        <button className="mobile-menu-close header-action-btn" onClick={() => setMobileOpen(false)}>
                            <X size={24} />
                        </button>
                        {navLinks.map(link => (
                            <Link key={link.to} to={link.to} className={`nav-link ${isActive(link.to) ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {link.label === 'Rastreo de envíos' ? (
                                    <>
                                        {link.label}
                                        {link.icon && <link.icon size={20} />}
                                    </>
                                ) : (
                                    <>
                                        {link.icon && <link.icon size={20} />}
                                        {link.label}
                                    </>
                                )}
                            </Link>
                        ))}
                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />
                        {user ? (
                            <>
                                <Link to="/perfil" className="nav-link">Mis Pedidos</Link>
                                {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin Panel</Link>}
                                <button onClick={logout} className="nav-link" style={{ color: 'var(--error)' }}>Cerrar Sesión</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Ingresar</Link>
                                <Link to="/registro" className="nav-link">Crear Cuenta</Link>
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
