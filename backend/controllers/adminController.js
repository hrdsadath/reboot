const User = require('../models/User');
const Group = require('../models/Group');
const Game = require('../models/Game');
const Submission = require('../models/Submission');
const Leader = require('../models/leader');
const { inMemoryData, isMongoConnected } = require('../utils/storage');

exports.getDashboardStats = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const totalCandidates = await User.countDocuments({ role: 'user' });
      const totalLeaders = await Leader.countDocuments();
      const groups = await Group.find()
        .populate('memberIds', 'name email phone admissionNo department personalPoints role')
        .populate('leaderId', 'name email phone');
      const submissions = await Submission.find().populate('userId', 'name email').populate('gameId', 'name');

      const topCandidates = await User.find({ role: { $ne: 'admin' } })
        .sort({ personalPoints: -1 })
        .limit(10);

      return res.json({
        success: true,
        stats: {
          totalCandidates,
          totalLeaders,
          totalGroups: groups.length,
          topCandidates,
          groups,
          recentSubmissions: submissions.slice(-10)
        }
      });
    } else {
      // Memory Fallback
      const topCandidates = [...inMemoryData.users]
        .filter(u => u.role !== 'admin')
        .map(u => ({
          ...u,
          name: u.fullName || u.name,
          personalPoints: u.individualPoints || u.personalPoints || 0
        }))
        .sort((a, b) => b.personalPoints - a.personalPoints);

      return res.json({
        success: true,
        stats: {
          totalCandidates: inMemoryData.users.filter(u => u.role === 'user').length,
          totalLeaders: inMemoryData.users.filter(u => u.role === 'leader').length,
          totalGroups: inMemoryData.groups.length,
          topCandidates,
          groups: inMemoryData.groups,
          recentSubmissions: inMemoryData.submissions
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignCandidateTrack = async (req, res) => {
  try {
    const { userId, finalAssignedTrack } = req.body;
    if (isMongoConnected()) {
      const user = await User.findByIdAndUpdate(userId, { finalAssignedTrack }, { new: true });
      return res.json({ success: true, message: `Assigned ${user ? user.name : 'Candidate'} to ${finalAssignedTrack}!`, user });
    } else {
      const user = inMemoryData.users.find(u => u._id === userId);
      if (user) user.finalAssignedTrack = finalAssignedTrack;
      return res.json({ success: true, message: `Assigned ${user ? user.fullName || user.name : 'Candidate'} to ${finalAssignedTrack}!`, user });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetSubmissions = async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Submission.deleteMany({});
      await User.updateMany({}, { personalPoints: 0, completedGames: [] });
      await Group.updateMany({}, { teamPoints: 0 });
    }
    inMemoryData.submissions = [];
    inMemoryData.users.forEach(u => {
      u.personalPoints = 0;
      u.individualPoints = 0;
      u.completedGames = [];
    });
    inMemoryData.groups.forEach(g => {
      g.teamPoints = 0;
      g.totalTeamPoints = 0;
    });

    return res.json({
      success: true,
      message: 'Reset all submissions, points, and activity logs across MongoDB & memory!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedSampleData = async (req, res) => {
  try {
    const mockStudents = [
      { name: 'Rohan Sharma', email: 'rohan@gmail.com', phone: '9811111111', admissionNo: 'ADM001', department: 'Computer Science', points: 45 },
      { name: 'Ananya Roy', email: 'ananya@gmail.com', phone: '9822222222', admissionNo: 'ADM002', department: 'Electronics', points: 50 },
      { name: 'Vikram Patel', email: 'vikram@gmail.com', phone: '9833333333', admissionNo: 'ADM003', department: 'Mechanical', points: 35 },
      { name: 'Sneha Iyer', email: 'sneha@gmail.com', phone: '9844444444', admissionNo: 'ADM004', department: 'Information Tech', points: 60 },
      { name: 'Dev Menon', email: 'dev@gmail.com', phone: '9855555555', admissionNo: 'ADM005', department: 'Electrical', points: 40 },
      { name: 'Pooja Nair', email: 'pooja@gmail.com', phone: '9866666666', admissionNo: 'ADM006', department: 'Civil', points: 55 },
      { name: 'Karan Gupta', email: 'karan@gmail.com', phone: '9877777777', admissionNo: 'ADM007', department: 'Computer Science', points: 30 },
      { name: 'Diya Kapoor', email: 'diya@gmail.com', phone: '9888888888', admissionNo: 'ADM008', department: 'Robotics', points: 65 },
      { name: 'Rahul Verma', email: 'rahul@gmail.com', phone: '9899999999', admissionNo: 'ADM009', department: 'AI & Data Science', points: 50 }
    ];

    if (isMongoConnected()) {
      for (let i = 0; i < mockStudents.length; i++) {
        const student = mockStudents[i];
        const groupNum = (i % 8) + 1;
        const groupName = `Group ${groupNum}`;
        
        let group = await Group.findOne({ name: groupName });
        if (!group) {
          group = await Group.create({
            name: groupName,
            visibleAfterGame: 2,
            teamPoints: 0,
            memberIds: []
          });
        }

        let created = await User.findOne({ email: student.email });
        if (!created) {
          created = await User.create({
            name: student.name,
            email: student.email,
            phone: student.phone,
            admissionNo: student.admissionNo,
            department: student.department,
            personalPoints: student.points,
            groupId: group._id,
            role: 'user',
            status: 'approved'
          });
          group.memberIds.push(created._id);
          await group.save();
        }
      }
      return res.json({ success: true, message: 'Seeded 9 sample candidates across 8 round-robin groups in MongoDB Atlas!' });
    } else {
      mockStudents.forEach((student, i) => {
        const groupNumber = (i % 8) + 1;
        const targetGroup = inMemoryData.groups.find(g => g.groupNumber === groupNumber);
        const userId = `seed_user_${i + 1}`;

        if (!inMemoryData.users.find(u => u.email === student.email)) {
          const newUser = {
            _id: userId,
            fullName: student.name,
            name: student.name,
            email: student.email,
            phone: student.phone,
            admissionNo: student.admissionNo,
            department: student.department,
            role: 'user',
            groupId: targetGroup._id,
            groupNumber,
            individualPoints: student.points,
            personalPoints: student.points,
            preferredLeadTrack: 'Tech',
            createdAt: new Date()
          };
          inMemoryData.users.push(newUser);
          targetGroup.members.push(userId);
        }
      });
      return res.json({ success: true, message: 'Seeded sample candidates in memory successfully!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
