const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `API error: ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  // Hotels
  getHotels: (params?: string) =>
    fetchApi<PagedResult<HotelList>>(`/hotels${params ? `?${params}` : ''}`),
  getHotel: (id: number) => fetchApi<HotelDetail>(`/hotels/${id}`),
  createHotel: (data: CreateHotel) =>
    fetchApi<HotelDetail>('/hotels', { method: 'POST', body: JSON.stringify(data) }),
  updateHotel: (id: number, data: UpdateHotel) =>
    fetchApi<void>(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHotel: (id: number) =>
    fetchApi<void>(`/hotels/${id}`, { method: 'DELETE' }),

  // Room Types
  getRoomTypes: (hotelId?: number) =>
    fetchApi<RoomType[]>(`/roomtypes${hotelId ? `?hotelId=${hotelId}` : ''}`),
  createRoomType: (data: CreateRoomType) =>
    fetchApi<RoomType>('/roomtypes', { method: 'POST', body: JSON.stringify(data) }),
  deleteRoomType: (id: number) =>
    fetchApi<void>(`/roomtypes/${id}`, { method: 'DELETE' }),

  // Availability
  getAvailability: (params?: string) =>
    fetchApi<AvailabilityItem[]>(`/availability${params ? `?${params}` : ''}`),
  createAvailability: (data: CreateAvailability) =>
    fetchApi<{ created: number; updated: number }>('/availability', { method: 'POST', body: JSON.stringify(data) }),

  // Reservations
  getReservations: (params?: string) =>
    fetchApi<PagedResult<Reservation>>(`/reservations${params ? `?${params}` : ''}`),
  createReservation: (data: CreateReservation) =>
    fetchApi<Reservation>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  updateReservationStatus: (id: number, status: string) =>
    fetchApi<void>(`/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Dashboard
  getDashboard: () => fetchApi<Dashboard>('/dashboard'),
};

// Types
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HotelList {
  id: number;
  name: string;
  city: string;
  country: string;
  stars: number;
  active: boolean;
  roomTypeCount: number;
}

export interface HotelDetail extends HotelList {
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  roomTypes: RoomType[];
}

export interface CreateHotel {
  name: string;
  address: string;
  city: string;
  country: string;
  stars: number;
  phone: string;
  email: string;
}

export interface UpdateHotel extends CreateHotel {
  active: boolean;
}

export interface RoomType {
  id: number;
  hotelId: number;
  hotelName: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  active: boolean;
}

export interface CreateRoomType {
  hotelId: number;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
}

export interface AvailabilityItem {
  id: number;
  roomTypeId: number;
  roomTypeName: string;
  hotelName: string;
  date: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
  price: number;
}

export interface CreateAvailability {
  roomTypeId: number;
  startDate: string;
  endDate: string;
  totalRooms: number;
  price: number;
}

export interface Reservation {
  id: number;
  bookingReference: string;
  roomTypeId: number | null;
  roomTypeName: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  notes: string;
  createdAt: string;
}

export interface CreateReservation {
  roomTypeId: number;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  notes?: string;
}

export interface Dashboard {
  totalHotels: number;
  activeHotels: number;
  totalReservations: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  reservationsByStatus: Record<string, number>;
  occupancyTrend: { date: string; occupancyRate: number }[];
  topHotels: { name: string; city: string; reservationCount: number }[];
}
