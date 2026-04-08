import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { UploadCloud, X } from "lucide-react";

export const FileUpload = forwardRef(
  ({ className, error, label, value, onChange, accept = "image/*", multiple = false, maxSizeMB = 5, ...props }, ref) => {
    
    const handleFileChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        const files = Array.from(e.target.files);
        
        // Check file sizes
        const oversized = files.find(f => f.size > maxBytes);
        if (oversized) {
          // Reset the input
          e.target.value = "";
          onChange(multiple ? [] : null);
          // Trigger a custom error via a brief alert-style feedback
          if (typeof window !== "undefined") {
            // We'll temporarily set an error state — the parent can also use the error prop
            console.warn(`File "${oversized.name}" exceeds ${maxSizeMB}MB limit (${(oversized.size / 1024 / 1024).toFixed(1)}MB)`);
          }
          return;
        }

        if (multiple) {
          onChange(files);
        } else {
          onChange(e.target.files[0]);
        }
      }
    };

    const clearFile = (e) => {
      e.preventDefault();
      onChange(multiple ? [] : null);
    };

    const getDisplayNames = () => {
      if (!value) return null;
      if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return value.map(v => v.name || 'File').join(', ');
      }
      return value.name || 'File attached';
    };

    const hasFile = Array.isArray(value) ? value.length > 0 : !!value;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-emerald-100/80">
            {label}
          </label>
        )}
        
        {!hasFile ? (
          <div 
            className={cn(
              "relative flex flex-col items-center justify-center w-full min-h-[120px] rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer",
              error && "border-red-500/50 bg-red-500/5",
              className
            )}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept={accept}
              multiple={multiple}
              ref={ref}
              {...props}
            />
            <UploadCloud size={32} className="mb-3 text-emerald-400 opacity-80" />
            <p className="text-sm font-medium text-white mb-1">Click to upload or drag & drop</p>
            <p className="text-xs text-white/50">PNG, JPG up to 5MB</p>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <UploadCloud size={20} className="text-emerald-400 shrink-0" />
              <span className="text-sm text-emerald-100 truncate">
                {getDisplayNames()}
              </span>
            </div>
            <button
              onClick={clearFile}
              className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 ml-2"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
