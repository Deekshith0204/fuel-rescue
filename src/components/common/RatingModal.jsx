import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, X, ThumbsUp } from 'lucide-react';
import { reviewService } from '../../firebase/services';

export default function RatingModal({
  isOpen,
  onClose,
  requestId,
  userId,
  userName = "Customer",
  partnerId,
  partnerName = "Delivery Partner",
  onSubmitted
}) {
  if (!isOpen) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const rev = await reviewService.submit({
        requestId,
        userId,
        userName,
        partnerId,
        partnerName,
        rating,
        comment: comment.trim() || "Quick emergency roadside fuel assistance. Highly recommended!"
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted(rev);
    } catch (e) {
      console.warn("Rating submission error", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Review Submitted!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Thank you for rating {partnerName}. Your feedback maintains high roadside safety standards.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                Emergency Delivery Feedback
              </span>
              <h3 className="text-lg font-bold text-white">Rate Your Experience</h3>
              <p className="text-xs text-slate-400">
                How did <span className="text-slate-200 font-semibold">{partnerName}</span> perform during the fuel delivery?
              </p>
            </div>

            {/* Star Rating Select */}
            <div className="flex justify-center items-center gap-2 py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(rating)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick rating text feedback */}
            <div className="text-center text-xs font-semibold text-amber-300">
              {rating === 5 && "Outstanding rapid emergency service!"}
              {rating === 4 && "Prompt assistance & polite partner."}
              {rating === 3 && "Standard roadside response."}
              {rating <= 2 && "Needs improvement in response time."}
            </div>

            {/* Comment field */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Comments / Feedback
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Mention quick response time, safety adherence, fuel dispensing precautions..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition shadow-glow flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Submit Rating & Review</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
