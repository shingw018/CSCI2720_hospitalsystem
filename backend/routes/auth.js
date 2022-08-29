/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { generateAccessToken, authToken } = require("../tools");
const User = require("../schema/userSchema");

// Login API: username and password in body
router.post("/login", async (req, res) => {
  // Check if user with this username exist
  let user = await User.findOne({ username: req.body.username, isDeleted: false });
  if (!user)
    return res.status(404).json({
      message: "User not found",
      description: "Incorrect username or password. Please try again",
    });

  // Check if password valid
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({
      message: "Wrong password",
      description: "Incorrect username or password. Please try again",
    });

  // Generate access token and return to the user
  const accessToken = generateAccessToken({ _id: user._id });

  // Generate refresh token and return to the user
  // refresh token is used for security issue
  const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET);

  user.sessionTokens.push(refreshToken);
  const savedUser = await user.save();
  return res.status(200).json({
    message: "success",
    user: user,
    accessToken: accessToken,
    refreshToken: refreshToken,
    userId: savedUser._id.toString(),
  });

  // session is used for all operation that required mutex lock
  // const session = await mongoose.startSession();
  // try {
  //     await session.withTransaction(async () => {
  //         user.sessionTokens.push(refreshToken);
  //         const savedUser = await user.save({ session: session });
  //         await session.commitTransaction();
  //         // res.cookie("accessToken", accessToken, { sameSite: "strict" }); // send all these tokens to client side for storing in cookie
  //         // res.cookie("refreshToken", refreshToken, { sameSite: "strict" });
  //         // res.cookie("userId", savedUser._id.toString(), { sameSite: "strict" });
  //         res.status(200).json({
  //             message: "success",
  //             user: user,
  //             accessToken: accessToken,
  //             refreshToken: refreshToken,
  //             userId: savedUser._id.toString()
  //         });
  //     });
  // } catch (err) {
  //     // Debug: session error
  //     console.log(err);
  //     return res.status(500).json({ message: "session error" });
  // } finally {
  //     console.log("Transaction end");
  //     session.endSession();
  // }
});

// Logout API: pop the refresh token from the user refreshToken list
router.delete("/logout/:token", authToken, async (req, res) => {
  let user = await User.findOne({ _id: req.user._id });
  if (!user) return res.sendStatus(404);
  user.sessionTokens.pull(req.params.token);
  await user.save();
  return res.sendStatus(204);
});

// Refresh Access Token API: Retrieve the refresh token from req and generate a new access token to client side
router.post("/token", async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.status(401).json({ message: "token missing", description: "token missing" });

  // Check if refresh token is valid for this user
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, token) => {
    if (err) {
      console.log(err);
      return res.status(403).send("ERROR"); // Send 403 if refresh token not exist
    }
    const userID = token._id;
    let user = await User.findOne({ _id: userID });

    if (!user?.sessionTokens?.includes(refreshToken)) return res.status(403).send("FORBIDDEN"); // Send 403 if this refresh token not owned by this user
    const accessToken = generateAccessToken({ _id: user._id });
    // res.cookie("accessToken", accessToken, { sameSite: "strict" }); // return the new access token as cookie to the client side
    return res.status(200).json({ accessToken: accessToken });
  });
});

module.exports = router;
