import { useState, useEffect, useRef } from 'react';
import type { GeoLocation } from '../types';
import { searchLocations, reverseGeocode } from '../api/geocoding';
import type { GeocodingResult } from '../api/geocoding';

interface Props {
  location: GeoLocation;
  onLocationChange: (loc: GeoLocation) => void;
}

export function LocationSearch({ location, onLocationChange }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      try {
        const res = await searchLocations(trimmed);
        setResults(res);
        setOpen(res.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(id);
      setSearching(false);
    };
  }, [query]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function select(result: GeocodingResult) {
    onLocationChange({ latitude: result.latitude, longitude: result.longitude, name: result.name });
    setQuery('');
    setOpen(false);
  }

  async function geolocate() {
    if (!navigator.geolocation) return;
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          onLocationChange(loc);
        } catch {
          onLocationChange({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            name: 'My Location',
          });
        } finally {
          setGeolocating(false);
        }
      },
      () => setGeolocating(false),
    );
  }

  const hasGeo = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && (setQuery(''), setOpen(false))}
            placeholder={location.name}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-colors"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs animate-pulse">
              …
            </span>
          )}
        </div>

        {hasGeo && (
          <button
            onClick={geolocate}
            disabled={geolocating}
            title="Use my current location"
            className="flex-none p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {geolocating ? (
              <span className="w-4 h-4 flex items-center justify-center text-xs animate-pulse">…</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-9.5 11.25S.5 17.642.5 10.5a9 9 0 1119 0z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
          {results.map(r => (
            <li key={r.id}>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors"
                onMouseDown={e => { e.preventDefault(); select(r); }}
              >
                <span className="text-slate-100">{r.name}</span>
                {r.admin1 && (
                  <span className="text-slate-400 ml-1.5 text-xs">{r.admin1},</span>
                )}
                <span className="text-slate-500 ml-1.5 text-xs">{r.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
