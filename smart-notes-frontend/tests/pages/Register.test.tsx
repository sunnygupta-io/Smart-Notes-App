import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest';

import Register from '../../src/pages/Register';
import { register as registerApi, login as loginApi } from '../../src/api/auth';
import { useAuth } from '../../src/hooks/useAuth';

// 1. Mock the API using Vitest's recommended 'importOriginal' pattern
vi.mock('../../src/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/auth')>();
  return {
    ...actual,
    register: vi.fn(),
    login: vi.fn(),
  };
});

// 2. Mock the useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// 3. Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Page', () => {
  const mockLoginHook = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ login: mockLoginHook });
  });

  const renderRegister = () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  it('renders the registration form correctly', () => {
    renderRegister();
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    
    // We now use placeholders to find the inputs
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    
    // Since there are two password fields with the same placeholder, we get an array
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    expect(passwordInputs).toHaveLength(2); 
    
    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
  });

  it('shows an error if passwords do not match WITHOUT calling the API', async () => {
    renderRegister();

    // Fill email
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@company.com' } });
    
    // Get both password inputs and fill them with different values
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } }); // Main Password
    fireEvent.change(passwordInputs[1], { target: { value: 'differentPassword' } }); // Confirm Password
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Started' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(registerApi).not.toHaveBeenCalled();
    expect(loginApi).not.toHaveBeenCalled();
  });

  it('handles a successful registration and login sequence', async () => {
    (registerApi as Mock).mockResolvedValueOnce({ data: { message: 'User created' } });
    (loginApi as Mock).mockResolvedValueOnce({ data: { token: 'fake-token' } });

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@company.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Started' }));

    await waitFor(() => {
      expect(registerApi).toHaveBeenCalledWith('test@company.com', 'password123');
      expect(loginApi).toHaveBeenCalledWith('test@company.com', 'password123');
      expect(mockLoginHook).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  }); 

  it('shows an error message when the backend API fails', async () => {
    const fakeError = {
      response: { data: { detail: 'Email already registered.' } }
    };
    (registerApi as Mock).mockRejectedValueOnce(fakeError);

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'existing@company.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Get Started' }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered.')).toBeInTheDocument();
    });
    
    expect(loginApi).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});