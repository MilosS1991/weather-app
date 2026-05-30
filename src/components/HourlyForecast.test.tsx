import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HourlyForecast } from './HourlyForecast';
import { MOCK_HOURLY } from '../test/fixtures';

describe('HourlyForecast', () => {
  const defaultProps = { hourly: MOCK_HOURLY, startIndex: 0, timezone: 'UTC' };

  it('renders the card title', () => {
    render(<HourlyForecast {...defaultProps} />);
    expect(screen.getByText('24-Hour Forecast')).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<HourlyForecast {...defaultProps} title="Tonight" />);
    expect(screen.getByText('Tonight')).toBeInTheDocument();
  });

  it('shows "Now" label for the first cell', () => {
    render(<HourlyForecast {...defaultProps} showNowLabel={true} />);
    expect(screen.getByText('Now')).toBeInTheDocument();
  });

  it('does not show "Now" when showNowLabel is false', () => {
    render(<HourlyForecast {...defaultProps} showNowLabel={false} />);
    expect(screen.queryByText('Now')).toBeNull();
  });

  it('renders temperature values', () => {
    render(<HourlyForecast {...defaultProps} />);
    // temperature_2m[0] = 10
    const temps = screen.getAllByText(/^10°$/);
    expect(temps.length).toBeGreaterThan(0);
  });

  it('renders the temperature sparkline SVG', () => {
    const { container } = render(<HourlyForecast {...defaultProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders without wrapper when wrapped=false', () => {
    const { container } = render(<HourlyForecast {...defaultProps} wrapped={false} />);
    // No card background when unwrapped
    const card = container.querySelector('.bg-slate-800.rounded-2xl');
    expect(card).toBeNull();
  });

  it('renders 25 cells from startIndex', () => {
    render(<HourlyForecast {...defaultProps} startIndex={0} />);
    // Each cell has a temperature value; count distinct time cells via wind info
    const cells = screen.getAllByTitle(/From .* \(\d+°\)/);
    expect(cells.length).toBe(25);
  });
});
