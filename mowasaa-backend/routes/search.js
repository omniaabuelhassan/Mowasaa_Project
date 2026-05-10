const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// GET /api/search/smart - Smart search (medicine + alternatives + nearest pharmacies)
router.get('/smart', searchController.smartSearch);

// GET /api/search/deals - Get best deals for a medicine
router.get('/deals', searchController.getBestDeals);

// GET /api/search/compare - Compare prices across pharmacies
router.get('/compare', searchController.comparePrices);

module.exports = router;