import { describe, it, expect } from 'vitest';
import { degreesToCardinal, windArrowRotation } from './wind';

describe('degreesToCardinal', () => {
  it('maps cardinal directions', () => {
    expect(degreesToCardinal(0)).toBe('N');
    expect(degreesToCardinal(90)).toBe('E');
    expect(degreesToCardinal(180)).toBe('S');
    expect(degreesToCardinal(270)).toBe('W');
  });

  it('maps intercardinal directions', () => {
    expect(degreesToCardinal(45)).toBe('NE');
    expect(degreesToCardinal(135)).toBe('SE');
    expect(degreesToCardinal(225)).toBe('SW');
    expect(degreesToCardinal(315)).toBe('NW');
  });

  it('handles 360 as North', () => {
    expect(degreesToCardinal(360)).toBe('N');
  });

  it('wraps values over 360', () => {
    expect(degreesToCardinal(450)).toBe('E');
  });

  it('normalises negative values', () => {
    expect(degreesToCardinal(-90)).toBe('W');
  });
});

describe('windArrowRotation', () => {
  it('adds 180 degrees for downwind arrow', () => {
    expect(windArrowRotation(0)).toBe(180);
    expect(windArrowRotation(90)).toBe(270);
    expect(windArrowRotation(180)).toBe(0);
    expect(windArrowRotation(270)).toBe(90);
  });

  it('wraps at 360', () => {
    expect(windArrowRotation(350)).toBe(170);
  });
});
