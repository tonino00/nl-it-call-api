const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { sendTestEmail } = require('../controllers/emailController');

router.post('/test', protect, authorize('admin', 'support'), sendTestEmail);

module.exports = router;
