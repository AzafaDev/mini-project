import React, { useState } from "react";

// --- Types ---
type TransactionStatus = "waiting" | "done" | "pending" | "rejected";

interface Transaction {
  id: string;
  customerName: string;
  customerEmail: string;
  avatarUrl?: string;
  ticketType: string;
  amount: string;
  status: TransactionStatus;
  verifiedBy?: string;
}

const ManageTransactions: React.FC = () => {
  // Data dummy untuk tabel
  const [transactions] = useState<Transaction[]>([
    {
      id: "#TXN-882190",
      customerName: "Alex Thompson",
      customerEmail: "alex.t@email.com",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA3f_0_81WH0lK3jwjekynrXxqEUB83ddVPwtTbroOANRNptg_QG7Uiib6KN4tW2ajOPpgYwcYhd40-xc8yz--L-L0O-zI3ieDbjdrhmd4d7e0BCu2Lybwffy64vpSHhnNBMyvmdvzl_PyZ4S22X3OZLAPh4w9mVCix4Dun1hdBV8xlhvW-4Xa0HHJSziGP-xDdcImem2K9YBk9IQK6D9GhFweUZiLqctyYZKONvNxJSCbaG5sEpfhTHGiin7TAeaWWKT07mqoMzT8Z",
      ticketType: "VIP Backstage Pass",
      amount: "$299.00",
      status: "waiting",
    },
    {
      id: "#TXN-882189",
      customerName: "Elena Rodriguez",
      customerEmail: "elena.rod@web.com",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCFjsnWAQYQSgHrsffA4bnEsLovYw5Cx87xKNUqkezvn-9XamkcTLU8FxTkcpV47Pu3YdCRWFg2umYuRc2RK9cRRJ-EbrvdYz98cdOZnpPPizshDS2D_sFO2qw2dIr6NQQxbz6t_3xlR4eSS_ZSp8WF15746dG954Pv90V6EUi1WkwYqqR9uA6ax9sHi9JBbP-wbNwXBmwkMC_EDZU-ZUjUPCQ8TUkKECAZvf4c28VMGAmHfeZ6MC--yMWEXUvPor_ox_5W2mkpwYk6",
      ticketType: "Early Bird General",
      amount: "$85.00",
      status: "done",
      verifiedBy: "AI",
    },
    {
      id: "#TXN-882188",
      customerName: "Marcus Chen",
      customerEmail: "m.chen@provider.org",
      ticketType: "2x Weekend Pass",
      amount: "$340.00",
      status: "pending",
    },
    {
      id: "#TXN-882187",
      customerName: "Julian Vane",
      customerEmail: "julian.v@mailbox.net",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCUHfP4Z5_w8Xxzg19XE_fz9HSWBfI0hXEo2wnl0SxUxb6V2THSo54aDUXqiYHIO4YRcH4CN_0RGkEjyuPTY0IWwHMNB2ePjJftsK0fqYyNuMuWQGlfMK-_6lUxM4PNPeW2peG5TVDgExnAk-GVghDaDlfH129xgbr_fIDuybZTPqp11bx4oAg5h-4kKwGVXhDtbR6ekbzKlcZ5bLv2XK2LxkENRc4LhzaAkMr07m7_huwKpLVTiEENKkw8Z-MpFhNAvtd-cx7zWsWS",
      ticketType: "General Admission",
      amount: "$99.00",
      status: "rejected",
    },
  ]);

  return (
    <div className="bg-[#131313] text-[#e5e2e1] font-sans min-h-screen selection:bg-[#c0c1ff]/30">
      {/* SideNavBar - Organizer specific */}
      <aside className="h-screen w-64 fixed left-0 top-16 bg-[#1C1B1B] flex flex-col py-6 px-4 gap-2 z-40 hidden md:flex">
        <div className="mt-16 mb-8 px-2">
          <h2 className="text-lg font-black text-[#E5E2E1]">
            Organizer Studio
          </h2>
          <p className="text-xs text-[#c7c4d8] uppercase tracking-widest mt-1">
            Premium Tier
          </p>
        </div>
        <div className="flex flex-col gap-1 flex-grow">
          <NavItem icon="dashboard" label="Dashboard" />
          <NavItem icon="event" label="Events" />
          <NavItem icon="group" label="Registrations" active />
          <NavItem icon="insights" label="Analytics" />
          <NavItem icon="campaign" label="Marketing" />
          <NavItem icon="settings" label="Settings" />
        </div>
        <div className="pt-4 border-t border-white/5 flex flex-col gap-1">
          <button className="mb-4 bg-[#353534] text-[#e5e2e1] text-xs font-bold py-2 rounded-lg hover:bg-[#393939] transition-colors uppercase tracking-widest">
            Upgrade Plan
          </button>
          <button className="flex items-center gap-3 py-2 px-4 text-[#C7C4D8] hover:text-[#E5E2E1] transition-all rounded-lg">
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm">Help Center</span>
          </button>
          <button className="flex items-center gap-3 py-2 px-4 text-[#ffb4ab]/80 hover:text-[#ffb4ab] transition-all rounded-lg">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 pb-12 px-6 md:px-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-[#e5e2e1] mb-2">
              Manage Transactions
            </h1>
            <p className="text-[#c7c4d8] text-lg">
              Verify payments for{" "}
              <span className="text-[#c0c1ff] font-semibold">
                Neon Nights Festival 2024
              </span>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <ActionBtn icon="filter_list" label="Filters" />
            <ActionBtn icon="download" label="Export CSV" />
          </div>
        </header>

        {/* Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="Total Revenue"
            value="$42,850.00"
            sub="12% from last week"
            trend="up"
          />
          <StatCard
            title="Pending Approval"
            value="24"
            sub="Awaiting manual verification"
            highlight="text-[#ffb695]"
          />
          <StatCard
            title="Successful Orders"
            value="1,142"
            sub="Tickets successfully issued"
            highlight="text-[#c0c1ff]"
          />
          <StatCard
            title="Rejected"
            value="7"
            sub="Payment failures"
            highlight="text-[#ffb4ab]"
          />
        </div>

        {/* Table Area */}
        <div className="bg-[#1C1B1B] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#2a2a2a]/50 text-[#c7c4d8] text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-semibold">Transaction ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Ticket Type</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className={`hover:bg-[#2a2a2a] transition-colors group ${txn.status === "pending" ? "border-l-4 border-[#ffb695]" : ""}`}
                  >
                    <td className="px-6 py-5 font-mono text-xs text-[#c0c1ff]">
                      {txn.id}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#353534] flex items-center justify-center overflow-hidden">
                          {txn.avatarUrl ? (
                            <img
                              alt={txn.customerName}
                              src={txn.avatarUrl}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-sm">
                              person
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#e5e2e1]">
                            {txn.customerName}
                          </p>
                          <p className="text-xs text-[#c7c4d8]">
                            {txn.customerEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#c7c4d8]">
                      {txn.ticketType}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-[#e5e2e1]">
                      {txn.amount}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      {txn.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button className="bg-[#c0c1ff] text-[#07006c] px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:brightness-110">
                            Approve
                          </button>
                          <button className="bg-[#353534] text-[#e5e2e1] px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-[#393939]">
                            View Proof
                          </button>
                        </div>
                      ) : txn.status === "done" ? (
                        <span className="text-[#c7c4d8] italic text-xs">
                          Verified by {txn.verifiedBy}
                        </span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button className="p-2 hover:text-[#c0c1ff] transition-colors text-[#c7c4d8]">
                            <span className="material-symbols-outlined text-lg">
                              visibility
                            </span>
                          </button>
                          <button className="p-2 hover:text-[#ffb4ab] transition-colors text-[#c7c4d8]">
                            <span className="material-symbols-outlined text-lg">
                              cancel
                            </span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between bg-[#0e0e0e]/50 border-t border-white/5">
            <p className="text-xs text-[#c7c4d8] uppercase tracking-wider">
              Showing 1-4 of 1,215 transactions
            </p>
            <div className="flex items-center gap-2">
              <PaginationBtn icon="chevron_left" disabled />
              <PaginationBtn label="1" active />
              <PaginationBtn label="2" />
              <PaginationBtn label="3" />
              <PaginationBtn icon="chevron_right" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-[#0E0E0E] flex flex-col md:flex-row justify-between items-center px-12 gap-8 text-[10px] uppercase tracking-widest text-[#C7C4D8]">
        <div className="flex flex-wrap gap-8 justify-center">
          {[
            "Terms of Service",
            "Privacy Policy",
            "Contact Support",
            "API Documentation",
          ].map((link) => (
            <a
              key={link}
              className="hover:text-[#E5E2E1] transition-opacity opacity-80"
              href="#"
            >
              {link}
            </a>
          ))}
        </div>
        <p>© 2024 EventPulse Global. Precision Engineered.</p>
      </footer>
    </div>
  );
};

// --- Sub-Components ---

const NavItem = ({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <a
    className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all active:translate-x-1 duration-150 ${active ? "bg-[#2A2A2A] text-[#C0C1FF] font-semibold border-r-4 border-[#C0C1FF]" : "text-[#C7C4D8] hover:bg-[#2A2A2A] hover:text-[#E5E2E1]"}`}
    href="#"
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-sm">{label}</span>
  </a>
);

const ActionBtn = ({ icon, label }: { icon: string; label: string }) => (
  <button className="bg-[#2a2a2a] text-[#e5e2e1] px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#393939] transition-colors">
    <span className="material-symbols-outlined text-xl">{icon}</span>
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

const StatCard = ({
  title,
  value,
  sub,
  highlight = "text-[#e5e2e1]",
  trend,
}: {
  title: string;
  value: string;
  sub: string;
  highlight?: string;
  trend?: "up";
}) => (
  <div className="bg-[#1C1B1B] p-6 rounded-xl border border-white/5 shadow-lg">
    <p className="text-[#c7c4d8] text-xs uppercase tracking-widest mb-2">
      {title}
    </p>
    <h3 className={`text-2xl font-bold ${highlight}`}>{value}</h3>
    <div
      className={`mt-4 flex items-center gap-1 text-xs ${trend === "up" ? "text-[#c0c1ff]" : "text-[#c7c4d8]"}`}
    >
      {trend === "up" && (
        <span className="material-symbols-outlined text-sm">trending_up</span>
      )}
      <span>{sub}</span>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const styles = {
    waiting: "bg-[#ffdbcc]/10 text-[#ffb695] border-[#a44100]/20",
    done: "bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#4b4dd8]/20",
    pending: "bg-[#ffdbcc]/20 text-[#ffb695] border-none",
    rejected: "bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#93000a]/20",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status]}`}
    >
      {status === "waiting" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#ffb695] animate-pulse"></span>
      )}
      {status === "done" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]"></span>
      )}
      {status === "pending" && (
        <span className="material-symbols-outlined text-[12px]">
          receipt_long
        </span>
      )}
      {status === "rejected" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
      )}
      {status === "waiting"
        ? "Waiting for Payment"
        : status === "pending"
          ? "Proof Uploaded"
          : status}
    </div>
  );
};

const PaginationBtn = ({
  icon,
  label,
  active = false,
  disabled = false,
}: {
  icon?: string;
  label?: string;
  active?: boolean;
  disabled?: boolean;
}) => (
  <button
    disabled={disabled}
    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${active ? "bg-[#c0c1ff] text-[#07006c]" : "bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1]"}`}
  >
    {icon ? (
      <span className="material-symbols-outlined text-sm">{icon}</span>
    ) : (
      label
    )}
  </button>
);

export default ManageTransactions;
