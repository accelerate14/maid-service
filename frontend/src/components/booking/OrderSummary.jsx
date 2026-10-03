import React from 'react';

const OrderSummary = ({ service, selectedSubServices, schedule, provider, address, onRemoveSubService }) => {
  const total = selectedSubServices.reduce((sum, s) => sum + parseFloat(s.price), 0);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-sm p-6 sticky top-28">
      <h3 className="font-heading font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        Order Summary
      </h3>

      {/* Service */}
      {service && (
        <div className="mb-4 pb-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Service</p>
          <p className="font-heading font-semibold text-slate-800">{service.name}</p>
        </div>
      )}

      {/* Sub-services */}
      {selectedSubServices.length > 0 && (
        <div className="mb-4 pb-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Selected Add-ons</p>
          <div className="space-y-2">
            {selectedSubServices.map(sub => (
              <div key={sub.id} className="flex items-center justify-between group">
                <span className="text-sm text-slate-700 flex-1">{sub.name}</span>
                <span className="text-sm font-semibold text-slate-800 mr-2">${parseFloat(sub.price).toFixed(2)}</span>
                {onRemoveSubService && (
                  <button
                    onClick={() => onRemoveSubService(sub.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      {schedule.date && (
        <div className="mb-4 pb-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Schedule</p>
          <p className="text-sm text-slate-700">
            📅 {new Date(schedule.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          {schedule.time && (
            <p className="text-sm text-slate-700 mt-0.5">🕐 {schedule.time}</p>
          )}
        </div>
      )}
      {address && (
        <div className="mb-4 pb-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Service Address</p>
          <p className="text-sm text-slate-700 break-words">📍 {address}</p>
        </div>
      )}

      {/* Provider */}
      {provider && (
        <div className="mb-4 pb-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Provider</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
              {provider.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-700">{provider.name}</span>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between pt-2">
        <span className="font-heading font-semibold text-slate-600">Total</span>
        <span className="font-heading text-2xl font-bold text-primary">${total.toFixed(2)}</span>
      </div>

      {selectedSubServices.length === 0 && (
        <p className="text-xs text-slate-400 mt-3 text-center">Select at least one sub-service to continue</p>
      )}
    </div>
  );
};

export default OrderSummary;
