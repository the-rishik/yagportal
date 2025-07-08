import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock the AuthContext
const mockUseAuth = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: jest.fn(),
      loading: false
    });
  });

  it('renders the navbar with logo', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/NJYAG Portal/i)).toBeInTheDocument();
  });

  it('shows login and register links when user is not authenticated', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });

  it('shows user menu when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user'
      },
      logout: jest.fn(),
      loading: false
    });

    renderWithRouter(<Navbar />);
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Bills/i)).toBeInTheDocument();
    expect(screen.getByText(/My Bills/i)).toBeInTheDocument();
  });

  it('shows admin links when user is admin', () => {
    mockUseAuth.mockReturnValue({
      user: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin'
      },
      logout: jest.fn(),
      loading: false
    });

    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Delegations/i)).toBeInTheDocument();
  });

  it('hides bills links for non-authenticated users', () => {
    renderWithRouter(<Navbar />);
    expect(screen.queryByText(/Bills/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/My Bills/i)).not.toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user'
      },
      logout: mockLogout,
      loading: false
    });

    renderWithRouter(<Navbar />);
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });
}); 