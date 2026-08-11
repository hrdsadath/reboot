const express = require('express');
const router = express.Router();
const { getMyGroup, getAllGroups, toggleGroupReveal, assignGroupLeader } = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my-group', protect, getMyGroup);
router.get('/all', protect, authorize('admin', 'leader'), getAllGroups);
router.post('/toggle-reveal', protect, authorize('admin'), toggleGroupReveal);
router.post('/assign-leader', protect, authorize('admin'), assignGroupLeader);

module.exports = router;
