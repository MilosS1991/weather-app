import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SevereWeatherBanner } from './SevereWeatherBanner';
import type { SevereEvent } from '../utils/wmo';

const thunderstorm: SevereEvent = {
  time: '2024-01-15T14:00',
  code: 95,
  label: 'Thunderstorm',
};

const hail: SevereEvent = {
  time: '2024-01-15T15:00',
  code: 96,
  label: 'Thunderstorm w/ hail',
};

describe('SevereWeatherBanner', () => {
  it('renders nothing when events array is empty', () => {
    const { container } = render(<SevereWeatherBanner events={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a banner for a thunderstorm event', () => {
    render(<SevereWeatherBanner events={[thunderstorm]} />);
    expect(screen.getByText('Thunderstorm')).toBeInTheDocument();
  });

  it('uses amber styling for non-hail events', () => {
    const { container } = render(<SevereWeatherBanner events={[thunderstorm]} />);
    expect(container.firstChild as HTMLElement).toHaveClass('text-amber-300');
  });

  it('uses red styling when hail is present', () => {
    const { container } = render(<SevereWeatherBanner events={[hail]} />);
    expect(container.firstChild as HTMLElement).toHaveClass('text-red-300');
  });

  it('shows "N more hours" when multiple events', () => {
    const extra: SevereEvent = { time: '2024-01-15T16:00', code: 95, label: 'Thunderstorm' };
    render(<SevereWeatherBanner events={[thunderstorm, extra, extra]} />);
    expect(screen.getByText(/2 more affected hours/)).toBeInTheDocument();
  });

  it('uses singular "hour" for exactly one extra event', () => {
    const extra: SevereEvent = { time: '2024-01-15T16:00', code: 95, label: 'Thunderstorm' };
    render(<SevereWeatherBanner events={[thunderstorm, extra]} />);
    expect(screen.getByText(/1 more affected hour(?!s)/)).toBeInTheDocument();
  });
});
