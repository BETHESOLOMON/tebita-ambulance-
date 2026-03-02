import { useState, useEffect, useCallback } from 'react';
import { GPSPoint } from '../types';

export function useGeolocation(active: boolean) {
  const [location, setLocation] = useState<GPSPoint | null>(null);
  const [route, setRoute] = useState<GPSPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point: GPSPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        };
        setLocation(point);
        setRoute((prev) => [...prev, point]);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [active]);

  const capturePoint = useCallback((label: string): GPSPoint | null => {
    if (!location) return null;
    return { ...location, label };
  }, [location]);

  return { location, route, error, capturePoint, setRoute };
}