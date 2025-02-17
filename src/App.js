import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Map() {
  const position = [-38.9516, -68.0591]; // Coordenadas de Buenos Aires, Argentina

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          Mi gente tamo en japon 
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default Map;
