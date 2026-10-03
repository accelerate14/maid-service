import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const SmoothScrollProvider = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.3,
      effects: true,
      normalizeScroll: true,
      smoothTouch: 0.1,
    });

    return () => {
      smoother.kill();
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div id="smooth-wrapper" className="min-h-screen overflow-x-hidden">
      <div id="smooth-content" className="min-h-screen will-change-transform">
        {children}
      </div>
    </div>
  );
};

export default SmoothScrollProvider;
