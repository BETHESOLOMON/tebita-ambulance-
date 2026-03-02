import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GPSPoint } from '../types';

// Standard Leaflet icons don't work with Vite easily without this fix
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  route: GPSPoint[];
  sceneLocation?: GPSPoint;
  destinationLocation?: GPSPoint;
  className?: string;
  interactive?: boolean;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ 
  route, 
  sceneLocation, 
  destinationLocation, 
  className,
  interactive = true 
}) => {
  const center: [number, number] = route.length > 0 
    ? [route[route.length - 1].lat, route[route.length - 1].lng]
    : [9.0227, 38.7460]; // Addis Ababa default

  const polylinePositions = route.map(p => [p.lat, p.lng] as [number, number]);

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg border border-red-500/20 ${className}`} style={{ height: '300px' }}>
      <style>{`
        .leaflet-container { width: 100%; height: 100%; }
        .leaflet-tile { filter: brightness(0.7) invert(1) grayscale(0.7) contrast(1.2) hue-rotate(180deg); }
      `}</style>
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        dragging={interactive}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {polylinePositions.length > 1 && (
          <Polyline positions={polylinePositions} color="#ef4444" weight={4} opacity={0.8} />
        )}
        {sceneLocation && (
          <Marker position={[sceneLocation.lat, sceneLocation.lng]}>
          </Marker>
        )}
        {destinationLocation && (
          <Marker position={[destinationLocation.lat, destinationLocation.lng]}>
          </Marker>
        )}
        <RecenterMap center={center} />
      </MapContainer>
    </div>
  );
};