import React, { useState } from 'react';
import Button from '../ui/Button';

const StepPayment = ({ onConfirm, loading }) => {
  const [paymentMethod, setPaymentMethod] = useState('dummy_gateway');

  const methods = [
    { 
      id: 'dummy_gateway', 
      label: 'Credit / Debit Card',
      desc: 'Pay securely with your card (Demo)',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      )
    },
    { 
      id: 'cod', 
      label: 'Cash on Delivery',
      desc: 'Pay in cash when the cleaner arrives',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      )
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-slate-900">Payment</h2>
        <p className="text-sm text-slate-500 mt-1">Choose your payment method and confirm your booking</p>
      </div>

      <div className="space-y-4 mb-8">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setPaymentMethod(m.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4
              ${paymentMethod === m.id
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              paymentMethod === m.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
            } transition-colors`}>
              {m.icon}
            </div>
            <div className="flex-1">
              <h4 className={`font-heading font-semibold ${paymentMethod === m.id ? 'text-primary' : 'text-slate-800'}`}>
                {m.label}
              </h4>
              <p className="text-sm text-slate-500 mt-0.5">{m.desc}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              paymentMethod === m.id ? 'border-primary bg-primary' : 'border-slate-300'
            }`}>
              {paymentMethod === m.id && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Dummy card form for visual appeal — only when card is selected */}
      {paymentMethod === 'dummy_gateway' && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 text-white animate-fade-in">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Card Details (Demo)</p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              readOnly
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="MM / YY" className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none" readOnly />
              <input type="text" placeholder="CVC" className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 text-sm focus:outline-none" readOnly />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">🔒 This is a demo gateway. No real charge will occur.</p>
        </div>
      )}

      <Button onClick={() => onConfirm(paymentMethod)} fullWidth isLoading={loading} size="lg">
        Confirm & Pay
      </Button>
    </div>
  );
};

export default StepPayment;
