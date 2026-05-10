import React, { useState } from 'react';
import './ResultsList.css';

const ResultsList = ({ results, searchedMedicine, onPharmacyClick }) => {
    const [sortBy, setSortBy] = useState('distance'); // distance, price, discount

    if (!results || results.length === 0) {
        return null;
    }

    // Sort results
    const sortedResults = [...results].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return a.final_price - b.final_price;
            case 'discount':
                return b.discount - a.discount;
            case 'distance':
            default:
                return a.distance_km - b.distance_km;
        }
    });

    // Find best deal
    const bestDeal = sortedResults.reduce((min, r) => 
        r.final_price < min.final_price ? r : min, 
        sortedResults[0]
    );

    // Calculate statistics
    const avgPrice = (sortedResults.reduce((sum, r) => sum + parseFloat(r.final_price), 0) / sortedResults.length).toFixed(2);
    const minPrice = Math.min(...sortedResults.map(r => parseFloat(r.final_price))).toFixed(2);
    const maxPrice = Math.max(...sortedResults.map(r => parseFloat(r.final_price))).toFixed(2);

    return (
        <div className="results-container">
            <div className="results-header">
                <div className="results-title">
                    <h2>🔍 Search Results</h2>
                    {searchedMedicine && (
                        <p className="searched-medicine">
                            Showing results for: <strong>{searchedMedicine}</strong>
                        </p>
                    )}
                    <p className="results-count">Found {results.length} pharmacies</p>
                </div>

                <div className="sort-controls">
                    <label>Sort by:</label>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="distance">📏 Distance</option>
                        <option value="price">💰 Price (Low to High)</option>
                        <option value="discount">🎁 Discount (High to Low)</option>
                    </select>
                </div>
            </div>

            {/* Price Statistics */}
            <div className="price-stats">
                <div className="stat-card">
                    <span className="stat-label">Lowest Price</span>
                    <span className="stat-value green">{minPrice} EGP</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Average Price</span>
                    <span className="stat-value blue">{avgPrice} EGP</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Highest Price</span>
                    <span className="stat-value red">{maxPrice} EGP</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">You Can Save Up To</span>
                    <span className="stat-value orange">{(maxPrice - minPrice).toFixed(2)} EGP</span>
                </div>
            </div>

            {/* Results Grid */}
            <div className="results-grid">
                {sortedResults.map((result, index) => {
                    const isBestDeal = result.pharmacy_id === bestDeal.pharmacy_id 
                        && result.medicine_id === bestDeal.medicine_id;
                    
                    return (
                        <div 
                            key={`${result.pharmacy_id}-${result.medicine_id}-${index}`}
                            className={`result-card ${isBestDeal ? 'best-deal' : ''}`}
                            onClick={() => onPharmacyClick && onPharmacyClick(result)}
                        >
                            {isBestDeal && (
                                <div className="best-deal-ribbon">
                                    🏆 BEST DEAL
                                </div>
                            )}

                            <div className="card-header">
                                <h3>{result.pharmacy_name}</h3>
                                <span className="distance-badge">
                                    📏 {result.distance_km.toFixed(2)} km
                                </span>
                            </div>

                            <div className="card-info">
                                <p><strong>📍</strong> {result.address}</p>
                                <p><strong>📞</strong> {result.phone}</p>
                                <p><strong>🕒</strong> {result.opening_hours}</p>
                            </div>

                            <div className="card-medicine">
                                <div className="medicine-header">
                                    <h4>💊 {result.medicine_name}</h4>
                                    {result.medicine_type === 'alternative' && (
                                        <span className="alternative-tag">Alternative</span>
                                    )}
                                </div>
                                
                                {result.scientific_name && (
                                    <p className="scientific-name">{result.scientific_name}</p>
                                )}
                            </div>

                            <div className="card-pricing">
                                <div className="price-display">
                                    {result.discount > 0 ? (
                                        <>
                                            <div className="price-breakdown">
                                                <span className="original-price">{result.price} EGP</span>
                                                <span className="discount-tag">-{result.discount}%</span>
                                            </div>
                                            <div className="final-price-large">{result.final_price} EGP</div>
                                            <div className="savings">
                                                You save: {(result.price - result.final_price).toFixed(2)} EGP
                                            </div>
                                        </>
                                    ) : (
                                        <div className="final-price-large">{result.price} EGP</div>
                                    )}
                                </div>

                                {result.offer && (
                                    <div className="offer-banner">
                                        🎁 {result.offer}
                                    </div>
                                )}

                                {result.has_offers && !result.offer && (
                                    <div className="has-offers-badge">
                                        ✨ This pharmacy has active offers
                                    </div>
                                )}
                            </div>

                            <button className="view-on-map-btn">
                                📍 View on Map
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResultsList;