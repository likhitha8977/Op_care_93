const Hospital = require('../models/Hospital');
exports.listHospitals = async (req, res, next) => {
  try {
    const { city, type, specialty } = req.query;
    let query = {};
    if (city) query.city = city;
    if (type) query.type = type;
    if (specialty) query.services = specialty;
    const hospitals = await Hospital.find(query);
    res.json(hospitals);
  } catch (err) { next(err); }
};
