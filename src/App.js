import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = L.icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" viewBox="0 0 24 24"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.75 7 13 7 13s7-7.25 7-13c0-3.86-3.14-7-7-7zm0 18c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3zm0-15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',
  iconSize: [36, 36],
  iconAnchor: [36, 36], 
});

function App() {
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [destination, setDestination] = useState({ latitude: null, longitude: null, address: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });
          setDestination({ latitude, longitude, address: 'Your current location' }); 
        },
        (err) => {
          setError("Location access denied. Unable to retrieve location.");
          console.error(err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleMarkerDragEnd = async (event) => {
    const { lat, lng } = event.target.getLatLng();
    setDestination({ latitude: lat, longitude: lng });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    if (response.ok) {
      const data = await response.json();
      setDestination((prev) => ({
        ...prev,
        address: data.display_name || 'Address not found',
      }));
    } else {
      console.error("Failed to fetch address");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Device Location</h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : coordinates.latitude && coordinates.longitude ? (
        <div>
          <p>Current Latitude: {coordinates.latitude}</p>
          <p>Current Longitude: {coordinates.longitude}</p>
          <MapContainer
            center={[coordinates.latitude, coordinates.longitude]}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker 
              position={[destination.latitude, destination.longitude]} 
              icon={customIcon} 
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
            >
              <Popup>
                <span className="font-bold text-red-500">You are here!</span>
              </Popup>
            </Marker>
          </MapContainer>
          {destination.latitude && destination.longitude && (
            <div className="mt-4">
              <p className="font-bold">Destination Latitude: {destination.latitude}</p>
              <p className="font-bold">Destination Longitude: {destination.longitude}</p>
              <p className="font-bold">Address: {destination.address}</p>
            </div>
          )}
        </div>
      ) : (
        <p>Loading location...</p>
      )}
    </div>
  );
}

export default App;
