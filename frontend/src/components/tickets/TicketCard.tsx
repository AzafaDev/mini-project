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
          ? "bg-dark-darker/50 border border-border-muted/10 opacity-60 hover:opacity-100"
          : isPending
            ? "bg-dark-elevated shadow-2xl shadow-black/20"
            : "bg-dark-surface"
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
                ? "bg-warning-dark/30 text-warning border-warning-dark/50"
                : isPast
                  ? "bg-dark-card-hover text-text-muted border-transparent"
                  : "bg-primary/10 text-primary border-primary/20"
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
              className={`text-2xl font-bold tracking-tight mb-1 ${isPast ? "text-text-muted" : "text-text-light"}`}
            >
              {title}
            </h2>
            <div className="flex items-center gap-4 text-text-muted text-sm">
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
            <p className="text-[10px] text-text-muted mb-1">{orderId}</p>
            <p
              className={`text-xl font-black ${isPending ? "text-warning" : "text-primary"}`}
            >
              {price}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isPending ? (
            <div className="flex items-center gap-3 text-sm text-warning">
              <span className="material-symbols-outlined">info</span>
              <span>Proof of payment must be uploaded within 24 hours.</span>
            </div>
          ) : (
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-dark bg-dark-card overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDn-FArK1l_5_YNPDgqyu5sb-Pj7e2E1m5c8DmnXy8_LJgVnD4KPXYhIiWXtT-C1Ps2Gsl4EQEgttumnFqV1fkgcXSmsUYqclTIXvI5Ou-UXlNAXhXewRwBN3MlZ5IC5ZcnOajF_ah6UT38AHme79MpmXvsal-rHAfZaDlD9j-5tamGTeImlxyPplFgpYeWYf_VgGOgLSLK4PsYc-bjSRdlVFtuhUkxm2iBi9w6D7oQGtb_Q2dM2Nxn30uWQ1_AWo8kipJ44f_YibL"
                  alt="User"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-dark bg-primary text-primary-darker text-[10px] flex items-center justify-center font-bold">
                +1
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {isPast ? (
              <button className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                Download Invoice{" "}
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
              </button>
            ) : (
              <>
                <button className="bg-dark-card text-text-light py-2 px-6 rounded-lg font-bold hover:bg-dark-card-hover transition-all text-sm">
                  Details
                </button>
                <button
                  className={`py-2 px-6 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${
                    isPending
                      ? "bg-gradient-to-br from-warning to-warning-dark text-[#351000]"
                      : "bg-primary text-primary-dark"
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
