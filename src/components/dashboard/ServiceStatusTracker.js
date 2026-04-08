import { SERVICE_STATUS } from "../../lib/constants";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Search, UserCheck, Navigation, Wrench, CheckCircle2, Phone, MessageSquare, MapPin } from "lucide-react";

export function ServiceStatusTracker({ request, onComplete, onCancel }) {
  if (!request) return null;

  const steps = [
    { id: SERVICE_STATUS.SEARCHING, label: "Finding Mechanic", icon: Search },
    { id: SERVICE_STATUS.ASSIGNED, label: "Assigned", icon: UserCheck },
    { id: SERVICE_STATUS.EN_ROUTE, label: "En Route", icon: Navigation },
    { id: SERVICE_STATUS.IN_PROGRESS, label: "Fixing Vehicle", icon: Wrench },
    { id: SERVICE_STATUS.COMPLETED, label: "Completed", icon: CheckCircle2 },
  ];

  const currentStepIdx = steps.findIndex(s => s.id === request.status);

  // Status-specific content
  const renderStatusCard = () => {
    switch (request.status) {
      case SERVICE_STATUS.SEARCHING:
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping"></div>
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Locating Providers Nearby</h3>
            <p className="text-emerald-100/70 text-sm">We&apos;re pinging the closest available mechanics to your location.</p>
          </div>
        );

      case SERVICE_STATUS.ASSIGNED:
      case SERVICE_STATUS.EN_ROUTE:
      case SERVICE_STATUS.IN_PROGRESS:
        return (
          <div className="bg-black/20 rounded-xl p-4 border border-white/5 mb-6 mt-4">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden border border-emerald-500/30">
                {request.mechanic?.image ? (
                  <img src={request.mechanic.image} alt={request.mechanic.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCheck className="text-emerald-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{request.mechanic?.name || "Assigning..."}</h4>
                <div className="flex items-center text-xs text-amber-400 mt-0.5">
                  ⭐ {request.mechanic?.rating || "—"} <span className="text-emerald-100/50 ml-2">• Verified Provider</span>
                </div>
              </div>
              <div className="flex gap-2 text-white">
                 <button type="button" className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full hover:bg-emerald-500 hover:text-white transition-colors">
                  <Phone size={16} />
                 </button>
                 <button type="button" className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full hover:bg-emerald-500 hover:text-white transition-colors">
                  <MessageSquare size={16} />
                 </button>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-emerald-100/80">
              <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white mb-0.5">Estimated Arrival</p>
                <p>{request.mechanic?.distance ? `${request.mechanic.distance} away` : "Calculating..."}</p>
              </div>
            </div>
          </div>
        );
      
      case SERVICE_STATUS.COMPLETED:
        return (
          <div className="text-center py-6 mt-4">
            <div className="inline-flex flex-col gap-4">
               <div>
                 <p className="text-emerald-100/70 text-sm mb-1">Estimated Amount</p>
                 <p className="text-3xl font-bold text-white tracking-tight">
                   ₹{request.priceEstimate?.min || "—"} – ₹{request.priceEstimate?.max || "—"}
                 </p>
                 <p className="text-xs text-emerald-100/50 mt-1">Final amount confirmed after review</p>
               </div>
               <Button onClick={() => onComplete(request)}>Pay & Review</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <GlassCard variant="strong" className="w-full h-full p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Service Status</h2>
        <p className="text-emerald-100/70 text-sm">Track your request in real-time</p>
      </div>

      {/* Progress Timeline */}
      <div className="relative mb-6 pb-2">
        <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-white/10 rounded-full">
          <div 
            className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between relative z-10 w-full">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx && request.status !== SERVICE_STATUS.COMPLETED;
            
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center">
                <div 
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent 
                      ? "bg-[#064e3b] border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                      : isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-black/50 border-white/20 text-white/30"
                  }`}
                >
                  <Icon size={18} />
                </div>
                {/* Text label */}
                <span className={`text-[10px] font-medium mt-2 w-full text-center leading-tight ${isCompleted ? 'text-emerald-100' : 'text-white/30'} ${idx > 0 && idx < steps.length - 1 ? 'hidden sm:block' : ''}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {renderStatusCard()}
      </div>

      {request.status !== SERVICE_STATUS.COMPLETED && (
         <div className="mt-4 pt-4 border-t border-white/5 text-center">
           <button 
             type="button"
             onClick={onCancel}
             className="text-sm text-red-400 hover:text-red-300 transition-colors"
           >
              Cancel Request
           </button>
         </div>
      )}
    </GlassCard>
  );
}
