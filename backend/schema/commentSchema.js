/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = mongoose.model("Comment", commentSchema, "comments");
