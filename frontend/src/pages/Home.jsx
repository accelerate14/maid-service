import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    title: 'Instant Booking',
    desc: 'Schedule your cleaning in under 60 seconds with our streamlined booking flow.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
    title: 'Verified Professionals',
    desc: 'Every cleaner is background-checked and trained to our emerald-standard quality.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    title: 'Live Tracking',
    desc: 'Real-time booking status updates so you always know what\'s happening.'
  }
];

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-primary/15 to-emerald-300/10 blur-[80px] animate-float"></div>
          <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tl from-primary/15 to-teal-300/10 blur-[80px] animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-primary/5 blur-[60px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now serving your area
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Premium <span className="gradient-text">Home Cleaning</span>
            <br />
            <span className="text-slate-700">at your fingertips</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Book trusted, professional cleaners in seconds. Experience a spotless home with our emerald-standard service — every time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 flex">
                Get Started Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-green-500'].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>500+ happy customers</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
              <span>4.9/5 rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why choose <span className="gradient-text">SparkleMaid</span>?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              We make home cleaning effortless with technology, trust, and a relentless focus on quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {f.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
            Ready for a spotless home?
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of satisfied customers who trust SparkleMaid for their home cleaning needs.
          </p>
          <Link to="/register">
            <Button variant="outline" size="lg" className="bg-white text-primary border-white px-8 py-3.5 text-base font-semibold shadow-lg hover">
              Book Your First Clean
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
