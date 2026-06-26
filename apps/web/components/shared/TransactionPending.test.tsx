import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TransactionPending } from './TransactionPending';

describe('TransactionPending', () => {
  it('renders loading state correctly', () => {
    render(<TransactionPending title="Processing" description="Please wait" />);
    expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    expect(screen.getByText(/Please wait/i)).toBeInTheDocument();
  });

  it('renders empty state correctly (not pending)', () => {
    const { container } = render(<TransactionPending title="" description="" isPending={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
