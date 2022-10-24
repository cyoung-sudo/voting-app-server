//----- Imports
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
const db = require("./db/conn");

//----- Middleware
app.use(cors());
app.use(express.json());

//----- Routes
// app.use(require("./routes/..."));
 
//----- Connection
app.listen(port, () => {
  db.connect(); // Connect to DB
  console.log(`Server is running on port: ${port}`);
});