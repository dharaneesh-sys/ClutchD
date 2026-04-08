import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function Loader({ size = 24, className }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 
        size={size} 
        className="animate-spin text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
      />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021a0f]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader size={48} />
        <p className="text-sm font-medium text-emerald-300">Loading ClutchD...</p>
      </div>
    </div>
  );
}
