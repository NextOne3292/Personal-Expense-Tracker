// routes/userRoutes.js
import express from "express";
import { Register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/Register",Register);
router.post("/login", login);

export default router;
