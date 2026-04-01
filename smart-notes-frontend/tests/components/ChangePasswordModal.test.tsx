import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import ChangePasswordModal from '../../src/components/ChangePasswordModal';
import { changePassword as changePasswordApi } from '../../src/api/auth';

vi.mock('../../src/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api/auth')>();
  return {
    ...actual,
    changePassword: vi.fn(),
  };
});

describe('ChangePasswordModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); 
  });

  it('does not render anything when isOpen is false', () => {
    render(<ChangePasswordModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Change Password')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onClose when the Cancel button is clicked', () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows an error if new passwords do not match WITHOUT calling the API', () => {
    const { container } = render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    const inputs = container.querySelectorAll('input[type="password"]');
    const currentInput = inputs[0];
    const newPasswordInput = inputs[1];
    const confirmPasswordInput = inputs[2];

    fireEvent.change(currentInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
    expect(changePasswordApi).not.toHaveBeenCalled();
  });

 it('handles a successful password update and auto-closes after 1.5 seconds', async () => {
    vi.useFakeTimers(); 
    
    (changePasswordApi as Mock).mockResolvedValueOnce({ data: { message: 'Success' } });

    const { container } = render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    const inputs = container.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: 'oldpass123' } });
    fireEvent.change(inputs[1], { target: { value: 'newsecurepass!' } });
    fireEvent.change(inputs[2], { target: { value: 'newsecurepass!' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(changePasswordApi).toHaveBeenCalledWith('oldpass123', 'newsecurepass!');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10); 
    });

    expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();

    expect(mockOnClose).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows an error message when the API request fails', async () => {
    const fakeError = {
      response: { data: { message: 'Incorrect current password.' } }
    };
    (changePasswordApi as Mock).mockRejectedValueOnce(fakeError);

    const { container } = render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);
    
    const inputs = container.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: 'wrongpass' } });
    fireEvent.change(inputs[1], { target: { value: 'newpass123' } });
    fireEvent.change(inputs[2], { target: { value: 'newpass123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() => {
      expect(screen.getByText('Incorrect current password.')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Password updated successfully!')).not.toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});