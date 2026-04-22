import { useNavigate } from "react-router-dom";
import { useEventStore } from "../../stores/useEventStore";
import { formatDate } from "../../lib/formatters";
import { getEventStatus } from "../../lib/eventUtils";
import { EventItem } from "../events/EventItem";

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
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
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
              sold={event.sold ?? (event.totalSeats - event.availableSeats)}
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
        <div className="bg-dark-surface rounded-lg p-12 text-center">
          <span className="material-symbols-outlined text-8xl text-dark-card mb-4">
            event
          </span>
          <p className="text-xl text-text-muted mb-2">No events yet</p>
          <p className="text-text-secondary mb-6">
            Create your first event to get started
          </p>
          <button
            onClick={() => navigate("/events/create")}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Create Event
          </button>
        </div>
      )}
    </div>
  );
}