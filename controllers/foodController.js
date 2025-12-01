const axios = require("axios");
const Food = require("../models/Food");
const User = require("../models/User");

// SAVE MANUAL FOOD SEARCH (unchanged, tidy)
const saveFoodSearch = async (req, res) => {
  try {
    const { userId, foodItem, calories, protein, carbs, fats, runningDistance, date } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (!foodItem) return res.status(400).json({ error: "foodItem is required" });

    const newFood = new Food({
      userId,
      name: foodItem,
      calories,
      protein,
      carbs,
      fats,
      runningDistance,
      date
    });

    await newFood.save();

    // update user history if user exists (do not crash server if userId invalid)
    try {
      await User.findByIdAndUpdate(userId, { $push: { foodHistory: newFood._id } });
    } catch (uErr) {
      console.warn("Warning: could not update user's foodHistory:", uErr.message || uErr);
    }

    return res.status(201).json({ message: "Food search saved successfully!", newFood });
  } catch (error) {
    console.error("saveFoodSearch - unexpected error:", error);
    return res.status(500).json({ message: "Server error saving food search" });
  }
};

// GET FOOD DATA — robust, with detailed error logging
const getFoodData = async (req, res) => {
  try {
    const { food, userId } = req.query;

    if (!food) return res.status(400).json({ error: "Food item is required" });
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    // ensure API key exists
    if (!process.env.CALORIE_API_KEY) {
      console.error("CALORIE_API_KEY is not set in environment");
      return res.status(500).json({ error: "Server misconfiguration: API key missing" });
    }

    // Call CalorieNinjas
    let response;
    try {
      response = await axios.get(
        `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(food)}`,
        {
          headers: { "X-Api-Key": process.env.CALORIE_API_KEY },
          timeout: 10000
        }
      );
    } catch (apiErr) {
      // log as much as possible from Axios error
      console.error("CalorieNinjas request failed:", {
        message: apiErr.message,
        status: apiErr.response?.status,
        responseData: apiErr.response?.data
      });
      // map some common API problems to clearer responses
      if (apiErr.response && apiErr.response.status === 401) {
        return res.status(502).json({ error: "External API authentication failed (401)" });
      }
      if (apiErr.response && apiErr.response.status === 403) {
        return res.status(502).json({ error: "External API forbidden (403)" });
      }
      return res.status(502).json({ error: "External API request failed" });
    }

    // normalize possible data shapes (calorie ninjas returns { items: [...] } OR sometimes { items: [] })
    const items = response.data && (response.data.items || response.data);
    const foodData = Array.isArray(items) ? items[0] : undefined;

    if (!foodData || Object.keys(foodData).length === 0) {
      console.warn("No food data returned for query:", food, "apiResponse:", response.data);
      return res.status(404).json({ error: "Food not found in external API" });
    }

    // map fields safely — provide fallbacks to 0 to satisfy required schema
    const calories = Number(foodData.calories ?? 0);
    const protein = Number(foodData.protein_g ?? 0);
    const carbs = Number(foodData.carbohydrates_total_g ?? 0);
    const fats = Number(foodData.fat_total_g ?? 0);

    const runningDistance = Number((calories / 100).toFixed(2));

    // Build and save new Food record
    const newFood = new Food({
      userId,
      name: foodData.name || food, // fallback to search term
      calories,
      protein,
      carbs,
      fats,
      runningDistance
    });

    try {
      await newFood.save();
    } catch (dbErr) {
      console.error("DB save error (newFood):", dbErr);
      return res.status(500).json({ error: "Database error saving food" });
    }

    // update user's history — if userId invalid, warn but still return created food
    try {
      await User.findByIdAndUpdate(userId, { $push: { foodHistory: newFood._id } });
    } catch (uErr) {
      console.warn("Warning: could not update user's foodHistory:", uErr.message || uErr);
    }

    return res.json(newFood);
  } catch (err) {
    console.error("getFoodData - unexpected error:", err);
    return res.status(500).json({ error: "Server error fetching food data" });
  }
};

module.exports = { getFoodData, saveFoodSearch };
