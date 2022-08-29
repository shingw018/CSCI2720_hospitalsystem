/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const express = require("express");
const { checkId, authAdmin, authSameUser, authToken } = require("../tools");
const router = express.Router();
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../schema/userSchema");
const Hospital = require("../schema/hospitalSchema");
const Comment = require("../schema/commentSchema");

// Check user logged in yet for all API; return user as req.user
router.use("*", authToken);

// Data check for registeration
const registerValidation = (data) => {
  const _validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  const schema = Joi.object({
    username: Joi.string().min(4).max(20).required(),
    password: Joi.string().min(4).max(20).required(),
  });

  return schema.validate(data, _validationOptions);
};

const updateValidation = (data) => {
  const _validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  const schema = Joi.object({
    username: Joi.string().min(4).max(20),
    password: Joi.string().min(4).max(20),
  });

  return schema.validate(data, _validationOptions);
};

// Add user (Body: username, password)
router.post("/", authAdmin, async (req, res) => {
  // Check if the username and password fit the defined format
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: "Body invalid", description: error.details[0].message });

  // Check if username is unique
  const usernameExist = await User.exists({ username: req.body.username, isDeleted: false });
  if (usernameExist)
    return res
      .status(400)
      .json({ message: "Body invalid", description: "This username is registered under another user" });

  // Encrypt the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create new User object
  let newUser = new User({
    username: req.body.username,
    password: hashedPassword,
  });

  const savedUser = await newUser.save();
  return res.status(201).json({
    message: "success",
    user: savedUser,
  });

  // session is used for all operation that required mutex lock
  // const session = await mongoose.startSession()
  // try {
  //     await session.withTransaction(async () => {
  //         let savedUser = await newUser.save({session: session})
  //         await session.commitTransaction()
  //         res.status(201)
  //         .json({
  //             message: 'success',
  //             user: savedUser
  //         })
  //     })
  // } catch (err) {
  //     // Debug: session error
  //     console.log(err)
  //     res.status(500).json({message: 'session error', description: err})
  // } finally {
  //     console.log('Transaction end')
  //     session.endSession()
  // }
});

// Get All users
router.get("/", authAdmin, async (req, res) => {
  const users = await User.find({ isDeleted: false }).select("username password"); // CRUD user data only username and password?
  return res.status(200).json(users);
});

// Update user by ID (Body: username, password)
router.put("/:id", checkId, authAdmin, async (req, res) => {
  // Check if the username and password fit the defined format
  const { error } = updateValidation(req.body);
  if (error) return res.status(400).json({ message: "Body invalid", description: error.details[0].message });

  // Check if user exist
  let user = await User.findOne({ _id: req.params.id, isDeleted: false });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Check if username is unique
  const usernameExist = await User.exists({
    username: req.body.username,
    _id: { $ne: req.params.id },
    isDeleted: false,
  });
  if (usernameExist)
    return res
      .status(400)
      .json({ message: "Body invalid", description: "This username is registered under another user" });

  // Encrypt the password
  let hashedPassword = undefined;
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(req.body.password, salt);
  }

  // Update user
  user.username = req.body.username || user.username;
  user.password = req.body.password ? hashedPassword : user.password;

  const savedUser = await user.save();
  return res.status(201).json({
    message: "success",
    user: savedUser,
  });

  // session is used for all operation that required mutex lock
  // const session = await mongoose.startSession()
  // try {
  //     await session.withTransaction(async () => {
  //         let savedUser = await user.save({session: session})
  //         await session.commitTransaction()
  //         res.status(201)
  //         .json({
  //             message: 'success',
  //             user: savedUser
  //         })
  //     })
  // } catch (err) {
  //     // Debug: session error
  //     console.log(err)
  //     res.status(500).json({message: 'session error', description: err})
  // } finally {
  //     console.log('Transaction end')
  //     session.endSession()
  // }
});

// Delete user by ID
router.delete("/:id", checkId, authAdmin, async (req, res) => {
  if (req.params.id == req.user._id) return res.sendStatus(403); // Forbid admin to delete itself
  // const user = await User.findOneAndDelete({_id: req.params.id})
  // if (!user) return res.sendStatus(404)
  // return res.sendStatus(204)

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true },
    { useFindAndModify: false }
  );

  if (!user) return res.sendStatus(404);

  let comments = await Comment.find({ sender: user._id });

  comments.forEach(async (comment) => {
    console.log("delete comment");
    await Comment.findOneAndUpdate({ _id: comment._id }, { isDeleted: true }, { useFindAndModify: false });
  });

  return res.sendStatus(204);
});

// Like hospital by user ID (Body: hospitalID)
router.patch("/:id/favHospitals", checkId, authSameUser, async (req, res) => {
  // Check if this hospital in the user fav list
  // Push if no; pop if yes

  if (!req.body.hospitalID?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "ID Invalid", description: "ID format must be in /^[0-9a-fA-F]{24}$/" });
  }

  const hospital = await Hospital.findOne({ _id: req.body.hospitalID, isDeleted: false });
  if (!hospital)
    return res
      .status(404)
      .json({
        message: "Hospital not found",
        description: `Hospital with ID ${req.body.hospitalID} not found in the DB`,
      });

  if (req.user.favHospitals.includes(hospital._id)) {
    // Delete this hospital from the favHospital list
    req.user.favHospitals.splice(req.user.favHospitals.indexOf(hospital._id), 1);
    await req.user.save();
  } else {
    // Insert this hospital from the favHospital list
    req.user.favHospitals.push(hospital._id);
    await req.user.save();
  }

  return res
    .status(200)
    .json({ message: "Success", description: "favHospitals updated", updatedList: req.user.favHospitals });
});

// Get favHospitals by user ID
router.get("/:id/favHospitals", checkId, authSameUser, async (req, res) => {
  let user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate({
    path: "favHospitals",
    match: { isDeleted: false },
  });

  return res.status(200).json(user.favHospitals);
});

module.exports = router;
