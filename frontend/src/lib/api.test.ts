import { api } from './api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('API Client', () => {
  describe('getHotels', () => {
    it('should fetch hotels with default params', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Hotel Test', city: 'Madrid', country: 'Spain', stars: 4, active: true, roomTypeCount: 3 }],
        totalCount: 1, page: 1, pageSize: 20, totalPages: 1,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => mockResponse,
      });

      const result = await api.getHotels();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/hotels'),
        expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Hotel Test');
    });

    it('should pass query params correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => ({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }),
      });

      await api.getHotels('search=grand&page=2');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/hotels?search=grand&page=2'),
        expect.any(Object)
      );
    });
  });

  describe('getHotel', () => {
    it('should fetch a single hotel by id', async () => {
      const mockHotel = { id: 5, name: 'Grand Madrid', address: 'Calle 1', city: 'Madrid', country: 'Spain', stars: 5, phone: '+34123', email: 'info@hotel.com', active: true, createdAt: '2024-01-01', roomTypes: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => mockHotel,
      });

      const result = await api.getHotel(5);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/hotels/5'),
        expect.any(Object)
      );
      expect(result.name).toBe('Grand Madrid');
    });
  });

  describe('createHotel', () => {
    it('should POST a new hotel', async () => {
      const newHotel = { name: 'New Hotel', address: 'Addr', city: 'Barcelona', country: 'Spain', stars: 3, phone: '+34', email: 'a@b.com' };
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 201,
        json: async () => ({ id: 10, ...newHotel, active: true, createdAt: '2024-01-01', roomTypes: [] }),
      });

      const result = await api.createHotel(newHotel);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/hotels'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newHotel),
        })
      );
      expect(result.id).toBe(10);
    });
  });

  describe('deleteHotel', () => {
    it('should DELETE a hotel', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

      await api.deleteHotel(3);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/hotels/3'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('getRoomTypes', () => {
    it('should fetch all room types', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => [{ id: 1, hotelId: 1, hotelName: 'Hotel A', name: 'Suite', description: 'Luxury', capacity: 2, basePrice: 200, active: true }],
      });

      const result = await api.getRoomTypes();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/roomtypes'),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
    });

    it('should filter by hotel id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => [],
      });

      await api.getRoomTypes(5);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/roomtypes?hotelId=5'),
        expect.any(Object)
      );
    });
  });

  describe('getReservations', () => {
    it('should fetch reservations with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => ({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }),
      });

      await api.getReservations('status=Confirmed&page=1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations?status=Confirmed&page=1'),
        expect.any(Object)
      );
    });
  });

  describe('createReservation', () => {
    it('should POST a new reservation', async () => {
      const newRes = { roomTypeId: 1, guestName: 'John', guestEmail: 'j@e.com', checkIn: '2024-06-01', checkOut: '2024-06-05', numberOfGuests: 2 };
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 201,
        json: async () => ({ id: 1, bookingReference: 'ALT-001', ...newRes, totalPrice: 800, status: 'Pending', notes: '', createdAt: '2024-01-01', roomTypeName: 'Suite', hotelName: 'Hotel A' }),
      });

      const result = await api.createReservation(newRes);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.bookingReference).toBe('ALT-001');
    });
  });

  describe('updateReservationStatus', () => {
    it('should PATCH reservation status', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

      await api.updateReservationStatus(1, 'Confirmed');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/1/status'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'Confirmed' }),
        })
      );
    });
  });

  describe('getDashboard', () => {
    it('should fetch dashboard data', async () => {
      const mockDashboard = {
        totalHotels: 50, activeHotels: 45, totalReservations: 200,
        todayCheckIns: 5, todayCheckOuts: 3,
        reservationsByStatus: { Pending: 10, Confirmed: 30 },
        occupancyTrend: [], topHotels: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => mockDashboard,
      });

      const result = await api.getDashboard();
      expect(result.totalHotels).toBe(50);
      expect(result.activeHotels).toBe(45);
    });
  });

  describe('getAvailability', () => {
    it('should fetch availability with params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => [],
      });

      await api.getAvailability('hotelId=1&from=2024-06-01');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/availability?hotelId=1&from=2024-06-01'),
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 404,
        text: async () => 'Not found',
      });

      await expect(api.getHotel(999)).rejects.toThrow('Not found');
    });

    it('should throw generic message when no error body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 500,
        text: async () => '',
      });

      await expect(api.getHotels()).rejects.toThrow('API error: 500');
    });
  });
});
