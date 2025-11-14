import express from "express";
const userRouter = express.Router();
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
} from "../controller/userController.js";
import authenticateJWT from "../helper/authenticateJwt.js";
import { createurl, redirectUrl } from "../controller/urlController.js";

userRouter.post("/register", authenticateJWT, registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/protected", authenticateJWT, getUserProfile);
userRouter.get("/profile", authenticateJWT, getUserProfile);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post("/resetpassword/:resetToken", resetPassword);
userRouter.post("/create", createurl);
userRouter.get("/:alias", redirectUrl);

export default userRouter;
