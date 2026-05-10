const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// POST /api/admin/inventory - Add medicine to inventory
router.post('/inventory', adminController.addMedicineToInventory);

// PUT /api/admin/inventory/:id - Update inventory item
router.put('/inventory/:id', adminController.updateInventory);

// DELETE /api/admin/inventory/:id - Delete inventory item
router.delete('/inventory/:id', adminController.deleteMedicineFromInventory);

// GET /api/admin/pharmacy/:id/stats - Get pharmacy statistics
router.get('/pharmacy/:id/stats', adminController.getPharmacyStats);

module.exports = router;