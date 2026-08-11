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
        return res.json({ success: true, group: null, isRevealed: false });
      }

      const group = await Group.findById(user.groupId)
        .populate('memberIds', 'name email phone admissionNo department personalPoints role')
        .populate('leaderId', 'name email phone department');

      if (!group) return res.json({ success: true, group: null, isRevealed: false });

      const completedCount = user.completedGames ? user.completedGames.length : 0;
      const isRevealed = completedCount >= (group.visibleAfterGame || 2) || userRole === 'admin' || userRole === 'leader';

      if (!isRevealed && userRole === 'user') {
        return res.json({
          success: true,
          isRevealed: false,
          groupName: group.name,
          message: '🔒 Group assignment is locked until after Game 2!'
        });
      }

      return res.json({
        success: true,
        isRevealed: true,
        group: {
          _id: group._id,
          name: group.name,
          teamPoints: group.teamPoints,
          leader: group.leaderId,
          members: group.memberIds
        }
      });
    } else {
      // Memory Fallback
      const user = inMemoryData.users.find(u => u._id === userId);
      if (!user || !user.groupId) {
        return res.json({ success: true, group: null, isRevealed: false });
      }

      const group = inMemoryData.groups.find(g => g._id === user.groupId);
      if (!group) return res.json({ success: true, group: null, isRevealed: false });

      const memberObjs = inMemoryData.users
        .filter(u => group.members.includes(u._id))
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
          message: '🔒 Group assignment is locked until after Game 2!'
        });
      }

      return res.json({
        success: true,
        isRevealed: true,
        group: {
          _id: group._id,
          name: group.groupName || group.name,
          teamPoints: group.totalTeamPoints || group.teamPoints || 0,
          leader: { name: group.leaderName || 'Alex Vance' },
          members: memberObjs
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
        .populate('memberIds', 'name email phone department personalPoints role')
        .populate('leaderId', 'name email phone');
      return res.json({ success: true, groups });
    } else {
      const groups = inMemoryData.groups.map(g => ({
        _id: g._id,
        name: g.groupName || g.name,
        teamPoints: g.totalTeamPoints || 0,
        leader: { name: g.leaderName || 'Alex Vance' },
        members: inMemoryData.users.filter(u => g.members.includes(u._id))
      }));
      return res.json({ success: true, groups });
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
