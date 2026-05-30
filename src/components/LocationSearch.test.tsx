import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LocationSearch } from './LocationSearch';
import type { GeocodingResult } from '../api/geocoding';

vi.mock('../api/geocoding', () => ({
  searchLocations: vi.fn(),
  reverseGeocode: vi.fn(),
}));

import { searchLocations, reverseGeocode } from '../api/geocoding';

const mockResults: GeocodingResult[] = [
  { id: 1, name: 'Paris', latitude: 48.85, longitude: 2.35, country: 'France', admin1: 'Île-de-France' },
  { id: 2, name: 'Paris', latitude: 33.66, longitude: -95.55, country: 'United States', admin1: 'Texas' },
];

const defaultLocation = { latitude: 44.82, longitude: 20.46, name: 'Belgrade' };

describe('LocationSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(searchLocations).mockResolvedValue(mockResults);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders search input with current location as placeholder', () => {
    render(<LocationSearch location={defaultLocation} onLocationChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Belgrade')).toBeInTheDocument();
  });

  it('does not search for empty input', () => {
    render(<LocationSearch location={defaultLocation} onLocationChange={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(searchLocations).not.toHaveBeenCalled();
  });

  it('shows search results after debounce', async () => {
    render(<LocationSearch location={defaultLocation} onLocationChange={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Paris' } });
    await act(() => vi.runAllTimersAsync());
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('calls searchLocations with the typed query', async () => {
    render(<LocationSearch location={defaultLocation} onLocationChange={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Paris' } });
    await act(() => vi.runAllTimersAsync());
    expect(searchLocations).toHaveBeenCalledWith('Paris');
  });

  it('calls onLocationChange when a result is selected', async () => {
    const onLocationChange = vi.fn();
    render(<LocationSearch location={defaultLocation} onLocationChange={onLocationChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Paris' } });
    await act(() => vi.runAllTimersAsync());
    fireEvent.mouseDown(screen.getAllByRole('button')[0]);
    expect(onLocationChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Paris', latitude: 48.85 }),
    );
  });

  it('clears input after selecting a result', async () => {
    render(<LocationSearch location={defaultLocation} onLocationChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Paris' } });
    await act(() => vi.runAllTimersAsync());
    fireEvent.mouseDown(screen.getAllByRole('button')[0]);
    expect(input).toHaveValue('');
  });

  it('clears results on Escape key', async () => {
    render(<LocationSearch location={defaultLocation} onLocationChange={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Paris' } });
    await act(() => vi.runAllTimersAsync());
    expect(screen.getByText('France')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(screen.queryByText('France')).toBeNull();
  });

  it('renders GPS button when geolocation is available', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
    });
    render(<LocationSearch location={defaultLocation} onLocationChange={vi.fn()} />);
    expect(screen.getByTitle('Use my current location')).toBeInTheDocument();
  });

  it('calls reverseGeocode after getting GPS position', async () => {
    const mockPosition = { coords: { latitude: 48.85, longitude: 2.35 } };
    vi.mocked(reverseGeocode).mockResolvedValue({ latitude: 48.85, longitude: 2.35, name: 'Paris' });
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((cb: (pos: typeof mockPosition) => void) => cb(mockPosition)),
      },
      configurable: true,
    });
    const onLocationChange = vi.fn();
    render(<LocationSearch location={defaultLocation} onLocationChange={onLocationChange} />);
    await act(async () => {
      fireEvent.click(screen.getByTitle('Use my current location'));
      await vi.runAllTimersAsync();
    });
    expect(reverseGeocode).toHaveBeenCalledWith(48.85, 2.35);
  });
});
