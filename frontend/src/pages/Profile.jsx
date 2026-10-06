import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { validateProfileForm } from '../utils/validation';

const Profile = () => {
  const { updateProfile } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', role: '' });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const fetched = response.data.user;
        setProfile(fetched);
        setFormData({ name: fetched.name || '', email: fetched.email || '', phone: fetched.phone || '', address: fetched.address || '' });
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const validation = validateProfileForm(formData);
    if (!validation.valid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }

    setSaving(true);
    const result = await updateProfile(formData);
    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setProfile(result.user);
    setFormData({
      name: result.user.name || '',
      email: result.user.email || '',
      phone: result.user.phone || '',
      address: result.user.address || ''
    });
    setMessage('Profile updated successfully.');
    setEditing(false);
    setSaving(false);
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">My Profile</h1>
              <p className="text-slate-500 mt-2">View and update your account details from one place.</p>
            </div>
            <Button size="md" variant={editing ? 'outline' : 'primary'} onClick={() => setEditing((prev) => !prev)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="font-semibold text-xl text-slate-900">{profile.name}</h2>
                <p className="text-sm text-slate-500">{profile.role?.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-slate-500 uppercase tracking-[0.12em] text-[11px] mb-1">Email</p>
                <p className="font-medium text-slate-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-[0.12em] text-[11px] mb-1">Phone</p>
                <p className="font-medium text-slate-900">{profile.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-[0.12em] text-[11px] mb-1">Account ID</p>
                <p className="font-medium text-slate-900">{profile.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-xl text-slate-900">Profile details</h2>
                <p className="text-sm text-slate-500">Update the information that appears on your account.</p>
              </div>
              {message && (
                <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                  {message}
                </span>
              )}
            </div>

            {error && (
              <div className="mb-4 rounded-3xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {editing ? (
              <form className="space-y-5" onSubmit={handleSave}>
                <Input
                  id="name"
                  label="Full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  id="phone"
                  type="tel"
                  label="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Input
                  id="address"
                  type="text"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Button type="submit" fullWidth size="md" isLoading={saving}>
                    Save changes
                  </Button>
                  <Button type="button" variant="outline" fullWidth size="md" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-sm text-slate-600">
                <div>
                  <p className="text-slate-500 uppercase tracking-[0.12em] text-[11px] mb-1">Name</p>
                  <p className="font-medium text-slate-900">{profile.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-[0.12em] text-[11px] mb-1">Email</p>
                  <p className="font-medium text-slate-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-[0.12em] text-[11px] mb-1">Phone</p>
                  <p className="font-medium text-slate-900">{profile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-[0.12em] text-[11px] mb-1">Membership</p>
                  <p className="font-medium text-slate-900">{profile.role?.replace('_', ' ')}</p>
                </div>
                <div className="pt-4">
                  <Button onClick={() => setEditing(true)} fullWidth>
                    Edit profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
