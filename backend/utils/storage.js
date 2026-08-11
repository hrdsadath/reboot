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
    groupName: `Group ${i + 1} - ${['Alpha', 'Blaze', 'Catalyst', 'Dynamo', 'Echo', 'Flux', 'Genesis', 'Hyperion'][i]}`,
    leaderId: i === 0 ? 'leader_1' : null,
    leaderName: i === 0 ? 'Alex Vance' : 'To be assigned',
    totalTeamPoints: 0,
    members: i === 0 ? ['leader_1'] : [],
    isRevealed: false // Default HIDDEN until Game 2 ends!
  })),
  games: [
    {
      _id: 'game_1',
      gameNumber: 1,
      title: 'Introduce Yourself (Stage vs Screen)',
      targetLeadTrack: 'General',
      description: 'Break the ice! Pitch yourself to the IEDC panel. Choose whether to present live on stage or submit your pitch via the app.',
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
      title: 'Tech Hack-Sprint (Tech Lead Track)',
      targetLeadTrack: 'Tech',
      description: 'Solve a real campus innovation problem statement! Draft a quick system concept, flowchart, or tech logic solution.',
      gameType: 'individual',
      maxPoints: 30,
      status: 'active',
      options: [],
      revealsGroupAfter: true // GROUPS REVEALED AFTER THIS GAME!
    },
    {
      _id: 'game_3',
      gameNumber: 3,
      title: 'Brand & Identity (Creative Lead Track)',
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
      title: 'Viral Surge (Marketing Lead Track)',
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
      title: 'Crisis & Execution Ops (Operating Lead Track)',
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
      title: 'Patents & Deep Research (IPR & Research Lead Track)',
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
