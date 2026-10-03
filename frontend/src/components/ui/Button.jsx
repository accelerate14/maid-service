import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 cursor-pointer";

  const variants = {
    primary: "bg-gradient-to-r from-primary to-emerald-500 text-white hover:from-primary-dark hover:to-emerald-600 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:translate-y-px hover:-translate-y-0.5",
    outline: "bg-transparent text-primary border-2 border-primary/30 hover:border-primary hover:bg-primary/5 active:translate-y-px",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3 text-base gap-2"
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button type={type} className={classes} disabled={isLoading || props.disabled} {...props}>
      {isLoading && (
        <svg className="absolute w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className={isLoading ? 'opacity-0' : 'flex'}>{children}</span>
    </button>
  );
};

export default Button;
