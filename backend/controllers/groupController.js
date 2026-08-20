const Group = require('../models/Group');
const User = require('../models/User');
const Leader = require('../models/leader');
const { inMemoryData, isMongoConnected } = require('../utils/storage');

exports.getMyGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (!user || !user.groupId) {
        return res.json({ success: true, group: null, isRevealed: false, unlockedGames: [1] });
      }

      const group = await Group.findById(user.groupId)
        .populate('memberIds', 'name email phone admissionNo department personalPoints role')
        .populate('leaderId', 'name email phone department');

      if (!group) return res.json({ success: true, group: null, isRevealed: false, unlockedGames: [1] });

      const completedCount = user.completedGames ? user.completedGames.length : 0;
      const isRevealed = completedCount >= (group.visibleAfterGame || 2) || userRole === 'admin' || userRole === 'leader';
      const unlockedGames = group.unlockedGames && group.unlockedGames.length > 0 ? group.unlockedGames : [1];

      if (!isRevealed && userRole === 'user') {
        return res.json({
          success: true,
          isRevealed: false,
          groupName: group.name,
          groupId: group._id,
          unlockedGames,
          pendingUnlockRequests: group.pendingUnlockRequests || [],
          message: '🔒 Group assignment details are locked until after Game 2!'
        });
      }

      return res.json({
        success: true,
        isRevealed: true,
        unlockedGames,
        pendingUnlockRequests: group.pendingUnlockRequests || [],
        group: {
          _id: group._id,
          name: group.name,
          teamPoints: group.teamPoints,
          leader: group.leaderId,
          members: group.memberIds,
          unlockedGames,
          pendingUnlockRequests: group.pendingUnlockRequests || []
        }
      });
    } else {
      // Memory Fallback
      const user = inMemoryData.users.find(u => u._id === userId);
      if (!user || !user.groupId) {
        return res.json({ success: true, group: null, isRevealed: false, unlockedGames: [1] });
      }

      const group = inMemoryData.groups.find(g => g._id === user.groupId);
      if (!group) return res.json({ success: true, group: null, isRevealed: false, unlockedGames: [1] });

      const unlockedGames = group.unlockedGames || [1];

      const memberObjs = inMemoryData.users
        .filter(u => group.members && group.members.includes(u._id))
        .map(u => ({
          _id: u._id,
          name: u.fullName || u.name,
          email: u.email,
          phone: u.phone,
          personalPoints: u.individualPoints || u.personalPoints || 0,
          role: u.role
        }));

      if (!group.isRevealed && userRole === 'user') {
        return res.json({
          success: true,
          isRevealed: false,
          groupName: group.groupName || group.name,
          groupId: group._id,
          unlockedGames,
          pendingUnlockRequests: group.pendingUnlockRequests || [],
          message: '🔒 Group assignment details are locked until after Game 2!'
        });
      }

      return res.json({
        success: true,
        isRevealed: true,
        unlockedGames,
        pendingUnlockRequests: group.pendingUnlockRequests || [],
        group: {
          _id: group._id,
          name: group.groupName || group.name,
          teamPoints: group.totalTeamPoints || group.teamPoints || 0,
          leader: { name: group.leaderName || 'Alex Vance' },
          members: memberObjs,
          unlockedGames,
          pendingUnlockRequests: group.pendingUnlockRequests || []
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const groups = await Group.find()
        .populate('memberIds', 'name email phone department personalPoints role completedGames')
        .populate('leaderId', 'name email phone')
        .populate('pendingUnlockRequests.requestedBy', 'name email department');
      return res.json({ success: true, groups });
    } else {
      const groups = inMemoryData.groups.map(g => ({
        _id: g._id,
        name: g.groupName || g.name,
        teamPoints: g.totalTeamPoints || 0,
        leader: { name: g.leaderName || 'Alex Vance' },
        members: inMemoryData.users.filter(u => g.members && g.members.includes(u._id)),
        unlockedGames: g.unlockedGames || [1],
        pendingUnlockRequests: g.pendingUnlockRequests || []
      }));
      return res.json({ success: true, groups });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Candidate Requests Game Unlock for Their Group
exports.requestGameUnlock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameNumber } = req.body;
    const gNum = Number(gameNumber);

    if (!gNum || gNum < 2 || gNum > 6) {
      return res.status(400).json({ success: false, message: 'Invalid game number for unlock request.' });
    }

    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (!user || !user.groupId) {
        return res.status(400).json({ success: false, message: 'Candidate must be assigned to a group to request unlock.' });
      }

      const group = await Group.findById(user.groupId);
      if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

      if (!group.unlockedGames) group.unlockedGames = [1];
      if (group.unlockedGames.includes(gNum)) {
        return res.json({ success: true, message: `Game #${gNum} is already unlocked for your group!` });
      }

      if (!group.pendingUnlockRequests) group.pendingUnlockRequests = [];
      const alreadyPending = group.pendingUnlockRequests.some(r => r.gameNumber === gNum);
      if (alreadyPending) {
        return res.json({ success: true, message: `Unlock request for Game #${gNum} is already pending Admin approval for your group!` });
      }

      group.pendingUnlockRequests.push({
        gameNumber: gNum,
        requestedBy: user._id,
        requestedAt: new Date()
      });
      await group.save();

      return res.json({
        success: true,
        message: `Requested Admin to unlock Game #${gNum} for ${group.name}!`,
        pendingRequests: group.pendingUnlockRequests
      });
    } else {
      const user = inMemoryData.users.find(u => u._id === userId);
      if (!user || !user.groupId) {
        return res.status(400).json({ success: false, message: 'Candidate must be assigned to a group.' });
      }
      const group = inMemoryData.groups.find(g => g._id === user.groupId);
      if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

      if (!group.unlockedGames) group.unlockedGames = [1];
      if (group.unlockedGames.includes(gNum)) {
        return res.json({ success: true, message: `Game #${gNum} is already unlocked for your group!` });
      }

      if (!group.pendingUnlockRequests) group.pendingUnlockRequests = [];
      const alreadyPending = group.pendingUnlockRequests.some(r => r.gameNumber === gNum);
      if (!alreadyPending) {
        group.pendingUnlockRequests.push({
          gameNumber: gNum,
          requestedBy: user._id,
          requestedAt: new Date()
        });
      }

      return res.json({
        success: true,
        message: `Requested Admin to unlock Game #${gNum} for ${group.groupName || group.name}!`,
        pendingRequests: group.pendingUnlockRequests
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Unlocks Game for a Specific Group
exports.unlockGameForGroup = async (req, res) => {
  try {
    const { groupId, groupName, gameNumber } = req.body;
    const gNum = Number(gameNumber);

    if (!gNum || gNum < 1 || gNum > 6) {
      return res.status(400).json({ success: false, message: 'Invalid game number' });
    }

    if (isMongoConnected()) {
      let group;
      if (groupId) group = await Group.findById(groupId);
      else if (groupName) group = await Group.findOne({ name: groupName });

      if (!group) return res.status(404).json({ success: false, message: 'Target Group not found' });

      if (!group.unlockedGames) group.unlockedGames = [1];
      if (!group.unlockedGames.includes(gNum)) {
        group.unlockedGames.push(gNum);
      }

      if (group.pendingUnlockRequests) {
        group.pendingUnlockRequests = group.pendingUnlockRequests.filter(r => r.gameNumber !== gNum);
      }

      await group.save();

      return res.json({
        success: true,
        message: `Unlocked Game #${gNum} for all members of ${group.name}!`,
        unlockedGames: group.unlockedGames
      });
    } else {
      let group = inMemoryData.groups.find(g => g._id === groupId || g.groupName === groupName || g.name === groupName);
      if (!group) return res.status(404).json({ success: false, message: 'Target Group not found' });

      if (!group.unlockedGames) group.unlockedGames = [1];
      if (!group.unlockedGames.includes(gNum)) {
        group.unlockedGames.push(gNum);
      }

      if (group.pendingUnlockRequests) {
        group.pendingUnlockRequests = group.pendingUnlockRequests.filter(r => r.gameNumber !== gNum);
      }

      return res.json({
        success: true,
        message: `Unlocked Game #${gNum} for ${group.groupName || group.name}!`,
        unlockedGames: group.unlockedGames
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleGroupReveal = async (req, res) => {
  try {
    const { visibleAfterGame } = req.body;
    const targetGameNum = visibleAfterGame !== undefined ? visibleAfterGame : 0;

    if (isMongoConnected()) {
      await Group.updateMany({}, { visibleAfterGame: targetGameNum });
    } else {
      inMemoryData.groups.forEach(g => g.isRevealed = (targetGameNum === 0));
    }

    return res.json({
      success: true,
      message: `Group reveal rule updated!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignGroupLeader = async (req, res) => {
  try {
    const { groupId, name, email, phone, admissionNo, department } = req.body;

    if (isMongoConnected()) {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

      let leader = await Leader.findOne({ email });
      if (!leader) {
        leader = await Leader.create({
          name,
          email,
          phone,
          admissionNo,
          department,
          groupId: group._id,
          role: 'leader'
        });
      }

      group.leaderId = leader._id;
      await group.save();

      return res.json({
        success: true,
        message: `${leader.name} assigned as Leader for ${group.name}!`,
        leader
      });
    } else {
      return res.json({ success: true, message: 'Leader assigned in memory!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
