import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Función para geocodificación directa usando Nominatim (con fetch)
const geocode = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]; // Retorna [lat, lng]
    }
  } catch (error) {
    console.error('Error en geocodificación:', error);
  }
  return null;
};

const RoutingMachine = ({ waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;

    // Crear un plan de ruta con todos los puntos
    const plan = new L.Routing.Plan(
      waypoints.map((wp) => L.latLng(wp)),
      {
        createMarker: function (i, wp) {
          return L.marker(wp.latLng, {
            draggable: false, // Marcadores no arrastrables
            icon: L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          });
        },
      }
    );

    // Crear un control de ruta con el plan
    const control = L.Routing.control({
      plan: plan,
      router: new L.Routing.OSRMv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        useHints: false,
      }),
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }],
      },
      show: false, // No mostrar el panel de instrucciones
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, waypoints]);

  return null;
};

function Map() {
  const [locations, setLocations] = useState(['', '']); // Lista de ubicaciones
  const [waypoints, setWaypoints] = useState([]); // Coordenadas de las ubicaciones
  const [error, setError] = useState(''); // Mensaje de error
  const [showControls, setShowControls] = useState(true); // Estado para mostrar/ocultar controles

  const handleAddLocation = () => {
    setLocations([...locations, '']); // Agrega un nuevo input vacío
  };

  const handleLocationChange = (index, value) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  const handleCalculateRoute = async () => {
    setError('');

    // Filtrar ubicaciones vacías
    const nonEmptyLocations = locations.filter((location) => location.trim() !== '');

    // Validar que haya al menos dos ubicaciones
    if (nonEmptyLocations.length < 2) {
      setError('Debes ingresar al menos dos ubicaciones válidas.');
      return;
    }

    // Agregar "Neuquén, Argentina" a cada ubicación si no está incluido
    const formattedLocations = nonEmptyLocations.map((location) => {
      if (!location.toLowerCase().includes('neuquén') && !location.toLowerCase().includes('argentina')) {
        return `${location}, Neuquén, Argentina`;
      }
      return location;
    });

    // Geocodificación de todas las ubicaciones
    const coordsPromises = formattedLocations.map((location) => geocode(location));
    const coords = await Promise.all(coordsPromises);

    // Verificar si todas las coordenadas son válidas
    if (coords.some((coord) => !coord)) {
      setError('No se pudieron encontrar las coordenadas para una o más ubicaciones. Asegúrate de ser específico (ej: "Rosario Central, Neuquén, Argentina").');
      return;
    }

    setWaypoints(coords);
  };

  const toggleControls = () => {
    console.log('Estado actual de showControls:', showControls);
    setShowControls(!showControls);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Botón para mostrar/ocultar controles */}
      <button
        onClick={toggleControls}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '10px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {showControls ? 'Ocultar Controles' : 'Mostrar Controles'}
      </button>

      {/* Panel de controles */}
      <div
        style={{
          width: '100%',
          padding: '10px',
          background: '#f4f4f4',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          display: showControls ? 'block' : 'none', // Mostrar u ocultar el panel
        }}
      >
        <h2>Calcular Ruta</h2>
        {locations.map((location, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <label>Ubicación {index + 1}:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(index, e.target.value)}
              style={{ width: '100%', padding: '5px' }}
              placeholder={`Ej: Rosario Central, Neuquén`}
            />
          </div>
        ))}
        <button
          onClick={handleAddLocation}
          style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: '10px' }}
        >
          Agregar Ubicación
        </button>
        <button
          onClick={handleCalculateRoute}
          style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Calcular Ruta
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>

      {/* Mapa */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[-38.9516, -68.0591]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {waypoints.length >= 2 && <RoutingMachine waypoints={waypoints} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default Map;