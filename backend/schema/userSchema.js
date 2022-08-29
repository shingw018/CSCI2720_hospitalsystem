/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: false, // Set false since we only clean up after server restart; unique check will be handle in middleware
    minLength: 4,
    maxLength: 20,
  },
  password: {
    type: String,
    required: true,
  },
  sessionTokens: {
    type: [String],
    default: [],
  },
  favHospitals: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
      },
    ],
    default: [],
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema, "users");
