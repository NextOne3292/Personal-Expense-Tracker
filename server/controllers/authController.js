// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// helper: create a JWT for a user id
const createToken = (userId) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn });
};

// SIGNUP: create a new user and return token + user info (without password)
export const Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    // check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "User with that email already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed
    });

    // create token
    const token = createToken(user._id);

    // return user (no password) + token
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    return res.status(201).json({ user: userData, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// LOGIN: authenticate user and return token + user info
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = createToken(user._id);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    return res.json({ user: userData, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
