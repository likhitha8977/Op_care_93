const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getRecords, uploadRecord } = require('../controllers/recordController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getRecords);
router.post('/', authMiddleware, upload.single('file'), uploadRecord);

module.exports = router;
