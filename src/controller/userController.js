import User from "../models/userModel.js";
import { z } from "zod";
import argon2 from "argon2";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import redisClient from "../helper/redis.js";
import logger from "../utils/logger.js";

import {
  registerSchema,
  loginSchema,
  updateUserProfileSchema,
  UpdateUserSchema,
} from "../validator/userValidator.js";
import generateToken from "../helper/jwtHandler.js";
import { sendMail } from "../helper/mail.js";
import { getResetPasswordEmailTemplate } from "../helper/mailtemplate.js";
import AppError from "../utils/AppError.js";
import { ErrorCodes } from "../utils/errorType.js";

// ****LOGIN USER   *****//
export const loginUser = async (req, res, next) => {
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

    //////////////////console.log("checkExistingUser", checkExistingUser.password);
    if (!checkExistingUser) {
      //return res.status(400).json({ message: "Invalid email or password" });
      throw new AppError("User not Found", 404, ErrorCodes.USER_NOT_FOUND);
    }

    const isMatch = await argon2.verify(
      checkExistingUser.password,
      result.data.password
    );

    if (!isMatch) {
      //return res.status(400).json({ message: "Invalid email or password" });
      throw new AppError(
        "Invalid email or password",
        400,
        ErrorCodes.INVALID_INPUT
      );
    }
    const token = generateToken({
      userId: checkExistingUser._id,
      email: checkExistingUser.email,
    });
    // Log successful login
    logger.info("User logged in", {
      email: checkExistingUser.email,
      userId: checkExistingUser._id.toString(),
      // correlationId: req.correlationId,
      method: req.method,
      path: req.originalUrl,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // chanage to true
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    });

    return res.status(200).json({
      message: "Login successful",
      data: checkExistingUser.email,
      token: token,
    });
  } catch (err) {
    // res.status(500).json({ message: "Server error" });
    if (!(err instanceof AppError)) {
      err = new AppError(
        err.message || "Something went wrong",
        500,
        ErrorCodes.INTERNAL_ERROR,
        false
      );
    }
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
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
      // return res.status(400).json({ message: "User already exists" });
      throw new AppError(
        "User Already Exit",
        404,
        ErrorCodes.DUPLICATE_RESOURCE
      );
    }
    const checkExistingUsername = await User.findOne({ username });

    if (checkExistingUsername) {
      //return res.status(400).json({ message: "Username already taken" });
      throw new AppError(
        "Username Already Exists",
        404,
        ErrorCodes.DUPLICATE_RESOURCE
      );
    }
    const newUser = new User({ email, username, password });
    const newUserSaved = await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", data: newUserSaved });
  } catch (err) {
    // res.status(500).json({ message: "Server error" });
    // Wrap unknown errors into AppError and pass to global handler
    if (!(err instanceof AppError)) {
      err = new AppError(
        err.message || "Something went wrong",
        500,
        ErrorCodes.INTERNAL_ERROR,
        false
      );
    }
    next(err);
  }
};

export const updateUserProfile = async (req, res) => {
  const userId = req.user?.userId;
  const result = updateUserProfileSchema.safeParse(req.body);

  if (!result.success) {
    const flattened = z.flattenError(result.error);
    return res.status(400).json({
      message: "Validation error",
      errors: flattened.fieldErrors,
    });
  }

  try {
    if (result.data.password) {
      return res.status(200).json({
        message: "Use the password reset endpoint to change password",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, result.data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      //return res.status(404).json({ message: "User not found" });
      throw new AppError("User not Found", 404, ErrorCodes.USER_NOT_FOUND);
    }

    logger.info("User Profile Updated", {
      email: updatedUser.email,
      userId: updatedUser._id.toString(),
      //correlationId: req.correlationId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    //////////////////console.log(error);
    // res.status(500).json({ message: "Server error" });
    if (!(err instanceof AppError)) {
      err = new AppError(
        err.message || "Something went wrong",
        500,
        ErrorCodes.INTERNAL_ERROR,
        false
      );
    }
    next(err);
  }
};

export const getUserProfile = async (req, res) => {
  const { userId } = req.user;

  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: "Invalid user ID" });
  // }

  try {
    const findUser = await User.findOne({ _id: userId });

    if (!findUser) {
      //return res.status(404).json({ message: "User not found" });
      throw new AppError("User not Found", 404, ErrorCodes.USER_NOT_FOUND);
    }

    return res.status(200).json({
      status: "true",
      message: " View  user  Profile",
      data: findUser,
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "error occured on  Get Profile",
    //   status: "false",
    // });
    if (!(err instanceof AppError)) {
      err = new AppError(
        err.message || "Something went wrong",
        500,
        ErrorCodes.INTERNAL_ERROR,
        false
      );
    }
    next(err);
  }
};

// export const forgotPassword = async (req, res) => {

//   try {

//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {

//       return res.status(404).json({ message: "User not found" });
//     }
//     const resetToken = user.getResetPasswordToken();

//     // 2. Create reset URL
//     const resetUrl = `${req.protocol}://${req.get(
//       "host"
//     )}/api/users/resetpassword/${resetToken}`;

//     // 3. Generate email template
//     const html = getResetPasswordEmailTemplate(resetUrl, user);

//     try {
//       await sendMail(user.email, "Reset Your Password", html);
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError);

//       return res.status(500).json({
//         message: "Password reset email failed to send",
//         status: false,
//       });
//     }

//     user.resetPasswordToken = resetToken;
//     await user.save();

//     return res.status(200).json({
//       message: "Password reset link sent to email",
//       status: true,
//     });
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     return res.status(500).json({
//       message: "Server error on forgot password",
//       status: false,
//     });
//   }
// };

export const forgotPassword = async (req, res, next) => {
  const result = UpdateUserSchema.safeParse(req.body);

  if (!result.success) {
    // Validation failed
    const flattened = z.flattenError(result.error);
    return res.status(400).json({
      message: "Validation error",
      errors: flattened.fieldErrors,
    });
  }
  try {
    // 1. Find the user
    const user = await User.findOne({ email: result.data.email });
    if (!user) {
      throw new AppError("User not Found", 404, ErrorCodes.USER_NOT_FOUND);

      //return res.status(404).json({ message: "User not found", status: false });
    }

    // 2. Generate reset token and assign to user
    const resetToken = user.getResetPasswordToken();
    user.resetPasswordToken = resetToken;
    await user.save(); // save all again

    // 3. Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetpassword/${resetToken}`;

    // 4. Generate email template
    const html = getResetPasswordEmailTemplate(resetUrl, user);

    // 5. Send email
    await sendMail(user.email, "Reset Your Password", html);

    return res.status(200).json({
      message: "Password reset link sent to email",
      status: true,
    });
  } catch (err) {
    //console.error("Forgot Password Error:", error);
    // return res.status(500).json({
    //   message: "Server error on forgot password",
    //   status: false,
    // });
    if (!(err instanceof AppError)) {
      err = new AppError(
        err.message || "Something went wrong",
        500,
        ErrorCodes.INTERNAL_ERROR,
        false
      );
    }
    next(err);
  }
};

// export const forgotPassword2 = async (req, res, next) => {
//   try {
//     const findUser = await User.findOne({ email: req.body.email });
//     if (!findUser) {
//       //return res.status(404).json({ message: "User not Found" });
//       throw new AppError("User not Found", 404, ErrorCodes.USER_NOT_FOUND);
//     }
//     const resetToken = findUser.getResetPasswordToken();
//     findUser.resetPasswordToken = resetToken;
//     await findUser.save();

//     // Create reset URL
//     const resetUrl = `${req.protocol}://${req.get(
//       "host"
//     )}/api/users/resetpassword/${resetToken}`;

//     res.status(200).json({ message: "Password reset link sent", resetUrl });
//   } catch (error) {
//     // return res.status(500).json({
//     //   message: "error occured on Forgot Password",
//     //   status: "false",
//     // });
//     if (!(err instanceof AppError)) {
//       err = new AppError(
//         err.message || "Something went wrong",
//         500,
//         ErrorCodes.INTERNAL_ERROR,
//         false
//       );
//     }
//     next(err);
//   }
// };

export const resetPassword = async (req, res) => {
  const token = req.params.resetToken;
  //////////////////console.log("Reset token received:", token);
  const { password } = req.body;
  //console.log(password)
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    //////////////////console.log("user found for reset:", user);

    if (!user) {
      throw new AppError(
        "Invalid or  expired Token",
        404,
        ErrorCodes.RESET_TOKEN_EXPIRED
      );

      //return res.status(400).json({ message: "Invali3d or expired token" });
    }

    // Set new password

    //const hashedPassword = await argon2.hash(password);
    user.password = password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (err) {
    // return res.status(500).json({
    //   message: "error occured on Resetting  Password",
    //   status: "false",
    // });

    if (!(err instanceof AppError)) {
      err = new AppError(
        err.message || "Something went wrong",
        500,
        ErrorCodes.INTERNAL_ERROR,
        false
      );
    }
    next(err);
  }
};

// const app = express();
// const redisClient = new Redis({
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: process.env.REDIS_PORT || 6379,
// });

// const TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds

export const logout = async (req, res, next) => {
  const TOKEN_EXPIRY = 60 * 60;

  try {
    // Get token from Authorization header, custom header, or cookie
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers["x-token"] || req.cookies?.token;

    if (!token) {
      throw new AppError("No  Token Provided", 404, ErrorCodes.TOKEN_NOT_FOUND);
      //return res.status(401).json({ message: "No token provided" });
    }

    // Decode token to get expiration
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new AppError("Invalid Token", 401, ErrorCodes.INVALID_TOKEN);
    }

    // Add token to Redis blacklist with TTL
    await redisClient.set(token, "blacklisted", "EX", TOKEN_EXPIRY);

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    // console.error("Logout error:", err);
    // res.status(500).json({ message: "Logout failed" });
    if (!(err instanceof AppError)) {
      err = new AppError(
        err.message || "Something went wrong",
        500,
        ErrorCodes.INTERNAL_ERROR,
        false
      );
    }
    next(err);
  }
};
