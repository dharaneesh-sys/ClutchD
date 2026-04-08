import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseClass = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-[1px]",
      secondary: "bg-white/10 hover:bg-white/20 text-emerald-50 border border-white/10",
      outline: "border-2 border-emerald-500 text-emerald-50 hover:bg-emerald-500/10",
      ghost: "hover:bg-white/10 text-emerald-50",
      danger: "bg-red-500 hover:bg-red-400 text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)]",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClass, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
