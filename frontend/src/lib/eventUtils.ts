/**
 * Menghitung status event berdasarkan tanggal mulai, tanggal akhir, dan flag deleted
 * @param event - Object event yang berisi startDate, endDate, dan isDeleted
 * @returns Status event: Deleted, Upcoming, Active, Completed, atau Unknown
 */
export const getEventStatus = (event: {
  startDate: string;
  endDate: string;
  isDeleted?: boolean;
}): string => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  // Urutan pengecekan penting: priority tertinggi ke terendah
  if (event.isDeleted) return "Deleted";
  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Active";
  if (now > end) return "Completed";
  return "Unknown";
};
