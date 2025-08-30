const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const foodRoutes = require("./routes/foodRoutes.js");
const userRoutes=require("./routes/userRoutes.js");
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/user",userRoutes);
app.use("/api/food", foodRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
