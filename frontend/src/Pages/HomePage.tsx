import React from "react";

// Types untuk data event
interface EventCardProps {
  id: number;
  title: string;
  category: string;
  location: string;
  date: { day: string; month: string };
  price: string;
  time: string;
  attendees: string;
  image: string;
}

const events: EventCardProps[] = [
  {
    id: 1,
    title: "Neon Pulse: Underground Techno Showcase",
    category: "Electronic",
    location: "SCBD",
    date: { day: "24", month: "Oct" },
    price: "IDR 450.000+",
    time: "22:00 PM",
    attendees: "2.5k Going",
    image:
      "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Fragmented Realities: Modern Exhibition",
    category: "Art",
    location: "Menteng",
    date: { day: "02", month: "Nov" },
    price: "Free Entry",
    time: "10:00 AM",
    attendees: "800 Going",
    image:
      "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "The Alchemist Table: 7-Course Pairing",
    category: "Food",
    location: "Senopati",
    date: { day: "15", month: "Nov" },
    price: "IDR 1.200.000",
    time: "19:00 PM",
    attendees: "40 Seats Left",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9fc] text-[#1a1c1e] font-['Inter']">
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-8 py-12 md:py-20 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-block px-4 py-1 rounded-full bg-[#ffdbcf] text-[#380d00] text-xs font-bold uppercase tracking-widest mb-6">
                Discovery Redefined
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#1a1c1e] leading-[1.1] mb-6 font-['Plus_Jakarta_Sans']">
                Experience <br />
                <span className="text-[#0f3dca]">The Kinetic</span> Curator.
              </h1>
              <p className="text-lg text-[#444655] max-w-md mb-8 leading-relaxed">
                Treating event discovery as a high-end editorial experience.
                Connect with Jakarta's most exclusive gatherings.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  alt="Hero event"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-[#0f3dca]/10 blur-3xl -z-10 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="px-8 -mt-10 mb-16 relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(15,61,202,0.12)] border border-[#c4c5d7]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#747686]">
                    Event Search
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747686]">
                      search
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-[#f4f3f6] border-none rounded-lg focus:ring-2 focus:ring-[#0f3dca]/20 text-sm"
                      placeholder="What are you looking for?"
                      type="text"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#747686]">
                    Category
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747686]">
                      category
                    </span>
                    <select className="w-full pl-10 pr-4 py-3 bg-[#f4f3f6] border-none rounded-lg focus:ring-2 focus:ring-[#0f3dca]/20 text-sm appearance-none">
                      <option>All Categories</option>
                      <option>Music & Concerts</option>
                      <option>Art & Editorial</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#747686]">
                    Location
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747686]">
                      location_on
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-[#f4f3f6] border-none rounded-lg focus:ring-2 focus:ring-[#0f3dca]/20 text-sm"
                      placeholder="Jakarta, Indonesia"
                      type="text"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#747686]">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select className="flex-1 px-4 py-3 bg-[#f4f3f6] border-none rounded-lg focus:ring-2 focus:ring-[#0f3dca]/20 text-sm appearance-none">
                      <option>Date</option>
                      <option>Price</option>
                    </select>
                    <button className="p-3 bg-[#f4f3f6] rounded-lg hover:bg-[#e8e8eb] transition-colors">
                      <span className="material-symbols-outlined text-[#0f3dca]">
                        swap_vert
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-[#c4c5d7]/20">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#747686]">
                    Date Range
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      className="flex-1 px-4 py-3 bg-[#f4f3f6] border-none rounded-lg text-xs"
                      type="date"
                    />
                    <span className="text-[#c4c5d7]">to</span>
                    <input
                      className="flex-1 px-4 py-3 bg-[#f4f3f6] border-none rounded-lg text-xs"
                      type="date"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#747686]">
                    Price Range (IDR)
                  </label>
                  <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                    <div className="relative flex-1 min-w-[120px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#747686]">
                        Rp
                      </span>
                      <input
                        className="w-full pl-10 pr-4 py-3 bg-[#f4f3f6] border-none rounded-lg text-sm"
                        placeholder="Min"
                        type="number"
                      />
                    </div>
                    <div className="relative flex-1 min-w-[120px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#747686]">
                        Rp
                      </span>
                      <input
                        className="w-full pl-10 pr-4 py-3 bg-[#f4f3f6] border-none rounded-lg text-sm"
                        placeholder="Max"
                        type="number"
                      />
                    </div>
                    <button className="w-full md:w-auto px-10 py-3 bg-[#0f3dca] text-white rounded-lg font-bold text-sm shadow-xl shadow-[#0f3dca]/20 hover:scale-105 active:scale-95 transition-all">
                      Find Events
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events Listing */}
        <section className="px-8 max-w-7xl mx-auto pb-24">
          <div className="flex items-baseline justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black tracking-tighter font-['Plus_Jakarta_Sans']">
                Curated Experiences
              </h2>
              <p className="text-[#747686] mt-1 font-medium">
                84 events found in Jakarta
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src={event.image}
                  />
                  <div className="absolute top-4 left-4 bg-[#a93800] text-white px-3 py-2 rounded-lg text-center leading-tight">
                    <div className="text-[10px] font-bold uppercase">
                      {event.date.month}
                    </div>
                    <div className="text-xl font-black">{event.date.day}</div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/20">
                    {event.price}
                  </div>
                </div>
                <div className="p-8">
                  <span className="text-[10px] font-bold text-[#0f3dca] uppercase tracking-widest mb-2 block">
                    {event.category} • {event.location}
                  </span>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-[#0f3dca] transition-colors font-['Plus_Jakarta_Sans']">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-6 text-[#747686] text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>{" "}
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        group
                      </span>{" "}
                      {event.attendees}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button className="px-12 py-4 border-2 border-[#0f3dca] text-[#0f3dca] rounded-xl font-bold hover:bg-[#0f3dca] hover:text-white transition-all active:scale-95">
              Explore All Jakarta Events
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 mt-20 bg-slate-50 border-t border-slate-200/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <div className="text-xl font-bold text-slate-900">Eventnique</div>
            <p className="text-slate-500 max-w-sm text-sm tracking-wide">
              © 2024 Eventnique. The Kinetic Curator. Discover elite gatherings
              and editorialized event experiences across the globe.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-4 md:justify-end items-start">
            <div className="flex flex-col gap-3">
              <a
                className="text-slate-500 text-sm hover:text-indigo-500 transition-all"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-slate-500 text-sm hover:text-indigo-500 transition-all"
                href="#"
              >
                Privacy Policy
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <a
                className="text-slate-500 text-sm hover:text-indigo-500 transition-all"
                href="#"
              >
                Contact Support
              </a>
              <a className="text-[#0f3dca] font-semibold text-sm" href="#">
                Global Events
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
