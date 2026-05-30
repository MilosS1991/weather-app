import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PressureAlert } from './PressureAlert';

// index 12 used so rate-of-change has a 3h window (needs index >= 3)
const STABLE_PRESSURE = Array.from({ length: 25 }, () => 1013);
const RISING_PRESSURE = Array.from({ length: 25 }, (_, i) => 1010 + i); // +1/h
const RAPID_FALL     = Array.from({ length: 25 }, (_, i) => 1030 - i * 2); // -2/h

describe('PressureAlert', () => {
  it('renders current pressure value', () => {
    render(<PressureAlert pressureArray={STABLE_PRESSURE} currentIndex={12} />);
    expect(screen.getByText('1013')).toBeInTheDocument();
    expect(screen.getByText('hPa')).toBeInTheDocument();
  });

  it('renders rate of change', () => {
    render(<PressureAlert pressureArray={RISING_PRESSURE} currentIndex={12} />);
    // rate = (1022 - 1019) / 3 = 1 hPa/h
    expect(screen.getByText(/1\.0 hPa\/h/)).toBeInTheDocument();
  });

  it('shows no alert badge for stable pressure', () => {
    render(<PressureAlert pressureArray={STABLE_PRESSURE} currentIndex={12} />);
    expect(screen.queryByText('Rapid')).toBeNull();
    expect(screen.queryByText('Moderate')).toBeNull();
  });

  it('shows Moderate badge for moderate change', () => {
    render(<PressureAlert pressureArray={RISING_PRESSURE} currentIndex={12} />);
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('shows Rapid badge for rapid change', () => {
    render(<PressureAlert pressureArray={RAPID_FALL} currentIndex={12} />);
    expect(screen.getByText('Rapid')).toBeInTheDocument();
  });

  it('renders the pressure sparkline', () => {
    const { container } = render(<PressureAlert pressureArray={STABLE_PRESSURE} currentIndex={12} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('±12h')).toBeInTheDocument();
  });

  it('renders rising indicator arrow', () => {
    render(<PressureAlert pressureArray={RISING_PRESSURE} currentIndex={12} />);
    expect(screen.getByText(/▲/)).toBeInTheDocument();
  });

  it('renders falling indicator arrow for rapid fall', () => {
    render(<PressureAlert pressureArray={RAPID_FALL} currentIndex={12} />);
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });
});
