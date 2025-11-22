import express from "express";
import {
  createurl,
  deleteExpiredUrls,
  getAllUrlsWithClicks,
  listAllUrl,
  listAllUrls,
  redirectUrl,
} from "../controller/urlController.js";
import authenticateJWT from "../helper/authenticateJwt.js";
// import authenticateJWT from "../helper/authenticateJwt";
const urlRouter = express.Router();

urlRouter.get("/urlClicks", authenticateJWT, getAllUrlsWithClicks);
urlRouter.post("/create", authenticateJWT, createurl);
urlRouter.get("/:alias", redirectUrl);
urlRouter.get("/list/allclicks", authenticateJWT, listAllUrl);
urlRouter.delete("/delete/:alias",  authenticateJWT,  deleteExpiredUrls)

export default urlRouter;
