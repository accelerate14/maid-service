import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';

const ServiceListing = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/customer/services');
        setServices(res.data);
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Available Services</h2>
          <p className="text-sm text-slate-500 mt-1">Choose from our professional cleaning options</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <Card 
            key={service.id} 
            hoverable 
            className="flex flex-col h-full overflow-hidden !p-0 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {service.image_url && (
              <div className="relative overflow-hidden">
                <img 
                  src={service.image_url} 
                  alt={service.name} 
                  className="w-full h-52 object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-heading text-lg font-bold text-slate-900">{service.name}</h3>
              <p className="text-slate-500 text-sm mt-2 flex-grow leading-relaxed">{service.description}</p>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">{service.duration_minutes} mins avg</span>
                <Button onClick={() => navigate(`/dashboard/book/${service.id}`)} size="sm">
                  Book Now
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceListing;
