import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('../config/prisma', () => ({
  prisma: {
    event: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    review: {
      findMany: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
    },
    ticket: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    voucher: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      const mockTx = {
        event: {
          create: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'event-123', ...data })),
          findUnique: vi.fn().mockResolvedValue(null),
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn().mockResolvedValue({}),
        },
        ticket: {
          create: vi.fn().mockResolvedValue({}),
          findFirst: vi.fn().mockResolvedValue(null),
        },
        voucher: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };
      return callback(mockTx);
    }),
  },
}));

// Import after mocks
import { eventService } from '../modules/events/event.service';
import { prisma } from '../config/prisma';

describe('Event Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create a new event with valid data', async () => {
      // Arrange
      const mockEvent = {
        id: 'event-123',
        name: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        category: 'Music',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-02'),
        totalSeats: 100,
        price: 50000,
        availableSeats: 100,
        organizerId: 'organizer-123',
      };
      
      prisma.event.create.mockResolvedValue(mockEvent);

      // Act
      const result = await eventService.createEvent({
        name: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        category: 'Music',
        startDate: '2024-12-01',
        endDate: '2024-12-02',
        totalSeats: 100,
        price: 50000,
        organizerId: 'organizer-123',
      });

      // Assert
      expect(result.name).toBe('Test Event');
      expect(result.price).toBe(50000);
      expect(prisma.event.create).toHaveBeenCalled();
    });

    it('should throw error when startDate is after endDate', async () => {
      // Act & Assert
      await expect(
        eventService.createEvent({
          name: 'Test Event',
          description: 'Test Description',
          location: 'Test Location',
          category: 'Music',
          startDate: '2024-12-02',
          endDate: '2024-12-01',
          totalSeats: 100,
          price: 50000,
          organizerId: 'organizer-123',
        })
      ).rejects.toThrow('startDate must be before endDate');
    });

    it('should throw error when required fields are missing', async () => {
      // Act & Assert
      await expect(
        eventService.createEvent({
          name: '',
          description: 'Test Description',
          location: 'Test Location',
          category: 'Music',
          startDate: '2024-12-01',
          endDate: '2024-12-02',
          totalSeats: 100,
          price: 50000,
          organizerId: 'organizer-123',
        })
      ).rejects.toThrow('All fields are required');
    });
  });

  describe('getAllEvents', () => {
    it('should return paginated events', async () => {
      // Arrange
      const mockEvents = [
        { id: 'event-1', name: 'Event 1', tickets: [] },
        { id: 'event-2', name: 'Event 2', tickets: [] },
      ];
      
      prisma.event.findMany.mockResolvedValue(mockEvents);
      prisma.event.count.mockResolvedValue(2);

      // Act
      const result = await eventService.getAllEvents({
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter events by category', async () => {
      // Arrange
      const mockEvents = [
        { id: 'event-1', name: 'Music Event', category: 'Music', tickets: [] },
      ];
      
      prisma.event.findMany.mockResolvedValue(mockEvents);
      prisma.event.count.mockResolvedValue(1);

      // Act
      const result = await eventService.getAllEvents({
        category: 'Music',
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toHaveLength(1);
    });

    it('should filter events by search query', async () => {
      // Arrange
      const mockEvents = [
        { id: 'event-1', name: 'Concert', description: 'Music concert', tickets: [] },
      ];
      
      prisma.event.findMany.mockResolvedValue(mockEvents);
      prisma.event.count.mockResolvedValue(1);

      // Act
      const result = await eventService.getAllEvents({
        search: 'Concert',
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getEventById', () => {
    it('should return event with organizer profile and reviews', async () => {
      // Arrange
      const mockEvent = {
        id: 'event-123',
        name: 'Test Event',
        organizer: { id: 'org-1', fullName: 'Organizer', profilePicture: null },
        reviews: [{ id: 'r1', rating: 5, comment: 'Great!', user: { id: 'u1', fullName: 'User' } }],
        vouchers: [],
        tickets: [],
        organizerId: 'org-1',
      };
      
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.event.findMany.mockResolvedValue([{ reviews: [{ rating: 5 }] }]);
      prisma.review.findMany.mockResolvedValue([]);

      // Act
      const result = await eventService.getEventById({ id: 'event-123' });

      // Assert
      expect(result.name).toBe('Test Event');
      expect(result.averageRating).toBe(5);
    });

    it('should throw error when event not found', async () => {
      // Arrange
      prisma.event.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        eventService.getEventById({ id: 'nonexistent' })
      ).rejects.toThrow('Event not found');
    });
  });

  describe('deleteEvent', () => {
    it('should soft delete an event', async () => {
      // Arrange
      const mockEvent = {
        id: 'event-123',
        organizerId: 'organizer-123',
        isDeleted: false,
      };
      
      const deletedEvent = { ...mockEvent, isDeleted: true };
      
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue(deletedEvent);

      // Act
      const result = await eventService.deleteEvent({
        id: 'event-123',
        userId: 'organizer-123',
      });

      // Assert
      expect(result.isDeleted).toBe(true);
      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isDeleted: true,
          }),
        })
      );
    });

    it('should throw error when event not found', async () => {
      // Arrange
      prisma.event.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        eventService.deleteEvent({
          id: 'nonexistent',
          userId: 'organizer-123',
        })
      ).rejects.toThrow('Event not found');
    });
  });

  describe('getEventAttendees', () => {
    it('should return list of attendees for an event', async () => {
      // Arrange
      const mockEvent = {
        id: 'event-123',
        organizerId: 'organizer-123',
      };
      
      const mockTransactions = [
        {
          id: 'tx-1',
          user: { id: 'u1', fullName: 'User 1', profilePicture: null },
          quantity: 2,
          finalPrice: 100000,
          paidAt: new Date(),
          ticket: { name: 'VIP' },
        },
      ];
      
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);

      // Act
      const result = await eventService.getEventAttendees({
        eventId: 'event-123',
        organizerId: 'organizer-123',
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe('User 1');
      expect(result[0].quantity).toBe(2);
    });

    it('should throw error when event not found or unauthorized', async () => {
      // Arrange
      prisma.event.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        eventService.getEventAttendees({
          eventId: 'event-123',
          organizerId: 'wrong-organizer',
        })
      ).rejects.toThrow('Event not found or unauthorized');
    });
  });
});
