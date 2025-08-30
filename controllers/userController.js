const User= require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "yourSecretKey"; // Replace with env variable
const Food=require("../models/Food");
exports.getUserWithFoods = async (req, res) => {
    try { console.log("Received request to get user with foods:", req.query);
           // Get Token & Verify
           const token = req.headers.authorization?.split(" ")[1];
           if (!token) return res.status(401).json({ message: "Unauthorized: No token" });
   
           const decoded = jwt.verify(token, SECRET_KEY);
           if (!decoded) return res.status(403).json({ message: "Unauthorized: Invalid token" });
   
           // Get User ID from query parameters
           const userId = req.query.userId;
           if (!userId) {
               console.log("❌ Missing userId in request");
               return res.status(400).json({ message: "User ID is required" });
               return;
           }
   
           console.log("✅ Found userId:", userId);
           console.log(`✅ Received request to get user with foods: ${userId}`);





        //const userId = req.user.id;
       
        // Fetch user and populate searched foods
        const user = await User.findById(userId).populate("foodHistory");



        if (!user) {
            res.status(404).json({ message: "User not found" });
            return; 
        }
        console.log("✅ User found:", user.name);
        res.status(200).json(user);
        res.json({ name: user.name, foodHistory: user.foodHistory || [] }); // Return user data


    } catch (error) {
        console.error("Error fetching user with foods:", error);
        if(!res.headersSent){
           return res.status(500).json({ message: "Server error" });
        }
    }
};

exports.registerUser = async (req, res) => {
    console.log("Register function called");
    console.log("Is res a function?", typeof res); // Check if res is a function

    try {
        const { name, email, password } = req.body;
        console.log("Received Data:", name, email, password);

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: "7d" });

        return res.status(201).json({ 
            message: "SignUp successfully", 
            token, 
            user: { id: newUser._id, name: newUser.name, email: newUser.email } 
          });

    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({ message: "Serve error" });
    }
};

exports.login = async(req,res)=>{

    try{
        console.log("Login request received",req.body);
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "7d" });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Server error" });

    }

}