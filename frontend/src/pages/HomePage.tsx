import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEventStore } from "../stores/useEventStore";
import { useDebounce } from "../lib/useDebounce";
import { EventCard } from "../components/home/EventCard";

// --- Main Page Component ---

export default function KinetixEvents() {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  
  const debouncedLocation = useDebounce(locationQuery, 800);
  
  const { events, loading, error, fetchEvents, pagination } = useEventStore();

  const categories = [
    { icon: "all_inclusive", label: "All Events" },
    { icon: "music_note", label: "Music" },
    { icon: "groups", label: "Conference" },
    { icon: "build", label: "Workshop" },
    { icon: "school", label: "Seminar" },
    { icon: "sports", label: "Sports" },
    { icon: "celebration", label: "Entertainment" },
  ];

  // Map frontend category to backend category enum
  const categoryMap: Record<string, string | undefined> = {
    "All Events": undefined,
    "Music": "Music",
    "Conference": "Conference",
    "Workshop": "Workshop",
    "Seminar": "Seminar",
    "Sports": "Sports",
    "Entertainment": "Entertainment",
  };

  // Fetch events when category, search, or location query changes
  useEffect(() => {
    const params: {
      search?: string;
      category?: string;
      location?: string;
      page: number;
      limit: number;
    } = {
      page: pagination.page,
      limit: 20,
    };

    // Add search query if provided
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    // Add category filter (not "All Events")
    if (activeCategory !== "All Events") {
      params.category = categoryMap[activeCategory];
    }

    // Add location filter if provided
    if (debouncedLocation.trim()) {
      params.location = debouncedLocation.trim();
    }

    fetchEvents(params);
  }, [activeCategory, searchQuery, debouncedLocation, fetchEvents, pagination.page]);

  // Filter events client-side for search (if API search didn't work)
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    // If we have search query, do client-side filtering as backup
    if (searchQuery.trim()) {
      return events.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return events;
  }, [events, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    useEventStore.getState().setPage(newPage);
  };

  return (
    <div className="bg-[#131313] text-[#E5E2E1] font-sans selection:bg-[#c0c1ff] selection:text-[#1000a9] min-h-screen overflow-x-hidden">
      <main className="pt-16">
        {/* Hero Section with Animation */}
        <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
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
              className="flex flex-col gap-3 items-center bg-[#2a2a2a]/80 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/10 max-w-lg mx-auto"
            >
              <input
                onChange={handleSearchChange}
                className="bg-[#1c1b1b] border border-white/10 rounded-lg px-4 py-3 w-full text-white outline-none focus:border-[#c0c1ff] transition-colors"
                placeholder="Search event title..."
                type="text"
                value={searchQuery}
              />
              <input
                onChange={(e) => setLocationQuery(e.target.value)}
                className="bg-[#1c1b1b] border border-white/10 rounded-lg px-4 py-3 w-full text-white outline-none focus:border-[#c0c1ff] transition-colors"
                placeholder="Filter by location..."
                type="text"
                value={locationQuery}
              />
              <button className="bg-[#c0c1ff] text-[#1000a9] font-bold px-6 py-3 rounded-lg hover:brightness-110 transition-all w-full">
                <span className="material-symbols-outlined">search</span> Search Events
              </button>
            </motion.div>
          </div>
        </section>

        {/* Interactive Category Filters */}
        <section className="px-8 mb-12 mt-8 relative z-20 flex justify-center">
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

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center text-[#c7c4d8] py-20"
            >
              <span className="material-symbols-outlined text-6xl mb-4 text-red-500">
                error
              </span>
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => fetchEvents({ limit: 20 })}
                className="mt-4 text-[#c0c1ff] hover:underline"
              >
                Try again
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center text-[#c7c4d8] py-20"
            >
              <div className="w-12 h-12 border-4 border-[#c0c1ff] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading events...</p>
            </motion.div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]"
            >
              <AnimatePresence mode="popLayout">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
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
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-12 pb-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2a] text-[#c7c4d8] hover:bg-[#393939] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Previous
                </button>
                <span className="px-4 py-2 text-[#c7c4d8]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2a] text-[#c7c4d8] hover:bg-[#393939] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              <p className="text-sm text-[#c7c4d8]">
                Showing {events.length > 0 ? (pagination.page - 1) * 20 + 1 : 0} -{" "}
                {Math.min(pagination.page * 20, pagination.total)} of {pagination.total} events
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}