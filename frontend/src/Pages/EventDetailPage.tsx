import { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  Plus,
  Minus,
  ArrowRight,
  Globe,
  Send,
  Building2,
} from "lucide-react";

const tickets = [
  {
    id: "standard",
    name: "Standard Admission",
    desc: "Single day access",
    price: "IDR 450.000",
  },
  {
    id: "vip",
    name: "VIP Passage",
    desc: "Lounge & Priority entry",
    price: "IDR 1.250.000",
    popular: true,
  },
  {
    id: "full",
    name: "Full Odyssey Pass",
    desc: "3-day full access",
    price: "IDR 2.800.000",
  },
];

const recommended = [
  {
    date: "NOV 12, 2024",
    title: "Future Pulse: AI & Creativity Summit",
    price: "IDR 850.000",
    tag: "Tomorrow",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAO5IC8p86iyD_dEhB9kOOs4d02KbZ-RaTbJqOx6PqUemS9yuYqPd1t62mupBn6qxTcmeJV-e1_Pe138OWa66jVeQhLA953QPbL--Y0HKnpr1t5nPEbs-spvqIC8Zj2VrivlE_kRy-SN_a4JLEhTyEYhkgWIhNJCKZmNWMpWGmG3QsO_wclWvO7da6wzLRHFw5rThLKWgCxF01_A-E1WaaDET8fQNRbjrdlfuLrQjC6NdT1P_QwstUfVsdPcIuSAHn5ZWU8tcUusytU",
  },
  {
    date: "DEC 04, 2024",
    title: "Sonic Layers: Underground Beats",
    price: "IDR 350.000",
    tag: "SOLD OUT",
    soldOut: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwH0_Ae_ktgFVqCAPyqxZqYcKKxqfJqDNAcsmXq2kchFyjzwz-nArKDTLEjbOKTyuQxbMQT9K4o0Tb5E-i7n6rOGNpY5yFsyVCOenDW3LnrfXMvUE2H3Jer-xU2ezf6BgFq7EF5g4PuepXu5nkEFkQ8J32xLAhhMBj6okga2wb6LwqdKTihUL6z_Ot9fKiqyTsOjrdK-_voglGYn2XcTLv1ZUO_25_ex_03673wwNzbL9hd_omenmhe-ikgnIdYZpU-WsKmqtv1ZRM",
  },
  {
    date: "JAN 15, 2025",
    title: "Nocturnal Design: After Dark Series",
    price: "IDR 600.000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCIxp4lio5XdXh6oPf-mWpTJJkDoC-dYTxydzpjkUj6pBGdAJFxjpi3H7_hWDMt1xq3_SOa5-oWxhr5GSc9GZLch3LjFSBiR7HdVYHM2F6l-X8RoApG9tu9PYzMSVbsBcemYiaQk6LvpaFQFQUfVvmxgzfSAn1HszMfwjtidpMOpfSpXYBDU0LV3Hb0GkbBTpoZXfierN0hEbrFr8BcQKqJUHYNkd5_v7N5k3-7SH5HHU38vo8SONzS4FhHjyvGN0pOiJphai4V7nlA",
  },
];

export default function EventDetailPPage() {
  const [selectedTicket, setSelectedTicket] = useState("standard");
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-[#faf9fc] text-[#1a1c1e] font-sans">
      {/* Hero Section */}
      <div className="relative w-full h-[716px] overflow-hidden">
        <img
          className="w-full h-full object-cover"
          data-alt="expansive overhead view of a high-end kinetic light installation at an indoor music festival with vibrant blue and magenta neon hues"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb6Ow4Z0ialF_SgbQw8zL7GH3kAXR0Y4W6fHW07KVYCWtvkCgSX-HQhpSsr78zTxW02kxxDRhfZzJ2rrmKRZrt0yfNndFlyhlHgxEutWjSoB_QH0RJXRDGelrYsfkxgBbRBzWlf--ho5ickI5PcoIQr4LyWRqip2MrAqYE__iytzUhyiTRAr0xFUUb8-nkXtznn4V3vftRqxvo4TNU8iFaBCaDvFtqx9EaMdKzXXffPScgKBpAyfMemqQ5IOuHnbX8RriVPeksy078"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-screen-2xl mx-auto flex flex-col items-start gap-4">
          <div className="flex gap-2">
            <span className="bg-[#ff6f35] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              LIVE EVENT
            </span>
            <span className="bg-[#0f3dca]/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
              Digital Art
            </span>
          </div>
          <h1
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter max-w-4xl leading-tight"
            style={{ textShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
          >
            Lumina: The Kinetic Light Odyssey
          </h1>
          <div className="flex flex-wrap items-center gap-8 text-white/90 font-medium mt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ff6f35]" />
              <span>October 24 - 26, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ff6f35]" />
              <span>19:00 - 02:00 WIB</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#ff6f35]" />
              <span>Jakarta Convention Center, Senayan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Shell */}
      <div className="max-w-screen-2xl mx-auto px-8 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-16">
          {/* Description Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-1 w-12 bg-[#0f3dca]"></div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#0f3dca]">
                The Vision
              </h2>
            </div>
            <div className="space-y-6 text-[#444655] leading-relaxed">
              <p className="text-2xl font-medium text-[#1a1c1e] leading-snug">
                Prepare to transcend the ordinary. Lumina is not just an
                exhibition—it's a physical immersion into the pulse of light and
                sound.
              </p>
              <p>
                Experience the collaboration of 12 world-renowned kinetic
                artists as they transform 5,000 square meters of industrial
                space into a breathing, sentient environment. Using AI-driven
                lighting arrays and localized soundscapes, Lumina challenges
                your perception of space and time.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                <li className="flex items-start gap-3 bg-[#f4f3f6] p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-[#0f3dca] flex-shrink-0 mt-0.5" />
                  <span>360-degree immersive kinetic dome</span>
                </li>
                <li className="flex items-start gap-3 bg-[#f4f3f6] p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-[#0f3dca] flex-shrink-0 mt-0.5" />
                  <span>Interactive laser fields</span>
                </li>
                <li className="flex items-start gap-3 bg-[#f4f3f6] p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-[#0f3dca] flex-shrink-0 mt-0.5" />
                  <span>Curated ambient soundscape by Synthesis</span>
                </li>
                <li className="flex items-start gap-3 bg-[#f4f3f6] p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-[#0f3dca] flex-shrink-0 mt-0.5" />
                  <span>VIP Sensory Lounge access</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Organizer Section */}
          <section className="bg-[#f4f3f6] rounded-3xl p-8 md:p-12 border border-[#c4c5d7]/10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <img
                className="w-32 h-32 rounded-2xl object-cover shadow-xl"
                data-alt="portrait of a professional creative director with glasses in a modern minimalist studio setting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTWMVEvCRsDLWblGRbytaF7vaKPKBbgL3nBuNrxuLqPPmLqxiC5kMVpSv-vYSZRvukg2cyo6b_yCI96VtkCzX4GMPe9SYKIqdgGoFH3OJqsssSzvXDhWb4motM0cjjOJL2SE802CRiuBln1F8dtfybptmQoKEfV-BzXJUltsQP4HpYa3BR3DhF2Cpo4nejjVuhk4Vs_nKqQr5lU0AdhaQ8i_y5zlO2Y6hlmUmePoRqv5lFdKAuWoFAuNnd_IzhKhYZF9jEwOAVPuiA"
              />
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">
                    Kinetic Curator Collective
                  </h3>
                  <p className="text-[#0f3dca] font-semibold uppercase text-xs tracking-widest">
                    Organizer Hub
                  </p>
                </div>
                <p className="text-[#444655] max-w-xl">
                  A global collective specializing in high-concept sensory
                  experiences. With over 15 years of curating kinetic art across
                  4 continents, we bridge the gap between technology and human
                  emotion.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-[#a93800]">
                      <span className="text-xl font-bold">4.9</span>
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">
                      Avg Rating
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">120+</div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">
                      Events Hosted
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">45k</div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">
                      Followers
                    </span>
                  </div>
                </div>
              </div>
              <button className="px-6 py-3 border-2 border-[#0f3dca] text-[#0f3dca] font-bold rounded-xl hover:bg-[#0f3dca]/5 transition-colors">
                Follow Hub
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Transactions & Sticky Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-6">
            {/* Ticket Selection Card */}
            <div className="bg-white rounded-3xl shadow-[0_40px_80px_rgba(15,61,202,0.1)] overflow-hidden border border-[#c4c5d7]/10">
              <div className="bg-[#0f3dca] p-6 text-white">
                <h3 className="text-xl font-bold">Secure Your Spot</h3>
                <p className="text-sm opacity-80">
                  Prices inclusive of service tax
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Ticket Options */}
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <label
                      key={ticket.id}
                      className="block group cursor-pointer"
                    >
                      <input
                        checked={selectedTicket === ticket.id}
                        className="hidden peer"
                        name="ticket"
                        type="radio"
                        onChange={() => setSelectedTicket(ticket.id)}
                      />
                      <div
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          selectedTicket === ticket.id
                            ? "border-[#0f3dca] bg-[#0f3dca]/5"
                            : "border-[#e3e2e5] hover:border-[#0f3dca]/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{ticket.name}</p>
                            {ticket.popular && (
                              <span className="bg-[#a93800] text-white text-[8px] px-2 py-0.5 rounded-full uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#444655]">
                            {ticket.desc}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0f3dca]">
                            {ticket.price}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between border-t border-[#e3e2e5] pt-6">
                  <span className="font-medium">Quantity</span>
                  <div className="flex items-center gap-4 bg-[#f4f3f6] px-4 py-2 rounded-xl">
                    <button
                      className="text-[#444655] hover:text-[#0f3dca] transition-colors"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold w-4 text-center">
                      {quantity}
                    </span>
                    <button
                      className="text-[#0f3dca]"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button className="w-full bg-[#0f3dca] text-white py-4 rounded-2xl font-bold text-lg shadow-[0_10px_20px_rgba(15,61,202,0.2)] active:scale-95 transition-all">
                  Register Now
                </button>
                <p className="text-center text-[10px] uppercase font-bold tracking-widest text-[#444655] opacity-60">
                  Powered by The Event Editorial
                </p>
              </div>
            </div>

            {/* Map/Location Card */}
            <div className="bg-[#e8e8eb] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Venue Location</h4>
                <a
                  className="text-xs font-bold text-[#0f3dca] underline"
                  href="#"
                >
                  Get Directions
                </a>
              </div>
              <div className="h-48 rounded-2xl overflow-hidden bg-[#f4f3f6] relative">
                <img
                  className="w-full h-full object-cover grayscale opacity-50"
                  data-alt="stylized map layout of central Jakarta showing urban grid and green parks"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaLTd8icxjNP8Yk0APWTioejsFjxz8lm14ST0DKxayPVyK_P1he8U5Imf8hSuekW4PRjyGDaWT3lVZZCS-U55olRs6bxTnlICUlyTnc1quUEGMh3wVE92ruqNDDG6J5r1ojHKdgBeeFhm9z1plCal6XWrI-eQLspUX0gm7fYk3eK4hP8qHbDP5jhuAV9tJ2A2YWd0NMnLTT-AgAYTZtgU_uxlXNI8LN2nGadcNpQ_1EtHeqBNYwEsW-Ysqc2ZjB8A5_F__ckkh3DZU"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin
                    className="w-10 h-10 text-[#0f3dca]"
                    fill="currentColor"
                  />
                </div>
              </div>
              <p className="text-sm font-medium">
                Jl. Gatot Subroto No.1, Gelora, Kecamatan Tanah Abang, Jakarta
                Pusat
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Events Recommendations */}
      <section className="bg-[#f4f3f6] py-24">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-1 w-12 bg-[#a93800]"></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#a93800]">
                  Discover More
                </h2>
              </div>
              <h3 className="text-4xl font-bold tracking-tight">
                Similar Editorial Picks
              </h3>
            </div>
            <button className="group flex items-center gap-2 text-[#0f3dca] font-bold">
              View All Experiences
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommended.map((event, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    data-alt={event.title}
                    src={event.image}
                  />
                  {event.tag && (
                    <div
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        event.soldOut
                          ? "bg-[#ba1a1a] text-white"
                          : "bg-[#a93800] text-white"
                      }`}
                    >
                      {event.tag}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                    <p className="text-white font-bold text-xl leading-tight">
                      {event.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#444655]">
                    {event.date}
                  </span>
                  <span className="text-[#0f3dca] font-bold">
                    {event.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100/50">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-6">
            <span className="text-lg font-bold text-slate-900">
              The Event Editorial
            </span>
            <p className="text-slate-500 max-w-xs text-sm">
              Curating the Kinetic. Defining the future of event discovery and
              professional organization.
            </p>
            <div className="flex gap-4">
              <Globe className="w-5 h-5 text-[#444655] cursor-pointer hover:text-[#0f3dca] transition-colors" />
              <Building2 className="w-5 h-5 text-[#444655] cursor-pointer hover:text-[#0f3dca] transition-colors" />
              <Send className="w-5 h-5 text-[#444655] cursor-pointer hover:text-[#0f3dca] transition-colors" />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900">
              Discover
            </h4>
            <ul className="space-y-2 text-xs uppercase tracking-widest">
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-400 hover:underline underline-offset-4 transition-colors"
                  href="#"
                >
                  Explore
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-400 hover:underline underline-offset-4 transition-colors"
                  href="#"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-400 hover:underline underline-offset-4 transition-colors"
                  href="#"
                >
                  Trending
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900">
              Editorial
            </h4>
            <ul className="space-y-2 text-xs uppercase tracking-widest">
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-400 hover:underline underline-offset-4 transition-colors"
                  href="#"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-400 hover:underline underline-offset-4 transition-colors"
                  href="#"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-400 hover:underline underline-offset-4 transition-colors"
                  href="#"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900">
              Legal
            </h4>
            <ul className="space-y-2 text-xs uppercase tracking-widest">
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-400 hover:underline underline-offset-4 transition-colors"
                  href="#"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-400 hover:underline underline-offset-4 transition-colors"
                  href="#"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            © 2024 The Event Editorial. Curating the Kinetic.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-[#0f3dca]">
              IDR / INDONESIA
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
