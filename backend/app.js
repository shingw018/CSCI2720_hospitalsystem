/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
const corsOptions = {
  exposedHeaders: [
    // no custrom headers for now
  ],
  // for local use
  // origin: "http://localhost:3000",

  // for vm
  origin: "http://csci2720-g30.cse.cuhk.edu.hk",
  // origin: ["http://csci2720-g44.cse.cuhk.edu.hk", "http://csci2720-g30.cse.cuhk.edu.hk"],

  credentials: true,
};
app.use(cors(corsOptions));

// for vm
const mongoUrl = "mongodb://s1155109549:x99346@localhost/s1155109549?retryWrites=false&w=majority";

// for local use
// const mongoUrl = 'mongodb+srv://2720user:jxvKT0zopkgE9zgO@cluster0.or2pb.gcp.mongodb.net/272?retryWrites=true&w=majority'

// connect mongoose
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

mongoose.connection.on("connected", () => {
  console.log("Connect to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("DB error: " + err);
});

// Create collections
const init = require("./init");
init.initCollections();
init.cleanup(); // clean up all {isDeleted = true} objetcs when server restart
init.createAdmin();

const { authToken } = require("./tools");

// routing
const auth = require("./routes/auth");
const comment = require("./routes/comment");
const hospital = require("./routes/hospital.js");
const user = require("./routes/user");

app.use("/api/auth", auth);
// app.use('*', authToken)     // Check user logged in yet for all API; return user as req.user

app.use("/api/comments", comment);
app.use("/api/hospitals", hospital);
app.use("/api/users", user);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const port = 2030;

app.listen(port, () => {
  console.log(`Listen to port ${port}`);
});
