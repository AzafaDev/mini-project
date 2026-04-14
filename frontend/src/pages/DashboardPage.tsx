import { Sidebar } from "../components/sidebar";

// --- Types ---
interface EventItemProps {
  title: string;
  date: string;
  location: string;
  sold: number;
  capacity: number;
  status: string;
  image: string;
}

// --- Sub-Components ---

const StatCard = ({
  label,
  value,
  trend,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  trend?: string;
  icon: string;
  iconColor: string;
}) => (
  <div className="p-6 bg-[#1C1B1B] rounded-lg">
    <div
      className={`w-10 h-10 rounded flex items-center justify-center mb-4`}
      style={{ backgroundColor: `${iconColor}1A` }}
    >
      <span className="material-symbols-outlined" style={{ color: iconColor }}>
        {icon}
      </span>
    </div>
    <span className="text-on-surface-variant text-xs uppercase tracking-widest">
      {label}
    </span>
    <p className="text-2xl font-bold text-on-surface mt-1">{value}</p>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
        <span className="material-symbols-outlined text-[12px]">
          trending_up
        </span>
        {trend}
      </div>
    )}
  </div>
);

const EventItem = ({
  title,
  date,
  location,
  sold,
  capacity,
  status,
  image,
}: EventItemProps) => {
  const percentage = (sold / capacity) * 100;
  return (
    <div className="bg-[#1C1B1B] hover:bg-[#2A2A2A] transition-colors p-4 flex items-center gap-4 group cursor-pointer">
      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
        <img alt={title} className="w-full h-full object-cover" src={image} />
      </div>
      <div className="flex-1">
        <h5 className="font-bold text-on-surface">{title}</h5>
        <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">
            calendar_today
          </span>{" "}
          {date}
          <span className="mx-2">•</span>
          <span className="material-symbols-outlined text-[14px]">
            location_on
          </span>{" "}
          {location}
        </p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-on-surface">
          {sold.toLocaleString()} Sold
        </p>
        <div className="w-24 bg-[#353534] h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-[#C0C1FF] h-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="px-3 py-1 bg-[#C3C0FF]/10 text-[#C3C0FF] text-[10px] font-black uppercase rounded border border-[#C3C0FF]/20">
        {status}
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

export default function OrganizerDashboard() {
  return (
    <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter'] selection:bg-[#4B4DD8] selection:text-[#D9D8FF]">
      <Sidebar />

      {/* Main Area */}
      <main className="md:ml-64 min-h-screen">
        {/* Content */}
        <div className="pt-24 pb-12 px-8">
          {/* Stats Bento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-2 p-6 bg-[#1C1B1B] rounded-lg flex flex-col justify-between border border-[#464555]/10">
              <div>
                <span className="uppercase tracking-widest text-[#C7C4D8] font-medium text-xs">
                  Total Revenue (MTD)
                </span>
                <h3 className="text-4xl font-bold tracking-tight mt-2">
                  $248,390.00
                </h3>
              </div>
              <div className="flex items-end justify-between mt-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-[#C0C1FF]/10 text-[#C0C1FF] rounded-lg font-bold">
                    +12.4%
                  </span>
                  <span className="text-xs text-[#C7C4D8]">vs last month</span>
                </div>
                <div className="flex items-baseline gap-1 h-12">
                  {[4, 6, 8, 12, 10].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 bg-[#C0C1FF] rounded-full`}
                      style={{ height: `${h * 4}px`, opacity: 0.2 + i * 0.2 }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <StatCard
              label="Tickets Sold"
              value="12,840"
              trend="84% of capacity"
              icon="confirmation_number"
              iconColor="#C3C0FF"
            />
            <StatCard
              label="Registrations"
              value="4,219"
              trend="Across 12 events"
              icon="person_add"
              iconColor="#FFB695"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Charts & Lists */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#1C1B1B] rounded-lg p-8 h-[400px] flex flex-col border border-[#464555]/10">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-bold tracking-tight">
                    Revenue Stream
                  </h4>
                  <div className="flex gap-2">
                    {["7D", "30D", "12M"].map((t) => (
                      <button
                        key={t}
                        className={`px-3 py-1 text-xs rounded-lg border border-[#464555]/10 ${t === "30D" ? "bg-[#C0C1FF] text-[#07006C] font-bold" : "bg-[#353534]"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-3 px-4 pb-8">
                  {[30, 45, 65, 40, 80, 55, 95].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-lg transition-all relative group ${i === 6 ? "bg-[#C0C1FF] shadow-[0_0_20px_rgba(192,193,255,0.2)]" : "bg-[#4B4DD8]/30"}`}
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#353534] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${h / 2}k
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-4 pt-4 border-t border-[#464555]/10 text-[10px] text-[#C7C4D8] font-medium uppercase tracking-widest">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold tracking-tight">
                    Active Events
                  </h4>
                  <button className="text-[#C0C1FF] text-sm font-semibold flex items-center gap-1 hover:underline">
                    View all{" "}
                    <span className="material-symbols-outlined text-sm">
                      chevron_right
                    </span>
                  </button>
                </div>
                <div className="space-y-4">
                  <EventItem
                    title="Kinetix Tech Summit 2024"
                    date="Oct 12-14, 2024"
                    location="San Francisco, CA"
                    sold={842}
                    capacity={1000}
                    status="Active"
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuCoxGWp2LsHEmsC3Qs2HXvHXd_gSloFsBEkDFkxb_4LJTryl00utmyfdeV0qe4yB46OiVzM8gwVj-DY6rqvmwrh9_XFNbTh2VnoKZHECmtj5ILlL9q-r0eKMChbbXOa1iD-ZiFZwTwj8sBPTQ-9T8PfhA6tWQAnSfPKdWxdaViCM3ua3f7X-d200qER-DUSnHi3e4Y3Jafkgsv-ig4FcqRYfr4mmYakyk6yBjXzSLtAYEtKKJSza40sC4WQ3OyVm2_-e7C3LaVorNB7"
                  />
                  <EventItem
                    title="Midnight Sound Waves"
                    date="Nov 05, 2024"
                    location="Austin, TX"
                    sold={2105}
                    capacity={4600}
                    status="Selling"
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuCLbEsnlhH6YHmmk3fMrnd6kXLiV2vQYu9LTnFmAzFw3BxXOaHXuRErhN97mmFGaiZGIkSDYqbHVRGzoONTYBavW8FNbRyk5FP7F7yXKMgFMWbDj9CFX7ENw11RCucV8Xitw4poCn3nanpBeJr3I6DxkRNgg76riyay6mRq3aFRJ4b6wLUVwn7NV-nFa_mkf3FS7An_AY_OtT9XaQaqK4x4piaG3rKWW3t-xTve3xuvT-lbW3JADBz9M4ZXYIA0kIAXrL6927CuDySd"
                  />
                </div>
              </section>
            </div>

            {/* Right Sidebar Widgets */}
            <div className="space-y-8">
              <div className="bg-[#1C1B1B] rounded-lg p-6 border border-[#464555]/10">
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#C7C4D8] mb-6">
                  Recent Activity
                </h4>
                <ul className="space-y-6">
                  {[
                    {
                      dot: "#C0C1FF",
                      text: "New ticket order for Tech Summit",
                      time: "2 mins ago",
                    },
                    {
                      dot: "#C3C0FF",
                      text: "Payout of $4,500 processed",
                      time: "1 hour ago",
                    },
                    {
                      dot: "#FFB695",
                      text: "Sarah J. updated schedule",
                      time: "4 hours ago",
                    },
                  ].map((act, i) => (
                    <li key={i} className="flex gap-4">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: act.dot }}
                      ></div>
                      <div>
                        <p className="text-sm leading-snug">{act.text}</p>
                        <p className="text-[10px] text-[#C7C4D8] mt-1 uppercase">
                          {act.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deadline Card */}
              <div className="bg-[#2A2A2A]/80 backdrop-blur-xl border border-[#464555]/15 p-6 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#C0C1FF]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#C7C4D8] mb-4">
                  Upcoming Deadline
                </h4>
                <p className="text-xl font-bold">Speaker Onboarding</p>
                <p className="text-xs text-[#C7C4D8] mt-2">
                  Due in{" "}
                  <span className="text-[#C0C1FF] font-bold">3 days</span>
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <img
                      alt="Ava"
                      className="w-8 h-8 rounded-full border-2 border-[#2A2A2A]"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZw9I-PJcmX9kw55beYemfSO7LPmcoJulqJsk9SN8al4-KIpROfMDEyK-5fpW46O8Icr8ykhfJClDuH0qAsn4DwcOKGVGNyTznTYcQwSsYV5QC045rJZaAaX9CXwcJHPaOGQ7MIC8owRw-FHBfAiy2smdZGqkWKBFrlUXHzFasxffNT3XiADbHmaUPXlczooWDe5Ao9LXRTJEjP70wA_bOvZYRQoSlG3or9uMV7VnsOCOFZJgYhjaSnMVrptgpTpmJO37gK4wGUpHq"
                    />
                    <img
                      alt="Ava"
                      className="w-8 h-8 rounded-full border-2 border-[#2A2A2A]"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiidb6JS7kHsw9aeW8bunZRZzmNLzCMHEFoRazXBhcrUuMHjFp7tkUO5LBz07PionQgRaF9QY9X3IGzQvr3AYM5MCC34jpRWCMKykPqsUv7uSPpNmJ-13uHtIa7m3e_O99f87dSd6DP_s_MsHe29boQW_kdBY4iHtXzwG5pYNxDtogcmuFZShiddTXhSqm0fOVA8OA-W-XKY9LFw0iOCRTBp3ezun9BsFwQcHlVg8MKxhvxVSTWYpxm2U2QRRfEo1CACf7sUvaa2U1"
                    />
                    <div className="w-8 h-8 rounded-full bg-[#353534] border-2 border-[#2A2A2A] flex items-center justify-center text-[10px] font-bold">
                      +3
                    </div>
                  </div>
                  <button className="bg-[#353534] hover:bg-[#393939] px-4 py-2 text-xs font-bold rounded transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
