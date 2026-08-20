const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    gameNumber: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    options: {
      type: [String],
      default: [],
    },

    points: {
      personal: {
        type: Number,
        default: 0,
      },

      team: {
        type: Number,
        default: 0,
      },
    },

    visibleToUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Game", gameSchema);