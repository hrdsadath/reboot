const express = require('express');
const router = express.Router();
const { getDashboardStats, assignCandidateTrack, seedSampleData } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.post('/assign-track', protect, authorize('admin'), assignCandidateTrack);
router.post('/seed', seedSampleData); // Open seed helper for fast initial setup

module.exports = router;
