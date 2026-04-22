/**
 * Calculate event status based on dates and deleted flag
 */
export const getEventStatus = (event: {
  startDate: string;
  endDate: string;
  isDeleted?: boolean;
}): string => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (event.isDeleted) return "Deleted";
  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Active";
  if (now > end) return "Completed";
  return "Unknown";
};
