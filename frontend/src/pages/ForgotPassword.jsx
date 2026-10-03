import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../api';
import { validateForgotPasswordForm } from '../utils/validation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const validation = validateForgotPasswordForm({ email });
    if (!validation.valid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to process request');
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
          <h1 className="font-heading text-3xl font-bold text-slate-900">Forgot password?</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your email and we’ll help you reset it.</p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" fullWidth isLoading={loading}>
              Send reset instructions
            </Button>

            {message && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-medium text-slate-700">Next step</p>
                <p className="mt-1">Open the reset page and enter the OTP sent to your inbox.</p>
                <Link
                  to={`/reset-password?email=${encodeURIComponent(email)}`}
                  className="mt-3 inline-flex font-semibold text-primary hover:text-primary-dark"
                >
                  Continue to reset password
                </Link>
              </div>
            )}

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

export default ForgotPassword;
