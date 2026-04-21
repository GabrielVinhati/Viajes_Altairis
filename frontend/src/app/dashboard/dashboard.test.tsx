import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    getDashboard: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/dashboard',
}));

// Mock recharts to avoid canvas rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

const mockDashboard = {
  totalHotels: 50,
  activeHotels: 45,
  totalReservations: 320,
  todayCheckIns: 12,
  todayCheckOuts: 8,
  reservationsByStatus: {
    Pending: 40,
    Confirmed: 180,
    Cancelled: 30,
    CheckedIn: 50,
    CheckedOut: 20,
  },
  occupancyTrend: [
    { date: '2024-06-01', occupancyRate: 75.5 },
    { date: '2024-06-02', occupancyRate: 82.3 },
  ],
  topHotels: [
    { name: 'Grand Madrid Hotel', city: 'Madrid', reservationCount: 45 },
    { name: 'Barcelona Resort', city: 'Barcelona', reservationCount: 38 },
  ],
};

describe('DashboardPage', () => {
  it('should render the page title', async () => {
    (api.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should display KPI cards with correct values', async () => {
    (api.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('45 / 50')).toBeInTheDocument(); // Active/Total hotels
      expect(screen.getByText('320')).toBeInTheDocument(); // Total reservations
      expect(screen.getByText('12')).toBeInTheDocument(); // Today check-ins
      expect(screen.getByText('8')).toBeInTheDocument(); // Today check-outs
    });
  });

  it('should display KPI labels', async () => {
    (api.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Hoteles Activos')).toBeInTheDocument();
      expect(screen.getByText('Total Reservas')).toBeInTheDocument();
      expect(screen.getByText('Check-ins Hoy')).toBeInTheDocument();
      expect(screen.getByText('Check-outs Hoy')).toBeInTheDocument();
    });
  });

  it('should render chart sections', async () => {
    (api.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Tendencia de Ocupación/)).toBeInTheDocument();
      expect(screen.getByText('Reservas por Estado')).toBeInTheDocument();
      expect(screen.getByText('Top 5 Hoteles por Reservas')).toBeInTheDocument();
    });
  });

  it('should show loading skeleton initially', () => {
    (api.getDashboard as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves
    render(<DashboardPage />);

    // Should show skeleton, not the actual content
    expect(screen.queryByText('45 / 50')).not.toBeInTheDocument();
  });

  it('should show error message on API failure', async () => {
    (api.getDashboard as jest.Mock).mockResolvedValue(null);
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el dashboard')).toBeInTheDocument();
    });
  });

  it('should call getDashboard on mount', () => {
    (api.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);
    render(<DashboardPage />);

    expect(api.getDashboard).toHaveBeenCalled();
  });
});
