import express from "express";
import authenticateJWT from "../helper/authenticateJwt.js";
import {
    deleteAllNotification,
  getNotificationCount,
  getreadNotification,
  getUnreadNotification,
  updateNotificationReadUnread,
} from "../controller/notificationController.js";
const notificationRouter = express.Router();

notificationRouter.get("/count", authenticateJWT, getNotificationCount);
notificationRouter.put(
  "/:notificationId",
  authenticateJWT,
  updateNotificationReadUnread
);
 notificationRouter.get("/read", authenticateJWT, getreadNotification);
notificationRouter.get("/unread", authenticateJWT, getUnreadNotification);
notificationRouter.delete("/delete",  authenticateJWT, deleteAllNotification);

export default notificationRouter;
