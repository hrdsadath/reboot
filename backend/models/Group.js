const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leader",
      default: null,
    },

    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    teamPoints: {
      type: Number,
      default: 0,
    },

    visibleAfterGame: {
      type: Number,
      default: 2,
    },

    unlockedGames: {
      type: [Number],
      default: [1],
    },

    pendingUnlockRequests: [
      {
        gameNumber: { type: Number },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", groupSchema);