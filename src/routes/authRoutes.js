import express from "express";
const userRouter = express.Router();
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  updateUserProfile,
} from "../controller/userController.js";
import authenticateJWT from "../helper/authenticateJwt.js";






userRouter.post("/register",  registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authenticateJWT, getUserProfile);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post("/resetpassword/:resetToken", resetPassword);
userRouter.put("/update",authenticateJWT, updateUserProfile)


export default userRouter;
