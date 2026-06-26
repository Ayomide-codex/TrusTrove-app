import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletConnect } from './WalletConnect';

vi.mock('@/hooks/useSoroban', () => {
  let state = 'disconnected';
  return {
    useSoroban: () => ({
      status: state,
      address: state === 'connected' ? 'GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' : null,
      error: state === 'error' ? 'Connection failed' : null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      setStatus: (newStatus: string) => { state = newStatus; }
    })
  };
});

describe('WalletConnect', () => {
  it('renders disconnected state', () => {
    vi.mocked(require('@/hooks/useSoroban').useSoroban).mockReturnValue({ status: 'disconnected', address: null, error: null });
    render(<WalletConnect />);
    expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
  });

  it('renders connecting state', () => {
    vi.mocked(require('@/hooks/useSoroban').useSoroban).mockReturnValue({ status: 'connecting', address: null, error: null });
    render(<WalletConnect />);
    expect(screen.getByText(/Connecting.../i)).toBeInTheDocument();
  });

  it('renders connected state', () => {
    vi.mocked(require('@/hooks/useSoroban').useSoroban).mockReturnValue({ status: 'connected', address: 'GBXYZ', error: null });
    render(<WalletConnect />);
    expect(screen.getByText(/GBXYZ/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.mocked(require('@/hooks/useSoroban').useSoroban).mockReturnValue({ status: 'error', address: null, error: 'Connection failed' });
    render(<WalletConnect />);
    expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
  });
});
