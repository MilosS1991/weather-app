import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders without crashing', () => {
    const { container: c } = render(<LoadingSkeleton />);
    expect(c.firstChild).toBeInTheDocument();
  });

  it('fills the full viewport', () => {
    const { container: c } = render(<LoadingSkeleton />);
    const root = c.firstChild as HTMLElement;
    expect(root.className).toContain('min-h-screen');
  });

  it('renders multiple shimmer blocks', () => {
    const { container: c } = render(<LoadingSkeleton />);
    const shimmers = c.querySelectorAll('.animate-pulse');
    expect(shimmers.length).toBeGreaterThanOrEqual(6);
  });
});
