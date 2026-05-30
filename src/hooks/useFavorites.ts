import { useState, useCallback } from 'react';
import { DEFAULT_LOCATION } from '../api/openmeteo';
import type { GeoLocation } from '../types';

const STORAGE_KEY = 'wx-favorites';
const MAX_FAVORITES = 5;

function load(): GeoLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is GeoLocation =>
        typeof x === 'object' && x !== null &&
        typeof (x as GeoLocation).latitude === 'number' &&
        typeof (x as GeoLocation).longitude === 'number' &&
        typeof (x as GeoLocation).name === 'string',
    );
  } catch {
    return [];
  }
}

function save(favs: GeoLocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch { /* quota — silently skip */ }
}

function isSameLocation(a: GeoLocation, b: GeoLocation): boolean {
  return Math.abs(a.latitude - b.latitude) < 0.01 &&
         Math.abs(a.longitude - b.longitude) < 0.01;
}

export interface UseFavoritesResult {
  favorites: GeoLocation[];
  add: (loc: GeoLocation) => void;
  remove: (loc: GeoLocation) => void;
  isFavorite: (loc: GeoLocation) => boolean;
  canAdd: boolean;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<GeoLocation[]>(load);

  const add = useCallback((loc: GeoLocation) => {
    // Never duplicate DEFAULT_LOCATION — it's always pinned separately
    if (isSameLocation(loc, DEFAULT_LOCATION)) return;
    setFavorites(prev => {
      if (prev.some(f => isSameLocation(f, loc))) return prev;
      if (prev.length >= MAX_FAVORITES) return prev;
      const next = [...prev, loc];
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((loc: GeoLocation) => {
    setFavorites(prev => {
      const next = prev.filter(f => !isSameLocation(f, loc));
      save(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (loc: GeoLocation) =>
      isSameLocation(loc, DEFAULT_LOCATION) ||
      favorites.some(f => isSameLocation(f, loc)),
    [favorites],
  );

  return {
    favorites,
    add,
    remove,
    isFavorite,
    canAdd: favorites.length < MAX_FAVORITES,
  };
}
