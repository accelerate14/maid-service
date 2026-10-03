import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Loader from './components/ui/Loader';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SmoothScrollProvider from './components/layout/SmoothScrollProvider';
import { AuthProvider } from './context/AuthContext';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BookingWizard = lazy(() => import('./pages/BookingWizard'));

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {!isAdminPage && <Navbar />}
      <main className="flex-1">
        <Suspense fallback={<Loader fullScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/dashboard/book/:serviceId" element={<BookingWizard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SmoothScrollProvider>
        <AppContent />
      </SmoothScrollProvider>
    </AuthProvider>
  );
}

export default App;
