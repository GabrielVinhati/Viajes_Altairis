import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationsPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    getReservations: jest.fn(),
    createReservation: jest.fn(),
    updateReservationStatus: jest.fn(),
    getRoomTypes: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/reservations',
}));

const mockReservations = {
  items: [
    {
      id: 1, bookingReference: 'ALT-001-0001-1234', roomTypeId: 1,
      roomTypeName: 'Suite', hotelName: 'Grand Madrid',
      guestName: 'Juan García', guestEmail: 'juan@email.com',
      checkIn: '2024-06-01', checkOut: '2024-06-05',
      numberOfGuests: 2, totalPrice: 1400.00, status: 'Confirmed',
      notes: '', createdAt: '2024-05-01T10:00:00',
    },
    {
      id: 2, bookingReference: 'ALT-002-0001-5678', roomTypeId: 2,
      roomTypeName: 'Standard Double', hotelName: 'Barcelona Resort',
      guestName: 'Maria López', guestEmail: 'maria@email.com',
      checkIn: '2024-06-10', checkOut: '2024-06-12',
      numberOfGuests: 1, totalPrice: 240.00, status: 'Pending',
      notes: 'Late arrival', createdAt: '2024-05-02T14:00:00',
    },
  ],
  totalCount: 2, page: 1, pageSize: 15, totalPages: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
  (api.getReservations as jest.Mock).mockResolvedValue(mockReservations);
});

describe('ReservationsPage', () => {
  it('should render the page title', () => {
    render(<ReservationsPage />);
    expect(screen.getByText('Reservas')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<ReservationsPage />);
    expect(screen.getByPlaceholderText('Buscar por referencia o huésped...')).toBeInTheDocument();
  });

  it('should render status filter', () => {
    render(<ReservationsPage />);
    expect(screen.getByText('Todos los estados')).toBeInTheDocument();
  });

  it('should display reservations from API', async () => {
    render(<ReservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('ALT-001-0001-1234')).toBeInTheDocument();
      expect(screen.getByText('ALT-002-0001-5678')).toBeInTheDocument();
    });
  });

  it('should show guest names', async () => {
    render(<ReservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument();
      expect(screen.getByText('Maria López')).toBeInTheDocument();
    });
  });

  it('should show hotel and room type', async () => {
    render(<ReservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Grand Madrid')).toBeInTheDocument();
      expect(screen.getByText('Barcelona Resort')).toBeInTheDocument();
      expect(screen.getByText('Suite')).toBeInTheDocument();
    });
  });

  it('should show prices', async () => {
    render(<ReservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('€1400.00')).toBeInTheDocument();
      expect(screen.getByText('€240.00')).toBeInTheDocument();
    });
  });

  it('should call API with search when typing', async () => {
    const user = userEvent.setup();
    render(<ReservationsPage />);

    const searchInput = screen.getByPlaceholderText('Buscar por referencia o huésped...');
    await user.type(searchInput, 'juan');

    await waitFor(() => {
      expect(api.getReservations).toHaveBeenCalledWith(
        expect.stringContaining('search=juan')
      );
    });
  });

  it('should call API with status filter', async () => {
    const user = userEvent.setup();
    render(<ReservationsPage />);

    const statusSelect = screen.getByDisplayValue('Todos los estados');
    await user.selectOptions(statusSelect, 'Confirmed');

    await waitFor(() => {
      expect(api.getReservations).toHaveBeenCalledWith(
        expect.stringContaining('status=Confirmed')
      );
    });
  });

  it('should show "Nueva Reserva" button', () => {
    render(<ReservationsPage />);
    expect(screen.getByText('Nueva Reserva')).toBeInTheDocument();
  });

  it('should show the reservation count when paginated', async () => {
    (api.getReservations as jest.Mock).mockResolvedValue({
      ...mockReservations,
      totalCount: 20,
      totalPages: 2,
    });
    render(<ReservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('20 reservas')).toBeInTheDocument();
    });
  });
});
