import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* Register User*/
export const register = async ( req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        picturePath,
        friends,
        location,
        occupation
      } = req.body;

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password : passwordHash,
        picturePath,
        friends,
        location,
        occupation,
        views: Math.floor(Math.random() * 10000),
        impressions: Math.floor(Math.random() * 10000)
      })

      const savedUser = await newUser.save();
      res.status(201).json(savedUser);  // response and status code sent to user if no error occurs. Json version of the saved user is sent
      // to frontend in order to evaluate the response 
    } catch(error) {
      res.status(500).json({ error: error.message})       // response sent in case of fail
    }
}

// Logging in

export const login = async(req,res) => {
  try{
     const { email, password} = req.body;
     const user = await User.findOne({email : email});
     if(!user) return res.status(400).json({msg: "User does not exist."});

     const isMatch = await bcrypt.compare(password, user.password);
     if(!isMatch) return res.status(400).json({msg: "Invalid Password"});

     const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET);
     delete user.password;  // delete so that frontend does not recieve the password

     res.status(200).json({token, user});
     // This authentication involves generating token on registering or logging in which gives a validation or 
     // a token which verifies the user logging in.
     
  }catch(error){
     res.status(500).json({error: error.message})
  }
}