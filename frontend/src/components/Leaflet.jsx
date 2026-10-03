import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// // Fix default marker icon issues in React
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// // delete L.Icon.Default.prototype._getIconUrl;
// // L.Icon.Default.mergeOptions({
// //   iconUrl: markerIcon,
// //   iconRetinaUrl: markerIcon2x,
// //   shadowUrl: markerShadow,
// // });

// Helper component to re-center map dynamically when props change
function MapRecenter({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      // Use map.setView(center, zoom) for instant snapping, 
      // or map.flyTo(center, zoom) for smooth animation
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

const Leaflet = ({ 
  center = [51.505, -0.09], 
  zoom = 25, 
  latlng = { lat: 51.505, lng: -0.09 } 
}) => {
  const position = [latlng?.lat ?? center[0], latlng?.lng ?? center[1]];

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-sm mt-6">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Booking Location</Popup>
        </Marker>

        {/* This triggers the view update whenever center or zoom changes */}
        <MapRecenter center={center} zoom={zoom} scrollWheelZoom={true}/>
      </MapContainer>
    </div>
  );
};

export default Leaflet;