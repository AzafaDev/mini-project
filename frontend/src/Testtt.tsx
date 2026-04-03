import React from "react";

const ArchitectPage: React.FC = () => {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 glass-nav dark:bg-slate-950/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary dark:text-blue-400">
              architecture
            </span>
            <span className="text-xl font-bold tracking-tighter font-headline">
              ARCHITECT
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-headline font-medium">
            <a
              href="#"
              className="text-primary hover:opacity-80 transition-opacity"
            >
              Beranda
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Layanan
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Portofolio
            </a>
          </nav>

          <button className="bg-gradient-to-br from-primary to-primary-dim text-on-primary px-6 py-2.5 rounded-md font-medium hover:brightness-110 transition-all shadow-md">
            Get Started
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-block px-3 py-1 bg-primary-fixed-dim rounded-full">
                <span className="text-[0.75rem] font-bold tracking-widest uppercase text-on-primary-fixed">
                  Digital Curator
                </span>
              </div>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Desain Minimalis untuk{" "}
                <span className="text-primary">Era Digital</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
                Kami membantu Anda membangun kehadiran online yang bersih,
                cepat, dan efektif melalui kurasi visual yang tajam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="bg-gradient-to-br from-primary to-primary-dim text-on-primary px-8 py-4 rounded-md font-semibold text-lg hover:brightness-110 transition-all">
                  Mulai Sekarang
                </button>
                <button className="px-8 py-4 text-primary font-semibold text-lg hover:underline transition-all">
                  Lihat Karya Kami
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-square bg-surface-container-high rounded-xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                <img
                  className="w-full h-full object-cover"
                  alt="Modern architectural detail"
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary-container/30 backdrop-blur-xl rounded-xl -z-10"></div>
            </div>
          </div>
        </section>

        {/* Feature Section (Bento Inspired) */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                Filosofi Kami
              </h2>
              <div className="w-20 h-1 bg-primary rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon="speed"
                title="Efisien"
                desc="Kode yang bersih dan performa tinggi memastikan pengalaman pengguna tanpa hambatan di setiap perangkat."
              />
              <FeatureCard
                icon="brush"
                title="Elegan"
                desc="Estetika yang abadi dan profesional yang mencerminkan kualitas serta integritas merek Anda di mata dunia."
              />
              <FeatureCard
                icon="target"
                title="Efektif"
                desc="Fokus pada konversi dan pengalaman pengguna yang bermakna untuk mencapai tujuan bisnis Anda secara terukur."
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 md:py-40 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative rounded-xl overflow-hidden min-h-[400px] flex items-center px-8 md:px-20">
              <div className="absolute inset-0 z-0">
                <img
                  className="w-full h-full object-cover"
                  alt="Minimalist workspace"
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000"
                />
                <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"></div>
              </div>
              <div className="relative z-10 max-w-2xl text-on-primary">
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
                  Siap untuk Mendefinisikan Ulang Kehadiran Digital Anda?
                </h2>
                <button className="bg-surface-container-lowest text-primary px-10 py-4 rounded-md font-bold text-lg hover:bg-primary-container transition-colors">
                  Mulai Sekarang
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-surface-container-low dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-on-surface/70 text-sm">
            © 2026 Architectural Minimalist. All rights reserved.
          </span>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm hover:text-primary transition-colors uppercase tracking-wider font-medium"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

// Reusable Feature Card Component
const FeatureCard: React.FC<{ icon: string; title: string; desc: string }> = ({
  icon,
  title,
  desc,
}) => (
  <div className="bg-surface-container-lowest p-10 rounded-xl hover:shadow-xl transition-all group border border-transparent hover:border-primary-container">
    <div className="w-14 h-14 bg-primary-fixed-dim rounded-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
      <span className="material-symbols-outlined text-primary text-3xl">
        {icon}
      </span>
    </div>
    <h3 className="font-headline text-2xl font-bold mb-4">{title}</h3>
    <p className="text-on-surface-variant leading-relaxed">{desc}</p>
  </div>
);

export default ArchitectPage;
