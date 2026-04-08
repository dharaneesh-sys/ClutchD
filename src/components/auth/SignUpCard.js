import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSignupSchema, mechanicSignupSchema, garageSignupSchema } from "../../lib/validators";
import { useAuthStore } from "../../store/authStore";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { CustomerFields } from "./CustomerFields";
import { MechanicFields } from "./MechanicFields";
import { GarageFields } from "./GarageFields";
import { UserCircle, Wrench, Building2, UserPlus } from "lucide-react";

const ROLES = [
  { id: "customer", label: "Customer", icon: UserCircle, desc: "Find mechanics & garages" },
  { id: "mechanic", label: "Mechanic", icon: Wrench, desc: "Find freelance jobs" },
  { id: "garage", label: "Garage", icon: Building2, desc: "List your auto shop" },
];

import { useRouter } from "next/navigation";

export function SignUpCard() {
  const [selectedRole, setSelectedRole] = useState("customer");
  const { signup, isLoading, error: authError } = useAuthStore();
  const router = useRouter();

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const onSubmit = async (data) => {
    try {
      const user = await signup(data, selectedRole);
      if (user) {
        if (user.role === "admin") router.push("/admin");
        else router.push(`/dashboard/${user.role}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <GlassCard variant="strong" className="w-full max-w-xl p-8 pt-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
        <p className="text-emerald-100/70">Join ClutchD to get started</p>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => handleRoleChange(role.id)}
              className={`
                flex flex-col items-center p-3 rounded-xl border transition-all text-center group
                ${isSelected 
                  ? "bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon size={24} className={`mb-2 ${isSelected ? "text-emerald-400" : "text-white/50 group-hover:text-white/80"}`} />
              <span className="text-sm font-medium mb-1">{role.label}</span>
              <span className="text-[10px] opacity-70 leading-tight hidden sm:block">{role.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Key forces full form re-creation when role changes, ensuring correct resolver */}
      <SignUpForm
        key={selectedRole}
        selectedRole={selectedRole}
        isLoading={isLoading}
        authError={authError}
        onSubmit={onSubmit}
      />
    </GlassCard>
  );
}

function SignUpForm({ selectedRole, isLoading, authError, onSubmit }) {
  const getSchema = () => {
    switch (selectedRole) {
      case "mechanic": return mechanicSignupSchema;
      case "garage": return garageSignupSchema;
      default: return customerSignupSchema;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getSchema()),
    mode: "onTouched"
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Dynamic Form Fields based on role */}
      <div className="bg-black/10 rounded-xl p-5 border border-white/5">
        {selectedRole === "customer" && <CustomerFields register={register} errors={errors} />}
        {selectedRole === "mechanic" && <MechanicFields register={register} errors={errors} setValue={setValue} watch={watch} />}
        {selectedRole === "garage" && <GarageFields register={register} errors={errors} setValue={setValue} watch={watch} />}
      </div>

      {authError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {authError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
      >
        <UserPlus size={18} className="mr-2" />
        Create {ROLES.find(r => r.id === selectedRole)?.label} Account
      </Button>
      
      <p className="text-xs text-center text-white/50 mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
