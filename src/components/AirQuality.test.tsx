import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AirQuality } from './AirQuality';
import { MOCK_AQ_DATA } from '../test/fixtures';

describe('AirQuality', () => {
  it('shows skeleton while loading', () => {
    const { container } = render(<AirQuality data={undefined} isPending={true} error={null} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows error message on failure', () => {
    render(<AirQuality data={undefined} isPending={false} error={new Error('Network error')} />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows "No data" when error is null and data is missing', () => {
    render(<AirQuality data={undefined} isPending={false} error={null} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders AQI value from data', () => {
    render(<AirQuality data={MOCK_AQ_DATA} isPending={false} error={null} />);
    // MOCK_AQ_DATA has us_aqi=25 at all hours → "Good"
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('renders individual pollutant readings', () => {
    render(<AirQuality data={MOCK_AQ_DATA} isPending={false} error={null} />);
    expect(screen.getByText(/PM2\.5/)).toBeInTheDocument();
    expect(screen.getByText(/PM10/)).toBeInTheDocument();
  });

  it('shows "AQI unavailable" when aqi index is null', () => {
    const nullAqData = {
      hourly: {
        ...MOCK_AQ_DATA.hourly,
        us_aqi: Array.from({ length: 48 }, () => null),
      },
    };
    render(<AirQuality data={nullAqData} isPending={false} error={null} />);
    expect(screen.getByText('AQI unavailable')).toBeInTheDocument();
  });
});
