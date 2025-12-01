import Notification from "../models/notificationModel.js";
import mongoose from "mongoose";

export const sendNotification = async ({
  userId,
  title,
  message,
  shortUrl,
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      shortUrl,
    });

    return notification || null;
  } catch (error) {
    return error;
  }
};

export const getUnreadNotification = async (req, res, next) => {
  const userId = req.user?.userId;

  // if (!userId) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }

  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: "Invalid user ID" });
  // }

  try {
    const getUnreadNotification = await Notification.find({
      user: userId,
      isRead: false,
    });
    return res.status(500).json({
      message: "Unread Notification",
      status: true,
      data: getUnreadNotification,
    });
  } catch (err) {
    // return res.status(500).json({
    //   message: "Error occured on Unread Notification",
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

export const getNotificationCount = async (req, res, next) => {
  const userId = req.user?.userId;

  // if (!userId) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }

  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: "Invalid user ID" });
  // }

  try {
    const getNotificationCount = await Notification.countDocuments({
      user: userId,
    });
    return res.status(200).json({
      message: "Total notification count retrieved",
      totalCount: getNotificationCount,
    });
  } catch (err) {
    // return res.status(500).json({
    //   message: "Error occured on Notification Count",
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

export const getreadNotification = async (req, res, next) => {
  const userId = req.user?.userId;

  // if (!userId) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }

  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: "Invalid user ID" });
  // }

  try {
    const getreadNotification = await Notification.find({
      user: userId,
      isRead: true,
    });
    return res.status(200).json({
      message: "Total notification count retrieved",
      status: true,
      data: getreadNotification,
    });
  } catch (err) {
    // return res.status(500).json({
    //   message: "Error occured on read  Notification   ",
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

export const updateNotificationReadUnread = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const { isRead } = req.body;
    //console.log(notificationId);

    const userId = req.user?.userId;
    // console.log(userId);

    // if (!userId) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }

    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ message: "Invalid user ID" });
    // }

    // Validate input
    if (typeof isRead !== "boolean") {
      return res.status(400).json({
        message: "isRead must be a boolean (true or false)",
      });
    }

    // Find notification
    const notification = await Notification.findOne({
      user: userId,
      _id: notificationId,
    });

    if (!notification) {
      // return res.status(404).json({
      //   message: "Notification not found",
      // });
    }

    // Update read/unread status
    notification.isRead = isRead;
    await notification.save();

    return res.status(200).json({
      message: `Notification marked as ${isRead ? "read" : "unread"}`,
      data: notification,
    });
  } catch (err) {
    // return res.status(500).json({
    //   message: "Error updating notification status",
    //   error: error.message,
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

export const deleteAllNotification = async (req, res) => {
  try {
    const userId = req.user?.userId;
    // console.log(userId);

    // if (!userId) {
    //   return res.status(401).json({ message: "Not authenticated" });
    // }

    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ message: "Invalid user ID" });
    // }

    const notification = await Notification.deleteMany({
      user: userId,
    });

    return res.status(200).json({
      message: "All notifications deleted successfully",
      deletedCount: notification.deletedCount,
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "Error deleting  all notifications",
    //   error: error.message,
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
