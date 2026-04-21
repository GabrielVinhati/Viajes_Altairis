import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomsPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    getRoomTypes: jest.fn(),
    getHotels: jest.fn(),
    createRoomType: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/rooms',
}));

const mockRooms = [
  { id: 1, hotelId: 1, hotelName: 'Grand Madrid', name: 'Suite Presidencial', description: 'Luxury suite', capacity: 2, basePrice: 350.00, active: true },
  { id: 2, hotelId: 1, hotelName: 'Grand Madrid', name: 'Standard Double', description: 'Comfortable room', capacity: 2, basePrice: 120.00, active: true },
  { id: 3, hotelId: 2, hotelName: 'Barcelona Resort', name: 'Family Room', description: 'Spacious family room', capacity: 4, basePrice: 200.00, active: false },
];

const mockHotels = {
  items: [
    { id: 1, name: 'Grand Madrid', city: 'Madrid', country: 'Spain', stars: 5, active: true, roomTypeCount: 2 },
    { id: 2, name: 'Barcelona Resort', city: 'Barcelona', country: 'Spain', stars: 4, active: true, roomTypeCount: 1 },
  ],
  totalCount: 2, page: 1, pageSize: 200, totalPages: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
  (api.getRoomTypes as jest.Mock).mockResolvedValue(mockRooms);
  (api.getHotels as jest.Mock).mockResolvedValue(mockHotels);
});

describe('RoomsPage', () => {
  it('should render the page title', async () => {
    render(<RoomsPage />);
    expect(screen.getByText('Tipos de Habitación')).toBeInTheDocument();
  });

  it('should render search input', async () => {
    render(<RoomsPage />);
    expect(screen.getByPlaceholderText('Buscar por nombre, hotel o descripción...')).toBeInTheDocument();
  });

  it('should display room type cards', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Suite Presidencial')).toBeInTheDocument();
      expect(screen.getByText('Standard Double')).toBeInTheDocument();
      expect(screen.getByText('Family Room')).toBeInTheDocument();
    });
  });

  it('should show hotel name on each card', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      const grandMadridElements = screen.getAllByText('Grand Madrid');
      expect(grandMadridElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should show price for each room', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('€350.00')).toBeInTheDocument();
      expect(screen.getByText('€120.00')).toBeInTheDocument();
      expect(screen.getByText('€200.00')).toBeInTheDocument();
    });
  });

  it('should show capacity', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      const twoPersonElements = screen.getAllByText('2 pers.');
      expect(twoPersonElements).toHaveLength(2);
      expect(screen.getByText('4 pers.')).toBeInTheDocument();
    });
  });

  it('should filter rooms by search text', async () => {
    const user = userEvent.setup();
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Suite Presidencial')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre, hotel o descripción...');
    await user.type(searchInput, 'suite');

    // Suite Presidencial should remain, others should be filtered out
    expect(screen.getByText('Suite Presidencial')).toBeInTheDocument();
    expect(screen.queryByText('Standard Double')).not.toBeInTheDocument();
    expect(screen.queryByText('Family Room')).not.toBeInTheDocument();
  });

  it('should filter rooms by hotel name in search', async () => {
    const user = userEvent.setup();
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Family Room')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre, hotel o descripción...');
    await user.type(searchInput, 'barcelona');

    expect(screen.getByText('Family Room')).toBeInTheDocument();
    expect(screen.queryByText('Suite Presidencial')).not.toBeInTheDocument();
  });

  it('should show empty state when search has no results', async () => {
    const user = userEvent.setup();
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Suite Presidencial')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre, hotel o descripción...');
    await user.type(searchInput, 'zzzznonexistent');

    expect(screen.getByText('No se encontraron tipos de habitación')).toBeInTheDocument();
  });

  it('should show "Nuevo Tipo" button', () => {
    render(<RoomsPage />);
    expect(screen.getByText('Nuevo Tipo')).toBeInTheDocument();
  });

  it('should show hotel filter dropdown', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Todos los hoteles')).toBeInTheDocument();
    });
  });
});
