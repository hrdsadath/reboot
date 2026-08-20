const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboardStats, assignCandidateTrack, seedSampleData, resetSubmissions } = require('../controllers/adminController');

// All Admin endpoints are strictly protected by JWT & Admin Role Check
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.post('/assign-track', protect, authorize('admin'), assignCandidateTrack);
router.post('/seed', protect, authorize('admin'), seedSampleData);
router.post('/reset-submissions', protect, authorize('admin'), resetSubmissions);

module.exports = router;
