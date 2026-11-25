import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '6rem' }}>🚫</div>
      <div>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: '1rem 0 .5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
        <Home size={18} /> Go to Dashboard
      </Link>
    </div>
  );
}
