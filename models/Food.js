
const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number },
  carbs: { type: Number },
  fats: { type: Number },
  runningDistance: { type: Number },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Food || mongoose.model("Food", FoodSchema);
