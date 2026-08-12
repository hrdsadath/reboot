const express = require('express');
const router = express.Router();
const { getGames, submitTask, updateGameVisibility, getUserSubmissions, evaluateSubmission, getAllSubmissions, approveStageClaim } = require('../controllers/gameController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getGames);
router.post('/submit', protect, submitTask);
router.get('/my-submissions', protect, getUserSubmissions);
router.get('/all-submissions', protect, authorize('leader', 'admin'), getAllSubmissions);
router.post('/evaluate', protect, authorize('leader', 'admin'), evaluateSubmission);
router.post('/approve-stage-claim', protect, authorize('admin'), approveStageClaim);
router.post('/update-visibility', protect, authorize('admin'), updateGameVisibility);
router.post('/update-status', protect, authorize('admin'), updateGameVisibility);

module.exports = router;
