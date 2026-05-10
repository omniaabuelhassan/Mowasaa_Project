import React, { useState, useEffect } from 'react';
import { getAllPharmacies, getAllMedicines, addMedicineToInventory, getPharmacyStats } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState('');
    const [pharmacyStats, setPharmacyStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        medicine_id: '',
        price: '',
        in_stock: true,
        discount: 0,
        offer: ''
    });

    useEffect(() => {
        loadPharmacies();
        loadMedicines();
    }, []);

    useEffect(() => {
        if (selectedPharmacy) {
            loadPharmacyStats(selectedPharmacy);
        }
    }, [selectedPharmacy]);

    const loadPharmacies = async () => {
        try {
            const response = await getAllPharmacies();
            setPharmacies(response.data || []);
        } catch (error) {
            console.error('Error loading pharmacies:', error);
        }
    };

    const loadMedicines = async () => {
        try {
            const response = await getAllMedicines();
            setMedicines(response.data || []);
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    };

    const loadPharmacyStats = async (pharmacyId) => {
        try {
            const response = await getPharmacyStats(pharmacyId);
            setPharmacyStats(response.statistics);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedPharmacy || !formData.medicine_id || !formData.price) {
            setMessage({ type: 'error', text: 'Please fill in all required fields!' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await addMedicineToInventory({
                pharmacy_id: parseInt(selectedPharmacy),
                medicine_id: parseInt(formData.medicine_id),
                price: parseFloat(formData.price),
                in_stock: formData.in_stock,
                discount: parseInt(formData.discount) || 0,
                offer: formData.offer || null
            });

            setMessage({ type: 'success', text: '✅ Medicine added to inventory successfully!' });
            
            // Reset form
            setFormData({
                medicine_id: '',
                price: '',
                in_stock: true,
                discount: 0,
                offer: ''
            });

            // Reload stats
            loadPharmacyStats(selectedPharmacy);

        } catch (error) {
            setMessage({ type: 'error', text: '❌ Error adding medicine: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>⚙️ Pharmacy Admin Panel</h1>
                <p>Manage your pharmacy inventory, prices, and offers</p>
            </div>

            <div className="admin-content">
                {/* Pharmacy Selection */}
                <div className="admin-card">
                    <h2>📍 Select Pharmacy</h2>
                    <select 
                        value={selectedPharmacy}
                        onChange={(e) => setSelectedPharmacy(e.target.value)}
                        className="admin-select"
                    >
                        <option value="">-- Select a Pharmacy --</option>
                        {pharmacies.map(pharmacy => (
                            <option key={pharmacy.pharmacy_id} value={pharmacy.pharmacy_id}>
                                {pharmacy.name} - {pharmacy.address}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pharmacy Statistics */}
                {selectedPharmacy && pharmacyStats && (
                    <div className="admin-card stats-card">
                        <h2>📊 Pharmacy Statistics</h2>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Total Medicines</span>
                                <span className="stat-number">{pharmacyStats.total_medicines}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">In Stock</span>
                                <span className="stat-number green">{pharmacyStats.in_stock_count}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Items on Discount</span>
                                <span className="stat-number orange">{pharmacyStats.discounted_items}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Active Offers</span>
                                <span className="stat-number blue">{pharmacyStats.items_with_offers}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Average Price</span>
                                <span className="stat-number">{pharmacyStats.average_price} EGP</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Price Range</span>
                                <span className="stat-number">
                                    {pharmacyStats.lowest_price} - {pharmacyStats.highest_price} EGP
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Medicine Form */}
                {selectedPharmacy && (
                    <div className="admin-card">
                        <h2>➕ Add Medicine to Inventory</h2>
                        
                        {message.text && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-group">
                                <label htmlFor="medicine_id">Medicine *</label>
                                <select
                                    id="medicine_id"
                                    name="medicine_id"
                                    value={formData.medicine_id}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">-- Select Medicine --</option>
                                    {medicines.map(medicine => (
                                        <option key={medicine.medicine_id} value={medicine.medicine_id}>
                                            {medicine.brand_name} ({medicine.scientific_name}) - {medicine.strength}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price">Price (EGP) *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., 25.50"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="discount">Discount (%)</label>
                                    <input
                                        type="number"
                                        id="discount"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., 10"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="offer">Special Offer (Optional)</label>
                                <input
                                    type="text"
                                    id="offer"
                                    name="offer"
                                    value={formData.offer}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="e.g., Buy 2 Get 1 Free"
                                    maxLength="200"
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="in_stock"
                                        checked={formData.in_stock}
                                        onChange={handleInputChange}
                                    />
                                    <span>In Stock</span>
                                </label>
                            </div>

                            {formData.price && (
                                <div className="price-preview">
                                    <h3>Price Preview:</h3>
                                    <div className="preview-content">
                                        {formData.discount > 0 ? (
                                            <>
                                                <span className="preview-original">{formData.price} EGP</span>
                                                <span className="preview-discount">-{formData.discount}%</span>
                                                <span className="preview-final">
                                                    {(formData.price * (1 - formData.discount / 100)).toFixed(2)} EGP
                                                </span>
                                            </>
                                        ) : (
                                            <span className="preview-final">{formData.price} EGP</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : '➕ Add to Inventory'}
                            </button>
                        </form>
                    </div>
                )}

                {!selectedPharmacy && (
                    <div className="admin-card empty-state">
                        <div className="empty-icon">🏥</div>
                        <h3>Please select a pharmacy to get started</h3>
                        <p>Choose a pharmacy from the dropdown above to manage its inventory</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;