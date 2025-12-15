import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  let token;

  // Check for "Authorization: Bearer <token>" header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token string after "Bearer "
      token = req.headers.authorization.split(" ")[1];

      // Verify token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Get real user document from DB and remove password
      req.user = await User.findById(decoded.id).select("-password");

      // If user does NOT exist -> block request
      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      // All good -> go to controller
      return next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  // If no token given
  return res.status(401).json({ message: "No token provided" });
};
