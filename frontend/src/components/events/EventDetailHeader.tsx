import React from "react";
import { motion } from "framer-motion";

interface EventDetailHeaderProps {
  title: string;
  date: string;
  location: string;
  time: string;
  image: string;
  category: string;
  subcategory?: string;
}

export const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({
  title,
  date,
  location,
  time,
  image,
  category,
  subcategory,
}) => {
  return (
    <section className="relative w-full h-[60vh] md:h-[614px] overflow-hidden">
      <img
        alt="Main Event Hero"
        className="w-full h-full object-cover"
        src={image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent"></div>

      <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <span className="bg-[#4b4dd8]/20 text-[#c0c1ff] px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
            {category}
          </span>
          {subcategory && (
            <span className="bg-[#353534] text-[#c7c4d8] px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
              {subcategory}
            </span>
          )}
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#e5e2e1] mb-6 leading-none">
          {title}
        </h1>

        <div className="flex flex-wrap gap-8 text-[#c7c4d8]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#c0c1ff]">
              calendar_today
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest font-bold">
                Date & Time
              </p>
              <p className="text-[#e5e2e1] font-medium">
                {date} • {time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#c0c1ff]">
              location_on
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest font-bold">
                Location
              </p>
              <p className="text-[#e5e2e1] font-medium">{location}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
