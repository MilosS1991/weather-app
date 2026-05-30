import { describe, it, expect } from 'vitest';
import { wmoLabel, wmoIcon, scanSevereWeather } from './wmo';

describe('wmoLabel', () => {
  it('returns known label', () => {
    expect(wmoLabel(0)).toBe('Clear sky');
    expect(wmoLabel(61)).toBe('Light rain');
    expect(wmoLabel(95)).toBe('Thunderstorm');
  });

  it('returns Unknown for unrecognised code', () => {
    expect(wmoLabel(999)).toBe('Unknown');
  });

  it('returns Unknown for undefined', () => {
    expect(wmoLabel(undefined)).toBe('Unknown');
  });
});

describe('wmoIcon', () => {
  it('returns known icon', () => {
    expect(wmoIcon(0)).toBe('☀️');
    expect(wmoIcon(3)).toBe('☁️');
    expect(wmoIcon(95)).toBe('⛈️');
  });

  it('returns fallback for unrecognised code', () => {
    expect(wmoIcon(999)).toBe('🌡️');
  });

  it('returns fallback for undefined', () => {
    expect(wmoIcon(undefined)).toBe('🌡️');
  });
});

describe('scanSevereWeather', () => {
  const times = ['T00', 'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T12'];

  it('returns empty array when no severe codes', () => {
    const codes = Array(13).fill(1);
    expect(scanSevereWeather(codes, times, 0)).toEqual([]);
  });

  it('returns events within the window', () => {
    const codes = [1, 1, 95, 96, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const events = scanSevereWeather(codes, times, 0, 12);
    expect(events).toHaveLength(2);
    expect(events[0].code).toBe(95);
    expect(events[0].label).toBe('Thunderstorm');
    expect(events[1].code).toBe(96);
  });

  it('excludes events outside the window', () => {
    const codes = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 95];
    const events = scanSevereWeather(codes, times, 0, 12);
    expect(events).toHaveLength(0);
  });

  it('respects startIndex', () => {
    const codes = [95, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const events = scanSevereWeather(codes, times, 1, 12);
    expect(events).toHaveLength(0);
  });

  it('handles code 99 (hail)', () => {
    const codes = [1, 99, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const events = scanSevereWeather(codes, times, 0, 12);
    expect(events[0].code).toBe(99);
    expect(events[0].time).toBe('T01');
  });
});
