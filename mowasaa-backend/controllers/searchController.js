const pool = require("../config/database");

// Smart search: Medicine + Alternatives + Nearest Pharmacies with Prices
exports.smartSearch = async (req, res, next) => {
  try {
    const { medicine, latitude, longitude, radius = 50 } = req.query;

    // Validate input
    if (!medicine) {
      return res.status(400).json({
        success: false,
        error: "Medicine name is required",
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "User location (latitude and longitude) is required",
      });
    }

    // Step 1: Find the medicine
    const medicineResult = await pool.query(
      `
            SELECT medicine_id, brand_name, scientific_name, category, strength
            FROM medicines 
            WHERE LOWER(brand_name) LIKE LOWER($1)
            OR LOWER(scientific_name) LIKE LOWER($1)
            LIMIT 1
        `,
      [`%${medicine}%`],
    );

    if (medicineResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Medicine not found",
        suggestion:
          "Try searching with different spelling or check medicine name",
      });
    }

    const foundMedicine = medicineResult.rows[0];

    // Step 2: Get alternatives
    const alternativesResult = await pool.query(
      `
            SELECT alternative_medicine_id as medicine_id
            FROM medicine_alternatives
            WHERE original_medicine_id = $1
        `,
      [foundMedicine.medicine_id],
    );

    // Collect all medicine IDs (original + alternatives)
    const allMedicineIds = [
      foundMedicine.medicine_id,
      ...alternativesResult.rows.map((a) => a.medicine_id),
    ];

    // Step 3: Find pharmacies with these medicines (within radius)
    const radiusMeters = radius * 1000;

    const result = await pool.query(
      `
            SELECT 
                p.pharmacy_id,
                p.name as pharmacy_name,
                p.address,
                p.phone,
                p.opening_hours,
                p.has_offers,
                ST_X(p.location::geometry) as longitude,
                ST_Y(p.location::geometry) as latitude,
                ST_Distance(
                    p.location,
                    ST_SetSRID(ST_MakePoint(parseFloat(longitude), parseFloat(latitude)), 4326)::geography
                ) / 1000 as distance_km,
                m.medicine_id,
                m.brand_name as medicine_name,
                m.scientific_name,
                pi.price,
                pi.discount,
                pi.offer,
                pi.in_stock,
                CASE 
                    WHEN m.medicine_id = $1 THEN 'original'
                    ELSE 'alternative'
                END as medicine_type,
                -- Calculate final price after discount
                ROUND(pi.price * (1 - pi.discount::decimal / 100), 2) as final_price
            FROM pharmacy_inventory pi
            JOIN pharmacies p ON pi.pharmacy_id = p.pharmacy_id
            JOIN medicines m ON pi.medicine_id = m.medicine_id
            WHERE pi.medicine_id = ANY($4)
            AND pi.in_stock = TRUE
            AND ST_DWithin(
                p.location,
                ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
                $5
            )
            ORDER BY 
                distance_km ASC,
                medicine_type ASC,  -- Show original medicine first
                final_price ASC     -- Then sort by price
        `,
      [
        foundMedicine.medicine_id,
        longitude,
        latitude,
        allMedicineIds,
        radiusMeters,
      ],
    );

    // Format response
    res.json({
      success: true,
      searched_medicine: {
        name: foundMedicine.brand_name,
        scientific_name: foundMedicine.scientific_name,
        category: foundMedicine.category,
      },
      user_location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      search_radius_km: radius,
      results_count: result.rows.length,
      results: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Get best deals for a medicine (cheapest + with offers)
exports.getBestDeals = async (req, res, next) => {
  try {
    const { medicine, latitude, longitude } = req.query;

    if (!medicine || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: "Medicine name, latitude, and longitude are required",
      });
    }

    // Find medicine
    const medicineResult = await pool.query(
      `
            SELECT medicine_id FROM medicines 
            WHERE LOWER(brand_name) LIKE LOWER($1)
            LIMIT 1
        `,
      [`%${medicine}%`],
    );

    if (medicineResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Medicine not found",
      });
    }

    const medicineId = medicineResult.rows[0].medicine_id;

    // Get alternatives
    const alternativesResult = await pool.query(
      `
            SELECT alternative_medicine_id as medicine_id
            FROM medicine_alternatives
            WHERE original_medicine_id = $1
        `,
      [medicineId],
    );

    const allMedicineIds = [
      medicineId,
      ...alternativesResult.rows.map((a) => a.medicine_id),
    ];

    // Find best deals
    const result = await pool.query(
      `
            SELECT 
                p.pharmacy_id,
                p.name as pharmacy_name,
                p.address,
                p.phone,
                ST_X(p.location::geometry) as longitude,
                ST_Y(p.location::geometry) as latitude,
                ST_Distance(
                    p.location,
                    ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
                ) / 1000 as distance_km,
                m.brand_name as medicine_name,
                pi.price,
                pi.discount,
                pi.offer,
                ROUND(pi.price * (1 - pi.discount::decimal / 100), 2) as final_price,
                -- Calculate savings
                pi.price - ROUND(pi.price * (1 - pi.discount::decimal / 100), 2) as savings
            FROM pharmacy_inventory pi
            JOIN pharmacies p ON pi.pharmacy_id = p.pharmacy_id
            JOIN medicines m ON pi.medicine_id = m.medicine_id
            WHERE pi.medicine_id = ANY($4)
            AND pi.in_stock = TRUE
            AND (pi.discount > 0 OR pi.offer IS NOT NULL)
            ORDER BY savings DESC, distance_km ASC
            LIMIT 10
        `,
      [medicineId, longitude, latitude, allMedicineIds],
    );

    res.json({
      success: true,
      count: result.rows.length,
      best_deals: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Compare prices across all pharmacies for a specific medicine
exports.comparePrices = async (req, res, next) => {
  try {
    const { medicine } = req.query;

    if (!medicine) {
      return res.status(400).json({
        success: false,
        error: "Medicine name is required",
      });
    }

    const result = await pool.query(
      `
            SELECT 
                p.pharmacy_id,
                p.name as pharmacy_name,
                p.address,
                m.brand_name as medicine_name,
                m.scientific_name,
                pi.price,
                pi.discount,
                pi.offer,
                ROUND(pi.price * (1 - pi.discount::decimal / 100), 2) as final_price,
                pi.in_stock
            FROM pharmacy_inventory pi
            JOIN pharmacies p ON pi.pharmacy_id = p.pharmacy_id
            JOIN medicines m ON pi.medicine_id = m.medicine_id
            WHERE LOWER(m.brand_name) LIKE LOWER($1)
            AND pi.in_stock = TRUE
            ORDER BY final_price ASC
        `,
      [`%${medicine}%`],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No pharmacies found selling this medicine",
      });
    }

    // Calculate price statistics
    const prices = result.rows.map((r) => parseFloat(r.final_price));
    const avgPrice = (
      prices.reduce((a, b) => a + b, 0) / prices.length
    ).toFixed(2);
    const minPrice = Math.min(...prices).toFixed(2);
    const maxPrice = Math.max(...prices).toFixed(2);

    res.json({
      success: true,
      medicine: result.rows[0].medicine_name,
      scientific_name: result.rows[0].scientific_name,
      statistics: {
        average_price: parseFloat(avgPrice),
        lowest_price: parseFloat(minPrice),
        highest_price: parseFloat(maxPrice),
        price_difference: (maxPrice - minPrice).toFixed(2),
        pharmacies_count: result.rows.length,
      },
      pharmacies: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
