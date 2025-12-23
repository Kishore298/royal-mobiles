const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  login,
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/auth.controller');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router; 