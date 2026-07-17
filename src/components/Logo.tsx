import { Zap } from 'lucide-react';

export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-pln-500 to-pln-700 shadow-md">
        <Zap className="w-5 h-5 text-white" fill="white" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold text-pln-800">PLN e-Procurement</span>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide">Vendor Portal</span>
        </div>
      )}
    </div>
  );
}
