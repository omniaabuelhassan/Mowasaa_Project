const pool = require('../config/database');

// Get all medicines
exports.getAllMedicines = async (req, res, next) => {
    try {
        const { category, search } = req.query;

        let query = 'SELECT * FROM medicines WHERE 1=1';
        const params = [];

        if (category) {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (LOWER(brand_name) LIKE LOWER($${params.length}) OR LOWER(scientific_name) LIKE LOWER($${params.length}))`;
        }

        query += ' ORDER BY brand_name';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Get medicine by ID
exports.getMedicineById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM medicines WHERE medicine_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Medicine not found'
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

// Search medicine and get alternatives
exports.searchMedicineWithAlternatives = async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Medicine name is required'
            });
        }

        // Find the medicine
        const medicineResult = await pool.query(`
            SELECT * FROM medicines 
            WHERE LOWER(brand_name) LIKE LOWER($1)
            OR LOWER(scientific_name) LIKE LOWER($1)
            LIMIT 10
        `, [`%${name}%`]);

        if (medicineResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Medicine not found'
            });
        }

        const medicine = medicineResult.rows[0];

        // Get alternatives
        const alternativesResult = await pool.query(`
            SELECT 
                m.medicine_id,
                m.brand_name,
                m.scientific_name,
                m.category,
                m.strength,
                ma.similarity,
                ma.note
            FROM medicine_alternatives ma
            JOIN medicines m ON ma.alternative_medicine_id = m.medicine_id
            WHERE ma.original_medicine_id = $1
            ORDER BY ma.similarity DESC
        `, [medicine.medicine_id]);

        res.json({
            success: true,
            medicine: medicine,
            alternatives: alternativesResult.rows
        });
    } catch (error) {
        next(error);
    }
};

// Get medicine categories
exports.getCategories = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT category 
            FROM medicines 
            WHERE category IS NOT NULL
            ORDER BY category
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows.map(row => row.category)
        });
    } catch (error) {
        next(error);
    }
};