import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InvoiceTable } from './InvoiceTable';

const mockInvoices = [
  {
    id: '1',
    status: 'created',
    issuer: 'GBISSUER',
    buyer: 'GBBUYER',
    faceValue: 1000n,
    dueDate: 1234567890
  },
  {
    id: '2',
    status: 'funded',
    issuer: 'GBISSUER2',
    buyer: 'GBBUYER2',
    faceValue: 2000n,
    dueDate: 1234567891
  }
];

describe('InvoiceTable', () => {
  it('renders a list of invoices', () => {
    render(<InvoiceTable invoices={mockInvoices as any} />);
    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.getByText(/2000/)).toBeInTheDocument();
  });

  it('renders empty state when no invoices', () => {
    render(<InvoiceTable invoices={[]} />);
    expect(screen.getByText(/No invoices found/i)).toBeInTheDocument();
  });
});
