const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "iprdResearch",
        "operating",
        "marketing",
        "tech",
        "creative",
      ],
      required: true,
    },

    type: {
      type: String,
      enum: ["individual", "group"],
      required: true,
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