const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose"); // Import mongoose

// const fetch = require("node-fetch"); // Import fetch library

const Router = require("./routes/Route");
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

require("dotenv").config();

app.use("/api", Router);

// MongoDB connection

const dbconnect = require("./config/dbconnect");
dbconnect();

// Define route to fetch GraphQL data










const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
