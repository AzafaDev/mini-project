import { motion } from "framer-motion";

// --- Sub-komponen: Stat Card ---
const StatCard = ({
  icon,
  label,
  value,
  subtext,
  colorClass = "text-primary",
  border = "",
}: any) => (
  <div
    className={`bg-[#1c1b1b] p-6 rounded-xl flex flex-col justify-between ${border}`}
  >
    <div>
      <span className={`material-symbols-outlined ${colorClass} mb-4`}>
        {icon}
      </span>
      <h3 className="text-[10px] uppercase tracking-widest text-[#c7c4d8] mb-1">
        {label}
      </h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
    <p
      className={`text-xs mt-4 ${colorClass === "text-tertiary" ? "text-tertiary" : "text-[#c7c4d8]"}`}
    >
      {subtext}
    </p>
  </div>
);

// --- Sub-komponen: Ticket Card ---
const TicketCard = ({

  title,
  date,
  location,
  price,
  status,
  image,
  orderId,
}: any) => {
  const isPending = status === "Pending Payment";
  const isPast = status === "Past Event";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${
        isPast
          ? "bg-[#0e0e0e]/50 border border-[#464555]/10 opacity-60 hover:opacity-100"
          : isPending
            ? "bg-[#2a2a2a] shadow-2xl shadow-black/20"
            : "bg-[#1c1b1b]"
      } rounded-xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300`}
    >
      <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
        <img
          className={`w-full h-full object-cover transition-all duration-500 ${isPast ? "grayscale" : "group-hover:scale-110"}`}
          src={image}
          alt={title}
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
              isPending
                ? "bg-[#a44100]/30 text-[#ffb695] border-[#a44100]/50"
                : isPast
                  ? "bg-[#393939] text-[#c7c4d8] border-transparent"
                  : "bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/20"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h2
              className={`text-2xl font-bold tracking-tight mb-1 ${isPast ? "text-[#c7c4d8]" : "text-[#e5e2e1]"}`}
            >
              {title}
            </h2>
            <div className="flex items-center gap-4 text-[#c7c4d8] text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  calendar_month
                </span>{" "}
                {date}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>{" "}
                {location}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#c7c4d8] mb-1">{orderId}</p>
            <p
              className={`text-xl font-black ${isPending ? "text-[#ffb695]" : "text-[#c0c1ff]"}`}
            >
              {price}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isPending ? (
            <div className="flex items-center gap-3 text-sm text-[#ffb695]">
              <span className="material-symbols-outlined">info</span>
              <span>Proof of payment must be uploaded within 24 hours.</span>
            </div>
          ) : (
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#131313] bg-[#353534] overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDn-FArK1l_5_YNPDgqyu5sb-Pj7e2E1m5c8DmnXy8_LJgVnD4KPXYhIiWXtT-C1Ps2Gsl4EQEgttumnFqV1fkgcXSmsUYqclTIXvI5Ou-UXlNAXhXewRwBN3MlZ5IC5ZcnOajF_ah6UT38AHme79MpmXvsal-rHAfZaDlD9j-5tamGTeImlxyPplFgpYeWYf_VgGOgLSLK4PsYc-bjSRdlVFtuhUkxm2iBi9w6D7oQGtb_Q2dM2Nxn30uWQ1_AWo8kipJ44f_YibL"
                  alt="User"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#131313] bg-[#c0c1ff] text-[#1000a9] text-[10px] flex items-center justify-center font-bold">
                +1
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {isPast ? (
              <button className="text-[#c0c1ff] text-sm font-semibold flex items-center gap-1 hover:underline">
                Download Invoice{" "}
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
              </button>
            ) : (
              <>
                <button className="bg-[#353534] text-[#e5e2e1] py-2 px-6 rounded-lg font-bold hover:bg-[#393939] transition-all text-sm">
                  Details
                </button>
                <button
                  className={`py-2 px-6 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${
                    isPending
                      ? "bg-gradient-to-br from-[#ffb695] to-[#a44100] text-[#351000]"
                      : "bg-[#c0c1ff] text-[#07006c]"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isPending ? "upload" : "qr_code_2"}
                  </span>
                  {isPending ? "Upload Proof" : "View Pass"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Komponen Utama ---
export const MyTickets = () => {
  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl shadow-2xl shadow-black/40 h-16 flex justify-between items-center px-8">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter">EventPulse</span>
          <nav className="hidden md:flex items-center gap-6 text-[#c7c4d8] text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Discover
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Schedule
            </a>
            <a
              href="#"
              className="text-[#c0c1ff] border-b-2 border-[#c0c1ff] pb-1"
            >
              Tickets
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Venues
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:block bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold py-2 px-4 rounded text-sm">
            Create Event
          </button>
          <div className="flex gap-3 text-[#c7c4d8]">
            <span className="material-symbols-outlined cursor-pointer hover:text-white">
              notifications
            </span>
            <span className="material-symbols-outlined cursor-pointer hover:text-white">
              account_circle
            </span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto">
        <section className="mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tighter mb-4"
          >
            My Tickets
          </motion.h1>
          <p className="text-[#c7c4d8] max-w-2xl leading-relaxed">
            Manage your event registrations, access your digital passes, and
            finalize pending payments for upcoming experiences.
          </p>
        </section>

        {/* Bento Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon="confirmation_number"
            label="Upcoming"
            value="4 Events"
            subtext="Next: Neo-Synth Festival (2d)"
          />
          <StatCard
            icon="pending_actions"
            label="Action Required"
            value="1 Pending"
            subtext="Upload payment proof for VIP access"
            colorClass="text-tertiary"
            border="border-l-4 border-[#ffb695]"
          />
          <StatCard
            icon="history"
            label="Archived"
            value="12 Past"
            subtext="2023 Season Summary available"
            colorClass="text-[#918fa1]"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-[#464555]/20">
          <button className="pb-4 text-[#c0c1ff] border-b-2 border-[#c0c1ff] font-bold">
            Upcoming
          </button>
          <button className="pb-4 text-[#c7c4d8] hover:text-white transition-colors">
            Pending Payment
          </button>
          <button className="pb-4 text-[#c7c4d8] hover:text-white transition-colors">
            Past Events
          </button>
        </div>

        {/* Ticket List */}
        <div className="space-y-6">
          <TicketCard
            status="Pending Payment"
            title="Cyber-Punk Underground 2024"
            date="Dec 15, 2024"
            location="Neo-Tokyo Sector 7"
            price="$120.00"
            orderId="Order #EP-90210"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuAiGlMY31zmPxSKhPTRs2KpMB7_5tqYTAEkR9FIyoGWA2MmZ3-TkwWg-tSkDzavHoFzzFChHsn0vju3tWN-Um51s8BtsSKA9XUeePDlFo9OzXU0Vd49vXpCE7kiN1J-yiImA1Z2eC64Thf1VijNgeEYUGw-4K0MTpGDGEJKQQa19cDm6Zwee2NwLuOyQN0T3AP318G4e20dgkO2rqStlllGlVt9wLmbDEdXYt-MRBmWCWEtKjJt6xU6OKNcqpHNOHWXUH2PP-Gfo0pk"
          />
          <TicketCard
            status="Confirmed"
            title="Minimalist Techno Series: Vol 12"
            date="Nov 28, 2024"
            location="The Warehouse, Berlin"
            price="VIP Pass"
            orderId="Ticket #882-VX"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCHjQ1xcMshGIz_FgoifakVu3uZ8nWZYsyxfkqKnLuZhbTFIXCvm5OqCJ5D_tEQDiZaSsNtWqgURfxsl3yAn5HX5xBnrWdLSro34HVmDaX48o-57ejXuAhApq9gkaQybs5-B9__EUu4m6tdzkPM_BJ8NyPJPHwsNGcXmOZ95SoDJIrtGlZWFjUSc2VnwtFe9rnDYHLOmL5i4Qx3CSty5b8kXp6aXWAEEvKVzS9Pi-ByZjJ_aCrQ2jvYKSweF_LmFCICnasIAB3iDXxX"
          />
          <TicketCard
            status="Past Event"
            title="Solstice Garden Party"
            date="October 12, 2024"
            location="Central Park, NY"
            price="General"
            orderId="ID: SOL-99812-24"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDO8Vwt0cOfDN_TT8mpcgn6Xy-n5wf-Q02nlCCd4FDrkNwl6dSRiZ1Ug6gHTh0abPEVzlFe-YhdBeZmgWJ4lx0rodB4W2l_j10zmT7uxNX-a4LMvA3eIrOzJwSrq1UVqEQ2rRYG7i4UAdan5s45iu6xwlc0KeHGzsZ0wzUvh87dljyFOyaJ7d_olGUzSPn4Jvdo-wsFHDfwrGzAQ5VINO_yhaW0ITjacsqDf2sjukCmh1WInHgsqYBhfXqTnQ8cCqAihpaW8ruI1QFC"
          />
        </div>

        {/* Help Center */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#1c1b1b] to-[#0e0e0e] border border-[#464555]/10 text-center">
          <h3 className="text-xl font-bold mb-2">
            Need help with your tickets?
          </h3>
          <p className="text-[#c7c4d8] mb-6 text-sm">
            Our support team is available 24/7 for order inquiries.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-2 rounded-lg bg-[#353534] hover:bg-[#393939] font-bold text-sm transition-all">
              Visit Help Center
            </button>
            <button className="px-6 py-2 rounded-lg border border-[#c0c1ff]/20 text-[#c0c1ff] hover:bg-[#c0c1ff]/5 font-bold text-sm transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
