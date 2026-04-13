export const Footer = () => (
  <footer className="w-full py-12 px-8 bg-[#0E0E0E] border-t border-white/5">
    <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <p className="text-xs uppercase tracking-widest text-[#C7C4D8]">
        © 2026 Kinetix Architecture. Built for Performance.
      </p>
      <div className="flex gap-8">
        {["Instagram", "Twitter", "LinkedIn"].map((social) => (
          <a
            key={social}
            href="#"
            className="text-[#C7C4D8] hover:text-[#c0c1ff] transition-colors text-sm uppercase tracking-tighter"
          >
            {social}
          </a>
        ))}
      </div>
    </div>
  </footer>
);
