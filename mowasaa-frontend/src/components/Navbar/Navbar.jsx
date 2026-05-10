import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🏥</span>
                    <span className="logo-text">Mowasaa</span>
                </Link>

                <div className="navbar-menu">
                    <Link 
                        to="/" 
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🔍</span>
                        Search
                    </Link>
                    
                    <Link 
                        to="/pharmacies" 
                        className={`nav-link ${location.pathname === '/pharmacies' ? 'active' : ''}`}
                    >
                        <span className="nav-icon">📍</span>
                        Pharmacies
                    </Link>
                    
                    <Link 
                        to="/admin" 
                        className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    >
                        <span className="nav-icon">⚙️</span>
                        Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;