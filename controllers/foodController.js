// const axios = require("axios");
// const Food = require("../models/Food"); // ✅ Corrected import

// const getFoodData = async (req, res) => {
//     try {
//         const { food } = req.query;
//         if (!food) {
//             return res.status(400).json({ error: "Food item is required" });
//         }

//         // Fetch data from Nutritionix API
//         const response = await axios.post(
//             "https://trackapi.nutritionix.com/v2/natural/nutrients",
//             { query: food },
//             {
//                 headers: {
//                     "x-app-id": process.env.NUTRITIONIX_APP_ID,
//                     "x-app-key": process.env.NUTRITIONIX_API_KEY,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         // Extract first food item from response
//         const foodData = response.data.foods[0];

//         if (!foodData) {
//             return res.status(404).json({ error: "Food not found in Nutritionix database" });
//         }

//         // ✅ Create a new food entry for MongoDB
//         const newFood = new Food({
//             name: foodData.food_name,
//             calories: foodData.nf_calories,
//             protein: foodData.nf_protein,
//             carbs: foodData.nf_total_carbohydrate,
//             fats: foodData.nf_total_fat,
//         });

//         await newFood.save(); // ✅ Save to MongoDB

//         res.status(201).json(newFood); // ✅ Return saved food data
//     } catch (error) {
//         console.error("Error fetching food data:", error.message);
//         res.status(500).json({ error: "Error fetching food data" });
//     }
// };

// module.exports = { getFoodData };
const axios = require("axios");
const Food = require("../models/Food");
const User = require("../models/User");
const saveFoodSearch = async (req, res) => {
  try {
      const { userId, foodItem, calories,protein,carbs,fats,runningDistance,date } = req.body;

      // Example: Assuming you're using MongoDB with Mongoose
      const FoodSearch = require("../models/Food.js"); // Ensure model is correctly imported

      const newSearch = new FoodSearch({ userId, foodItem, calories,protein,carbs,fats,runningDistance,date });
      await newSearch.save();

      res.status(201).json({ message: "Food search saved successfully!" });
  } catch (error) {
      console.error("Error saving food search:", error);
      res.status(500).json({ message: "Server error" });
  }
};




const getFoodData = async (req, res) => {
  try {
    const { food , userId} = req.query;
    if (!food) {
      return res.status(400).json({ error: "Food item is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
  }

    const response = await axios.post(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      { query: food },
      {
        headers: {
          "x-app-id": process.env.NUTRITIONIX_APP_ID,
          "x-app-key": process.env.NUTRITIONIX_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const foodData = response.data.foods[0];

    
    const runningDistance = (Number(foodData.nf_calories) / 100);
// Calories divided by 100
    //Converrt kcal to km
    console.log("🔍 Running Distance:", runningDistance);

    const newFood = new Food({
      name: foodData.food_name,
      calories: foodData.nf_calories,
      protein: foodData.nf_protein,
      carbs: foodData.nf_total_carbohydrate,
      fats: foodData.nf_total_fat,
      runningDistance: runningDistance.toFixed(2), // Store with 2 decimal places
      userId:userId   //Save userId in database
    });

    await newFood.save();
    await User.findByIdAndUpdate(userId, { $push: { foodHistory: newFood._id } });
    res.json(newFood);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching food data" });
  }
};

module.exports = { getFoodData, saveFoodSearch };


