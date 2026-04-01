import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest'; // <-- NEW: Import vi and Mock from vitest

import Login from '../../src/pages/Login';
import { login as loginApi } from '../../src/api/auth';
import { useAuth } from '../../src/hooks/useAuth';

vi.mock('../../src/api/auth', () => ({
  login: vi.fn(), 
}));

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom'); 
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  const mockLoginHook = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ login: mockLoginHook });
  });

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders the login form correctly', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
  });

  it('handles a successful login', async () => {
    (loginApi as Mock).mockResolvedValueOnce({ data: { token: 'fake-token' } });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'test@company.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledWith('test@company.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error message when login fails', async () => {
    const fakeError = {
      response: { data: { detail: 'Invalid email or password.' } }
    };
    (loginApi as Mock).mockRejectedValueOnce(fakeError);

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'wrong@company.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});