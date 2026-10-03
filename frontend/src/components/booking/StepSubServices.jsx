import React, { useState, useEffect } from 'react';
import api from '../../api';
import Loader from '../ui/Loader';

const StepSubServices = ({ serviceId, selectedSubServices, onToggle }) => {
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/customer/services/${serviceId}/sub-services`);
        setSubServices(res.data);
      } catch (err) {
        console.error('Failed to fetch sub-services', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [serviceId]);

  const isSelected = (id) => selectedSubServices.some(s => s.id === id);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-slate-900">Choose Your Services</h2>
        <p className="text-sm text-slate-500 mt-1">Select at least one service to continue. You can pick multiple.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subServices.map((sub, index) => {
          const selected = isSelected(sub.id);
          return (
            <button
              key={sub.id}
              onClick={() => onToggle(sub)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 animate-fade-in group
                ${selected
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={`font-heading font-semibold ${selected ? 'text-primary' : 'text-slate-800'}`}>
                    {sub.name}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{sub.description}</p>
                </div>
                <div className="flex flex-col items-end ml-4 flex-shrink-0">
                  <span className={`font-heading text-lg font-bold ${selected ? 'text-primary' : 'text-slate-700'}`}>
                    ${parseFloat(sub.price).toFixed(2)}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-2 transition-all ${
                    selected 
                      ? 'border-primary bg-primary' 
                      : 'border-slate-300 group-hover:border-slate-400'
                  }`}>
                    {selected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {subServices.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No sub-services available for this service.
        </div>
      )}
    </div>
  );
};

export default StepSubServices;
