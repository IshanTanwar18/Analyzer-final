const express = require("express");
const { getFoodData, saveFoodSearch } = require("../controllers/foodController.js");


const router = express.Router();

// Route to fetch food data and save to MongoDB
router.get("/", getFoodData);

router.post("/save-food",saveFoodSearch); // Protected Route

module.exports = router;
