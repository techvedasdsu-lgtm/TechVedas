import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { events as allEvents, type ClubEvent } from "../data/events";
import { useEventFilter } from "../hooks/useEventFilter";
import EventFilter from "./EventFilter";
import EventCard from "./EventCard";
import EventDetails from "./EventDetails";

const VISIBLE_CATEGORIES = new Set(["Workshops", "Hackathons"]);

interface EventsProps {
  onLoginRequired: () => void;
}

export default function Events({ onLoginRequired }: EventsProps) {
  const upcoming = allEvents.filter(
    (e) => e.status !== "past" && VISIBLE_CATEGORIES.has(e.category)
  );
  const past = allEvents.filter(
    (e) => e.status === "past" && VISIBLE_CATEGORIES.has(e.category)
  );

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const source = tab === "upcoming" ? upcoming : past;
  const { filter, setFilter, filtered } = useEventFilter(source);

  return (
    <section id="events" className="relative bg-[#0B1320]/35 backdrop-blur-sm py-28 border-b border-gold/15 text-cream">
      <div className="container-edit">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-4xl font-semibold text-cream sm:text-5xl">Events</h2>
          <div className="flex gap-2 rounded-full border border-beige/15 bg-espresso/60 p-1">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setFilter("All");
                }}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors duration-300 ${
                  tab === t ? "bg-gold text-espresso" : "text-beige/70 hover:text-cream"
                }`}
              >
                {t} events
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <EventFilter value={filter} onChange={setFilter} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${tab}-${filter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onLoginRequired={onLoginRequired}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-beige/60">No events in this category yet.</p>
        )}
      </div>

      {selectedEvent && (
        <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </section>
  );
}
