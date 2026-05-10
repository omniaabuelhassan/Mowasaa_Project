import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ============================================
// SEARCH APIs
// ============================================

export const smartSearch = async (medicineName, latitude, longitude, radius = 50) => {
    try {
        const response = await api.get('/search/smart', {
            params: { medicine: medicineName, latitude, longitude, radius }
        });
        return response.data;
    } catch (error) {
        console.error('Smart search error:', error);
        throw error;
    }
};

export const getBestDeals = async (medicineName, latitude, longitude) => {
    try {
        const response = await api.get('/search/deals', {
            params: { medicine: medicineName, latitude, longitude }
        });
        return response.data;
    } catch (error) {
        console.error('Best deals error:', error);
        throw error;
    }
};

export const comparePrices = async (medicineName) => {
    try {
        const response = await api.get('/search/compare', {
            params: { medicine: medicineName }
        });
        return response.data;
    } catch (error) {
        console.error('Compare prices error:', error);
        throw error;
    }
};

// ============================================
// PHARMACY APIs
// ============================================

export const getAllPharmacies = async () => {
    try {
        const response = await api.get('/pharmacies');
        return response.data;
    } catch (error) {
        console.error('Get pharmacies error:', error);
        throw error;
    }
};

export const getNearestPharmacies = async (latitude, longitude, limit = 10) => {
    try {
        const response = await api.get('/pharmacies/nearest', {
            params: { latitude, longitude, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Get nearest pharmacies error:', error);
        throw error;
    }
};

export const getPharmacyInventory = async (pharmacyId) => {
    try {
        const response = await api.get(`/pharmacies/${pharmacyId}/inventory`);
        return response.data;
    } catch (error) {
        console.error('Get pharmacy inventory error:', error);
        throw error;
    }
};

// ============================================
// MEDICINE APIs
// ============================================

export const getAllMedicines = async (search = '') => {
    try {
        const response = await api.get('/medicines', {
            params: { search }
        });
        return response.data;
    } catch (error) {
        console.error('Get medicines error:', error);
        throw error;
    }
};

export const searchMedicineWithAlternatives = async (medicineName) => {
    try {
        const response = await api.get('/medicines/search', {
            params: { name: medicineName }
        });
        return response.data;
    } catch (error) {
        console.error('Search medicine error:', error);
        throw error;
    }
};

// ============================================
// ADMIN APIs
// ============================================

export const addMedicineToInventory = async (data) => {
    try {
        const response = await api.post('/admin/inventory', data);
        return response.data;
    } catch (error) {
        console.error('Add medicine error:', error);
        throw error;
    }
};

export const updateInventory = async (inventoryId, data) => {
    try {
        const response = await api.put(`/admin/inventory/${inventoryId}`, data);
        return response.data;
    } catch (error) {
        console.error('Update inventory error:', error);
        throw error;
    }
};

export const deleteInventoryItem = async (inventoryId) => {
    try {
        const response = await api.delete(`/admin/inventory/${inventoryId}`);
        return response.data;
    } catch (error) {
        console.error('Delete inventory error:', error);
        throw error;
    }
};

export const getPharmacyStats = async (pharmacyId) => {
    try {
        const response = await api.get(`/admin/pharmacy/${pharmacyId}/stats`);
        return response.data;
    } catch (error) {
        console.error('Get pharmacy stats error:', error);
        throw error;
    }
};

export default api;