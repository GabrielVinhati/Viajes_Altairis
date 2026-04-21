import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HotelsPage from './page';
import { api } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  api: {
    getHotels: jest.fn(),
    createHotel: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/hotels',
}));

const mockHotels = {
  items: [
    { id: 1, name: 'Grand Madrid Hotel', city: 'Madrid', country: 'Spain', stars: 5, active: true, roomTypeCount: 4 },
    { id: 2, name: 'Barcelona Resort', city: 'Barcelona', country: 'Spain', stars: 4, active: true, roomTypeCount: 3 },
    { id: 3, name: 'Paris Inn', city: 'Paris', country: 'France', stars: 3, active: false, roomTypeCount: 2 },
  ],
  totalCount: 3,
  page: 1,
  pageSize: 15,
  totalPages: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
  (api.getHotels as jest.Mock).mockResolvedValue(mockHotels);
});

describe('HotelsPage', () => {
  it('should render the page title', async () => {
    render(<HotelsPage />);
    expect(screen.getByText('Hoteles')).toBeInTheDocument();
  });

  it('should render the "Nuevo Hotel" button', async () => {
    render(<HotelsPage />);
    expect(screen.getByText('Nuevo Hotel')).toBeInTheDocument();
  });

  it('should render the search input', async () => {
    render(<HotelsPage />);
    expect(screen.getByPlaceholderText('Buscar por nombre...')).toBeInTheDocument();
  });

  it('should display hotels from API', async () => {
    render(<HotelsPage />);

    await waitFor(() => {
      expect(screen.getByText('Grand Madrid Hotel')).toBeInTheDocument();
      expect(screen.getByText('Barcelona Resort')).toBeInTheDocument();
      expect(screen.getByText('Paris Inn')).toBeInTheDocument();
    });
  });

  it('should show city and country for each hotel', async () => {
    render(<HotelsPage />);

    await waitFor(() => {
      expect(screen.getByText('Madrid')).toBeInTheDocument();
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });
  });

  it('should show active/inactive badges', async () => {
    render(<HotelsPage />);

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Activo');
      const inactiveBadges = screen.getAllByText('Inactivo');
      expect(activeBadges).toHaveLength(2);
      expect(inactiveBadges).toHaveLength(1);
    });
  });

  it('should call API with search param when typing', async () => {
    const user = userEvent.setup();
    render(<HotelsPage />);

    const searchInput = screen.getByPlaceholderText('Buscar por nombre...');
    await user.type(searchInput, 'grand');

    await waitFor(() => {
      expect(api.getHotels).toHaveBeenCalledWith(
        expect.stringContaining('search=grand')
      );
    });
  });

  it('should show the create hotel modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<HotelsPage />);

    await user.click(screen.getByText('Nuevo Hotel'));

    await waitFor(() => {
      expect(screen.getByText('Nuevo Hotel', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('Crear Hotel')).toBeInTheDocument();
    });
  });

  it('should show room type count', async () => {
    render(<HotelsPage />);

    await waitFor(() => {
      expect(screen.getByText('4 tipos')).toBeInTheDocument();
      expect(screen.getByText('3 tipos')).toBeInTheDocument();
      expect(screen.getByText('2 tipos')).toBeInTheDocument();
    });
  });
});
