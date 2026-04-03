import React from 'react';

// Pastikan Anda telah mengimpor font Manrope dan Inter di proyek Anda
// Dan menambahkan Material Symbols di index.html atau layout Anda.

const CosmicFestival: React.FC = () => {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* Styles kustom (Bisa dipindah ke file CSS global) */}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-gradient-to-b from-slate-950/80 to-transparent">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-950/40 backdrop-blur-md hover:bg-slate-900 transition-colors">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <div className="flex gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-950/40 backdrop-blur-md hover:bg-slate-900 transition-colors">
            <span className="material-symbols-outlined text-on-surface">favorite</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-950/40 backdrop-blur-md hover:bg-slate-900 transition-colors">
            <span className="material-symbols-outlined text-on-surface">share</span>
          </button>
        </div>
      </header>

      <main className="pb-32">
        {/* Hero Section */}
        <section className="relative h-[530px] w-full overflow-hidden">
          <img 
            alt="Concert stage with neon lights" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkQSOXFjeBAATiiA4Gki3km0f--iRZg7e1b4rZWEJpaIAHvLBzfO5mFA8GRUQmlFFzNxXyEiQ1Wo7jO1HHp7XmzmLTNpzFlCgIWjYxyrl3iwob5Ir1-AFLiEUGL4GGv9clN_USfhTiJdxNdo9Jj9ZjIMyh7eBrKySo91g6OInV6LzjSwF9moILWmxoNX5UVFiVffNnh9yB1ZmMC6AtGCVGJ4sCsn07hoFdgsczQkvQL5aOFWCj2wvhqYtLPqeB_EBPTpgL4CVBOoAT"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary pulse-dot"></span>
              <span className="text-tertiary font-bold tracking-widest text-[10px] uppercase font-label">Selling Fast</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter text-on-surface text-glow leading-none">
              Cosmic Music <br/>Festival 2026
            </h1>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-6 -mt-6 relative z-10 space-y-8">
          {/* Info Card */}
          <div className="glass-card rounded-[2rem] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Date</p>
                <p className="font-bold text-on-surface">July 15-17</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">schedule</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Time</p>
                <p className="font-bold text-on-surface">4 PM - 2 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">location_on</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Location</p>
                <p className="font-bold text-on-surface">Gelora Bung Karno, JKT</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold text-primary">About the Experience</h2>
            <div className="space-y-4 text-on-surface-variant leading-relaxed font-body">
              <p>Prepare for a celestial journey where music meets the stars. Cosmic Music Festival 2026 returns to Jakarta with its most ambitious production to date.</p>
              <p>Witness the convergence of international headliners and local innovators in an atmosphere designed to transcend the ordinary.</p>
            </div>
          </div>

          {/* Lineup Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-headline font-bold text-primary">The Lineup</h2>
              <span className="text-secondary font-bold text-sm hover:underline cursor-pointer">View Schedule</span>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                { name: 'Luna Ray', img: '1', ring: 'ring-primary' },
                { name: 'Solaris Duo', img: '2', ring: 'ring-secondary/40' },
                { name: 'MC Nebula', img: '3', ring: 'ring-secondary/40' },
                { name: 'Vortex', img: '4', ring: 'ring-secondary/40' },
              ].map((artist, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 group">
                  <div className={`w-20 h-20 rounded-full overflow-hidden ring-2 ${artist.ring} ring-offset-4 ring-offset-background group-hover:scale-105 transition-transform`}>
                    <img alt={artist.name} className="w-full h-full object-cover" src={`http://googleusercontent.com/profile/picture/${artist.img}`} />
                  </div>
                  <p className="font-bold text-sm text-center">{artist.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Venue Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold text-primary">Venue</h2>
            <div className="rounded-3xl h-48 w-full overflow-hidden relative">
              <img 
                alt="Venue Map" 
                className="w-full h-full object-cover opacity-60" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGsOUymao_ZQa4X23FfDuDpMPmiGxGS6KMkxEqXNStlBre7nmu1Jwf3HJ4eiPfY2DZ_A99O8uugTn5MBJgySSv7SVkyj7g-6FWD3g-ucMSk2huMioLDnszBqPIPSXmBzh1mFaU1WJom3OA7rTen_J5bOyYMGG212oPo0IEtOCwyFA3aeKK2tZRar94-mFn3A3dPM4VBZfk8y0i7Q13Br39vp0weMcgMnOvrvzxCo37arqTVKrdcRq_syNIye1KoBjlYbS2YWNxRFN3"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-surface-container-highest/80 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary">explore</span>
                  <span className="text-sm font-bold">Open in Maps</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full p-6 z-50">
        <div className="glass-card rounded-3xl p-4 flex items-center justify-between shadow-[0_-20px_50px_rgba(6,14,32,0.8)] border border-white/5">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Price from</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-headline font-extrabold text-on-surface">Rp 850k</span>
              <span className="text-xs text-on-surface-variant">/day</span>
            </div>
          </div>
          <button className="bg-gradient-to-r from-primary to-primary-dim text-on-primary-fixed px-8 py-4 rounded-2xl font-bold font-headline shadow-[0_10px_30px_rgba(204,151,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
            Get Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default CosmicFestival;