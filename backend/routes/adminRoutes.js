const express = require('express');
const router = express.Router();
const { getDashboardStats, assignCandidateTrack, seedSampleData, resetSubmissions } = require('../controllers/adminController');

router.get('/dashboard', getDashboardStats);
router.post('/assign-track', assignCandidateTrack);
router.post('/seed', seedSampleData);
router.post('/reset-submissions', resetSubmissions);

module.exports = router;
