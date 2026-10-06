import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import OrderSummary from '../components/booking/OrderSummary';
import StepSubServices from '../components/booking/StepSubServices';
import StepSchedule from '../components/booking/StepSchedule';
import StepProvider from '../components/booking/StepProvider';
import StepPayment from '../components/booking/StepPayment';
import { validateBookingRequest } from '../utils/validation';

const steps = [
  { id: 'sub-services', title: 'Services' },
  { id: 'schedule', title: 'Schedule' },
  { id: 'provider', title: 'Provider' },
  { id: 'payment', title: 'Payment' }
];

const BookingWizard = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [service, setService] = useState(null);

  // Booking State
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [schedule, setSchedule] = useState({ date: '', time: '' });
  const [address, setAddress] = useState('');
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get('/customer/services');
        const found = res.data.find(s => s.id === parseInt(serviceId));
        if (found) {
          setService(found);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Failed to fetch service', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId, navigate]);

  const toggleSubService = (sub) => {
    setSelectedSubServices(prev => {
      const exists = prev.find(s => s.id === sub.id);
      if (exists) {
        return prev.filter(s => s.id !== sub.id);
      }
      return [...prev, sub];
    });
  };

  const removeSubService = (id) => {
    setSelectedSubServices(prev => prev.filter(s => s.id !== id));
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedSubServices.length === 0) {
      setError('Please select at least one service');
      return;
    }
    if (currentStep === 1 && (!schedule.date || !schedule.time || !address.trim())) {
      setError('Please select both date/time and enter the service address');
      return;
    }
    if (currentStep === 2 && !provider) {
      setError('Please select a provider');
      return;
    }

    setError('');
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleConfirmBooking = async (paymentMethod, paymentData, paymentConfirmed) => {
    setSubmitLoading(true);
    setError('');

    if (!paymentConfirmed) {
      setError('Payment not confirmed. Please complete the payment to proceed.');
      setSubmitLoading(false);
      return;
    }
    
    const payload = {
      service_id: parseInt(serviceId),
      sub_service_ids: selectedSubServices.map(s => s.id),
      scheduled_date: schedule.date,
      scheduled_time: schedule.time,
      payment_method: paymentMethod,
      transaction_id: paymentData?.razorpay_payment_id || null,
      provider_id: provider.id,
      address,
      address_lat: null,
      address_lng: null
    };

    const validation = validateBookingRequest(payload);
    if (!validation.valid) {
      setError(Object.values(validation.errors)[0]);
      setSubmitLoading(false);
      return;
    }

    try {
      await api.post('/customer/bookings', payload);
      // Navigate to dashboard on success
      navigate('/dashboard', { state: { bookingSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>
            <div className="text-sm font-semibold text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <div className={`flex flex-col items-start ${i <= currentStep ? 'text-primary' : 'text-slate-400'}`}>
                  <div className={`h-1.5 w-24 rounded-full mb-2 transition-colors ${i <= currentStep ? 'bg-primary' : 'bg-slate-200'}`}></div>
                  <span className="text-xs font-bold uppercase tracking-wider">{step.title}</span>
                </div>
                {i < steps.length - 1 && <div className="w-4"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Wizard Content */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-fade-in">
                {error}
              </div>
            )}

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/50 min-h-[500px]">
              {currentStep === 0 && (
                <StepSubServices
                  serviceId={serviceId}
                  selectedSubServices={selectedSubServices}
                  onToggle={toggleSubService}
                />
              )}
              {currentStep === 1 && (
                <StepSchedule
                  schedule={schedule}
                  onDateChange={(date) => setSchedule({ ...schedule, date })}
                  onTimeChange={(time) => setSchedule({ ...schedule, time })}
                  address={address}
                  onAddressChange={setAddress}
                />
              )}
              {currentStep === 2 && (
                <StepProvider
                  selectedProvider={provider}
                  onSelect={setProvider}
                />
              )}
              {currentStep === 3 && (
                <StepPayment
                  onConfirm={handleConfirmBooking}
                  loading={submitLoading}
                  serviceId={parseInt(serviceId)}
                  selectedSubServices={selectedSubServices}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={currentStep === 0 ? 'invisible' : ''}
              >
                Previous Step
              </Button>
              {currentStep < steps.length - 1 && (
                <Button onClick={handleNext}>
                  Continue to {steps[currentStep + 1].title}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              service={service}
              selectedSubServices={selectedSubServices}
              schedule={schedule}
              provider={provider}
              address={address}
              onRemoveSubService={removeSubService}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
