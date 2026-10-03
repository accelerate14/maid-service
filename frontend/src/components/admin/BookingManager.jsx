import React, { useState, useEffect } from 'react';
import api from '../../api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProviders, setSelectedProviders] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, providersRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/admin/providers')
      ]);
      setBookings(bookingsRes.data);
      setProviders(providersRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Ensure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (bookingId) => {
    const providerId = selectedProviders[bookingId];
    if (!providerId) return;

    try {
      await api.put(`/admin/bookings/${bookingId}/assign`, { provider_id: parseInt(providerId) });
      fetchData();
    } catch (err) {
      console.error('Failed to assign provider', err);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' };
      case 'assigned': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' };
      case 'completed': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' };
      case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
    }
  };

  if (loading) return <Loader />;
  if (error) return (
    <Card className="text-center py-12">
      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <p className="text-red-600 font-medium">{error}</p>
    </Card>
  );

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    assigned: bookings.filter(b => b.status === 'assigned').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Booking Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage all customer bookings and assign providers</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Assigned', value: stats.assigned, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 border border-slate-100`}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`font-heading text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-500">No bookings found in the system.</p>
          </Card>
        ) : (
          bookings.map((b, index) => {
            const sc = getStatusConfig(b.status);
            return (
              <Card 
                key={b.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Booking Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-heading font-bold text-primary text-sm">#{b.id}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-slate-900">{b.service_name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        👤 {b.customer_name} &nbsp;·&nbsp; 📅 {new Date(b.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {b.scheduled_time}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                        {b.provider_name && (
                          <span className="text-xs text-primary font-medium bg-primary/5 px-2.5 py-1 rounded-lg">
                            🧹 {b.provider_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto flex-shrink-0">
                    <div className="flex gap-2">
                      <select 
                        className="flex-1 lg:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
                        value={selectedProviders[b.id] || ''}
                        onChange={(e) => setSelectedProviders({...selectedProviders, [b.id]: e.target.value})}
                      >
                        <option value="">Select provider...</option>
                        {providers.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <Button 
                        size="sm" 
                        onClick={() => handleAssign(b.id)}
                        disabled={!selectedProviders[b.id]}
                      >
                        Assign
                      </Button>
                    </div>
                    
                    {b.status === 'assigned' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStatusChange(b.id, 'completed')}
                        className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400"
                      >
                        ✓ Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookingManager;
