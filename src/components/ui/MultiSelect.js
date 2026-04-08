import { useState } from "react";
import { cn } from "../../lib/utils";
import { Check, ChevronDown, X } from "lucide-react";

export function MultiSelect({ options = [], value = [], onChange, label, error, placeholder = "Select options..." }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (e, optionValue) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = value.map(
    (v) => options.find((opt) => opt.value === v)?.label || v
  );

  return (
    <div className="w-full relative">
      {label && (
        <label className="mb-2 block text-sm font-medium text-emerald-100/80">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          "min-h-[48px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white",
          "focus-within:border-emerald-500 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all cursor-pointer flex flex-wrap gap-2 items-center",
          error && "border-red-500/50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 ? (
          <span className="text-white/30 truncate">{placeholder}</span>
        ) : (
          selectedLabels.map((lbl, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md text-xs border border-emerald-500/30"
            >
              {lbl}
              <button
                type="button"
                onClick={(e) => removeOption(e, value[idx])}
                className="hover:text-emerald-100 focus:outline-none"
              >
                <X size={14} />
              </button>
            </span>
          ))
        )}
        
        <div className="ml-auto text-emerald-100/50">
          <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-[#064e3b] shadow-xl max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/10 cursor-pointer text-sm text-white transition-colors"
              >
                <span>{option.label}</span>
                {value.includes(option.value) && (
                  <Check size={16} className="text-emerald-400" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
      
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
