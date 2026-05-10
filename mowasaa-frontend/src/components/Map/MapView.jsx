import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const pharmacyIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const bestDealIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to fit bounds
function FitBounds({ bounds }) {
    const map = useMap();
    
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [bounds, map]);
    
    return null;
}

const MapView = ({ results, userLocation, selectedPharmacy, onPharmacySelect }) => {
    const mapRef = useRef();
    const bounds = [];

    // Calculate bounds
    if (userLocation) {
        bounds.push([userLocation.latitude, userLocation.longitude]);
    }
    
    if (results && results.length > 0) {
        results.forEach(r => {
            if (r.latitude && r.longitude) {
                bounds.push([r.latitude, r.longitude]);
            }
        });
    }

    // Default center (Hurghada)
    const defaultCenter = [27.2579, 33.8116];
    const center = userLocation 
        ? [userLocation.latitude, userLocation.longitude] 
        : defaultCenter;

    // Find best deal (lowest final price)
    const bestDeal = results && results.length > 0
        ? results.reduce((min, r) => r.final_price < min.final_price ? r : min, results[0])
        : null;

    return (
        <div className="map-container">
            <MapContainer 
                center={center} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {bounds.length > 0 && <FitBounds bounds={bounds} />}

                {/* User location marker */}
                {userLocation && (
                    <Marker 
                        position={[userLocation.latitude, userLocation.longitude]} 
                        icon={userIcon}
                    >
                        <Popup>
                            <div className="popup-content">
                                <h3>📍 Your Location</h3>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Pharmacy markers */}
                {results && results.map((result, index) => {
                    const isBestDeal = bestDeal && result.pharmacy_id === bestDeal.pharmacy_id 
                        && result.medicine_id === bestDeal.medicine_id;
                    
                    return (
                        <Marker
                            key={`${result.pharmacy_id}-${result.medicine_id}`}
                            position={[result.latitude, result.longitude]}
                            icon={isBestDeal ? bestDealIcon : pharmacyIcon}
                            eventHandlers={{
                                click: () => onPharmacySelect && onPharmacySelect(result)
                            }}
                        >
                            <Popup>
                                <div className="pharmacy-popup">
                                    {isBestDeal && (
                                        <div className="best-deal-badge">
                                            🏆 BEST DEAL!
                                        </div>
                                    )}
                                    
                                    <h3>{result.pharmacy_name}</h3>
                                    
                                    <div className="popup-info">
                                        <p><strong>📍 Address:</strong> {result.address}</p>
                                        <p><strong>📞 Phone:</strong> {result.phone}</p>
                                        <p><strong>🕒 Hours:</strong> {result.opening_hours}</p>
                                        
                                        {result.distance_km && (
                                            <p className="distance">
                                                <strong>📏 Distance:</strong> {result.distance_km.toFixed(2)} km away
                                            </p>
                                        )}
                                    </div>

                                    <div className="popup-medicine">
                                        <h4>💊 {result.medicine_name}</h4>
                                        
                                        {result.medicine_type === 'alternative' && (
                                            <span className="alternative-badge">Alternative Medicine</span>
                                        )}
                                        
                                        <div className="price-section">
                                            <div className="price-row">
                                                {result.discount > 0 ? (
                                                    <>
                                                        <span className="original-price">{result.price} EGP</span>
                                                        <span className="final-price">{result.final_price} EGP</span>
                                                        <span className="discount-badge">-{result.discount}%</span>
                                                    </>
                                                ) : (
                                                    <span className="final-price">{result.price} EGP</span>
                                                )}
                                            </div>
                                            
                                            {result.offer && (
                                                <p className="offer-text">🎁 {result.offer}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {results && results.length > 0 && (
                <div className="map-legend">
                    <h4>Map Legend:</h4>
                    <div className="legend-item">
                        <span className="legend-marker blue"></span>
                        <span>Your Location</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-marker red"></span>
                        <span>Pharmacy</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-marker green"></span>
                        <span>Best Deal 🏆</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapView;