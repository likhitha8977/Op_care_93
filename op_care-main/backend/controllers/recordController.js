const Record = require('../models/Record');
exports.getRecords = async (req, res, next) => {
  try {
    const records = await Record.find({ user: req.userId });
    res.json(records);
  } catch (err) { next(err); }
};
exports.uploadRecord = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const record = await Record.create({ user: req.userId, filename: file.originalname, url: `/uploads/${file.filename}` });
    res.status(201).json(record);
  } catch (err) { next(err); }
};