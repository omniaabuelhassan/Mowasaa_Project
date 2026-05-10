import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, loading }) => {
    const [medicineName, setMedicineName] = useState('');
    const [searchRadius, setSearchRadius] = useState(10);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (medicineName.trim()) {
            onSearch(medicineName, searchRadius);
        }
    };

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSubmit} className="search-form">
                <div className="search-header">
                    <h2>🔍 Find Your Medicine</h2>
                    <p>Search for medicines and find the nearest pharmacies with best prices</p>
                </div>

                <div className="search-inputs">
                    <div className="input-group">
                        <label htmlFor="medicine">Medicine Name</label>
                        <input
                            id="medicine"
                            type="text"
                            placeholder="e.g., Panadol, Brufen, Antinal..."
                            value={medicineName}
                            onChange={(e) => setMedicineName(e.target.value)}
                            className="search-input"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="radius">Search Radius: {searchRadius} km</label>
                        <input
                            id="radius"
                            type="range"
                            min="1"
                            max="50"
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(e.target.value)}
                            className="search-slider"
                            disabled={loading}
                        />
                        <div className="radius-labels">
                            <span>1 km</span>
                            <span>50 km</span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="search-button"
                        disabled={loading || !medicineName.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Searching...
                            </>
                        ) : (
                            <>
                                <span>🔍</span>
                                Search Pharmacies
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="search-examples">
                <p>Try searching: 
                    <button onClick={() => setMedicineName('Panadol')}>Panadol</button>
                    <button onClick={() => setMedicineName('Brufen')}>Brufen</button>
                    <button onClick={() => setMedicineName('Antinal')}>Antinal</button>
                </p>
            </div>
        </div>
    );
};

export default SearchBar;