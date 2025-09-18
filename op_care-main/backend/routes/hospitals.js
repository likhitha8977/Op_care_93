const express = require('express');
const router = express.Router();
const { listHospitals } = require('../controllers/hospitalController');

router.get('/', listHospitals);

module.exports = router;
