import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useToastStore } from "../stores/useToastStore";
import { formatDate } from "../lib/formatters";
import type { EventAttendee } from "../services/api";

export default function EventAttendeesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentEvent,
    eventAttendees,
    loading,
    loadingEventAttendees,
    fetchEventById,
    fetchEventAttendees,
    clearError,
  } = useEventStore();
  const { addToast } = useToastStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
      fetchEventAttendees(eventId);
    }
  }, [eventId, fetchEventById, fetchEventAttendees]);

  // Filter attendees by search term
  const filteredAttendees = eventAttendees.filter((attendee) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      attendee.fullName.toLowerCase().includes(searchLower) ||
      attendee.email.toLowerCase().includes(searchLower) ||
      attendee.ticketName.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const paginatedAttendees = filteredAttendees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading || loadingEventAttendees) {
    return (
      <div className="bg-dark text-text-light antialiased min-h-screen font-['Inter']">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-surface rounded w-48 mb-8"></div>
            <div className="h-12 bg-dark-surface rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-dark-surface rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-text-light antialiased min-h-screen font-['Inter'] selection:bg-accent selection:text-[#D9D8FF]">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-lg bg-dark-surface flex items-center justify-center hover:bg-dark-elevated transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Attendees</h1>
              <p className="text-sm text-text-muted">
                {currentEvent?.name || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-accent/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {eventAttendees.length} total
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or ticket type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-dark-surface border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Attendees Table */}
        {filteredAttendees.length > 0 ? (
          <div className="bg-dark-surface rounded-lg border border-border-muted/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-muted/10">
                  <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                    Attendee
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                    Ticket
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                    Quantity
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                    Purchase Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedAttendees.map((attendee, index) => (
                  <tr
                    key={`${attendee.userId}-${attendee.ticketId}-${index}`}
                    className="border-b border-border-muted/10 hover:bg-dark-elevated transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center overflow-hidden">
                          {attendee.profilePicture ? (
                            <img
                              src={attendee.profilePicture}
                              alt={attendee.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-text-secondary">
                              person
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{attendee.fullName}</p>
                          <p className="text-sm text-text-secondary">{attendee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-primary font-medium">
                        {attendee.ticketName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{attendee.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-muted">
                        {formatDate(attendee.purchaseDate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-dark-surface rounded-lg p-12 text-center border border-border-muted/10">
            <span className="material-symbols-outlined text-8xl text-dark-card mb-4">
              group
            </span>
            <p className="text-xl text-text-muted mb-2">No attendees yet</p>
            <p className="text-text-secondary">
              {searchTerm
                ? "No attendees match your search"
                : "No one has purchased tickets for this event yet"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-text-muted">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAttendees.length)} of{" "}
              {filteredAttendees.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-dark-surface rounded-lg hover:bg-dark-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-accent text-white"
                      : "bg-dark-surface hover:bg-dark-elevated"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-dark-surface rounded-lg hover:bg-dark-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}