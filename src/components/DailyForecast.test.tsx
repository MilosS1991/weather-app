import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyForecast } from './DailyForecast';
import { MOCK_DAILY, MOCK_HOURLY } from '../test/fixtures';

describe('DailyForecast', () => {
  const defaultProps = { data: MOCK_DAILY, hourly: MOCK_HOURLY, currentHourIndex: 0, timezone: 'UTC' };

  it('renders the section title', () => {
    render(<DailyForecast {...defaultProps} />);
    expect(screen.getByText('7-Day Forecast')).toBeInTheDocument();
  });

  it('renders Today for the first row', () => {
    render(<DailyForecast {...defaultProps} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders 7 day rows', () => {
    render(<DailyForecast {...defaultProps} />);
    const dayButtons = screen.getAllByRole('button');
    expect(dayButtons).toHaveLength(7);
  });

  it('shows max/min temps for each day', () => {
    render(<DailyForecast {...defaultProps} />);
    // MOCK_DAILY.temperature_2m_max[0] = 15, min = 5
    expect(screen.getByText('15°')).toBeInTheDocument();
    expect(screen.getByText('5°')).toBeInTheDocument();
  });

  it('expands hourly section when a day row is clicked', () => {
    render(<DailyForecast {...defaultProps} />);
    fireEvent.click(screen.getByText('Today'));
    expect(screen.getByText(/Today.*Hourly/)).toBeInTheDocument();
  });

  it('collapses hourly section on second click of the same row', () => {
    render(<DailyForecast {...defaultProps} />);
    fireEvent.click(screen.getByText('Today'));
    expect(screen.getByText(/Today.*Hourly/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Today'));
    expect(screen.queryByText(/Today.*Hourly/)).toBeNull();
  });

  it('switches expanded day when a different row is clicked', () => {
    render(<DailyForecast {...defaultProps} />);
    fireEvent.click(screen.getByText('Today'));
    expect(screen.getByText(/Today.*Hourly/)).toBeInTheDocument();
    // click the second day button (index 1)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(screen.queryByText(/Today.*Hourly/)).toBeNull();
    expect(screen.getByText(/Hourly/)).toBeInTheDocument();
  });
});
