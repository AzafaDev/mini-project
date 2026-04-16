import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useToastStore } from "../stores/useToastStore";
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading || loadingEventAttendees) {
    return (
      <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter']">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1C1B1B] rounded w-48 mb-8"></div>
            <div className="h-12 bg-[#1C1B1B] rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-[#1C1B1B] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter'] selection:bg-[#4B4DD8] selection:text-[#D9D8FF]">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-lg bg-[#1C1B1B] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Attendees</h1>
              <p className="text-sm text-[#C7C4D8]">
                {currentEvent?.name || "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#4B4DD8]/10 text-[#C0C1FF] px-3 py-1 rounded-full text-sm font-medium">
              {eventAttendees.length} total
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#666]">
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
              className="w-full pl-12 pr-4 py-3 bg-[#1C1B1B] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors"
            />
          </div>
        </div>

        {/* Attendees Table */}
        {filteredAttendees.length > 0 ? (
          <div className="bg-[#1C1B1B] rounded-lg border border-[#464555]/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#464555]/10">
                  <th className="text-left px-6 py-4 text-xs font-medium text-[#C7C4D8] uppercase tracking-widest">
                    Attendee
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-[#C7C4D8] uppercase tracking-widest">
                    Ticket
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-[#C7C4D8] uppercase tracking-widest">
                    Quantity
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-[#C7C4D8] uppercase tracking-widest">
                    Purchase Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedAttendees.map((attendee, index) => (
                  <tr
                    key={`${attendee.userId}-${attendee.ticketId}-${index}`}
                    className="border-b border-[#464555]/10 hover:bg-[#2A2A2A] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center overflow-hidden">
                          {attendee.profilePicture ? (
                            <img
                              src={attendee.profilePicture}
                              alt={attendee.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[#666]">
                              person
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{attendee.fullName}</p>
                          <p className="text-sm text-[#666]">{attendee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#C0C1FF] font-medium">
                        {attendee.ticketName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{attendee.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#C7C4D8]">
                        {formatDate(attendee.purchaseDate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#1C1B1B] rounded-lg p-12 text-center border border-[#464555]/10">
            <span className="material-symbols-outlined text-8xl text-[#353534] mb-4">
              group
            </span>
            <p className="text-xl text-[#C7C4D8] mb-2">No attendees yet</p>
            <p className="text-[#666]">
              {searchTerm
                ? "No attendees match your search"
                : "No one has purchased tickets for this event yet"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-[#C7C4D8]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAttendees.length)} of{" "}
              {filteredAttendees.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-[#1C1B1B] rounded-lg hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-[#4B4DD8] text-white"
                      : "bg-[#1C1B1B] hover:bg-[#2A2A2A]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-[#1C1B1B] rounded-lg hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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