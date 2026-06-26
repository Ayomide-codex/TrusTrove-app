import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceCard } from './InvoiceCard';

// Mock the hooks
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ role: 'issuer' })
}));

vi.mock('@/hooks/useSoroban', () => ({
  useSoroban: () => ({ address: 'GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' })
}));

const mockInvoice = {
  id: 'abcd',
  status: 'created',
  issuer: 'GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  buyer: 'GBBUYER',
  faceValue: 1000n,
  dueDate: 1234567890
};

describe('InvoiceCard', () => {
  it('renders invoice details correctly', () => {
    render(<InvoiceCard invoice={mockInvoice as any} />);
    expect(screen.getByText(/1000/)).toBeInTheDocument();
  });

  it('renders correct action buttons for created status (issuer)', () => {
    render(<InvoiceCard invoice={{...mockInvoice, status: 'created'} as any} />);
    // Issuer can list for financing when created
    expect(screen.getByText(/List for Financing/i)).toBeInTheDocument();
  });

  it('renders correct action buttons for listed status (investor)', () => {
    vi.mocked(require('@/hooks/useRole').useRole).mockReturnValue({ role: 'investor' });
    render(<InvoiceCard invoice={{...mockInvoice, status: 'listed'} as any} />);
    // Investor can fund when listed
    expect(screen.getByText(/Fund Invoice/i)).toBeInTheDocument();
  });

  it('renders correct action buttons for funded status (issuer)', () => {
    vi.mocked(require('@/hooks/useRole').useRole).mockReturnValue({ role: 'issuer' });
    render(<InvoiceCard invoice={{...mockInvoice, status: 'funded'} as any} />);
    // Issuer can mark shipped when funded
    expect(screen.getByText(/Mark Shipped/i)).toBeInTheDocument();
  });

  it('renders correct action buttons for shipped status (buyer)', () => {
    vi.mocked(require('@/hooks/useRole').useRole).mockReturnValue({ role: 'buyer' });
    vi.mocked(require('@/hooks/useSoroban').useSoroban).mockReturnValue({ address: 'GBBUYER' });
    render(<InvoiceCard invoice={{...mockInvoice, status: 'shipped'} as any} />);
    // Buyer can confirm delivery when shipped
    expect(screen.getByText(/Confirm Delivery/i)).toBeInTheDocument();
  });

  it('renders correct action buttons for delivered status (buyer)', () => {
    vi.mocked(require('@/hooks/useRole').useRole).mockReturnValue({ role: 'buyer' });
    vi.mocked(require('@/hooks/useSoroban').useSoroban).mockReturnValue({ address: 'GBBUYER' });
    render(<InvoiceCard invoice={{...mockInvoice, status: 'delivered'} as any} />);
    // Buyer can repay when delivered
    expect(screen.getByText(/Repay/i)).toBeInTheDocument();
  });
});
