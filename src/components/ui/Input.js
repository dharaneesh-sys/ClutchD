import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef(
  ({ className, type = "text", error, label, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-emerald-100/80">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/50">
              <Icon size={18} />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30",
              "focus:border-emerald-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
              Icon && "pl-10",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
