import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService, type PointsHistoryItem } from "../services/api";
import { formatDate } from "../lib/formatters";

export default function PointsHistoryPage() {
  const navigate = useNavigate();
  // const { user } = useAuthStore(); // Unused for now
  
  const [points, setPoints] = useState<number>(0);
  const [history, setHistory] = useState<PointsHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current points
        const pointsRes = await profileService.getPoints();
        if (pointsRes.success && pointsRes.points !== undefined) {
          setPoints(pointsRes.points);
        }

        // Fetch points history
        const historyRes = await profileService.getPointsHistory(page, limit);
        if (historyRes.success) {
          setHistory(historyRes.data);
          setTotalPages(historyRes.pagination.totalPages);
        }
      } catch (error) {
        console.error("Failed to load points data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit]);

  const getTransactionType = (type: string) => {
    switch (type) {
      case "EARNED":
        return { label: "Earned", color: "text-green-400", bg: "bg-green-500/10" };
      case "REDEEMED":
        return { label: "Redeemed", color: "text-[#C0C1FF]", bg: "bg-[#C0C1FF]/10" };
      default:
        return { label: type, color: "text-[#C7C4D8]", bg: "bg-[#353534]" };
    }
  };

  if (loading) {
    return (
      <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter']">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1C1B1B] rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="h-32 bg-[#1C1B1B] rounded-lg"></div>
              <div className="h-32 bg-[#1C1B1B] rounded-lg"></div>
              <div className="h-32 bg-[#1C1B1B] rounded-lg"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-[#1C1B1B] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter'] selection:bg-[#4B4DD8] selection:text-[#D9D8FF]">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-lg bg-[#1C1B1B] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Points History</h1>
            <p className="text-sm text-[#C7C4D8]">View your points transactions</p>
          </div>
        </div>

        {/* Points Balance Card */}
        <div className="bg-gradient-to-br from-[#4B4DD8] to-[#494BD6] rounded-xl p-8 mb-8 text-[#D9D8FF] relative overflow-hidden">
          <span className="material-symbols-outlined absolute top-4 right-4 opacity-20 text-8xl rotate-12">
            token
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
              Available Points
            </div>
            <div className="text-5xl font-black tracking-tighter text-white">
              {points.toLocaleString()}
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="bg-[#1C1B1B] rounded-lg border border-[#464555]/10 overflow-hidden">
          <div className="p-4 border-b border-[#464555]/10">
            <h3 className="font-bold">Transaction History</h3>
          </div>
          
          {history.length > 0 ? (
            <>
              <div className="divide-y divide-[#464555]/10">
                {history.map((item) => {
                  const typeInfo = getTransactionType(item.type);
                  return (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between hover:bg-[#2A2A2A] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeInfo.bg}`}>
                          <span className={`material-symbols-outlined ${typeInfo.color}`}>
                            {item.type === "EARNED" ? "add_circle" : "redeem"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-xs text-[#666] mt-1">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold text-lg ${
                        item.type === "EARNED" ? "text-green-400" : "text-[#C0C1FF]"
                      }`}>
                        {item.type === "EARNED" ? "+" : "-"}{item.points.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 flex items-center justify-between border-t border-[#464555]/10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-[#353534] hover:bg-[#393939] rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[#C7C4D8]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-[#353534] hover:bg-[#393939] rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-[#353534] mb-4">
                history
              </span>
              <p className="text-[#C7C4D8]">No points history yet</p>
              <p className="text-xs text-[#666] mt-2">Earn points by purchasing tickets</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
