import { useState } from "react";
import { 
  User, 
  Mail, 
  Ticket, 
  Coins, 
  Calendar, 
  ChevronRight, 
  Camera, 
  LogOut, 
  ShieldCheck,
  Copy,
  Check,
  Zap,
  Star
} from "lucide-react";

export default function Profile() {
  const [isCopied, setIsCopied] = useState(false);
  
  const userData = {
    name: "John Doe",
    email: "johndoe@example.com",
    role: "Customer",
    referralCode: "EVENT-NIQUE-2026",
    points: 30000,
    pointsExpiry: "28 March 2026",
    profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(userData.referralCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E293B] via-[#A855F7] to-[#FF00E5] text-white pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER PROFILE CARD */}
        <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#1E293B] border border-white/10 p-8 shadow-2xl">
          {/* Decorative Glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#A855F7] opacity-20 blur-[80px]"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#00D1FF] opacity-20 blur-[80px]"></div>

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image with Neon Ring */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#A855F7] via-[#00D1FF] to-[#FF00E5] rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                <img 
                  src={userData.profilePic} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-[2rem] object-cover bg-[#0F172A]"
                />
                <button className="absolute -bottom-2 -right-2 p-2.5 bg-[#0F172A] border border-white/20 rounded-xl text-[#00D1FF] hover:scale-110 transition-transform">
                  <Camera size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-black tracking-tight">{userData.name}</h1>
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#A855F7] to-[#FF00E5] rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 w-max mx-auto md:mx-0">
                  {userData.role}
                </span>
              </div>
              <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-6">
                <Mail size={16} className="text-[#00D1FF]" /> {userData.email}
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button className="px-8 py-3 bg-[#00D1FF] text-[#0F172A] rounded-2xl font-bold text-sm hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] transition-all active:scale-95">
                  Edit Profile
                </button>
                <button className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS & REFERRAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Points Card with Glassmorphism */}
          <div className="group bg-[#1E293B] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div className="p-4 bg-[#A855F7]/10 rounded-2xl text-[#A855F7]">
                <Coins size={28} />
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Points Balance</p>
                <h2 className="text-4xl font-black mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#FF00E5]">
                  {userData.points.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-xs relative z-10">
              <span className="text-gray-500">Expiring soon</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 rounded-full font-bold">
                <Calendar size={14} /> {userData.pointsExpiry}
              </div>
            </div>
          </div>

          {/* Referral Card */}
          <div className="bg-[#1E293B] border border-white/10 rounded-[2rem] p-8 relative">
            <div className="flex items-center gap-3 mb-6 font-black text-[#00D1FF] italic uppercase tracking-tighter text-xl">
              <Zap size={24} fill="currentColor" />
              <h3>Invites Reward</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#0F172A] border border-white/5 rounded-2xl px-6 py-4 font-mono font-bold text-center tracking-widest text-[#00D1FF] shadow-inner">
                  {userData.referralCode}
                </div>
                <button 
                  onClick={copyReferral}
                  className={`p-4 rounded-2xl transition-all active:scale-90 ${isCopied ? 'bg-green-500 text-white' : 'bg-[#FF00E5] text-white hover:shadow-[0_0_15px_rgba(255,0,229,0.4)]'}`}
                >
                  {isCopied ? <Check size={24} /> : <Copy size={24} />}
                </button>
              </div>
              <p className="text-center text-[11px] text-gray-500 font-medium">
                GIVE A COUPON, GET <span className="text-white font-bold">10,000 POINTS</span>
              </p>
            </div>
          </div>
        </div>

        {/* MODERN NAVIGATION LIST */}
        <div className="bg-[#1E293B] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <MenuLink 
            icon={<Ticket size={20} />} 
            label="My Coupons" 
            count="2 active" 
            color="#FF00E5" 
          />
          <MenuLink 
            icon={<ShieldCheck size={20} />} 
            label="Account Security" 
            color="#00D1FF" 
          />
          <button className="w-full flex items-center justify-between p-6 hover:bg-red-500/5 transition-all text-red-400 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all">
                <LogOut size={20} />
              </div>
              <span className="font-bold tracking-tight">Logout Account</span>
            </div>
            <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </div>
  );
}

function MenuLink({ icon, label, count, color }: { icon: React.ReactNode, label: string, count?: string, color: string }) {
  return (
    <button className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all group border-b border-white/5">
      <div className="flex items-center gap-4">
        <div 
          className="p-3 rounded-2xl transition-all shadow-lg"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {icon}
        </div>
        <span className="font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {count && (
          <span 
            className="text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {count}
          </span>
        )}
        <ChevronRight size={18} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}