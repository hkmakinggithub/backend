const express = require('express');
const router = express.Router();


const exportController = require('../controllers/exportController'); 

// Your routes
router.get('/export/master', exportController.exportFullDatabaseToExcel);
router.get('/export/businesses', exportController.exportBusinessesToExcel);

module.exports = router;