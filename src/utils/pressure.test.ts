import { describe, it, expect } from 'vitest';
import { pressureRateOfChange, pressureAlert } from './pressure';

describe('pressureRateOfChange', () => {
  const series = [1010, 1011, 1012, 1013, 1014, 1015, 1016];

  it('returns null when index is less than window', () => {
    expect(pressureRateOfChange(series, 2, 3)).toBeNull();
    expect(pressureRateOfChange(series, 0, 3)).toBeNull();
  });

  it('returns null when index out of bounds', () => {
    expect(pressureRateOfChange(series, 99, 3)).toBeNull();
  });

  it('computes rising rate correctly', () => {
    // index 6, window 3: (1016 - 1013) / 3 = 1
    expect(pressureRateOfChange(series, 6, 3)).toBeCloseTo(1);
  });

  it('computes falling rate correctly', () => {
    const falling = [1016, 1015, 1014, 1013, 1012, 1011, 1010];
    // index 6, window 3: (1010 - 1013) / 3 = -1
    expect(pressureRateOfChange(falling, 6, 3)).toBeCloseTo(-1);
  });

  it('returns zero for stable pressure', () => {
    const stable = [1013, 1013, 1013, 1013];
    expect(pressureRateOfChange(stable, 3, 3)).toBe(0);
  });
});

describe('pressureAlert', () => {
  it('returns null for null rate', () => {
    expect(pressureAlert(null)).toBeNull();
  });

  it('returns null for stable pressure (rate < 1)', () => {
    expect(pressureAlert(0.5)).toBeNull();
    expect(pressureAlert(-0.5)).toBeNull();
  });

  it('returns moderate rising alert', () => {
    const result = pressureAlert(1.2);
    expect(result).not.toBeNull();
    expect(result?.level).toBe('moderate');
    expect(result?.direction).toBe('rising');
  });

  it('returns moderate falling alert', () => {
    const result = pressureAlert(-1.5);
    expect(result?.level).toBe('moderate');
    expect(result?.direction).toBe('falling');
  });

  it('returns rapid rising alert', () => {
    const result = pressureAlert(3);
    expect(result?.level).toBe('rapid');
    expect(result?.direction).toBe('rising');
  });

  it('returns rapid falling alert with storm label', () => {
    const result = pressureAlert(-3);
    expect(result?.level).toBe('rapid');
    expect(result?.direction).toBe('falling');
    expect(result?.label).toMatch(/storm/i);
  });
});
