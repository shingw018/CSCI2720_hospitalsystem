# CSCI2720_hospitalsystem

CSCI2720 Group20 Project

!!!
We have read the academic honesty articile carefully
and understood the guidelines clearly, at
http://www.cuhk.edu.hk/policy/academichonesty
!!!

NodeJS port: 2030
MongoDB location: port 2030 localhost

Before running the program:
run "npm i" in "~/", "~/frontend", "~/backend" to install the module needed for this web app
run "npm run build" in "~/frontend" to build the app for production to the build folder

To run this in CSCI2720 VM:
run "npm run serve" in s1155109549@csci2720.cse.cuhk.edu.hk
(I am not sure if this can be used by other account)

To run this in local:
run "npm start" in ~/ to run both frontend and backend concurrently

To run ONLY frontend in local:
run "npm run front" in ~/ to run frontend only

To run ONLY backend in local:
run "npm run back" in ~/ to run backend only

In case this is not compilable in the VM due to some unexpected issue:
Please change the code with comments "for vm" to the code with comments "for local use"
in ~/frontend/src/middleware/api.jsx and ~/backend/app.js,
and run the program with "npm start". The React App will be displayed in localhost:3000
