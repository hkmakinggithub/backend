const express = require('express');
const router = express.Router();

// 🟢 THE FIX: Import your dedicated exportController instead of adminController
const exportController = require('../controllers/exportController'); 

// Your routes
router.get('/export/master', exportController.exportFullDatabaseToExcel);
router.get('/export/businesses', exportController.exportBusinessesToExcel);

module.exports = router;