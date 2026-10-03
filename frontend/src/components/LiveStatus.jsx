import React, { useEffect, useState } from 'react';

const LiveStatus = () => {
  const [statusMessage, setStatusMessage] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let isMounted = true;
    
    const connectSSE = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/customer/bookings/live', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.type === 'status_update' && isMounted) {
                  setStatusMessage(`Booking #${data.bookingId} status updated to: ${data.newStatus}`);
                  setShow(true);
                  setTimeout(() => {
                    if (isMounted) setShow(false);
                  }, 5000);
                  
                  window.dispatchEvent(new Event('booking-updated'));
                }
              } catch (e) {}
            }
          });
        }
      } catch (err) {
        console.error('SSE Error:', err);
      }
    };

    connectSSE();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-slate-900/95 backdrop-blur-xl text-white pl-5 pr-6 py-4 rounded-2xl shadow-2xl shadow-slate-900/30 flex items-center gap-3 border border-slate-700/50 max-w-sm">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div>
          <p className="text-xs font-medium text-primary uppercase tracking-wider">Live Update</p>
          <p className="text-sm font-medium text-white/90 mt-0.5">{statusMessage}</p>
        </div>
        <button onClick={() => setShow(false)} className="ml-2 text-slate-500 hover:text-white transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default LiveStatus;
