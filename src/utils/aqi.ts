import type { AqiCategory } from '../types';

interface AqiBreakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

const PM25_BREAKPOINTS: AqiBreakpoint[] = [
  { cLow: 0.0,   cHigh: 12.0,  iLow: 0,   iHigh: 50  },
  { cLow: 12.1,  cHigh: 35.4,  iLow: 51,  iHigh: 100 },
  { cLow: 35.5,  cHigh: 55.4,  iLow: 101, iHigh: 150 },
  { cLow: 55.5,  cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
];

export function pm25ToAqi(concentration: number): number {
  const c = Math.round(concentration * 10) / 10;
  const bp = PM25_BREAKPOINTS.find(b => c >= b.cLow && c <= b.cHigh);
  if (!bp) return concentration > 500 ? 500 : 0;
  return Math.round(
    ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow,
  );
}

export function aqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50)  return { label: 'Good',                    color: 'text-green-400',  bg: 'bg-green-400/10'  };
  if (aqi <= 100) return { label: 'Moderate',                color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-400', bg: 'bg-orange-400/10' };
  if (aqi <= 200) return { label: 'Unhealthy',               color: 'text-red-400',    bg: 'bg-red-400/10'    };
  if (aqi <= 300) return { label: 'Very Unhealthy',          color: 'text-purple-400', bg: 'bg-purple-400/10' };
  return            { label: 'Hazardous',                    color: 'text-rose-500',   bg: 'bg-rose-500/10'   };
}
