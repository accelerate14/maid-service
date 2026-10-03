import React, { useState, useEffect } from 'react';
import api from '../../api';
import Loader from '../ui/Loader';
import Button from '../ui/Button';

const StarRating = ({ rating, size = 'sm' }) => {
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25;
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<svg key={i} className={`${sizeClass} text-amber-400 fill-current`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
    } else if (i === full && hasHalf) {
      stars.push(<svg key={i} className={`${sizeClass} text-amber-400 fill-current`} viewBox="0 0 20 20"><defs><linearGradient id={`half-${i}`}><stop offset="50%" stopColor="currentColor"/><stop offset="50%" stopColor="#e2e8f0"/></linearGradient></defs><path fill={`url(#half-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
    } else {
      stars.push(<svg key={i} className={`${sizeClass} text-slate-200 fill-current`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const StepProvider = ({ selectedProvider, onSelect }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [providerDetails, setProviderDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async (q = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/customer/providers${q ? `?search=${q}` : ''}`);
      setProviders(res.data);
    } catch (err) {
      console.error('Failed to fetch providers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    // Debounce-like: fetch on each change
    fetchProviders(val);
  };

  const toggleExpand = async (providerId) => {
    if (expandedId === providerId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(providerId);

    if (!providerDetails[providerId]) {
      setDetailLoading(providerId);
      try {
        const res = await api.get(`/customer/providers/${providerId}`);
        setProviderDetails(prev => ({ ...prev, [providerId]: res.data }));
      } catch (err) {
        console.error('Failed to fetch provider details', err);
      } finally {
        setDetailLoading(null);
      }
    }
  };

  if (loading && providers.length === 0) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-slate-900">Choose Your Provider</h2>
        <p className="text-sm text-slate-500 mt-1">Browse our verified cleaning professionals</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          placeholder="Search providers by name..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-slate-300"
        />
      </div>

      {/* Provider List */}
      <div className="space-y-4">
        {providers.map((p, index) => {
          const isExpanded = expandedId === p.id;
          const isChosen = selectedProvider?.id === p.id;
          const details = providerDetails[p.id];

          return (
            <div
              key={p.id}
              className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden animate-fade-in
                ${isChosen ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 bg-white hover:border-slate-300'}
              `}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Provider card header */}
              <div
                className="p-5 cursor-pointer flex items-center justify-between"
                onClick={() => toggleExpand(p.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md shadow-primary/20">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-slate-900">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={parseFloat(p.avg_rating)} />
                      <span className="text-sm font-medium text-slate-600">
                        {parseFloat(p.avg_rating).toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400">({p.review_count} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isChosen && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">Selected</span>
                  )}
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  {detailLoading === p.id ? (
                    <Loader />
                  ) : details ? (
                    <div>
                      <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {details.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          {details.phone}
                        </span>
                      </div>

                      {/* Reviews */}
                      {details.reviews && details.reviews.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Reviews</h5>
                          {details.reviews.slice(0, 3).map((r, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <StarRating rating={parseFloat(r.rating)} size="sm" />
                                <span className="text-xs font-medium text-slate-600">{r.customer_name}</span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{r.review}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button size="sm" onClick={() => onSelect(details)} className="w-full sm:w-auto">
                        {isChosen ? '✓ Selected' : 'Select This Provider'}
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}

        {providers.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500">No providers found matching your search.</div>
        )}
      </div>
    </div>
  );
};

export default StepProvider;
