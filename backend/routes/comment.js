/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const express = require("express");
const { checkId, authToken } = require("../tools");
const router = express.Router();
const Comment = require("../schema/commentSchema");
const Hospital = require("../schema/hospitalSchema");

// Check user logged in yet for all API; return user as req.user
router.use("*", authToken);

// Delete comment by ID
router.delete("/:id", checkId, async (req, res) => {
  // const comment = await Comment.findOneAndDelete({_id: req.params.id})
  // if (!comment) return res.sendStatus(404)
  // return res.sendStatus(204)

  const comment = await Comment.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true },
    { useFindAndModify: false }
  );
  if (!comment) return res.sendStatus(404);

  // Delete this hospital from favHospital of all users
  const hospitals = await Hospital.find({ isDeleted: false });
  if (hospitals) {
    hospitals.forEach(async (hospital) => {
      const foundHospital = await Hospital.findOne({ _id: hospital._id, isDeleted: false });
      if (foundHospital) {
        foundHospital.comments.splice(foundHospital.comments.indexOf(comment._id), 1);
        await foundHospital.save();
      }
    });
  }

  return res.sendStatus(204);
});

module.exports = router;
