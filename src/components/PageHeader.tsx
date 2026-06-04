import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function PageHeader({ title, onBack, rightAction }: PageHeaderProps) {
  return (
    <header className="relative bg-[#0000ff] text-white pt-10 pb-20 overflow-hidden shrink-0">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-white/20 rounded-full blur-[120px] opacity-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] opacity-10" />
      </div>

      {/* Main Content */}
      <div className="relative px-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="group p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-[0.1em] uppercase text-white drop-shadow-md">
              {title}
            </h1>
            <div className="h-0.5 w-6 bg-white/30 rounded-full mt-1 shrink-0" />
          </div>
        </div>
        {rightAction && (
          <div className="flex items-center">
            {rightAction}
          </div>
        )}
      </div>

      {/* Refined Proportional Wave Bottom */}
      <div className="absolute bottom-[-1px] left-0 w-full leading-[0] pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] text-white fill-current">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" opacity="0.3"></path>
          <path d="M0,0V15.81C20,45.92,45.64,66.86,97.69,82.05c45.76,13.1,87.41,15,132.31,11,62-5.63,111.91-25.7,164-36,54.85-10.87,112.5,4.1,164.5,22,64.21,22.1,131.62,24.9,198.5,9,46.75-11.11,88.4-32.9,134.5-49,50-17.46,105-23.09,156.5-12,25.3,5,44.7,14,64.5,26.5,50,31.6,100,32.5,157.5,10V120H0Z"></path>
        </svg>
      </div>
    </header>
  );
}
