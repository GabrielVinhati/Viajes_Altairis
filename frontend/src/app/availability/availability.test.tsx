import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AvailabilityPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    getAvailability: jest.fn(),
    getHotels: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/availability',
}));

const mockAvailability = [
  { id: 1, roomTypeId: 1, roomTypeName: 'Suite', hotelName: 'Grand Madrid', date: '2024-06-01', totalRooms: 10, bookedRooms: 8, availableRooms: 2, price: 350 },
  { id: 2, roomTypeId: 1, roomTypeName: 'Suite', hotelName: 'Grand Madrid', date: '2024-06-02', totalRooms: 10, bookedRooms: 3, availableRooms: 7, price: 350 },
  { id: 3, roomTypeId: 2, roomTypeName: 'Standard', hotelName: 'Barcelona Resort', date: '2024-06-01', totalRooms: 15, bookedRooms: 14, availableRooms: 1, price: 120 },
  { id: 4, roomTypeId: 2, roomTypeName: 'Standard', hotelName: 'Barcelona Resort', date: '2024-06-02', totalRooms: 15, bookedRooms: 5, availableRooms: 10, price: 120 },
];

const mockHotels = {
  items: [
    { id: 1, name: 'Grand Madrid', city: 'Madrid', country: 'Spain', stars: 5, active: true, roomTypeCount: 1 },
    { id: 2, name: 'Barcelona Resort', city: 'Barcelona', country: 'Spain', stars: 4, active: true, roomTypeCount: 1 },
  ],
  totalCount: 2, page: 1, pageSize: 200, totalPages: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
  (api.getAvailability as jest.Mock).mockResolvedValue(mockAvailability);
  (api.getHotels as jest.Mock).mockResolvedValue(mockHotels);
});

describe('AvailabilityPage', () => {
  it('should render the page title', () => {
    render(<AvailabilityPage />);
    expect(screen.getByText('Disponibilidad e Inventario')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<AvailabilityPage />);
    expect(screen.getByPlaceholderText('Buscar por hotel o tipo de habitación...')).toBeInTheDocument();
  });

  it('should display availability data grouped by hotel/room', async () => {
    render(<AvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText('Grand Madrid - Suite')).toBeInTheDocument();
      expect(screen.getByText('Barcelona Resort - Standard')).toBeInTheDocument();
    });
  });

  it('should show available/total rooms', async () => {
    render(<AvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText('2/10')).toBeInTheDocument(); // Grand Madrid Suite June 1
      expect(screen.getByText('7/10')).toBeInTheDocument(); // Grand Madrid Suite June 2
      expect(screen.getByText('1/15')).toBeInTheDocument(); // Barcelona Standard June 1
    });
  });

  it('should filter by search text - hotel name', async () => {
    const user = userEvent.setup();
    render(<AvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText('Grand Madrid - Suite')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por hotel o tipo de habitación...');
    await user.type(searchInput, 'barcelona');

    expect(screen.getByText('Barcelona Resort - Standard')).toBeInTheDocument();
    expect(screen.queryByText('Grand Madrid - Suite')).not.toBeInTheDocument();
  });

  it('should filter by search text - room type', async () => {
    const user = userEvent.setup();
    render(<AvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText('Grand Madrid - Suite')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por hotel o tipo de habitación...');
    await user.type(searchInput, 'suite');

    expect(screen.getByText('Grand Madrid - Suite')).toBeInTheDocument();
    expect(screen.queryByText('Barcelona Resort - Standard')).not.toBeInTheDocument();
  });

  it('should show empty state when search has no results', async () => {
    const user = userEvent.setup();
    render(<AvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText('Grand Madrid - Suite')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por hotel o tipo de habitación...');
    await user.type(searchInput, 'zzzznonexistent');

    expect(screen.getByText('No hay datos de disponibilidad')).toBeInTheDocument();
  });

  it('should show the color legend', async () => {
    render(<AvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText('Alta disponibilidad')).toBeInTheDocument();
      expect(screen.getByText('Media')).toBeInTheDocument();
      expect(screen.getByText('Baja')).toBeInTheDocument();
    });
  });

  it('should render date filter inputs', () => {
    render(<AvailabilityPage />);
    const dateInputs = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should show hotel filter dropdown', async () => {
    render(<AvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText('Todos los hoteles')).toBeInTheDocument();
    });
  });
});
