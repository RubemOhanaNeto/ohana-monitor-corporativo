import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface FormTooltipProps {
  title: string;
  content: string;
  example?: string;
  required?: boolean;
}

export const FormTooltip: React.FC<FormTooltipProps> = ({
  title,
  content,
  example,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center ml-1" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
        aria-label={`Ajuda sobre ${title}`}
        title={`Orientações sobre ${title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 bg-slate-900 text-white rounded-xl p-3 text-xs shadow-xl border border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />

          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1">
              {title}
              {required && (
                <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-800">
                  Obrigatório
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Content */}
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {content}
          </p>

          {/* Example / Dica */}
          {example && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-emerald-300/90 font-mono bg-slate-950/50 p-1.5 rounded">
              <strong className="text-emerald-400 font-sans">Exemplo: </strong>
              {example}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
