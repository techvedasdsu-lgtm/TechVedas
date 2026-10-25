import { motion } from "framer-motion";
import { Calendar, LockKeyhole, MapPin } from "lucide-react";
import type { ClubEvent } from "../data/events";

interface EventCardProps {
  event: ClubEvent;
  onLoginRequired: () => void;
}

export default function EventCard({ event, onLoginRequired }: EventCardProps) {
  const isAarambh = event.id === "datathon-2026";
  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#d8b56a]/35 bg-[#100e0b] transition-all duration-300 hover:border-[#f0ce82]/70"
      data-cursor-hover
      onClick={onLoginRequired}
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
            className="text-sm font-semibold text-gold underline decoration-transparent underline-offset-4 transition-all duration-300 hover:decoration-gold"
          >
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole size={13} /> Login to view details
            </span>
          </button>
          {event.registrationUrl && event.status !== "past" && (
            <button
              type="button"
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition-transform duration-300 group-hover:-translate-y-0.5 ${
                "bg-[#d9b467] text-[#171109]"
              }`}
            >
              Login to register <LockKeyhole size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
