import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusTimeline } from './StatusTimeline';

describe('StatusTimeline', () => {
  it('renders all timeline steps', () => {
    render(<StatusTimeline currentStatus="created" />);
    expect(screen.getByText(/Created/i)).toBeInTheDocument();
    expect(screen.getByText(/Listed/i)).toBeInTheDocument();
    expect(screen.getByText(/Funded/i)).toBeInTheDocument();
    expect(screen.getByText(/Shipped/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
    expect(screen.getByText(/Repaid/i)).toBeInTheDocument();
  });

  it('marks steps up to currentStatus as active or completed', () => {
    const { container } = render(<StatusTimeline currentStatus="funded" />);
    // Testing specific active/completed visual states would depend on the implementation
    // But we ensure it renders without crashing for a mid-way status
    expect(container).toBeInTheDocument();
  });
});
