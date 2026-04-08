import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef(
  ({ className, options = [], error, label, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-emerald-100/80">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "appearance-none w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-10 py-3 text-sm text-white",
              "focus:border-emerald-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-[#064e3b] text-gray-400">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-[#064e3b] text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-100/50">
            <ChevronDown size={18} />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
