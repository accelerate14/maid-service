import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../api';
import { validateResetPasswordForm } from '../utils/validation';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const validation = validateResetPasswordForm({ email, otp, password, confirmPassword });
    if (!validation.valid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }

    const submittedPassword = password;
    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', { email, otp, password: submittedPassword });
      setMessage(response.data.message);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to reset password');
      setPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-28">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[80px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[80px]"></div>
      </div>

      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-5 shadow-lg shadow-primary/30">
            S
          </div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Reset password</h1>
          <p className="mt-2 text-sm text-slate-500">Choose a new password for your account.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/50 p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm text-center border border-emerald-100">
                {message}
              </div>
            )}

            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="otp"
              type="text"
              label="One-time password"
              placeholder="123456"
              required
              autoComplete="one-time-code"
              spellCheck="false"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Input
              id="password"
              type="password"
              label="New password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              id="confirmPassword"
              type="password"
              label="Confirm new password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" fullWidth isLoading={loading}>
              Update password
            </Button>

            <div className="text-center text-sm pt-2">
              <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
