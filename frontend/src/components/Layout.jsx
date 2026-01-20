import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Projects', icon: '📁' },
        { path: '/tasks', label: 'Tasks', icon: '✓' },
        { path: '/project-view', label: 'Matrix View', icon: '📊' },
        { path: '/companies', label: 'Companies', icon: '🏢' },
        { path: '/customers', label: 'Customers', icon: '👥' },
        { path: '/tags', label: 'Tags', icon: '🏷️' },
    ];

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="app-title">
                        <span className="app-icon">📝</span>
                        Brag Doc
                    </h1>
                    <p className="app-subtitle">Track Your Achievements</p>
                </div>

                <nav className="nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <p className="text-xs text-muted">v1.0.0</p>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
