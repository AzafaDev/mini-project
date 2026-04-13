import { motion } from "framer-motion";

interface TicketCardProps {
  title: string;
  date: string;
  location: string;
  price: string;
  status: "Pending Payment" | "Confirmed" | "Past Event";
  image: string;
  orderId: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  title,
  date,
  location,
  price,
  status,
  image,
  orderId,
}) => {
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
