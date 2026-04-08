import { cn } from "../../lib/utils";

export function GlassCard({ children, className, variant = "normal", ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border", // Base
        variant === "normal" && "bg-white/5 border-white/10 backdrop-blur-xl",
        variant === "strong" && "bg-white/10 border-white/20 backdrop-blur-3xl",
        variant === "interactive" && "bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
