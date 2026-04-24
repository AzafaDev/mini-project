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
      includePast: boolean;
    } = {
      page: pagination.page,
      limit: 20,
      includePast: true, // Fetch all events including past events
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
    <div className="bg-dark text-text-light font-sans selection:bg-primary selection:text-primary-darker min-h-screen overflow-x-hidden">
      <main className="pt-16">
        {/* Hero Section with Animation */}
        <section className="relative min-h-[400px] md:h-[450px] flex items-center justify-center overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark/60 to-dark"></div>
          </motion.div>

           <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl">
             <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight text-white"
            >
              Architect Your{" "}
              <span className="text-primary italic">Moment</span>.
            </motion.h1>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-2 md:gap-3 items-center bg-dark-elevated/80 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-2xl border border-white/10 w-full max-w-lg mx-auto"
            >
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl">search</span>
                <input
                  onChange={handleSearchChange}
                  className="bg-dark-surface border border-white/10 rounded-lg pl-10 pr-4 py-3 w-full text-white text-sm md:text-base outline-none focus:border-primary transition-colors"
                  placeholder="Search event title..."
                  type="text"
                  value={searchQuery}
                />
              </div>
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl">location_on</span>
                <input
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="bg-dark-surface border border-white/10 rounded-lg pl-10 pr-4 py-3 w-full text-white text-sm md:text-base outline-none focus:border-primary transition-colors"
                  placeholder="Filter by location..."
                  type="text"
                  value={locationQuery}
                />
              </div>
              <button className="bg-primary text-primary-darker font-bold px-6 py-3 rounded-lg hover:brightness-110 transition-all w-full text-sm md:text-base">
                <span className="material-symbols-outlined">search</span> Search Events
              </button>
            </motion.div>
          </div>
        </section>

        {/* Interactive Category Filters */}
        <section className="px-4 md:px-8 mb-12 mt-8 relative z-20">
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar justify-start md:justify-center -mx-4 px-4 md:mx-0 md:px-0 scroll-pl-4 snap-x snap-mandatory">
            {categories.map((cat) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-300 text-sm md:text-base snap-always ${
                  activeCategory === cat.label
                    ? "bg-primary text-primary-darker shadow-[0_0_20px_rgba(192,193,255,0.4)]"
                    : "bg-dark-elevated hover:bg-dark-card-hover text-text-muted hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-lg md:text-xl">
                  {cat.icon}
                </span>{" "}
                {cat.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Dynamic Events Grid */}
        <section className="px-4 md:px-8 pb-24 max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
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
              className="col-span-full flex flex-col items-center justify-center text-text-muted py-20"
            >
              <span className="material-symbols-outlined text-6xl mb-4 text-red-500">
                error
              </span>
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => fetchEvents({ limit: 20 })}
                className="mt-4 text-primary hover:underline"
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
              className="col-span-full flex flex-col items-center justify-center text-text-muted py-20"
            >
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading events...</p>
            </motion.div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-h-[400px]"
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
                    className="col-span-full flex flex-col items-center justify-center text-text-muted py-20"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-elevated text-text-muted hover:bg-dark-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Previous
                </button>
                <span className="px-4 py-2 text-text-muted">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-elevated text-text-muted hover:bg-dark-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              <p className="text-sm text-text-muted">
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