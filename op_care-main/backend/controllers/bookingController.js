const Booking = require('../models/Booking');
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).populate('hospital');
    res.json(bookings);
  } catch (err) { next(err); }
};
exports.createBooking = async (req, res, next) => {
  try {
    const { hospital, service, date } = req.body;
    const booking = await Booking.create({ user: req.userId, hospital, service, date });
    res.status(201).json(booking);
  } catch (err) { next(err); }
};
exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
    res.json(booking);
  } catch (err) { next(err); }
};
exports.deleteBooking = async (req, res, next) => {
  try {
    await Booking.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Booking cancelled' });
  } catch (err) { next(err); }
};
