const mongoose = require("mongoose");

const defaultGames = [
  {
    gameNumber: 1,
    name: 'Game 1: Icebreaker Spotlight Pitch',
    category: 'creative',
    type: 'individual',
    options: ['On Stage', 'On App'],
    points: { personal: 20, team: 0 },
    description: 'Introduce yourself to the IEDC community! Pitch live on stage for +20 PTS (requires Admin stage verification) or submit on app for +5 PTS automatically.',
    visibleToUser: true
  },
  {
    gameNumber: 2,
    name: 'Game 2: College Campus Innovation Hub Pitch',
    category: 'tech',
    type: 'individual',
    options: [],
    points: { personal: 30, team: 0 },
    description: 'Describe your college campus and share 2 innovative ideas to improve student developer culture and campus startup ecosystem! (Dummy testing challenge).',
    visibleToUser: true
  },
  {
    gameNumber: 3,
    name: 'Game 3: Brand & Identity (Creative Lead)',
    category: 'creative',
    type: 'group',
    options: [],
    points: { personal: 10, team: 50 },
    description: 'Collaborate with your newly revealed team! Design a startup logo concept, taglines, and visual identity poster.',
    visibleToUser: false
  },
  {
    gameNumber: 4,
    name: 'Game 4: Viral Surge (Marketing Lead)',
    category: 'marketing',
    type: 'group',
    options: [],
    points: { personal: 10, team: 50 },
    description: 'Develop a growth-hacking campaign & 60-second viral marketing pitch strategy for an IEDC flagship startup.',
    visibleToUser: false
  },
  {
    gameNumber: 5,
    name: 'Game 5: Crisis & Execution Ops (Operating Lead)',
    category: 'operating',
    type: 'group',
    options: [],
    points: { personal: 10, team: 50 },
    description: 'Operational simulation: Allocate event budgets under strict financial limits & manage 2 live event bottlenecks.',
    visibleToUser: false
  },
  {
    gameNumber: 6,
    name: 'Game 6: Patents & Deep Research (IPR & Research Lead)',
    category: 'iprdResearch',
    type: 'individual',
    options: [],
    points: { personal: 50, team: 0 },
    description: 'Conduct a novelty check on a deep-tech innovation, formulate patentable claims & defend your abstract to the IEDC jury.',
    visibleToUser: false
  }
];

const connectDB = async () => {
  try {
    // 1. Try Primary MONGODB_URI from .env
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log("MongoDB connected successfully to Atlas!");
    
    // Auto-run direct MongoDB Atlas migrations
    const Group = require('../models/Group');
    const Game = require('../models/Game');
    const User = require('../models/User');
    
    try {
      await Group.updateMany({}, { $set: { unlockedGames: [1], pendingUnlockRequests: [] } });
      
      // Wipe old game documents missing gameNumber and insert fresh 6 games with gameNumber: 1..6
      await Game.deleteMany({});
      await Game.insertMany(defaultGames);
      console.log("🎮 [Database Migration] RE-SEEDED ALL 6 GAMES WITH gameNumber: 1 THROUGH 6 IN ATLAS!");

      // Guarantee Executive Admin User Exists with role: 'admin'
      let defaultAdmin = await User.findOne({ role: 'admin' });
      if (!defaultAdmin) {
        await User.create({
          name: 'IEDC Executive Admin',
          email: 'admin@iedc.org',
          phone: '9999999999',
          admissionNo: 'ADMIN2026',
          department: 'IEDC Executive Cell',
          role: 'admin',
          personalPoints: 100
        });
        console.log("👑 [Database Migration] Created default Admin user: admin@iedc.org / 9999999999");
      } else {
        if (!defaultAdmin.phone) {
          defaultAdmin.phone = '9999999999';
          await defaultAdmin.save();
        }
      }

      console.log("🔒 [Database Migration] DIRECT ATOMIC UPDATE: Synchronized Admin credentials & group game locks in Atlas!");
    } catch (migErr) {
      console.warn("Migration warning:", migErr.message);
    }

  } catch (error) {
    console.warn("MongoDB Atlas connection warning:", error.message);
    console.log("Attempting fallback to local MongoDB...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/iedc_selection", {
        serverSelectionTimeoutMS: 2000
      });
      console.log("Connected to local MongoDB (fallback)");
    } catch (localErr) {
      console.log("💡 Tip: In MongoDB Atlas -> Network Access -> Click Add IP Address -> Type 0.0.0.0/0 into the input box -> Click Confirm.");
    }
  }
};

module.exports = connectDB;
