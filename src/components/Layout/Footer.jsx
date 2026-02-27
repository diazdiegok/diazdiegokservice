import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">


                    <div className="footer-column">
                        <h4>Categorías</h4>
                        <ul>
                            <li><Link to="/catalogo?category=telefonos">Teléfonos</Link></li>
                            <li><Link to="/catalogo?category=notebooks">Notebooks</Link></li>
                            <li><Link to="/catalogo?category=tablets">Tablets</Link></li>
                            <li><Link to="/catalogo?category=smartwatches">Smartwatches</Link></li>
                            <li><Link to="/catalogo?category=parlantes">Parlantes</Link></li>
                            <li><Link to="/catalogo?category=accesorios">Accesorios</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Servicios</h4>
                        <ul>
                            <li><Link to="/reparaciones">Reparación de Celulares</Link></li>
                            <li><Link to="/reparaciones">Reparación de Notebooks</Link></li>
                            <li><Link to="/reparaciones">Diagnóstico Gratuito</Link></li>
                            <li><Link to="/catalogo">Ver Catálogo</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Contacto</h4>
                        <ul>
                            <li>
                                <a href="https://wa.me/5493435508586" target="_blank" rel="noopener noreferrer">
                                    <Phone size={14} /> 343-5508586
                                </a>
                            </li>
                            <li>
                                <a href="mailto:diazdiegonicok@gmail.com">
                                    <Mail size={14} /> diazdiegonicok@gmail.com
                                </a>
                            </li>
                            <li>
                                <div className="footer-contact-item">
                                    <MapPin size={16} />
                                    <span>Paraná, Entre Ríos, Argentina</span>
                                </div>
                            </li>
                        </ul>
                        <div className="footer-social">
                            <a href="https://wa.me/5493435508586" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                                <MessageCircle size={18} />
                            </a>
                            <a href="https://instagram.com/diazdiegokservice" target="_blank" rel="noopener noreferrer" title="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href="mailto:diazdiegonicok@gmail.com" title="Email">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} DiazDiegokService. Todos los derechos reservados.</p>
                    <div className="footer-bottom-links">
                        <span>Garantía Asegurada</span>
                        <span style={{ margin: '0 12px', opacity: 0.3 }}>|</span>
                        <span>Envíos a todo el país</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
