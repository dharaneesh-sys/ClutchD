import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema } from "../../lib/validators";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { StarRating } from "../ui/StarRating";

export function ReviewModal({ isOpen, onClose, providerName, onSubmit }) {
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 }
  });

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setValue("rating", newRating, { shouldValidate: true });
  };

  const submitHandler = async (data) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Service">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto mb-4 border border-emerald-500/30 flex items-center justify-center text-xl font-bold text-emerald-400">
           {providerName && providerName.length >= 2 ? providerName.substring(0, 2).toUpperCase() : "⭐"}
        </div>
        <h3 className="text-lg font-bold text-white mb-1">How was your experience?</h3>
        <p className="text-sm text-emerald-100/70">Rate the service provided by {providerName || "the professional"}</p>
      </div>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <StarRating 
            max={5} 
            size={40} 
            rating={rating} 
            interactive={true} 
            onChange={handleRatingChange} 
          />
          {errors.rating && <p className="text-sm text-red-400 mt-2">Please provide a rating</p>}
        </div>

        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-emerald-100/80">
            Leave a comment (Optional)
          </label>
          <textarea
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[120px] resize-none"
            placeholder="Tell us what you liked or what could be improved..."
            {...register("comment")}
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-white/10">
           <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
             Skip
           </Button>
           <Button type="submit" className="flex-1" disabled={rating === 0}>
             Submit Review
           </Button>
        </div>
      </form>
    </Modal>
  );
}
