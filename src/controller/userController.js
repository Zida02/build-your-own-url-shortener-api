import User from "../models/userModel.js";
import { z } from "zod";
import argon2 from "argon2";
import mongoose from "mongoose";
import { registerSchema, loginSchema } from "../validator/userValidator.js";
import generateToken from "../helper/jwtHandler.js";

export const loginUser = async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    // Validation failed
    const flattened = z.flattenError(result.error);
    return res.status(400).json({
      message: "Validation error",
      errors: flattened.fieldErrors,
    });
  }

  try {
    const { email, password } = req.body;
    const checkExistingUser = await User.findOne({ email });

    console.log("checkExistingUser", checkExistingUser.password);
    if (!checkExistingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await argon2.verify(checkExistingUser.password, password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = generateToken({
      userId: checkExistingUser._id,
      email: checkExistingUser.email,
    });

    return res.status(200).json({
      message: "Login successful",
      data: checkExistingUser,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.log(error);
  }
};

export const registerUser = async (req, res) => {
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
    const checkExistingUser = await User.findOne({ email });
    if (checkExistingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const checkExistingUsername = await User.findOne({ username });

    if (checkExistingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const newUser = new User({ email, username, password });
    const newUserSaved = await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", data: newUserSaved });
  } catch (error) {
    console.error(error);
  }
};

export const updateUserProfile = async (req, res) => {
  const result = updateProfileSchema.safeParse(req.body);

  if (!result.success) {
    const flattened = z.flattenError(result.error);
    return res.status(400).json({
      message: "Validation error",
      errors: flattened.fieldErrors,
    });
  }

  try {
    const userId = req.params.id; // or req.user.id if using auth middleware
    const updates = req.body;

    if (updates.password) {
      return res.status(400).json({
        message: "Use the password reset endpoint to change password",
      });
    }

    // update and return new document
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password"); // hide password field

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  const { userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    console.log("userId", userId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const findUser = await User.findOne({ email: req.body.email });
    if (!findUser) {
      return res.status(404).json({ message: "User not Found" });
    }
    const resetToken = findUser.getResetPasswordToken();
    findUser.resetPasswordToken = resetToken;
    await findUser.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/users/resetpassword/${resetToken}`;
    res.status(200).json({ message: "Password reset link sent", resetUrl });
  } catch (error) {}
};

export const resetPassword = async (req, res) => {
  const token = req.params.resetToken;
  console.log("Reset token received:", token);
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    console.log("user found for reset:", user);

    if (!user) {
      return res.status(400).json({ message: "Invali3d or expired token" });
    }

    // Set new password
    user.password = await argon2.hash(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
  }
};
