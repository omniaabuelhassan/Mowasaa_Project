const pool = require('../config/database');

// Get all pharmacies
exports.getAllPharmacies = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT 
                pharmacy_id,
                name,
                address,
                phone,
                opening_hours,
                has_offers,
                ST_X(location::geometry) as longitude,
                ST_Y(location::geometry) as latitude
            FROM pharmacies
            ORDER BY name
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Get pharmacy by ID
exports.getPharmacyById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                pharmacy_id,
                name,
                address,
                phone,
                opening_hours,
                has_offers,
                ST_X(location::geometry) as longitude,
                ST_Y(location::geometry) as latitude,
                created_at
            FROM pharmacies
            WHERE pharmacy_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pharmacy not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Get nearest pharmacies to user location
exports.getNearestPharmacies = async (req, res, next) => {
    try {
        const { latitude, longitude, limit = 10 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }

        const result = await pool.query(`
            SELECT 
                pharmacy_id,
                name,
                address,
                phone,
                opening_hours,
                has_offers,
                ST_X(location::geometry) as longitude,
                ST_Y(location::geometry) as latitude,
                ST_Distance(
                    location,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) / 1000 as distance_km
            FROM pharmacies
            ORDER BY distance_km
            LIMIT $3
        `, [longitude, latitude, limit]);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Get pharmacies within radius
exports.getPharmaciesInRadius = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query; // radius in km

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }

        const radiusMeters = radius * 1000;

        const result = await pool.query(`
            SELECT 
                pharmacy_id,
                name,
                address,
                phone,
                opening_hours,
                has_offers,
                ST_X(location::geometry) as longitude,
                ST_Y(location::geometry) as latitude,
                ST_Distance(
                    location,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) / 1000 as distance_km
            FROM pharmacies
            WHERE ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                $3
            )
            ORDER BY distance_km
        `, [longitude, latitude, radiusMeters]);

        res.json({
            success: true,
            count: result.rows.length,
            radius_km: radius,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Get pharmacy inventory (medicines available at specific pharmacy)
exports.getPharmacyInventory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                m.medicine_id,
                m.brand_name,
                m.scientific_name,
                m.category,
                m.strength,
                pi.price,
                pi.in_stock,
                pi.discount,
                pi.offer,
                pi.last_updated
            FROM pharmacy_inventory pi
            JOIN medicines m ON pi.medicine_id = m.medicine_id
            WHERE pi.pharmacy_id = $1
            AND pi.in_stock = TRUE
            ORDER BY m.brand_name
        `, [id]);

        res.json({
            success: true,
            pharmacy_id: parseInt(id),
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};