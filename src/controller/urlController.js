import Url from "../models/urlModel.js";
import { urlSchema } from "../validator/urlValidator.js";
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";

import dayjs from "dayjs";
import relativeTime from "../../node_modules/dayjs/plugin/relativeTime.js";
import { sendNotification } from "./notificationController.js";
import { checkTokenStatus } from "../helper/auth.js";
import { ErrorCodes } from "../utils/errorType.js";
import AppError from "../utils/AppError.js";

dayjs.extend(relativeTime);

// CREATE URL

export const createurl = async (req, res) => {
  const result = urlSchema.safeParse(req.body);
  const userId = req.user?.userId;

  if (!userId) {
    //return res.status(401).json({ message: "Not authenticated" });

    return next(
      new AppError(
        "You must be authenticated to create a URL",
        401,
        ErrorCodes.AUTH_REQUIRED
      )
    );
  }

  if (!result.success) {
    // Validation failed
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.format(), // detailed issues
    });
  }

  try {
    if (result.data.alias) {
      const checkAlias = await Url.findOne({ alias: result.data.alias });
      if (checkAlias) {
        // return res.status(404).json({
        //   message: "alias must be unique",
        // });
        return next(
          new AppError("alias must be unique", 401, ErrorCodes.AUTH_REQUIRED)
        );
      }
    }

    if (result.data.linkType === "protected" && !result.data.password) {
      return res
        .status(400)
        .json({ message: "Password is required for protected links" });
    }

    const url = await Url.create({
      user: req.user.userId,
      originalUrl: result.data.originalUrl,
      alias: result.data.alias || "", // default to empty string
      expiresAt: result.data.setExpiry ? new Date(result.data.setExpiry) : null, // you can use null for optional date
      password: result.data.password || "", // default to empty string
      linkType: result.data.linkType || "", // default to empty string
    });

    await sendNotification({
      userId: req.user.userId,
      title: "URL Created",
      message: "Your short link has been created",
      shortUrl: url.newUrl,
    });

    return res.status(200).json({
      message: "url Created",
      data: url,
      //sendNotificationdata,
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: "error occured on creating Short Url",
    //   status: "false",
    //   error: error,
    // });
  }
};

// REDIRECT URL

export const redirectUrl = async (req, res, next) => {
  const { alias } = req.params;

  try {
    const findAlias = await Url.findOne({ alias });

//    console.log(findAlias);

    if (!findAlias) {
      // return res.status(404).json({ message: "Link not found" });

      return next(
        new AppError("LINK NOT FOUND", 401, ErrorCodes.LINK_NOT_FOUND)
      );
    }
    if (findAlias.expiresAt && new Date() > findAlias.expiresAt) {
      //return res.status(410).json({ message: "Link has expired" });

      return next(new AppError("LINK EXPIRED", 401, ErrorCodes.LINK_EXPIRED));
    }

    if (findAlias.linkType === "protected") {
      const { password } = req.body;
      if (findAlias.password !== password || !password) {
        return next(
          new AppError("INVALID PASSWORD ", 401, ErrorCodes.INVALID_INPUT)
        );
        //return res.status(403).json({ message: "Password Required" });
      }

      await urlCount(alias);
      return res.redirect(findAlias.originalUrl);
    }

    // if (findAlias.linkType === "private") {
    //   if (!req.user || !req.user.userId) {
    //     return res.status(401).json({
    //       message: "Login required to access this private link",
    //       data: " redirecting to   Login Page ",
    //     });
    //   }
    //   await urlCount(alias);
    //   return res.redirect(findAlias.originalUrl);
    // }

    if (findAlias.linkType === "private") {
      const tokenInfo = checkTokenStatus(req);

      if (tokenInfo.status === "missing") {
        return res.status(401).json({
          message: "Login required to access this private link",
        });
      }

      if (tokenInfo.status === "expired") {
        return res.status(401).json({
          message: "Session expired. Please login again.",
        });
      }

      if (tokenInfo.status === "invalid") {
        return res.status(403).json({
          message: "Invalid token. Access denied.",
        });
      }

      // token is valid
      req.user = tokenInfo.user;

      // continue with redirect
      await urlCount(alias);
      return res.redirect(findAlias.originalUrl);
    }

    await urlCount(alias);

    return res.redirect(findAlias.originalUrl);
  } catch (err) {
    // return res.status(500).json({
    //   message: "error occured on  redirecting Url",
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

// GET URL COUNT
export const urlCount = async (alias) => {
  try {
    const updatedUrl = await Url.findOneAndUpdate(
      { alias: alias },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!updatedUrl) {
      //console.log("URL not found for alias:", alias);
      return null;
    }
    return updatedUrl;
  } catch (error) {
    return res.status(500).json({
      message: "error occured on  Url count",
      status: "false",
    });
  }
};

export const getAllUrlsWithClicks = async (req, res, next) => {
  const userId = req.user?.userId;

  // if (!userId) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }

  // // Validate MongoDB ObjectId
  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: "Invalid user ID" });
  // }
  try {
    const urls = await Url.find(
      { user: userId },
      { originalUrl: 1, newUrl: 1, clicks: 1, _id: 0 }
    )
      .sort({ clicks: -1 })
      .limit(5);
    return res.status(200).json({ data: urls });
  } catch (err) {
    // return res.status(500).json({
    //   message: "error occured on  getAllUrl  with ClickCount",
    //   status: "false",
    //   error: error,
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

export const listAllUrls = async (req, res, next) => {
  const userId = req.user?.userId;

  // if (!userId) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }

  // // Validate MongoDB ObjectId
  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: "Invalid user ID" });
  // }
  try {
    const urls = await Url.find(
      { user: userId },
      {
        originalUrl: 1,
        alias: 1,
        clicks: 1,
        expiresAt: 1,
        createdAt: 1,
        linkType: 1,
        newUrl: 1,
        _id: 0,
      }
    ).sort({ createdAt: -1 }); // newest first

    const result = urls.map((url) => {
      const now = new Date();
      const createdAgo = dayjs(url.createdAt).fromNow();

      let expiresIn = null;
      let expired = false;

      if (url.expiresAt) {
        if (now > url.expiresAt) {
          expired = true;
          expiresIn = "Expired";
        } else {
          expiresIn = dayjs(url.expiresAt).fromNow(); // e.g., "in 3 days"
        }
      } else {
        expiresIn = "Never"; // no expiry
      }

      return {
        originalUrl: url.originalUrl,
        alias: url.alias,
        clicks: url.clicks,
        linkType: url.linkType,
        shortUrl: url.newUrl,
        createdAgo,
        expiresIn,
        expired,
      };
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    // return res.status(500).json({
    //   message: "error occured on list Urls",
    //   status: "false",
    //   error,
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

export const deleteExpiredUrls = async (req, res, next) => {
  const alias = req.params.alias;
  const userId = req.user?.userId;

  try {
    const result = await Url.findOneAndDelete({
      user: userId,
      expiresAt: { $lte: new Date() },
      alias: req.params.alias,
    });

    if (!result) {
      return res.status(404).json({
        message: "No expired Url Found to delete",
      });
    }

    const sendNotification = await Notification({
      user: req.user.userId,
      title: "Url Deleted",
      shortUrl: result.newUrl,
    });

    return res.status(200).json({
      message: "Expired Url Deleted",
      status: "true",
    });
  } catch (err) {
    // return res.status(500).json({
    //   message: "error occured on Delecting Url",
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

// export const getAllUrlsWithClick = async (req, res) => {
//   try {
//     const userId = req.user?.userId;

//     if (!userId) {
//       return res.status(401).json({ message: "Not authenticated" });
//     }

//     const urls = await Url.find(
//       { userId: userId }, // 👈 filter by this user only
//       { originalUrl: 1, alias: 1, clicks: 1 }
//     ).sort({ clicks: -1 });

//     const domain = process.env.BASE_URL; // e.g. "https://short.me"

//     const formatted = urls.map((url) => ({
//       alias: url.alias,
//       originalUrl: url.originalUrl,
//       shortUrl: `${domain}/${url.alias}`,
//       clicks: url.clicks,
//     }));

//     return res.status(200).json({ data: formatted });
//   } catch (error) {
//     return res.status(500).json({
//       message: "error occured on  getAll Url with  Click",
//       status: "false",
//     });
//   }
// };

export const listAllUrl = async (req, res, next) => {
  const userId = req.user?.userId;

  // if (!userId) {
  //   return res.status(401).json({ message: "Not authenticated" });
  // }

  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: "Invalid user ID" });
  // }

  try {
    const urls = await Url.find(
      { user: userId },
      {
        originalUrl: 1,
        alias: 1,
        clicks: 1,
        expiresAt: 1,
        createdAt: 1,
        linkType: 1,
        newUrl: 1,
        _id: 0,
      }
    ).sort({ createdAt: -1 });

    const result = urls.map((url) => {
      const now = new Date();
      const createdAgo = dayjs(url.createdAt).fromNow();

      let expiresIn = null;
      let expired = false;

      // FULL FORMAT FOR CREATED AT
      const createdOnFull = url.createdAt.toLocaleString("en-NG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // FULL FORMAT FOR EXPIRES AT
      let expiresOnFull = "Never";

      if (url.expiresAt) {
        if (now > url.expiresAt) {
          expired = true;
          expiresIn = "Expired";
        } else {
          expiresIn = dayjs(url.expiresAt).fromNow();
        }

        expiresOnFull = url.expiresAt.toLocaleString("en-NG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else {
        expiresIn = "Never";
      }

      return {
        originalUrl: url.originalUrl,
        alias: url.alias,
        clicks: url.clicks,
        linkType: url.linkType,
        shortUrl: url.newUrl,
        createdAgo,
        createdOnFull, // 👈 EXACT DATE + TIME
        expiresIn,
        expiresOnFull, // 👈 EXACT EXPIRES DATE + TIME
        expired,
      };
    });

    return res.status(200).json({ data: result });
  } catch (err) {
    // return res.status(500).json({
    //   message: "Error occurred while listing URLs",
    //   status: false,
    //   error,
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
