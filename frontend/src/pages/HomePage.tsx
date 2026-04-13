import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-Components ---

const EventCard = ({ event }: { event: any }) => (
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

// --- Main Page Component ---

export default function KinetixEvents() {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { icon: "all_inclusive", label: "All Events" },
    { icon: "music_note", label: "Music" },
    { icon: "terminal", label: "Tech" },
    { icon: "palette", label: "Arts" },
    { icon: "restaurant", label: "Dining" },
    { icon: "fitness_center", label: "Wellness" },
  ];

  const allEvents = [
    {
      category: "Music",
      title: "Sonic Architecture: 001",
      date: "OCT 24",
      location: "Jakarta, Indonesia",
      price: "IDR 850.000",
      attendees: "12k",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800",
    },
    {
      category: "Arts",
      title: "The Void: Abstract Expo",
      date: "OCT 28",
      location: "Bali, Indonesia",
      price: "IDR 450.000",
      attendees: "3k",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800",
    },
    {
      category: "Tech",
      title: "Future Stack Summit",
      date: "NOV 02",
      location: "Bandung, Indonesia",
      price: "IDR 1.200.000",
      attendees: "1k",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800",
    },
    {
      category: "Dining",
      title: "Molecular Noir Dining",
      date: "NOV 15",
      location: "Jakarta, Indonesia",
      price: "IDR 2.500.000",
      attendees: "200",
      image:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800",
    },
  ];

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesCategory =
        activeCategory === "All Events" || event.category === activeCategory;
      const matchesSearch = event.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="bg-[#131313] text-[#E5E2E1] font-sans selection:bg-[#c0c1ff] selection:text-[#1000a9] min-h-screen overflow-x-hidden">
      <main className="pt-16">
        {/* Hero Section with Animation */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <img
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1600"
              alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/60 to-[#131313]"></div>
          </motion.div>

          <div className="relative z-10 text-center px-6 max-w-4xl">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white"
            >
              Architect Your{" "}
              <span className="text-[#c0c1ff] italic">Moment</span>.
            </motion.h1>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center bg-[#2a2a2a]/80 backdrop-blur-md p-1 rounded-xl shadow-2xl border border-white/10 max-w-md mx-auto"
            >
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 px-6 py-3 w-full text-white outline-none"
                placeholder="Search event title..."
                type="text"
              />
              <button className="bg-[#c0c1ff] text-[#1000a9] font-bold px-6 py-3 rounded-lg hover:brightness-110 transition-all">
                <span className="material-symbols-outlined">search</span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* Interactive Category Filters */}
        <section className="px-8 mb-12 -mt-12 relative z-20">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
            {categories.map((cat) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat.label
                    ? "bg-[#c0c1ff] text-[#1000a9] shadow-[0_0_20px_rgba(192,193,255,0.4)]"
                    : "bg-[#2a2a2a] hover:bg-[#393939] text-[#c7c4d8] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {cat.icon}
                </span>{" "}
                {cat.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Dynamic Events Grid */}
        <section className="px-8 pb-24 max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[#c0c1ff] font-bold tracking-widest text-xs uppercase mb-2 block">
                Curated Selection
              </span>
              <h2 className="text-3xl font-bold text-white">
                Upcoming Experiences
              </h2>
            </div>
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard key={event.title} event={event} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center text-[#c7c4d8] py-20"
                >
                  <span className="material-symbols-outlined text-6xl mb-4">
                    event_busy
                  </span>
                  <p>
                    No events found for "{searchQuery}" in {activeCategory}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
