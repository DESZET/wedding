import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewStats {
  avg: number;
  total: number;
}

interface ReviewSectionProps {
  /** "printing" | "umrah" | "wedding" */
  type: "printing" | "umrah" | "wedding";
  /** id produk / paket */
  itemId: number;
  itemName: string;
  /** warna aksen: "blue" (printing), "emerald" (umrah/haji), "primary" (wedding) */
  accent?: "blue" | "emerald" | "primary";
}

const ACCENT = {
  blue: {
    badge: "bg-blue-100 text-blue-700",
    btn: "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white",
    ring: "focus:ring-blue-400",
    bar: "bg-blue-500",
    text: "text-blue-600",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    btn: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white",
    ring: "focus:ring-emerald-400",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  },
  primary: {
    badge: "bg-primary/10 text-primary",
    btn: "bg-primary hover:bg-primary/90 text-white",
    ring: "focus:ring-primary/50",
    bar: "bg-primary",
    text: "text-primary",
  },
};

function StarRating({
  value,
  onChange,
  size = "w-7 h-7",
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => onChange?.(i)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            className={`${size} transition-colors ${
              i <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total, accent }: { label: string; count: number; total: number; accent: "blue" | "emerald" | "primary" }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-8 text-gray-600 text-right">{label}★</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${ACCENT[accent].bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-gray-500">{count}</span>
    </div>
  );
}

export default function ReviewSection({ type, itemId, itemName, accent = "blue" }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ avg: 0, total: 0 });
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({ name: "", rating: 0, comment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const a = ACCENT[accent];

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reviews/${type}/${itemId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setStats(data.stats);
        // Hitung distribusi
        const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.data.forEach((r: Review) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
        setDistribution(dist);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [type, itemId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.rating) e.rating = "Pilih rating bintang";
    if (!form.comment.trim()) e.comment = "Tulis komentar Anda";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/reviews/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ name: "", rating: 0, comment: "" });
        setShowForm(false);
        await loadReviews();
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            Ulasan <span className={a.text}>Pelanggan</span>
          </h3>
          <p className="text-gray-500">{itemName}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${a.btn}`}
        >
          <MessageSquare className="w-4 h-4" />
          {showForm ? "Tutup Form" : "Tulis Ulasan"}
        </button>
      </div>

      {/* Stats + Distribution */}
      {stats.total > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Big average */}
            <div className="text-center min-w-[120px]">
              <div className={`text-6xl font-bold ${a.text}`}>{stats.avg.toFixed(1)}</div>
              <StarRating value={Math.round(stats.avg)} size="w-5 h-5" readonly />
              <p className="text-sm text-gray-500 mt-1">{stats.total} ulasan</p>
            </div>
            {/* Bars */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar key={star} label={String(star)} count={distribution[star] || 0} total={stats.total} accent={accent} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-8"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-5"
            >
              <h4 className="text-lg font-bold text-gray-800">Bagikan Pengalaman Anda</h4>

              {/* Rating input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size="w-8 h-8" />
                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 ${a.ring} ${errors.name ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Komentar *</label>
                <textarea
                  rows={4}
                  placeholder="Ceritakan pengalaman Anda..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 ${a.ring} resize-none ${errors.comment ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60 ${a.btn}`}
              >
                <Send className="w-4 h-4" />
                {submitting ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl mb-6 text-sm font-medium shadow"
          >
            <Star className="w-4 h-4 fill-green-500 text-green-500" />
            Terima kasih! Ulasan Anda telah dikirim.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada ulasan</p>
          <p className="text-gray-400 text-sm mt-1">Jadilah yang pertama memberikan ulasan!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {visibleReviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${a.badge}`}>
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating value={review.rating} size="w-3.5 h-3.5" readonly />
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Show more/less */}
          {reviews.length > 3 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
              >
                {showAll ? (
                  <><ChevronUp className="w-4 h-4" /> Tampilkan lebih sedikit</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Lihat {reviews.length - 3} ulasan lainnya</>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
