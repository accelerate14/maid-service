import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingManager from '../components/admin/BookingManager';
import Loader from '../components/ui/Loader';

const AdminDashboard = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return <Loader fullScreen />;

  if (!user || (user.role !== 'admin' && user.role !== 'service_manager')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Top Navbar */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/50 shadow-sm shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/30">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg text-slate-800 leading-tight tracking-tight">
                Sparkle<span className="text-primary">Maid</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-primary/70">Admin Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</span>
                <span className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-3 sticky top-28 shadow-sm">
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary font-semibold rounded-xl transition-all text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></rect><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line></svg>
                  Bookings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium rounded-xl transition-all text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  Staff
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium rounded-xl transition-all text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth="2"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-4">
            <BookingManager />
          </div>
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-200/50 bg-white/50 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} SparkleMaid Admin Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
