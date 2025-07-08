import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the AuthContext
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false
  })
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  it('renders the application without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders the main navigation', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/NJYAG Portal/i)).toBeInTheDocument();
  });
});
