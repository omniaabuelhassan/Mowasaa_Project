const pool = require('../config/database');

// Add new medicine to inventory (Pharmacy Admin)
exports.addMedicineToInventory = async (req, res, next) => {
    try {
        const { pharmacy_id, medicine_id, price, in_stock, discount, offer } = req.body;

        // Validate input
        if (!pharmacy_id || !medicine_id || !price) {
            return res.status(400).json({
                success: false,
                error: 'pharmacy_id, medicine_id, and price are required'
            });
        }

        const result = await pool.query(`
            INSERT INTO pharmacy_inventory 
            (pharmacy_id, medicine_id, price, in_stock, discount, offer)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (pharmacy_id, medicine_id) 
            DO UPDATE SET
                price = EXCLUDED.price,
                in_stock = EXCLUDED.in_stock,
                discount = EXCLUDED.discount,
                offer = EXCLUDED.offer,
                last_updated = CURRENT_TIMESTAMP
            RETURNING *
        `, [pharmacy_id, medicine_id, price, in_stock || true, discount || 0, offer || null]);

        res.status(201).json({
            success: true,
            message: 'Medicine added/updated in inventory',
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update medicine price/stock (Pharmacy Admin)
exports.updateInventory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { price, in_stock, discount, offer } = req.body;

        const result = await pool.query(`
            UPDATE pharmacy_inventory
            SET 
                price = COALESCE($1, price),
                in_stock = COALESCE($2, in_stock),
                discount = COALESCE($3, discount),
                offer = COALESCE($4, offer),
                last_updated = CURRENT_TIMESTAMP
            WHERE inventory_id = $5
            RETURNING *
        `, [price, in_stock, discount, offer, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Inventory item not found'
            });
        }

        res.json({
            success: true,
            message: 'Inventory updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete medicine from inventory
exports.deleteMedicineFromInventory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM pharmacy_inventory WHERE inventory_id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Inventory item not found'
            });
        }

        res.json({
            success: true,
            message: 'Medicine removed from inventory'
        });
    } catch (error) {
        next(error);
    }
};

// Get pharmacy statistics
exports.getPharmacyStats = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_medicines,
                COUNT(*) FILTER (WHERE in_stock = TRUE) as in_stock_count,
                COUNT(*) FILTER (WHERE discount > 0) as discounted_items,
                COUNT(*) FILTER (WHERE offer IS NOT NULL) as items_with_offers,
                ROUND(AVG(price), 2) as average_price,
                MIN(price) as lowest_price,
                MAX(price) as highest_price
            FROM pharmacy_inventory
            WHERE pharmacy_id = $1
        `, [id]);

        res.json({
            success: true,
            pharmacy_id: parseInt(id),
            statistics: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};