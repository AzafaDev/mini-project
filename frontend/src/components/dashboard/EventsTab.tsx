import { useNavigate } from "react-router-dom";
import { useEventStore } from "../../stores/useEventStore";
import { formatDate } from "../../lib/formatters";

interface EventItemProps {
  id: string;
  title: string;
  date: string;
  location: string;
  sold: number;
  capacity: number;
  status: string;
  image: string;
  onStatsClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EventItem = ({
  id,
  title,
  date,
  location,
  sold,
  capacity,
  status,
  image,
  onStatsClick,
  onEdit,
  onDelete,
}: EventItemProps) => {
  const navigate = useNavigate();
  const percentage = capacity > 0 ? (sold / capacity) * 100 : 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatsClick) {
      onStatsClick();
    } else {
      navigate(`/events/${id}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className="bg-[#1C1B1B] hover:bg-[#2A2A2A] transition-colors p-4 flex items-center gap-4 group cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
        <img
          alt={title}
          className="w-full h-full object-cover"
          src={image || "https://via.placeholder.com/64"}
        />
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
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleEdit}
          className="p-2 text-[#999] hover:text-on-surface hover:bg-[#353534] rounded transition-colors"
          title="Edit event"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-[#999] hover:text-red-500 hover:bg-[#353534] rounded transition-colors"
          title="Delete event"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
};

// Helper functions
const getEventStatus = (event: { startDate: string; endDate: string; isDeleted?: boolean }) => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (event.isDeleted) return "Deleted";
  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Active";
  if (now > end) return "Completed";
  return "Unknown";
};

interface EventsTabProps {
  onStatsClick: (event: { id: string; name: string }) => void;
}

export function EventsTab({ onStatsClick }: EventsTabProps) {
  const navigate = useNavigate();
  const { myEvents, deleteEvent } = useEventStore();

  const allEvents = myEvents.filter((e) => !e.isDeleted);

  const handleEdit = (id: string) => {
    navigate(`/events/${id}/edit`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete event "${title}"?`)) {
      await deleteEvent(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">My Events</h2>
        <button
          onClick={() => navigate("/events/create")}
          className="bg-[#4B4DD8] hover:bg-[#3a3cb3] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Create Event
        </button>
      </div>

      {allEvents.length > 0 ? (
        <div className="space-y-4">
          {allEvents.map((event) => (
            <EventItem
              key={event.id}
              id={event.id}
              title={event.name}
              date={`${formatDate(event.startDate)} - ${formatDate(
                event.endDate
              )}`}
              location={event.location}
              sold={event.totalSeats - event.availableSeats}
              capacity={event.totalSeats}
              status={getEventStatus(event)}
              image={event.imageUrl || ""}
              onStatsClick={() => {
                onStatsClick({ id: event.id, name: event.name });
              }}
              onEdit={() => handleEdit(event.id)}
              onDelete={() => handleDelete(event.id, event.name)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#1C1B1B] rounded-lg p-12 text-center">
          <span className="material-symbols-outlined text-8xl text-[#353534] mb-4">
            event
          </span>
          <p className="text-xl text-[#C7C4D8] mb-2">No events yet</p>
          <p className="text-[#666] mb-6">
            Create your first event to get started
          </p>
          <button
            onClick={() => navigate("/events/create")}
            className="bg-[#4B4DD8] hover:bg-[#3a3cb3] text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Create Event
          </button>
        </div>
      )}
    </div>
  );
}