/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const mongoose = require("mongoose");

const hospitalSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false, // Set false since we only clean up after server restart; unique check will be handle in middleware
  },
  waitingTime: {
    type: String,
    default: "",
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  district: {
    type: String,
    default: "",
  },
  map: {
    type: String,
    default: "",
  },
  comments: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    default: [],
  },
  lastUpdateTime: {
    type: String,
    default: undefined,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  past10HoursWaitingTime: {
    type: [
      {
        updateTime: String,
        waitTime: String,
      },
    ],
    default: [],
  },
  past7DaysWaitingTime: {
    type: [
      {
        updateTime: String,
        waitTime: String,
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Hospital", hospitalSchema, "hospitals");
