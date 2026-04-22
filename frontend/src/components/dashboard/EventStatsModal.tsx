import { useEffect } from "react";
import { useEventStore } from "../../stores/useEventStore";
import { useToastStore } from "../../stores/useToastStore";

interface EventStatsModalProps {
  eventId: string;
  eventName: string;
  onClose: () => void;
}

export function EventStatsModal({
  eventId,
  eventName,
  onClose,
}: EventStatsModalProps) {
  const { eventStats, loadingEventStats, fetchEventStats, error, clearError } =
    useEventStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchEventStats(eventId);
  }, [eventId, fetchEventStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate derived values
  const ticketsSold = eventStats?.ticketsSold || 0;
  const availableSeats = eventStats?.availableSeats || 0;
  const totalSeats = ticketsSold + availableSeats;
  const soldPercentage = totalSeats > 0 ? (ticketsSold / totalSeats) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-dark-surface rounded-lg w-full max-w-md max-h-[90vh] flex flex-col border border-border-muted/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-muted/10">
          <div>
            <h2 className="text-lg font-bold">Event Stats</h2>
            <p className="text-sm text-text-muted mt-1">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        {loadingEventStats ? (
          <div className="p-6 flex-shrink-0">
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-dark-elevated rounded-lg"></div>
              <div className="h-20 bg-dark-elevated rounded-lg"></div>
              <div className="h-20 bg-dark-elevated rounded-lg"></div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Total Revenue */}
            <div className="bg-dark-elevated rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    payments
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-widest">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(eventStats?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tickets Sold */}
              <div className="bg-dark-elevated rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-accent text-[20px]">
                    confirmation_number
                  </span>
                  <p className="text-xs text-text-muted uppercase">Sold</p>
                </div>
                <p className="text-2xl font-bold">{ticketsSold}</p>
              </div>

              {/* Available Seats */}
              <div className="bg-dark-elevated rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#FFB695] text-[20px]">
                    event_seat
                  </span>
                  <p className="text-xs text-text-muted uppercase">Available</p>
                </div>
                <p className="text-2xl font-bold">{availableSeats}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-dark-elevated rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-text-muted">Sold Percentage</p>
                <p className="text-sm font-bold text-primary">
                  {soldPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-dark-card h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-accent to-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-text-secondary mt-2 text-right">
                {ticketsSold} of {totalSeats} seats
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border-muted/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-dark-card hover:bg-dark-card-hover rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
