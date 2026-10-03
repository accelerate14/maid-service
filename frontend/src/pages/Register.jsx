import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { validateRegisterForm } from '../utils/validation';
import GoogleAuth from '../components/auth/GoogleAuth';


const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateRegisterForm(formData);
    if (!validation.valid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }

    setLoading(true);
    const result = await register(formData);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-28">
      {/* Background decorative */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[80px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[80px]"></div>
      </div>

      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-5 shadow-lg shadow-primary/30">
            S
          </div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join us to book premium maid services
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/50 p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            <Input
              id="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              id="phone"
              type="tel"
              label="Phone Number"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              id="address"
              type="text"
              label="Service Address"
              placeholder="123 Main St, Apt 4B"
              required
              value={formData.address}
              onChange={handleChange}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <Button type="submit" fullWidth isLoading={loading} className="mt-2">
              Create Account
            </Button>
            <GoogleAuth mode="signUp" />

            <div className="text-center text-sm pt-2">
              <span className="text-slate-500">Already have an account? </span>
              <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
