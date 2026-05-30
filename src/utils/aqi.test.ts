import { describe, it, expect } from 'vitest';
import { aqiCategory, pm25ToAqi } from './aqi';

describe('aqiCategory', () => {
  it('Good for AQI ≤ 50', () => {
    expect(aqiCategory(0).label).toBe('Good');
    expect(aqiCategory(50).label).toBe('Good');
  });

  it('Moderate for AQI 51–100', () => {
    expect(aqiCategory(51).label).toBe('Moderate');
    expect(aqiCategory(100).label).toBe('Moderate');
  });

  it('Unhealthy for Sensitive for AQI 101–150', () => {
    expect(aqiCategory(101).label).toBe('Unhealthy for Sensitive');
    expect(aqiCategory(150).label).toBe('Unhealthy for Sensitive');
  });

  it('Unhealthy for AQI 151–200', () => {
    expect(aqiCategory(151).label).toBe('Unhealthy');
  });

  it('Very Unhealthy for AQI 201–300', () => {
    expect(aqiCategory(201).label).toBe('Very Unhealthy');
  });

  it('Hazardous for AQI > 300', () => {
    expect(aqiCategory(301).label).toBe('Hazardous');
  });

  it('returns distinct color per tier', () => {
    const good = aqiCategory(25);
    const moderate = aqiCategory(75);
    expect(good.color).not.toBe(moderate.color);
  });
});

describe('pm25ToAqi', () => {
  it('converts 0 μg/m³ to AQI 0', () => {
    expect(pm25ToAqi(0)).toBe(0);
  });

  it('converts 12 μg/m³ to AQI 50', () => {
    expect(pm25ToAqi(12)).toBe(50);
  });

  it('converts mid-range concentration to expected AQI', () => {
    // 35.4 μg/m³ should be near AQI 100
    expect(pm25ToAqi(35.4)).toBeGreaterThanOrEqual(98);
    expect(pm25ToAqi(35.4)).toBeLessThanOrEqual(100);
  });

  it('caps at 500 for extreme values', () => {
    expect(pm25ToAqi(600)).toBe(500);
  });
});
