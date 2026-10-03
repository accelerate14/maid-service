import React, { useState } from 'react';
import api from '../api';
import Button from './ui/Button';
import Input from './ui/Input';

const BookingModal = ({ service, onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('dummy_gateway');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/customer/bookings', {
        service_id: service.id,
        scheduled_date: date,
        scheduled_time: time,
        payment_method: paymentMethod
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.dispatchEvent(new Event('booking-updated'));
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-emerald-500 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <h2 className="font-heading text-xl font-bold">Book {service.name}</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Total: <span className="font-bold text-white text-lg">${service.price}</span>
          </p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Booking Confirmed!</h3>
              <p className="text-sm text-slate-500 mt-1">Your cleaning has been scheduled successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
                  {error}
                </div>
              )}
              
              <Input 
                type="date" 
                label="Schedule Date" 
                required 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              
              <Input 
                type="time" 
                label="Schedule Time" 
                required 
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1.5 font-heading">Payment Method</label>
                <select 
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 outline-none hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="dummy_gateway">💳 Credit Card (Dummy Gateway)</option>
                  <option value="cod">💵 Cash on Delivery</option>
                </select>
              </div>

              <Button type="submit" fullWidth isLoading={loading} className="mt-2">
                Confirm Booking
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
