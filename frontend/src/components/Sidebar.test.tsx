import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/hotels',
}));

describe('Sidebar', () => {
  it('should render all navigation items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Hoteles')).toBeInTheDocument();
    expect(screen.getByText('Habitaciones')).toBeInTheDocument();
    expect(screen.getByText('Disponibilidad')).toBeInTheDocument();
    expect(screen.getByText('Reservas')).toBeInTheDocument();
  });

  it('should render the brand name', () => {
    render(<Sidebar />);
    expect(screen.getByText('Altairis')).toBeInTheDocument();
    expect(screen.getByText('Backoffice Operativo')).toBeInTheDocument();
  });

  it('should highlight the active navigation item', () => {
    render(<Sidebar />);
    const hotelesLink = screen.getByText('Hoteles').closest('a');
    expect(hotelesLink).toHaveClass('bg-primary-50');
    expect(hotelesLink).toHaveClass('text-primary-700');
  });

  it('should not highlight inactive items', () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toHaveClass('bg-primary-50');
  });

  it('should have correct href links', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Hoteles').closest('a')).toHaveAttribute('href', '/hotels');
    expect(screen.getByText('Habitaciones').closest('a')).toHaveAttribute('href', '/rooms');
    expect(screen.getByText('Disponibilidad').closest('a')).toHaveAttribute('href', '/availability');
    expect(screen.getByText('Reservas').closest('a')).toHaveAttribute('href', '/reservations');
  });

  it('should toggle mobile menu on button click', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // The sidebar starts hidden on mobile (translated off-screen)
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('-translate-x-full');

    // Click the menu toggle
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    // Sidebar should now be visible
    expect(sidebar).toHaveClass('translate-x-0');
  });
});
