import { motion } from "framer-motion";

interface Event {
  category: string;
  title: string;
  date: string;
  location: string;
  price: string;
  attendees: string;
  image: string;
}

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -8 }}
    className="group relative bg-[#1c1b1b] rounded-xl overflow-hidden border border-white/5 shadow-2xl"
  >
    <div className="h-64 relative overflow-hidden">
      <motion.img
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.6 }}
        className="w-full h-full object-cover"
        src={event.image}
        alt={event.title}
      />
      <div className="absolute top-4 right-4 bg-[#131313]/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-white">
        {event.date}
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-[#c0c1ff]/10 text-[#c0c1ff] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          {event.category}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-[#c0c1ff] transition-colors text-[#e5e2e1] line-clamp-1">
        {event.title}
      </h3>
      <div className="flex flex-col gap-2 text-sm text-[#c7c4d8]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-[#c0c1ff]">
            location_on
          </span>{" "}
          {event.location}
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-[#c0c1ff]">
            payments
          </span>{" "}
          {event.price}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 border-[#1c1b1b] bg-slate-700 flex items-center justify-center text-[8px]`}
            >
              <img
                src={`https://i.pravatar.cc/150?u=${event.title}${i}`}
                className="rounded-full"
              />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-[#1c1b1b] bg-[#353534] flex items-center justify-center text-[10px] font-bold text-white">
            +{event.attendees}
          </div>
        </div>
        <button className="text-[#c0c1ff] font-bold text-sm flex items-center gap-1 group-hover:gap-3 transition-all">
          Get Tickets{" "}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  </motion.div>
);
