const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// GET /api/medicines - Get all medicines
router.get('/', medicineController.getAllMedicines);

// GET /api/medicines/categories - Get all categories
router.get('/categories', medicineController.getCategories);

// GET /api/medicines/search - Search medicine with alternatives
router.get('/search', medicineController.searchMedicineWithAlternatives);

// GET /api/medicines/:id - Get medicine by ID
router.get('/:id', medicineController.getMedicineById);

module.exports = router;