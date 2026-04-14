import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Event } from "../../services/api";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

// Format price to IDR format
const formatPrice = (price: number): string => {
  if (price === 0) return "Free";
  return `IDR ${price.toLocaleString("id-ID")}`;
};

// Format date to "MON DD" format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, "0")}`;
};


export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const navigate = useNavigate();
  const formattedPrice = formatPrice(event.price);
  const formattedDate = formatDate(event.startDate);
  const imageUrl = event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      className="group relative bg-[#1c1b1b] rounded-xl overflow-hidden border border-white/5 shadow-2xl cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-64 relative overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover"
          src={imageUrl}
          alt={event.name}
        />
        <div className="absolute top-4 right-4 bg-[#131313]/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-white">
          {formattedDate}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#c0c1ff]/10 text-[#c0c1ff] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            {event.category}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-[#c0c1ff] transition-colors text-[#e5e2e1] line-clamp-1">
          {event.name}
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
            {formattedPrice}
          </div>
        </div>
        <div className="mt-6">
          <button className="text-[#c0c1ff] font-bold text-sm flex items-center gap-1 group-hover:gap-3 transition-all">
            Get Tickets{" "}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};