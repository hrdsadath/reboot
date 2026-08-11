const mongoose = require("mongoose");

const leaderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    admissionNo: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    role: {
      type: String,
      default: "leader",
      enum: ["leader"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Leader", leaderSchema);