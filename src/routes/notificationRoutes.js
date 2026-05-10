const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');
const { streamNotifications } = require('../controllers/notificationController');

router.get('/stream', protect, streamNotifications);

module.exports = router;
