import { motion } from "framer-motion";
import { Calendar, Check, ExternalLink, LockKeyhole, MapPin, Sparkles } from "lucide-react";
import type { ClubEvent } from "../data/events";
import { useAuth } from "../context/AuthContext";

interface EventCardProps {
  event: ClubEvent;
  onLoginRequired: () => void;
  onSelectEvent: (event: ClubEvent) => void;
}

export default function EventCard({ event, onLoginRequired, onSelectEvent }: EventCardProps) {
  const { user, registeredEventIds, registerForEvent } = useAuth();
  const isAarambh = event.id === "datathon-2026";
  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isRegistered = registeredEventIds.has(event.id);

  const handleCardClick = () => {
    if (!user) {
      onLoginRequired();
    } else {
      onSelectEvent(event);
    }
  };

  const handleRegisterClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onLoginRequired();
      return;
    }
    if (!isRegistered) {
      await registerForEvent(event);
    }
    onSelectEvent(event);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#d8b56a]/35 bg-[#100e0b] transition-all duration-300 hover:border-[#f0ce82]/70 cursor-pointer"
      data-cursor-hover
      onClick={handleCardClick}
    >
      <div
        className={`relative overflow-hidden ${isAarambh ? "aspect-[1240/634] bg-[#100e0b]" : "h-52 bg-espresso"}`}
        data-cursor-image
      >
        <img
          src={event.image}
          alt=""
          className="h-full w-full scale-100 object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
          onError={(e) => (e.currentTarget.style.opacity = "0")}
        />
        {user && isRegistered && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-sage/90 px-3 py-1 text-xs font-bold text-espresso shadow-lg backdrop-blur-sm">
            <Check size={14} /> Registered
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isAarambh ? "text-[#e1bb6c]" : "text-gold"}`}>
          {event.category}
        </span>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-cream">{event.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-beige/70">{event.description}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-beige/60">
          <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gold" /> {formattedDate}</span>
          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gold" /> {event.venue}</span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-beige/15 pt-4">
          <button
            type="button"
            className="text-sm font-semibold text-gold underline decoration-transparent underline-offset-4 transition-all duration-300 hover:decoration-gold"
          >
            {user ? (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={14} className="text-gold" /> View details
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole size={13} /> Login to view details
              </span>
            )}
          </button>

          {event.status !== "past" && (
            <button
              type="button"
              onClick={handleRegisterClick}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition-transform duration-300 group-hover:-translate-y-0.5 ${
                isRegistered
                  ? "bg-sage/20 border border-sage text-sage hover:bg-sage/30"
                  : "bg-[#d9b467] text-[#171109] hover:bg-[#ecc77d]"
              }`}
            >
              {!user ? (
                <>Login to register <LockKeyhole size={13} /></>
              ) : isRegistered ? (
                <>Registered <Check size={13} /></>
              ) : (
                <>Register <ExternalLink size={13} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
