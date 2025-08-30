const express=require("express");
const { registerUser, login, getUserWithFoods } = require("../controllers/userController.js");


const router = express.Router();

router.post('/register',registerUser);
router.post('/login',login);
router.get('/profile-with-foods',getUserWithFoods);
module.exports = router;