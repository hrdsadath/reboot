const Game = require('../models/Game');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Group = require('../models/Group');
const { inMemoryData, isMongoConnected } = require('../utils/storage');

const defaultGames = [
  {
    gameNumber: 1,
    name: 'Game 1: Icebreaker Spotlight Pitch',
    category: 'creative',
    type: 'individual',
    options: ['On Stage', 'On App'],
    points: { personal: 20, team: 0 },
    visibleToUser: true
  },
  {
    gameNumber: 2,
    name: 'Game 2: Tech Hack-Sprint (Tech Lead)',
    category: 'tech',
    type: 'individual',
    options: [],
    points: { personal: 30, team: 0 },
    visibleToUser: true
  },
  {
    gameNumber: 3,
    name: 'Game 3: Brand & Identity (Creative Lead)',
    category: 'creative',
    type: 'group',
    options: [],
    points: { personal: 10, team: 50 },
    visibleToUser: false
  },
  {
    gameNumber: 4,
    name: 'Game 4: Viral Surge (Marketing Lead)',
    category: 'marketing',
    type: 'group',
    options: [],
    points: { personal: 10, team: 50 },
    visibleToUser: false
  },
  {
    gameNumber: 5,
    name: 'Game 5: Crisis & Execution Ops (Operating Lead)',
    category: 'operating',
    type: 'group',
    options: [],
    points: { personal: 10, team: 50 },
    visibleToUser: false
  },
  {
    gameNumber: 6,
    name: 'Game 6: Patents & Deep Research (IPR & Research Lead)',
    category: 'iprdResearch',
    type: 'individual',
    options: [],
    points: { personal: 50, team: 0 },
    visibleToUser: false
  }
];

exports.getGames = async (req, res) => {
  try {
    if (isMongoConnected()) {
      let games = await Game.find();
      if (games.length === 0) {
        games = await Game.insertMany(defaultGames);
      }
      return res.json({ success: true, games });
    } else {
      return res.json({ success: true, games: inMemoryData.games });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGameVisibility = async (req, res) => {
  try {
    const { gameId, gameNumber, visibleToUser, isVisible } = req.body;
    const visibility = visibleToUser !== undefined ? visibleToUser : isVisible;

    if (isMongoConnected()) {
      let game;
      if (gameId) game = await Game.findByIdAndUpdate(gameId, { visibleToUser: visibility }, { new: true });
      else if (gameNumber) game = await Game.findOneAndUpdate({ gameNumber }, { visibleToUser: visibility }, { new: true });
      return res.json({ success: true, message: 'Updated game visibility status!', game });
    } else {
      const gNum = Number(gameNumber) || 1;
      const game = inMemoryData.games.find(g => g.gameNumber === gNum);
      if (game) game.visibleToUser = visibility;
      return res.json({ success: true, message: 'Updated game visibility status in memory!', game });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameNumber, gameId, chosenOption, choice, submissionText, answer } = req.body;

    const gNum = Number(gameNumber) || 1;
    const targetOption = chosenOption || choice || (gNum === 1 ? 'On Stage' : null);
    const targetText = submissionText || answer || '';

    const isStage = gNum === 1 && (
      !targetOption ||
      targetOption === 'On Stage' ||
      targetOption === 'stage' ||
      targetOption.toLowerCase().includes('stage')
    );

    if (isMongoConnected()) {
      let game = gameId ? await Game.findById(gameId) : await Game.findOne({ gameNumber: gNum });
      const user = await User.findById(userId);

      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      let pPoints = 0;
      let tPoints = (game && game.points) ? game.points.team : 0;
      let subStatus = 'approved';

      if (gNum === 1) {
        if (isStage) {
          pPoints = 0; // Pending Admin Approval for +20 PTS
          subStatus = 'pending';
        } else {
          pPoints = 5; // Automatic +5 PTS for On App
          subStatus = 'approved';
        }
      } else {
        pPoints = (game && game.points) ? game.points.personal : 10;
        subStatus = 'approved';
      }

      let existingSub = await Submission.findOne({ userId: user._id, gameNumber: gNum });
      let submission;

      if (existingSub) {
        existingSub.choice = isStage ? 'On Stage' : 'On App';
        existingSub.answer = targetText;
        existingSub.personalPoints = pPoints;
        existingSub.teamPoints = tPoints;
        existingSub.status = subStatus;
        submission = await existingSub.save();
      } else {
        submission = await Submission.create({
          userId: user._id,
          groupId: user.groupId || user._id,
          gameId: game ? game._id : user._id,
          gameNumber: gNum,
          choice: isStage ? 'On Stage' : 'On App',
          answer: targetText,
          personalPoints: pPoints,
          teamPoints: tPoints,
          status: subStatus
        });
      }

      if (subStatus === 'approved' && pPoints > 0) {
        user.personalPoints += pPoints;
      }
      if (!user.completedGames) user.completedGames = [];
      user.completedGames.push({ gameId: game ? game._id : user._id, score: pPoints, completedAt: new Date() });
      await user.save();

      const responseMessage = isStage
        ? 'Stage pitch claim submitted! Waiting for Admin verification on stage to approve +20 PTS.'
        : `Task submitted successfully! Earned +${pPoints} personal points.`;

      return res.status(201).json({
        success: true,
        message: responseMessage,
        submission,
        status: subStatus,
        updatedPoints: user.personalPoints
      });
    } else {
      // Memory Fallback
      const user = inMemoryData.users.find(u => u._id === userId);
      const pPoints = gNum === 1 ? (isStage ? 0 : 5) : 10;
      const subStatus = (gNum === 1 && isStage) ? 'pending' : 'approved';

      if (user && subStatus === 'approved') {
        user.individualPoints = (user.individualPoints || user.personalPoints || 0) + pPoints;
        user.personalPoints = user.individualPoints;
      }

      const memSubmission = {
        _id: `sub_${Date.now()}`,
        userId: user ? { _id: user._id, name: user.name, department: user.department } : null,
        gameNumber: gNum,
        choice: isStage ? 'On Stage' : 'On App',
        answer: targetText,
        personalPoints: pPoints,
        teamPoints: 0,
        status: subStatus,
        createdAt: new Date()
      };

      if (!inMemoryData.submissions) inMemoryData.submissions = [];
      inMemoryData.submissions.push(memSubmission);

      return res.status(201).json({
        success: true,
        message: isStage ? 'Stage pitch claim submitted for Admin verification (+20 PTS pending).' : `Task submitted successfully! Earned +${pPoints} personal points.`,
        submission: memSubmission,
        status: subStatus,
        updatedPoints: user ? user.personalPoints : pPoints
      });
    }
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Stage Claim Approval / Rejection
exports.approveStageClaim = async (req, res) => {
  try {
    const { submissionId, status } = req.body; // 'approved' or 'rejected'

    if (!submissionId || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid submissionId or status' });
    }

    if (isMongoConnected()) {
      const submission = await Submission.findById(submissionId);
      if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

      submission.status = status;
      if (status === 'approved') {
        submission.personalPoints = 20;
        await submission.save();

        const user = await User.findById(submission.userId);
        if (user) {
          user.personalPoints += 20;
          await user.save();
        }
        return res.json({ success: true, message: `Stage claim APPROVED! +20 Points granted to candidate.` });
      } else {
        submission.personalPoints = 0;
        await submission.save();
        return res.json({ success: true, message: `Stage claim REJECTED. 0 Points granted.` });
      }
    } else {
      if (!inMemoryData.submissions) inMemoryData.submissions = [];
      const sub = inMemoryData.submissions.find(s => s._id === submissionId);
      if (sub) {
        sub.status = status;
        if (status === 'approved') {
          sub.personalPoints = 20;
          const user = inMemoryData.users.find(u => u._id === sub.userId || (sub.userId && u._id === sub.userId._id));
          if (user) user.personalPoints = (user.personalPoints || 0) + 20;
        } else {
          sub.personalPoints = 0;
        }
      }
      return res.json({ success: true, message: `Stage claim ${status.toUpperCase()} updated!` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.evaluateSubmission = async (req, res) => {
  try {
    const { submissionId, personalPoints, teamPoints } = req.body;
    const pPts = Number(personalPoints) || 0;
    const tPts = Number(teamPoints) || 0;

    if (isMongoConnected()) {
      const submission = await Submission.findById(submissionId).populate('userId').populate('groupId');
      if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

      submission.personalPoints = pPts;
      submission.teamPoints = tPts;
      submission.status = 'approved';
      await submission.save();

      if (submission.userId) {
        const user = await User.findById(submission.userId._id || submission.userId);
        if (user) {
          user.personalPoints += pPts;
          await user.save();
        }
      }

      if (submission.groupId) {
        const group = await Group.findById(submission.groupId._id || submission.groupId);
        if (group) {
          group.teamPoints += tPts;
          await group.save();
        }
      }

      return res.json({
        success: true,
        message: `Volunteer Judge approved +${pPts} personal pts & +${tPts} team pts!`
      });
    } else {
      return res.json({
        success: true,
        message: `Volunteer Judge approved +${pPts} personal pts & +${tPts} team pts in memory!`
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    if (isMongoConnected()) {
      const submissions = await Submission.find({ userId }).populate('gameId');
      return res.json({ success: true, submissions });
    } else {
      if (!inMemoryData.submissions) inMemoryData.submissions = [];
      const submissions = inMemoryData.submissions.filter(s => s.userId === userId || (s.userId && s.userId._id === userId));
      return res.json({ success: true, submissions });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const submissions = await Submission.find()
        .populate('userId', 'name email phone admissionNo department personalPoints')
        .populate('groupId', 'name teamPoints')
        .populate('gameId', 'name category type');
      return res.json({ success: true, submissions });
    } else {
      if (!inMemoryData.submissions) inMemoryData.submissions = [];
      return res.json({ success: true, submissions: inMemoryData.submissions });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
