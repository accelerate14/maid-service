import React from 'react';

const Card = ({ children, className = '', hoverable = false, ...props }) => {
  const baseClass = `bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-sm transition-all duration-300 ${hoverable ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20' : ''} ${className}`;
  
  return (
    <div className={baseClass} {...props}>
      {children}
    </div>
  );
};

export default Card;
