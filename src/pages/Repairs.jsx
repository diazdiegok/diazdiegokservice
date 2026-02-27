import { useState } from 'react';
import { Smartphone, Laptop, Wrench, Shield, Zap, MessageCircle, CheckCircle, MapPin, Send, Star } from 'lucide-react';
import { repairsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Repairs() {
    const { user } = useAuth();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        device_type: 'Celular',
        device_brand: '',
        device_model: '',
        issue_description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await repairsAPI.create(form);
            toast.success('¡Solicitud enviada! Te contactaremos pronto.');
            setForm({
                ...form,
                device_brand: '',
                device_model: '',
                issue_description: ''
            });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ paddingBottom: '100px', overflowX: 'hidden' }}>
            {/* Background Decorations */}
            <div style={{ position: 'fixed', top: '10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '10%', left: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />

            {/* Hero Section */}
            <section style={{ padding: '80px 0 60px', position: 'relative' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--primary-400)',
                            padding: '8px 16px',
                            borderRadius: '100px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginBottom: '24px',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            animation: 'fadeInDown 0.5s ease'
                        }}>
                            <Wrench size={14} /> Servicio Técnico Premium en Paraná
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: '20px',
                            letterSpacing: '-0.02em',
                            animation: 'fadeInUp 0.6s ease'
                        }}>
                            Reparamos tus <span style={{ color: 'var(--primary-400)' }}>Dispositivos</span><br />
                            con Calidad Garantizada
                        </h1>
                        <p style={{
                            fontSize: '1.2rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: 1.6,
                            animation: 'fadeInUp 0.7s ease'
                        }}>
                            Diagnóstico especializado para celulares, notebooks y tablets.
                            Repuestos originales para que tu equipo vuelva a estar como nuevo.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
                    gap: '40px',
                    alignItems: 'stretch' // Balanced height for both columns
                }}>
                    {/* Main Form Card */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '28px',
                        padding: '40px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        animation: 'fadeInLeft 0.8s ease',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MessageCircle size={28} style={{ color: 'var(--primary-400)' }} /> Pedir Presupuesto
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Completá el formulario y te enviaremos una estimación gratuita.</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Nombre Completo</label>
                                    <input
                                        className="form-input"
                                        style={{ background: 'rgba(0,0,0,0.25)', height: '50px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                                        value={form.customer_name}
                                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                        required
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Teléfono / WhatsApp</label>
                                    <input
                                        className="form-input"
                                        style={{ background: 'rgba(0,0,0,0.25)', height: '50px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                                        value={form.customer_phone}
                                        onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                                        placeholder="Ej: 343555..."
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ background: 'rgba(0,0,0,0.25)', height: '50px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                                    value={form.customer_email}
                                    onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                                    required
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                padding: '24px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Detalles del Equipo</h3>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Tipo de Equipo</label>
                                    <select
                                        className="form-input"
                                        style={{
                                            background: 'rgba(0,0,0,0.25)',
                                            height: '50px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                        value={form.device_type}
                                        onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                                    >
                                        <option value="Celular" style={{ background: '#1a1a1a', color: 'white' }}>📱 Celular</option>
                                        <option value="Notebook" style={{ background: '#1a1a1a', color: 'white' }}>💻 Notebook</option>
                                        <option value="Tablet" style={{ background: '#1a1a1a', color: 'white' }}>📟 Tablet</option>
                                        <option value="Otro" style={{ background: '#1a1a1a', color: 'white' }}>❓ Otro</option>
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Marca</label>
                                        <input
                                            className="form-input"
                                            style={{ background: 'rgba(0,0,0,0.25)', height: '50px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                                            placeholder="Ej: Samsung, Apple"
                                            value={form.device_brand}
                                            onChange={(e) => setForm({ ...form, device_brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Modelo</label>
                                        <input
                                            className="form-input"
                                            style={{ background: 'rgba(0,0,0,0.25)', height: '50px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                                            placeholder="Ej: Galaxy S23, iPhone 14"
                                            value={form.device_model}
                                            onChange={(e) => setForm({ ...form, device_model: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Descripción del Problema</label>
                                <textarea
                                    className="form-input"
                                    style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
                                    rows="4"
                                    placeholder="Contanos qué le pasa al equipo (ej: pantalla rota, no enciende, problemas de carga)..."
                                    value={form.issue_description}
                                    onChange={(e) => setForm({ ...form, issue_description: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                style={{
                                    height: '56px',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)'
                                }}
                                disabled={submitting}
                            >
                                {submitting ? 'Enviando...' : <><Send size={20} /> Solicitar Presupuesto Gratis</>}
                            </button>
                        </form>
                    </div>

                    {/* Sidebar: Benefits & Contact */}
                    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: '24px', animation: 'fadeInRight 0.8s ease' }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '28px',
                            padding: '32px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>¿Por qué nosotros?</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {[
                                    { icon: Shield, title: 'Garantía Escrita', desc: 'Certificamos cada trabajo para tu tranquilidad.' },
                                    { icon: Zap, title: 'Servicio Express', desc: 'Reparamos lo más común en el día.' },
                                    { icon: Star, title: 'Repuestos Originales', desc: 'Calidad superior en cada componente.' },
                                    { icon: MapPin, title: 'Atención Local', desc: 'Retiro y entrega en nuestro local de Paraná.' }
                                ].map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div style={{
                                            minWidth: '42px',
                                            height: '42px',
                                            background: 'rgba(59, 130, 246, 0.08)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary-400)',
                                            border: '1px solid rgba(59, 130, 246, 0.1)'
                                        }}>
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '3px' }}>{item.title}</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* WhatsApp CTA Card - Refined Emerald Design */}
                        <div style={{
                            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.05) 100%)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '28px',
                            padding: '36px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative blur circle */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '100px',
                                height: '100px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                borderRadius: '50%',
                                filter: 'blur(40px)'
                            }} />

                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(16, 185, 129, 0.2)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#10B981',
                                marginBottom: '24px',
                                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.1)'
                            }}>
                                <MessageCircle size={32} />
                            </div>

                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Atención al Instante</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                                ¿Mucha urgencia? Escribinos ahora por WhatsApp y te respondemos en minutos.
                            </p>
                            <a
                                href="https://wa.me/5493435508586"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    height: '56px',
                                    borderRadius: '16px',
                                    fontWeight: 700,
                                    background: '#10B981',
                                    border: 'none',
                                    boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <MessageCircle size={20} /> Chatear ahora
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* List of Services */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 850, marginBottom: '12px' }}>Servicios Destacados</h2>
                        <div style={{ width: '60px', height: '4px', background: 'var(--primary-400)', margin: '0 auto', borderRadius: '2px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                        {[
                            {
                                icon: Smartphone,
                                title: 'Celulares',
                                items: ['Cambio de pantalla / display', 'Baterías con garantía', 'Puerto de carga (Pin)', 'Placa y micro-soldadura', 'Software y desbloqueos']
                            },
                            {
                                icon: Laptop,
                                title: 'Notebooks',
                                items: ['Cambio a Disco Sólido (SSD)', 'Upgrade de Memoria RAM', 'Teclados y Touchpads', 'Limpieza y Pasta Térmica', 'Reparación de bisagras']
                            }
                        ].map((category, idx) => (
                            <div key={idx} style={{
                                background: 'var(--bg-card)',
                                borderRadius: '24px',
                                padding: '40px',
                                border: '1px solid var(--border-subtle)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.03 }}>
                                    <category.icon size={150} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ width: '56px', height: '56px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                                        <category.icon size={28} />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{category.title}</h3>
                                </div>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {category.items.map((item, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                            <CheckCircle size={16} style={{ color: 'var(--primary-400)', flexShrink: 0 }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
