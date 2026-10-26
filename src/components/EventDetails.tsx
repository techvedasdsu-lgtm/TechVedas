import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, Loader2, MapPin, Sparkles, X } from "lucide-react";
import type { ClubEvent } from "../data/events";
import Countdown from "./Countdown";
import { useAuth } from "../context/AuthContext";

interface EventDetailsProps {
  event: ClubEvent;
  onClose: () => void;
}

export default function EventDetails({ event, onClose }: EventDetailsProps) {
  const { user, registeredEventIds, registerForEvent } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const isAarambh = event.id === "datathon-2026";
  const isRegistered = registeredEventIds.has(event.id) || registeredSuccess;

  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleRegister = async () => {
    if (!user) return;
    setSubmitting(true);
    const success = await registerForEvent(event);
    setSubmitting(false);
    if (success) {
      setRegisteredSuccess(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#0B1320] text-cream border border-gold/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
      >
        <div className={`relative overflow-hidden bg-espresso ${isAarambh ? "aspect-[1240/634]" : "h-56"}`}>
          <img
            src={event.image}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.opacity = "0")}
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-espresso/80 p-2 text-cream hover:bg-terracotta transition-colors backdrop-blur-sm"
          >
            <X size={18} />
          </button>
          {isRegistered && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-sage px-3.5 py-1 text-xs font-bold text-espresso shadow-lg">
              <CheckCircle2 size={15} /> Registered Participant
            </div>
          )}
        </div>

        <div className="p-7">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              {event.category}
            </span>
            <span className="text-xs text-beige/60 capitalize">Status: {event.status}</span>
          </div>

          <h3 className="mt-2 font-display text-3xl text-cream">{event.title}</h3>
          <p className="mt-4 leading-relaxed text-beige/80">{event.description}</p>

          <div className="mt-6 space-y-2.5 rounded-xl border border-beige/10 bg-brown/30 p-4 text-sm text-beige/90">
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-gold" />
              <span>{event.imageDateLabel ?? formattedDate}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-gold" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={16} className="text-gold" />
              <span>{event.venue}</span>
            </div>
          </div>

          {event.details && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-terracotta mb-2.5">
                Key Highlights
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {event.details.map((detail) => (
                  <div
                    key={detail}
                    className="border border-gold/15 bg-brown/20 rounded-lg px-3 py-2 text-xs leading-relaxed text-beige/85 flex items-start gap-2"
                  >
                    <Sparkles size={12} className="text-gold shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.status !== "past" && (
            <div className="mt-7 flex flex-col gap-4 border-t border-beige/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
              {event.status === "upcoming" && (
                <div className="text-beige/80">
                  <Countdown date={event.date} />
                </div>
              )}

              <div className="flex items-center gap-3">
                {isRegistered ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-sage/40 bg-sage/10 px-5 py-2.5 text-sm font-semibold text-sage">
                    <CheckCircle2 size={16} /> Registered with Tech Vedas
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleRegister}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-cream shadow-sm transition-all hover:bg-[#ff8176] hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Registering...
                      </>
                    ) : (
                      "Register now"
                    )}
                  </button>
                )}

                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-gold/50 px-5 py-2.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/10"
                  >
                    External Link
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
