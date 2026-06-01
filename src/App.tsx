import { useState, useEffect } from 'react';
import { useWeather } from './hooks/useWeather';
import { useAirQuality } from './hooks/useAirQuality';
import { useDaily } from './hooks/useDaily';
import { usePressureAlerts } from './hooks/usePressureAlerts';
import { currentHourIndex, DEFAULT_LOCATION } from './api/openmeteo';
import { CurrentConditions } from './components/CurrentConditions';
import { PressureAlert } from './components/PressureAlert';
import { AirQuality } from './components/AirQuality';
import { ModelDisagreement } from './components/ModelDisagreement';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { AlertToggle } from './components/AlertToggle';
import { LocationSearch } from './components/LocationSearch';
import { SevereWeatherBanner } from './components/SevereWeatherBanner';
import { FavoriteChips } from './components/FavoriteChips';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { useFavorites } from './hooks/useFavorites';
import { scanSevereWeather } from './utils/wmo';
import type { GeoLocation } from './types';

function locationFromURL(): GeoLocation {
  const p = new URLSearchParams(window.location.search);
  const lat = parseFloat(p.get('lat') ?? '');
  const lon = parseFloat(p.get('lon') ?? '');
  const name = p.get('name') ?? '';
  if (!isNaN(lat) && !isNaN(lon) && name) return { latitude: lat, longitude: lon, name };
  return DEFAULT_LOCATION;
}

export default function App() {
  const [location, setLocation] = useState<GeoLocation>(locationFromURL);
  const [showModels, setShowModels] = useState(false);
  const favorites = useFavorites();

  const { data: weather, isPending: weatherPending, isFetching: weatherFetching, error: weatherError, refetch: retryWeather, dataUpdatedAt } = useWeather(location);
  const { data: aqData, isPending: aqPending, error: aqError } = useAirQuality(location.latitude, location.longitude);
  const { data: dailyData } = useDaily(location);
  const pressureAlerts = usePressureAlerts(location);

  useEffect(() => {
    document.title = `${location.name} — Weather`;
  }, [location.name]);

  useEffect(() => {
    const p = new URLSearchParams();
    p.set('lat', location.latitude.toFixed(4));
    p.set('lon', location.longitude.toFixed(4));
    p.set('name', location.name);
    history.replaceState(null, '', `?${p.toString()}`);
  }, [location]);

  if (weatherPending) return <LoadingSkeleton />;

  if (weatherError || !weather) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full flex flex-col items-center gap-4 text-center">
          <div className="text-slate-400 text-sm uppercase tracking-widest">Weather</div>
          <div className="text-slate-200 font-medium">Could not load weather data</div>
          <div className="text-slate-500 text-sm">{weatherError?.message ?? 'Unknown error'}</div>
          <button
            onClick={() => retryWeather()}
            className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hourly   = weather.primary.hourly;
  const timezone = weather.primary.timezone;
  const currentIdx = currentHourIndex(hourly.time, timezone);
  const severeEvents = scanSevereWeather(hourly.weather_code, hourly.time, currentIdx);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">

        <header className="flex flex-col gap-2 py-2">
          <div className="flex items-center gap-3">
            <LocationSearch location={location} onLocationChange={setLocation} />
            <div className="flex-none flex items-center gap-3">
              <AlertToggle {...pressureAlerts} />
              <div className="text-xs text-right hidden sm:block">
                <div className="text-slate-500">
                  {new Date().toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  {weatherFetching && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-none" />
                  )}
                  <span className="text-slate-600">
                    {weatherFetching
                      ? 'Refreshing…'
                      : dataUpdatedAt
                      ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <FavoriteChips
            current={location}
            onSelect={setLocation}
            favorites={favorites}
          />
        </header>

        <SevereWeatherBanner events={severeEvents} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CurrentConditions hourly={hourly} index={currentIdx} locationName={location.name} />
          <PressureAlert pressureArray={hourly.pressure_msl} currentIndex={currentIdx} />
          <AirQuality data={aqData} isPending={aqPending} error={aqError} />
        </div>

        <HourlyForecast hourly={hourly} startIndex={currentIdx} timezone={timezone} />

        {dailyData && (
          <DailyForecast
            data={dailyData}
            hourly={hourly}
            currentHourIndex={currentIdx}
            timezone={timezone}
          />
        )}

        <div>
          <button
            onClick={() => setShowModels(s => !s)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-400 text-xs uppercase tracking-widest transition-colors mb-2"
          >
            <span>Model Agreement</span>
            <span className={`transition-transform duration-200 ${showModels ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {showModels && (
            <ModelDisagreement
              ecmwfHourly={weather.ecmwf.hourly}
              gfsHourly={weather.gfs.hourly}
              primaryTimes={hourly.time}
              currentIndex={currentIdx}
            />
          )}
        </div>

      </div>
    </div>
  );
}
