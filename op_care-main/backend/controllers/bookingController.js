const Booking = require('../models/Booking');
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).populate('hospital');
    res.json(bookings);
  } catch (err) { next(err); }
};
exports.createBooking = async (req, res, next) => {
  try {
    const { hospital, service, date, consultationType } = req.body;
    const payload = { user: req.userId, hospital, service, date };
    if (consultationType && (consultationType === 'video' || consultationType === 'in_person')) {
      payload.consultationType = consultationType;
      if (consultationType === 'video') {
        payload.videoStatus = 'pending';
      }
    }
    const booking = await Booking.create(payload);
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
