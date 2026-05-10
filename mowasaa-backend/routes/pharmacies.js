const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');

// GET /api/pharmacies - Get all pharmacies
router.get('/', pharmacyController.getAllPharmacies);

// GET /api/pharmacies/nearest - Get nearest pharmacies
router.get('/nearest', pharmacyController.getNearestPharmacies);

// GET /api/pharmacies/radius - Get pharmacies within radius
router.get('/radius', pharmacyController.getPharmaciesInRadius);

// GET /api/pharmacies/:id - Get pharmacy by ID
router.get('/:id', pharmacyController.getPharmacyById);

// GET /api/pharmacies/:id/inventory - Get pharmacy inventory
router.get('/:id/inventory', pharmacyController.getPharmacyInventory);

module.exports = router;