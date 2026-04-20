import axiosInstance from "../lib/axiosInstance";
import type {
  Event,
  EventsResponse,
  GetEventsParams,
  CreateEventRequest,
  EventResponse,
  OrganizerStatsResponse,
  EventStatsResponse,
  EventAttendeesResponse,
  OrganizerProfileResponse,
} from "../types";

export const eventService = {
  getAllEvents: async (params: GetEventsParams): Promise<EventsResponse> => {
    const response = await axiosInstance.get<EventsResponse>('/events', { params });
    return response.data;
  },

  getEventById: async (id: string): Promise<{ success: boolean; data: Event }> => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data;
  },

  getOrganizerProfile: async (organizerId: string): Promise<OrganizerProfileResponse> => {
    const response = await axiosInstance.get(`/events/organizer/${organizerId}`);
    return response.data;
  },

  getMyEvents: async (): Promise<{ success: boolean; data: Event[] }> => {
    const response = await axiosInstance.get('/events/me');
    return response.data;
  },

  getOrganizerStats: async (year?: number, month?: number, day?: number): Promise<OrganizerStatsResponse> => {
    const response = await axiosInstance.get('/events/stats', { params: { year, month, day } });
    return response.data;
  },

  getEventStats: async (eventId: string): Promise<EventStatsResponse> => {
    const response = await axiosInstance.get(`/events/${eventId}/stats`);
    return response.data;
  },

  getEventAttendees: async (eventId: string): Promise<EventAttendeesResponse> => {
    const response = await axiosInstance.get(`/events/${eventId}/attendees`);
    return response.data;
  },

  createEvent: async (data: CreateEventRequest & { imageFile?: File }): Promise<EventResponse> => {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.location) formData.append('location', data.location);
    if (data.category) formData.append('category', data.category);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    formData.append('totalSeats', String(data.totalSeats));
    formData.append('price', String(data.price));
    if (data.availableSeats !== undefined) {
      formData.append('availableSeats', String(data.availableSeats));
    }
    if (data.imageFile) {
      formData.append('imageFile', data.imageFile);
    }
    if (data.tickets && data.tickets.length > 0) {
      formData.append('tickets', JSON.stringify(data.tickets));
    }
    
    const response = await axiosInstance.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<CreateEventRequest> & { imageFile?: File }): Promise<EventResponse> => {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.location) formData.append('location', data.location);
    if (data.category) formData.append('category', data.category);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.totalSeats !== undefined) formData.append('totalSeats', String(data.totalSeats));
    if (data.price !== undefined) formData.append('price', String(data.price));
    if (data.availableSeats !== undefined) {
      formData.append('availableSeats', String(data.availableSeats));
    }
    if (data.imageFile) {
      formData.append('imageFile', data.imageFile);
    }
    
    const response = await axiosInstance.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteEvent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  },
};