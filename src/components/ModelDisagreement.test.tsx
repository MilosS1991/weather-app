import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModelDisagreement } from './ModelDisagreement';
import { MOCK_TIMES, MOCK_BASE_HOURLY } from '../test/fixtures';

describe('ModelDisagreement', () => {
  it('shows "Model data unavailable" when there are no matching times', () => {
    const emptyHourly = { time: [], temperature_2m: [], precipitation: [] };
    render(
      <ModelDisagreement
        ecmwfHourly={emptyHourly}
        gfsHourly={emptyHourly}
        primaryTimes={MOCK_TIMES}
        currentIndex={0}
      />,
    );
    expect(screen.getByText('Model data unavailable')).toBeInTheDocument();
  });

  it('renders "Good" badge for low disagreement', () => {
    render(
      <ModelDisagreement
        ecmwfHourly={MOCK_BASE_HOURLY}
        gfsHourly={MOCK_BASE_HOURLY}
        primaryTimes={MOCK_TIMES}
        currentIndex={0}
      />,
    );
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('renders avg delta value', () => {
    render(
      <ModelDisagreement
        ecmwfHourly={MOCK_BASE_HOURLY}
        gfsHourly={MOCK_BASE_HOURLY}
        primaryTimes={MOCK_TIMES}
        currentIndex={0}
      />,
    );
    // Identical models → delta = 0
    expect(screen.getByText('±0.0°C')).toBeInTheDocument();
  });

  it('renders "High" badge when models diverge significantly', () => {
    const shiftedGfs = {
      ...MOCK_BASE_HOURLY,
      temperature_2m: MOCK_BASE_HOURLY.temperature_2m.map(t => t + 5),
    };
    render(
      <ModelDisagreement
        ecmwfHourly={MOCK_BASE_HOURLY}
        gfsHourly={shiftedGfs}
        primaryTimes={MOCK_TIMES}
        currentIndex={0}
      />,
    );
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders "Moderate" badge for moderate disagreement', () => {
    const shiftedGfs = {
      ...MOCK_BASE_HOURLY,
      temperature_2m: MOCK_BASE_HOURLY.temperature_2m.map(t => t + 3),
    };
    render(
      <ModelDisagreement
        ecmwfHourly={MOCK_BASE_HOURLY}
        gfsHourly={shiftedGfs}
        primaryTimes={MOCK_TIMES}
        currentIndex={0}
      />,
    );
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('renders the disagreement bar chart', () => {
    const { container } = render(
      <ModelDisagreement
        ecmwfHourly={MOCK_BASE_HOURLY}
        gfsHourly={MOCK_BASE_HOURLY}
        primaryTimes={MOCK_TIMES}
        currentIndex={0}
      />,
    );
    // Bar chart: flex row of divs
    const bars = container.querySelectorAll('.flex-1.rounded-sm');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('shows ECMWF and GFS legend labels', () => {
    render(
      <ModelDisagreement
        ecmwfHourly={MOCK_BASE_HOURLY}
        gfsHourly={MOCK_BASE_HOURLY}
        primaryTimes={MOCK_TIMES}
        currentIndex={0}
      />,
    );
    expect(screen.getByText('ECMWF IFS04')).toBeInTheDocument();
    expect(screen.getByText('GFS Seamless')).toBeInTheDocument();
  });
});
