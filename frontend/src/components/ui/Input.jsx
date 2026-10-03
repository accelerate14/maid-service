import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 mb-1.5 font-heading">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        type={type}
        className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-white text-slate-900 transition-all duration-200 outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
            : 'border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1.5">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
