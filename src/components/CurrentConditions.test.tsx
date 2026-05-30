import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrentConditions } from './CurrentConditions';
import { MOCK_HOURLY } from '../test/fixtures';

describe('CurrentConditions', () => {
  const defaultProps = { hourly: MOCK_HOURLY, index: 0, locationName: 'Belgrade' };

  it('renders location name', () => {
    render(<CurrentConditions {...defaultProps} />);
    expect(screen.getByText('Belgrade')).toBeInTheDocument();
  });

  it('renders temperature', () => {
    render(<CurrentConditions {...defaultProps} />);
    // temperature_2m[0] = 10 → "10°"
    expect(screen.getByText('10°')).toBeInTheDocument();
  });

  it('renders feels-like stat', () => {
    render(<CurrentConditions {...defaultProps} />);
    // apparent_temperature[0] = 8 → "8°C"
    expect(screen.getByText('8°C')).toBeInTheDocument();
    expect(screen.getByText('Feels like')).toBeInTheDocument();
  });

  it('renders humidity stat', () => {
    render(<CurrentConditions {...defaultProps} />);
    // relative_humidity_2m[0] = 60
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
  });

  it('renders dew point stat', () => {
    render(<CurrentConditions {...defaultProps} />);
    // dew_point_2m[0] = 5 → "5°C"
    expect(screen.getByText('Dew point')).toBeInTheDocument();
  });

  it('renders wind speed', () => {
    render(<CurrentConditions {...defaultProps} />);
    // wind_speed_10m[0] = 15
    expect(screen.getByText('15 km/h')).toBeInTheDocument();
  });

  it('renders wind cardinal direction', () => {
    render(<CurrentConditions {...defaultProps} />);
    // wind_direction_10m[0] = 0 → 'N'
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  it('updates values when index changes', () => {
    const { rerender } = render(<CurrentConditions {...defaultProps} index={0} />);
    expect(screen.getByText('10°')).toBeInTheDocument();
    rerender(<CurrentConditions {...defaultProps} index={1} />);
    // temperature_2m[1] = 11
    expect(screen.getByText('11°')).toBeInTheDocument();
  });
});
