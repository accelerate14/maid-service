import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const loaderEl = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="w-10 h-10 border-[3px] border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <span className="text-xs text-slate-400 font-medium">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-[9999]">
        {loaderEl}
      </div>
    );
  }

  return loaderEl;
};

export default Loader;
