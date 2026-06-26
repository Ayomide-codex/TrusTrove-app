import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoiceForm } from './InvoiceForm';

vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ role: 'issuer' })
}));
vi.mock('@/hooks/useSoroban', () => ({
  useSoroban: () => ({ address: 'GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' })
}));

describe('InvoiceForm', () => {
  it('renders the first step of the wizard', () => {
    render(<InvoiceForm />);
    expect(screen.getByText(/Buyer Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Face Value/i)).toBeInTheDocument();
  });

  it('validates form fields before proceeding', async () => {
    render(<InvoiceForm />);
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    expect(await screen.findByText(/Address is required/i)).toBeInTheDocument();
  });

  it('proceeds to step 2 when valid and shows simulation state', async () => {
    render(<InvoiceForm />);
    const buyerInput = screen.getByLabelText(/Buyer Address/i);
    const valueInput = screen.getByLabelText(/Face Value/i);
    
    fireEvent.change(buyerInput, { target: { value: 'GBBUYERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' } });
    fireEvent.change(valueInput, { target: { value: '1000' } });
    
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    
    expect(await screen.findByText(/Review Transaction/i)).toBeInTheDocument();
  });
});
