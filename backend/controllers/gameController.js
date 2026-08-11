const Game = require('../models/Game');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Group = require('../models/Group');
const { inMemoryData, isMongoConnected } = require('../utils/storage');

const defaultGames = [
  {
    gameNumber: 1,
    name: 'Game 1: Introduce Yourself (Stage vs Screen)',
    category: 'creative',
    type: 'individual',
    options: ['On Stage Pitch', 'On App Submission'],
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

exports.submitTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameNumber, gameId, chosenOption, choice, submissionText, answer } = req.body;

    const targetOption = chosenOption || choice;
    const targetText = submissionText || answer;
    const gNum = Number(gameNumber) || 1;

    if (isMongoConnected()) {
      let game = gameId ? await Game.findById(gameId) : await Game.findOne({ gameNumber: gNum });
      const user = await User.findById(userId);

      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      let pPoints = (game && game.points) ? game.points.personal : (gNum === 1 ? (targetOption === 'stage' || targetOption === 'On Stage Pitch' ? 20 : 5) : 10);
      let tPoints = (game && game.points) ? game.points.team : 0;

      if (gNum === 1) {
        if (targetOption === 'stage' || targetOption === 'On Stage Pitch') pPoints = 20;
        else pPoints = 5;
      }

      const submission = await Submission.create({
        userId: user._id,
        groupId: user.groupId,
        gameId: game ? game._id : user._id,
        choice: targetOption || null,
        answer: targetText || '',
        personalPoints: pPoints,
        teamPoints: tPoints
      });

      user.personalPoints += pPoints;
      if (!user.completedGames) user.completedGames = [];
      user.completedGames.push({ gameId: game ? game._id : user._id, score: pPoints, completedAt: new Date() });
      await user.save();

      return res.status(201).json({
        success: true,
        message: `Task submitted successfully! Earned +${pPoints} personal points.`,
        submission,
        updatedPoints: user.personalPoints
      });
    } else {
      // Memory Fallback
      const user = inMemoryData.users.find(u => u._id === userId);
      let pPoints = gNum === 1 ? (targetOption === 'stage' || targetOption === 'On Stage Pitch' ? 20 : 5) : 10;

      if (user) {
        user.individualPoints = (user.individualPoints || user.personalPoints || 0) + pPoints;
        user.personalPoints = user.individualPoints;
      }

      if (gNum === 2) {
        inMemoryData.groups.forEach(g => g.isRevealed = true);
      }

      return res.status(201).json({
        success: true,
        message: `Task submitted successfully! Earned +${pPoints} personal points.`,
        updatedPoints: user ? user.personalPoints : pPoints
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Volunteer Leader / Judge Point Approval Controller
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

exports.updateGameVisibility = async (req, res) => {
  try {
    const { gameId, gameNumber, visibleToUser, status } = req.body;
    if (isMongoConnected()) {
      if (gameId) await Game.findByIdAndUpdate(gameId, { visibleToUser });
      else if (gameNumber) await Game.findOneAndUpdate({ gameNumber }, { status });
    }
    return res.json({ success: true, message: 'Game updated successfully!' });
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
      const submissions = inMemoryData.submissions.filter(s => s.userId === userId);
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
      return res.json({ success: true, submissions: inMemoryData.submissions });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
