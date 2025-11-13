import express from "express";
import { registerSchema } from "../config/validator/userValidator.js";
const userRouter = express.Router();
import { z } from "zod";

userRouter.post("/register", async (req, res) => {
  // Validate request body
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    // Validation failed
    const flattened = z.flattenError(result.error);
    return res.status(400).json({
      message: "Validation error",
      errors: flattened.fieldErrors,
    });


  }
  try {
    const { email, username, password } = req.body;
    const checkExistingUser = User.findOne({ email });
    const checkExistingUsername = User.findOne({ username });
    if (checkExistingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (checkExistingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const newUser = new User({ email, username, password });
    const newUserSaved = await newUser.save();
    res.status(201).json({ message: "User registered successfully", data: newUserSaved });
  } catch (error) {


  }
    
})
  

export default userRouter;
