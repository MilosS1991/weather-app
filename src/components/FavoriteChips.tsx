import { DEFAULT_LOCATION } from '../api/openmeteo';
import type { GeoLocation } from '../types';
import type { UseFavoritesResult } from '../hooks/useFavorites';

interface Props {
  current: GeoLocation;
  onSelect: (loc: GeoLocation) => void;
  favorites: UseFavoritesResult;
}

function isSame(a: GeoLocation, b: GeoLocation): boolean {
  return Math.abs(a.latitude - b.latitude) < 0.01 &&
         Math.abs(a.longitude - b.longitude) < 0.01;
}

export function FavoriteChips({ current, onSelect, favorites }: Props) {
  const { favorites: saved, add, remove, canAdd } = favorites;
  const isCurrentDefault = isSame(current, DEFAULT_LOCATION);
  const isCurrentSaved = saved.some(f => isSame(f, current));
  const isCurrentFav = isCurrentDefault || isCurrentSaved;

  const allChips: GeoLocation[] = [DEFAULT_LOCATION, ...saved];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {allChips.map(loc => {
        const active = isSame(loc, current);
        return (
          <button
            key={`${loc.latitude}-${loc.longitude}`}
            onClick={() => onSelect(loc)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
              active
                ? 'bg-slate-600 border-slate-500 text-slate-100'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            {loc.name}
            {isSame(loc, DEFAULT_LOCATION) && (
              <span className="ml-1 opacity-50">★</span>
            )}
          </button>
        );
      })}

      {/* Add / remove button for current non-default location */}
      {!isCurrentDefault && (
        <button
          onClick={() => isCurrentSaved ? remove(current) : add(current)}
          disabled={!isCurrentSaved && !canAdd}
          title={
            isCurrentSaved
              ? `Remove ${current.name} from favorites`
              : canAdd
              ? `Save ${current.name}`
              : 'Favorites full (5 max)'
          }
          className={`text-xs px-2 py-1 rounded-full border transition-colors ${
            isCurrentFav
              ? 'border-slate-600 text-slate-500 hover:text-red-400 hover:border-red-500/40'
              : canAdd
              ? 'border-slate-700 text-slate-600 hover:text-slate-300 hover:border-slate-500'
              : 'border-slate-800 text-slate-700 cursor-not-allowed'
          }`}
        >
          {isCurrentSaved ? '✕' : '+'}
        </button>
      )}
    </div>
  );
}
