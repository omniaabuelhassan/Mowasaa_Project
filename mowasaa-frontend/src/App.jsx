import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// 1. Add extensions (.jsx) to local component imports
import Navbar from "./components/Navbar/Navbar.jsx"; 
import SearchBar from "./components/Search/SearchBar.jsx";
import MapView from "./components/Map/MapView.jsx";
import ResultsList from "./components/Results/ResultsList.jsx";
import AdminPanel from "./components/Admin/AdminPanel.jsx";

// 2. Fix the path to api.js (it's now in ./components/services/api.js)
// AND add the .js extension
import { smartSearch, getAllPharmacies } from "./components/services/api.js"; 
import "./App.css";

// Home Page Component
function HomePage() {
  const [userLocation, setUserLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchedMedicine, setSearchedMedicine] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  // Get user's current location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log("✅ User location obtained:", position.coords);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Hurghada center if location denied
          setUserLocation({
            latitude: 27.2579,
            longitude: 33.8116,
          });
          setError(
            "Location access denied. Using default location (Hurghada).",
          );
        },
      );
    } else {
      // Browser doesn't support geolocation
      setUserLocation({
        latitude: 27.2579,
        longitude: 33.8116,
      });
      setError("Geolocation not supported. Using default location (Hurghada).");
    }
  };

  const handleSearch = async (medicineName, radius) => {
    if (!userLocation) {
      setError("Unable to get your location. Please enable location services.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedPharmacy(null);

    try {
      console.log("🔍 Searching for:", medicineName, "Radius:", radius, "km");

      const response = await smartSearch(
        medicineName,
        userLocation.latitude,
        userLocation.longitude,
        radius,
      );

      console.log("✅ Search results:", response);

      if (response.success) {
        setSearchResults(response.results || []);
        setSearchedMedicine(response.searched_medicine?.name || medicineName);

        if (!response.results || response.results.length === 0) {
          setError(
            `No pharmacies found selling "${medicineName}" within ${radius} km. Try increasing the search radius.`,
          );
        }
      } else {
        setError(response.error || "Search failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Search error:", err);

      if (err.response?.status === 404) {
        setError(
          `Medicine "${medicineName}" not found. Please check the spelling or try a different medicine.`,
        );
      } else {
        setError(
          "Unable to search. Please check your internet connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePharmacyClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    // Scroll to map
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>🏥 Find Your Medicine</h1>
          <p>
            Search for medicines and discover the nearest pharmacies with the
            best prices
          </p>
        </div>
      </div>

      <div className="container">
        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && <div className="error-message">⚠️ {error}</div>}

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching for pharmacies near you...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <>
            <div className="map-section">
              <h2 className="section-title">📍 Interactive Map</h2>
              <MapView
                results={searchResults}
                userLocation={userLocation}
                selectedPharmacy={selectedPharmacy}
                onPharmacySelect={handlePharmacyClick}
              />
            </div>

            <ResultsList
              results={searchResults}
              searchedMedicine={searchedMedicine}
              onPharmacyClick={handlePharmacyClick}
            />
          </>
        )}

        {!loading && !error && searchResults.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Start Your Search</h3>
            <p>Enter a medicine name above to find pharmacies near you</p>
            <div className="example-searches">
              <p>Popular searches:</p>
              <div className="example-pills">
                <span className="pill">💊 Panadol</span>
                <span className="pill">💊 Brufen</span>
                <span className="pill">💊 Antinal</span>
                <span className="pill">💊 Augmentin</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pharmacies Page Component
function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadPharmacies();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({
            latitude: 27.2579,
            longitude: 33.8116,
          });
        },
      );
    } else {
      setUserLocation({
        latitude: 27.2579,
        longitude: 33.8116,
      });
    }
  };

  const loadPharmacies = async () => {
    try {
      const response = await getAllPharmacies();
      setPharmacies(response.data || []);
    } catch (err) {
      setError("Failed to load pharmacies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pharmacies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="pharmacies-page">
      <div className="hero-section small">
        <div className="hero-content">
          <h1>📍 All Pharmacies</h1>
          <p>Browse all available pharmacies in Hurghada</p>
        </div>
      </div>

      <div className="container">
        <div className="map-section">
          <MapView
            results={pharmacies.map((p) => ({
              ...p,
              pharmacy_name: p.name,
              distance_km: 0,
            }))}
            userLocation={userLocation}
          />
        </div>

        <div className="pharmacies-grid">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.pharmacy_id} className="pharmacy-card">
              <h3>{pharmacy.name}</h3>
              <div className="pharmacy-details">
                <p>
                  <strong>📍</strong> {pharmacy.address}
                </p>
                <p>
                  <strong>📞</strong> {pharmacy.phone}
                </p>
                <p>
                  <strong>🕒</strong> {pharmacy.opening_hours}
                </p>
                {pharmacy.has_offers && (
                  <span className="offers-badge">🎁 Has Offers</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pharmacies" element={<PharmaciesPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>

        <footer className="app-footer">
          <div className="footer-content">
            <p>© 2026 Mowasaa Pharmacy Finder - GIS Project</p>
            <p>Built with using React, Leaflet & PostGIS</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
