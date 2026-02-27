import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Cpu } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="container" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty-state" style={{
                animation: 'fadeInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                padding: '60px 40px',
                borderRadius: 'var(--radius-2xl)',
                position: 'relative',
                overflow: 'hidden',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        color: 'var(--primary-500)',
                        marginBottom: '20px',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        <Cpu size={64} strokeWidth={1.5} />
                    </div>

                    <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(4rem, 10vw, 8rem)',
                        fontWeight: 900,
                        lineHeight: 1,
                        background: 'linear-gradient(to bottom, var(--text-primary), var(--text-muted))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-4px',
                        marginBottom: '16px',
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
                    }}>
                        404
                    </div>

                    <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 700 }}>
                        Falla en el Sistema
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        No pudimos encontrar el componente que estás buscando. La página parece haber sido descontinuada o la URL es incorrecta.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/" className="btn btn-primary btn-lg" style={{ minWidth: '160px', justifyContent: 'center' }}>
                            <Home size={20} /> Reiniciar
                        </Link>
                        <button onClick={() => window.history.back()} className="btn btn-ghost btn-lg" style={{ minWidth: '160px', justifyContent: 'center' }}>
                            <ArrowLeft size={20} /> Volver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
