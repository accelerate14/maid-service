import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/50' 
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/30 group-hover:shadow-lg group-hover:shadow-primary/40 transition-shadow">
              S
            </div>
            <span className="font-heading font-bold text-xl text-slate-800 tracking-tight">
              Sparkle<span className="text-primary">Maid</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary bg-primary/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>
            {user && (
              <Link 
                to={user.role === 'admin' || user.role === 'service_manager' ? '/admin' : '/dashboard'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (isActive('/dashboard') || isActive('/admin')) ? 'text-primary bg-primary/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</span>
                    <span className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-red-500">
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50 animate-fade-in">
            <div className="flex flex-col gap-1">
              <Link to="/" className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Home</Link>
              {user ? (
                <>
                  <Link 
                    to={user.role === 'admin' || user.role === 'service_manager' ? '/admin' : '/dashboard'} 
                    className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button onClick={logout} className="px-4 py-3 rounded-lg text-sm font-medium text-left text-red-500 hover:bg-red-50 transition-colors">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Sign In</Link>
                  <Link to="/register" className="px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
