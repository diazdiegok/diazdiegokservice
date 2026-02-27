import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (form.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setLoading(true);
        try {
            await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
            toast.success('¡Cuenta creada exitosamente! 🎉');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            <div className="form-card">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <img src="/logo.png" alt="DiazDiegokService" style={{ height: '60px', margin: '0 auto 16px' }} />
                </div>
                <h1 className="form-title">Crear Cuenta</h1>
                <p className="form-subtitle">Registrate para comprar y recibir ofertas exclusivas</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nombre completo</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" required style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Teléfono (opcional)</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="343-5508586" style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="form-input" type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                                onChange={handleChange} placeholder="Mínimo 6 caracteres" required style={{ paddingLeft: '40px', paddingRight: '40px' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmar contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="form-input" type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword}
                                onChange={handleChange} placeholder="Repetí la contraseña" required style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                        {loading ? 'Creando cuenta...' : <><UserPlus size={18} /> Crear cuenta</>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/login" style={{ color: 'var(--primary-400)', fontWeight: 500 }}>Iniciar sesión</Link>
                </p>

                <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                    O REGISTRARSE CON
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`}>
                        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" style={{ height: '18px' }} /> Google
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/facebook`}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> Facebook
                    </button>
                </div>
            </div>
        </div>
    );
}
