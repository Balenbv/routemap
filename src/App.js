import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const RoutingMachine = ({ positionA, positionB }) => {
  const map = useMap();

  useEffect(() => {
    const plan = new L.Routing.Plan([L.latLng(positionA), L.latLng(positionB)], {
      createMarker: function(i, wp) {
        return L.marker(wp.latLng, {
          draggable: true,
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        });
      }
    });

    const control = L.Routing.control({
      plan: plan,
      router: new L.Routing.OSRMv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      useHints: false,
      urlParameters: {
        api_key: '5b3ce3597851110001cf62486557bf231c2242518f4abb6da5c944d9'
      }
    }),
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }]
      }
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, positionA, positionB]);

  return null;
};

function Map() {
  const positionA = [-38.9516, -68.0591]; // Punto A: Coordenadas de Neuquén, Argentina
  const positionB = [-38.9339, -67.9906]; // Punto B: Coordenadas de Cipolletti, Río Negro

  return (
    <MapContainer center={positionA} zoom={13} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <RoutingMachine positionA={positionA} positionB={positionB} />
    </MapContainer>
  );
}

export default Map;