/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const express = require("express");
const { checkId, authAdmin, authToken } = require("../tools");
const router = express.Router();
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
require("dotenv").config();
const Hospital = require("../schema/hospitalSchema");
const Comment = require("../schema/commentSchema");
const User = require("../schema/userSchema");

// Check user logged in yet for all API; return user as req.user
router.use("*", authToken);

// Data check for create hospital
const createValidation = (data) => {
  const _validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  const schema = Joi.object({
    name: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  });

  return schema.validate(data, _validationOptions);
};

// Data check for registeration
const updateValidation = (data) => {
  const _validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  const schema = Joi.object({
    name: Joi.string(),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
  });

  return schema.validate(data, _validationOptions);
};

const validHospitalName = [
  "Alice Ho Miu Ling Nethersole Hospital",
  "Caritas Medical Centre",
  "Kwong Wah Hospital",
  "North District Hospital",
  "North Lantau Hospital",
  "Princess Margaret Hospital",
  "Pok Oi Hospital",
  "Prince of Wales Hospital",
  "Pamela Youde Nethersole Eastern Hospital",
  "Queen Elizabeth Hospital",
  "Queen Mary Hospital",
  "Ruttonjee Hospital",
  "St John Hospital",
  "Tseung Kwan O Hospital",
  "Tuen Mun Hospital",
  "Tin Shui Wai Hospital",
  "United Christian Hospital",
  "Yan Chai Hospital",
];

// Create hospital
router.post("/", authAdmin, async (req, res) => {
  // Check if the username and password fit the defined format
  const { error } = createValidation(req.body);
  if (error) return res.status(400).json({ message: "Body invalid", description: error.details[0].message });

  // Check if name is unique
  const nameExist = await Hospital.exists({ name: req.body.name, isDeleted: false });
  if (nameExist)
    return res.status(400).json({ message: "Body invalid", description: "This hospital is already created" });

  const nameValid = validHospitalName.includes(req.body.name);
  if (!nameValid)
    return res
      .status(400)
      .json({ message: "Body invalid", description: `There is no hospital with name "${req.body.name}" in HK.` });

  // Create new User object
  let newHospital = new Hospital({
    name: req.body.name,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    district: req.body.district,
  });

  const savedHospital = await newHospital.save();
  return res.status(201).json({
    message: "success",
    hospital: savedHospital,
  });

  // session is used for all operation that required mutex lock
  // const session = await mongoose.startSession()
  // try {
  //     await session.withTransaction(async () => {
  //         let savedHospital = await newHospital.save({session: session})
  //         await session.commitTransaction()
  //         res.status(201)
  //         .json({
  //             message: 'success',
  //             hospital: savedHospital
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

// Get All hospitals
router.get("/", async (req, res) => {
  const hospitals = await Hospital.find({ isDeleted: false });
  return res.status(200).json(hospitals);
});

// Update ALL valid hospitals waitTime (Body: JSON from gov API)
router.patch("/", authAdmin, async (req, res) => {
  // console.log(req.body)
  const hospitals = await Hospital.find({ name: { $in: validHospitalName }, isDeleted: false });
  if (hospitals) {
    hospitals.forEach(async (hospital) => {
      await Hospital.findOneAndUpdate(
        { _id: hospital._id },
        { waitingTime: req.body.waitTime.filter((hosp) => hosp.hospName === hospital.name)[0].topWait },
        { useFindAndModify: false }
      );
    });
  }

  const allHospitals = await Hospital.find();
  if (allHospitals) {
    allHospitals.forEach(async (hospital) => {
      await Hospital.findOneAndUpdate(
        { _id: hospital._id },
        { lastUpdateTime: req.body.updateTime },
        { useFindAndModify: false }
      );
    });
  }

  return res.status(200).json(allHospitals);
});

// Update ALL valid hospitals past 10 hours waiting time (Body: [{hospName: hospName, data: [{updateTime: updateTime, waitTime: waitTime}]}] )
router.patch("/past10HoursWaitingTime", authAdmin, async (req, res) => {
  // console.log('req body of hours ', req.body)
  const map = new Map(Object.entries(req.body));
  // console.log('10 hours: ', map);
  const hospitals = await Hospital.find({ name: { $in: validHospitalName }, isDeleted: false });
  if (hospitals) {
    hospitals.forEach(async (hospital) => {
      await Hospital.findOneAndUpdate(
        { _id: hospital._id },
        { past10HoursWaitingTime: map.get(hospital.name) },
        { useFindAndModify: false }
      );
    });
  }

  return res.status(200).json(hospitals);
});

// Update ALL valid hospitals past 7 days waiting time (Body: [{hospName: hospName, data: [{updateTime: updateTime, waitTime: waitTime}]}] )
router.patch("/past7DaysWaitingTime", authAdmin, async (req, res) => {
  const map = new Map(Object.entries(req.body));
  const hospitals = await Hospital.find({ name: { $in: validHospitalName }, isDeleted: false });
  if (hospitals) {
    hospitals.forEach(async (hospital) => {
      await Hospital.findOneAndUpdate(
        { _id: hospital._id },
        { past7DaysWaitingTime: map.get(hospital.name) },
        { useFindAndModify: false }
      );
    });
  }

  return res.status(200).json(hospitals);
});

// Get hospital by ID
router.get("/:id", checkId, async (req, res) => {
  const hospital = await Hospital.findOne({ _id: req.params.id, isDeleted: false }).populate({
    path: "comments",
    match: { isDeleted: false },
    populate: {
      path: "sender",
      select: "username",
    },
    select: "username sender content date",
  });

  if (!hospital)
    return res
      .status(404)
      .json({ message: "Hospital not found", description: `Hospital with ID ${req.params.id} not found in the DB` });
  return res.status(200).json(hospital);
});

// Update hospital by ID
router.put("/:id", checkId, authAdmin, async (req, res) => {
  // Check if the name and latitude and longitude fit the defined format
  const { error } = updateValidation(req.body);
  if (error) return res.status(400).json({ message: "Body invalid", description: error.details[0].message });

  // Check if hospital exist
  let hospital = await Hospital.findOne({ _id: req.params.id, isDeleted: false });
  if (!hospital)
    return res
      .status(404)
      .json({ message: "Hospital not found", description: `Hospital with ID ${req.params.id} not found in the DB` });

  // Check if hospital name is unique
  const nameExist = await Hospital.exists({ name: req.body.name, _id: { $ne: req.params.id }, isDeleted: false });
  if (nameExist)
    return res
      .status(400)
      .json({ message: "Body invalid", description: "This hospital name is registered under another hospital" });

  // Check if the hospital name match with list
  if (req.body?.name) {
    const nameValid = validHospitalName.includes(req.body.name);
    if (!nameValid)
      return res
        .status(400)
        .json({ message: "Body invalid", description: `There is no hospital with name "${req.body.name}" in HK.` });
  }

  // Update hospital
  hospital.name = req.body.name || hospital.name;
  hospital.waitingTime = req.body.waitingTime || hospital.waitingTime;
  hospital.latitude = req.body.latitude || hospital.latitude;
  hospital.longitude = req.body.longitude || hospital.longitude;
  hospital.district = req.body.district || hospital.district;

  const savedHospital = await hospital.save();
  return res.status(201).json({
    message: "success",
    hospital: savedHospital,
  });

  // session is used for all operation that required mutex lock
  // const session = await mongoose.startSession()
  // try {
  //     await session.withTransaction(async () => {
  //         let savedHospital = await hospital.save({session: session})
  //         await session.commitTransaction()
  //         res.status(201)
  //         .json({
  //             message: 'success',
  //             hospital: savedHospital
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

// Delete hospital by ID
router.delete("/:id", checkId, authAdmin, async (req, res) => {
  let hospital = await Hospital.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true },
    { useFindAndModify: false }
  );
  if (!hospital) return res.sendStatus(404);

  // Delete this hospital from favHospital of all users
  const users = await User.find({ isDeleted: false });
  if (users) {
    users.forEach(async (user) => {
      const foundUser = await User.findOne({ _id: user._id, isDeleted: false });
      if (foundUser) {
        foundUser.favHospitals.splice(foundUser.favHospitals.indexOf(hospital._id), 1);
        await foundUser.save();
      }
    });
  }

  // Delete all comments under this hospital
  hospital.comments.forEach(async (comment) => {
    await Comment.findOneAndUpdate({ _id: comment._id }, { isDeleted: true }, { useFindAndModify: false });
  });

  return res.sendStatus(204);
});

// Create comment under hospital (Body: content)
router.post("/:id/comments", checkId, async (req, res) => {
  let hospital = await Hospital.findOne({ _id: req.params.id, isDeleted: false });
  if (!hospital)
    return res
      .status(404)
      .json({ message: "Hospital not found", description: `Hospital with ID ${req.params.id} not found in the DB` });

  if (!req.body?.content)
    return res.status(400).json({ message: "Body invalid", description: "Content missing in body" });

  const newComment = new Comment({
    sender: req.user._id,
    content: req.body.content,
    date: Date.now(),
  });

  const savedComment = await newComment.save();
  hospital.comments.push(savedComment);
  await hospital.save();
  return res.status(201).json({
    message: "success",
    comment: savedComment,
  });

  // session is used for all operation that required mutex lock
  // const session = await mongoose.startSession()
  // try {
  //     await session.withTransaction(async () => {
  //         const savedComment = await newComment.save({session: session})
  //         hospital.comments.push(savedComment)
  //         await hospital.save({session: session})
  //         await session.commitTransaction()
  //         res.status(201).json({
  //             message: 'success',
  //             comment: savedComment
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

module.exports = router;
