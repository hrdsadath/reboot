const mongoose = require('mongoose');

// In-Memory Fallback State (when live MongoDB Atlas is not yet populated or offline)
const inMemoryData = {
  users: [
    {
      _id: 'admin_1',
      fullName: 'IEDC Executive Admin',
      email: 'admin@iedc.org',
      phone: '9999999999',
      role: 'admin',
      groupId: null,
      groupNumber: null,
      individualPoints: 100,
      preferredLeadTrack: 'General',
      finalAssignedTrack: 'Unassigned'
    },
    {
      _id: 'leader_1',
      fullName: 'Alex Vance (Group 1 Leader)',
      email: 'leader1@iedc.org',
      phone: '9876543210',
      role: 'leader',
      groupId: 'group_1',
      groupNumber: 1,
      individualPoints: 45,
      preferredLeadTrack: 'Tech',
      finalAssignedTrack: 'Tech'
    }
  ],
  groups: Array.from({ length: 8 }, (_, i) => ({
    _id: `group_${i + 1}`,
    groupNumber: i + 1,
    name: `Group ${i + 1}`,
    groupName: `Group ${i + 1} - ${['Alpha', 'Blaze', 'Catalyst', 'Dynamo', 'Echo', 'Flux', 'Genesis', 'Hyperion'][i]}`,
    leaderId: i === 0 ? 'leader_1' : null,
    leaderName: i === 0 ? 'Alex Vance' : 'To be assigned',
    totalTeamPoints: 0,
    members: i === 0 ? ['leader_1'] : [],
    isRevealed: false,
    unlockedGames: [1],
    pendingUnlockRequests: []
  })),
  games: [
    {
      _id: 'game_1',
      gameNumber: 1,
      title: 'Game 1: Icebreaker Spotlight Pitch',
      targetLeadTrack: 'General',
      description: 'Introduce yourself to the IEDC community! Pitch live on stage for +20 PTS (requires Admin stage verification) or submit on app for +5 PTS automatically.',
      gameType: 'individual',
      maxPoints: 20,
      status: 'active',
      options: [
        { label: 'On Stage Pitch', points: 20, description: 'Live presentation on stage (+20 pts for high courage & public speaking)' },
        { label: 'On App Submission', points: 5, description: 'Submit written / recorded intro in app (+5 pts)' }
      ],
      revealsGroupAfter: false
    },
    {
      _id: 'game_2',
      gameNumber: 2,
      title: 'Game 2: College Campus Innovation Hub Pitch',
      targetLeadTrack: 'Tech',
      description: 'Describe your college campus and share 2 innovative ideas to improve student developer culture and campus startup ecosystem! (Dummy testing challenge).',
      gameType: 'individual',
      maxPoints: 30,
      status: 'locked',
      options: [],
      revealsGroupAfter: true
    },
    {
      _id: 'game_3',
      gameNumber: 3,
      title: 'Game 3: Brand & Identity (Creative Lead)',
      targetLeadTrack: 'Creative',
      description: 'Collaborate with your newly revealed team! Design a startup logo concept, taglines, and visual identity poster.',
      gameType: 'team',
      maxPoints: 50,
      status: 'locked',
      options: [],
      revealsGroupAfter: false
    },
    {
      _id: 'game_4',
      gameNumber: 4,
      title: 'Game 4: Viral Surge (Marketing Lead)',
      targetLeadTrack: 'Marketing',
      description: 'Develop a growth-hacking campaign & 60-second viral marketing pitch strategy for an IEDC flagship startup.',
      gameType: 'team',
      maxPoints: 50,
      status: 'locked',
      options: [],
      revealsGroupAfter: false
    },
    {
      _id: 'game_5',
      gameNumber: 5,
      title: 'Game 5: Crisis & Execution Ops (Operating Lead)',
      targetLeadTrack: 'Operating',
      description: 'Operational simulation: Allocate event budgets under strict financial limits & manage 2 live event bottlenecks.',
      gameType: 'team',
      maxPoints: 50,
      status: 'locked',
      options: [],
      revealsGroupAfter: false
    },
    {
      _id: 'game_6',
      gameNumber: 6,
      title: 'Game 6: Patents & Deep Research (IPR & Research Lead)',
      targetLeadTrack: 'IPR & Research',
      description: 'Conduct a novelty check on a deep-tech innovation, formulate patentable claims & defend your abstract to the IEDC jury.',
      gameType: 'individual',
      maxPoints: 50,
      status: 'locked',
      options: [],
      revealsGroupAfter: false
    }
  ],
  submissions: []
};

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

module.exports = {
  inMemoryData,
  isMongoConnected
};
