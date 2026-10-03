import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ServiceListing from '../components/ServiceListing';
import MyBookings from '../components/MyBookings';
import LiveStatus from '../components/LiveStatus';
import Loader from '../components/ui/Loader';
import Profile from './Profile';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('services');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      setShowSuccess(true);
      setActiveTab('bookings');
      // Clean up state
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace />;

  const tabs = [
    { id: 'services', label: 'Book a Service', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    )},
    { id: 'bookings', label: 'My Bookings', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    )},
    { id: 'profile', label: 'My Profile', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><path d="M16 3.13a4 4 0 1 1-8 0"/></svg>
    )}
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-slide-up">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="font-heading font-bold text-emerald-900 text-sm">Booking Confirmed!</p>
              <p className="text-emerald-700 text-xs">Your request has been sent to the provider. You can track it in My Bookings.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="ml-auto text-emerald-400 hover:text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">
            Welcome back, <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-slate-500 mt-2">Manage your cleaning services and bookings here.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white/60 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/50 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'services' ? <ServiceListing /> : activeTab === 'bookings' ? <MyBookings /> : <Profile />}
        </div>
      </div>
      
      {/* Global Live Status component */}
      <LiveStatus />
    </div>
  );
};

export default Dashboard;
