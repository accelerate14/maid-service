import React, { useState, useEffect } from 'react';
import api from '../api';
import Card from './ui/Card';
import Loader from './ui/Loader';
import Leaflet from './Leaflet';
import { formatINR } from '../utils/currency';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Add state to store current browser location
  const [userLocation, setUserLocation] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/customer/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // 2. Fetch current browser position on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error/denied:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    const handleUpdate = () => fetchBookings();
    window.addEventListener('booking-updated', handleUpdate);
    return () => window.removeEventListener('booking-updated', handleUpdate);
  }, []);

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

  if (bookings.length === 0) {
    return (
      <Card className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>
        <h3 className="font-heading text-lg font-semibold text-slate-800">No bookings yet</h3>
        <p className="text-slate-500 text-sm mt-2">When you book a service, it will appear here.</p>
      </Card>
    );
  }

  // 3. Coordinate Priority: First Booking location -> Browser Location -> Default Fallback
  const firstBooking = bookings[0];
  const activeLat = firstBooking?.address_lat ? parseFloat(firstBooking.address_lat) : userLocation?.lat ?? 51.505;
  const activeLng = firstBooking?.address_lng ? parseFloat(firstBooking.address_lng) : userLocation?.lng ?? -0.09;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-slate-900">My Bookings</h2>
        <p className="text-sm text-slate-500 mt-1">Track the status of your cleaning services</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking, index) => {
          const sc = getStatusConfig(booking.status);
          return (
            <Card 
              key={booking.id} 
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900">{booking.service_name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    📅 {new Date(booking.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {booking.scheduled_time}
                  </p>
                  {booking.address && (
                    <p className="text-sm text-slate-500 mt-1 break-words">📍 {booking.address}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {booking.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Credit Card'} 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${booking.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {booking.payment_status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <span className="font-heading text-lg font-bold text-slate-900">{formatINR(booking.price)}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 4. Pass coordinates directly to Leaflet */}
      <Leaflet 
        center={[activeLat, activeLng]} 
        zoom={13} 
        latlng={{ lat: activeLat, lng: activeLng }} 
      />
    </div>
  );
};

export default MyBookings;