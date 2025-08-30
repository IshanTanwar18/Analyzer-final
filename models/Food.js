const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
 userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  runningDistance: { type: Number, required: true }, // New field added
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Food", FoodSchema);
