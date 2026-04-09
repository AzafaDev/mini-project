export type CreateEvent = {
  name: string;
  description: string;
  location: string;
  category: string;
  startDate: Date;
  endDate: Date;
  totalSeats: number;
  price: number;
  availableSeats?: number;
  imageUrl?: string;
  organizerId: string;
};

export type UpdateEvent = {
  id?: string;
  name?: string;
  description?: string;
  location?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  totalSeats?: string;
  availableSeats?: string;
  price?: string;
  imageUrl?: string;
};
