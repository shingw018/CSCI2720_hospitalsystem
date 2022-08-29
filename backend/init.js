/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const User = require("./schema/userSchema");
const Hospital = require("./schema/hospitalSchema");
const Comment = require("./schema/commentSchema");
const bcrypt = require("bcryptjs");

function initCollections() {
  User.createCollection().catch((err) => {});
  Hospital.createCollection().catch((err) => {});
  Comment.createCollection().catch((err) => {});
}

async function cleanup() {
  const removedUsers = await User.find({ isDeleted: true });
  const removedHospitals = await Hospital.find({ isDeleted: true });
  const removedComments = await Comment.find({ isDeleted: true });

  removedUsers.forEach(async (user) => {
    await User.findOneAndDelete({ _id: user._id }, { useFindAndModify: false });
  });

  removedHospitals.forEach(async (hospital) => {
    await Hospital.findOneAndDelete({ _id: hospital._id }, { useFindAndModify: false });
  });

  removedComments.forEach(async (comment) => {
    await Comment.findOneAndDelete({ _id: comment._id }, { useFindAndModify: false });
  });
}

async function createAdmin() {
  const adminExist = await User.findOne({ username: "admin", isDeleted: false });
  if (!adminExist) {
    console.log("Admin not found, Creating Admin.");

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin", salt);
    const admin = new User({
      username: "admin",
      password: hashedPassword,
    });

    await admin.save();
  } else {
    console.log("Admin exist");
  }
}

module.exports = {
  initCollections,
  cleanup,
  createAdmin,
};
