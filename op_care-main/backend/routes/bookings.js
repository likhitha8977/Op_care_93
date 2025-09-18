const express = require('express');
const router = express.Router();
const { getBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getBookings);
router.post('/', authMiddleware, createBooking);
router.put('/:id', authMiddleware, updateBooking);
router.delete('/:id', authMiddleware, deleteBooking);

module.exports = router;
