import Url from "../models/urlModel.js";
import { urlSchema } from "../validator/urlValidator.js";

export const createurl = async (req, res) => {
  const result = urlSchema.safeParse(req.body);

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
        return res.status(404).json({
          message: "alias must be unique",
        });
      }
    }

    if (result.data.linkType === "protected" && !result.data.password) {
      return res
        .status(400)
        .json({ message: "Password is required for protected links" });
    }
    const url = await Url.create({
      originalUrl: result.data.originalUrl,
      alias: result.data.alias || "", // default to empty string
      expiresAt: result.data.setExpiry ? new Date(result.data.setExpiry) : null, // you can use null for optional date
      password: result.data.password || "", // default to empty string
      linkType: result.data.linkType || "", // default to empty string
    });

    console.log(url);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const redirectUrl = async (req, res) => {
  const { alias } = req.params;

  try {
    const findAlias = await Url.findOne({ alias });
    // console.log("findAlias", findAlias);

    // console.log("findAlias", findAlias);
    if (!findAlias) {
      return res.status(404).json({ message: "Link not found" });
    }
    if (findAlias.expiresAt && new Date() > findAlias.expiresAt) {
      return res.status(410).json({ message: "Link has expired" });
    }

    if (findAlias.linkType === "protected") {
      const { password } = req.body;
      if (findAlias.password !== password || !password) {
        return res.status(403).json({ message: "Password Required" });
      }
      await urlCount(alias);

      return res.redirect(findAlias.originalUrl);
    }

    //urlCount(alias);

    await urlCount(alias);

    return res.redirect(findAlias.originalUrl);

    console.log("data after click increment", data);
  } catch (error) {
    console.error("Error during redirection:", error);
  }
};

export const urlCount = async (alias) => {
  try {
    // Increment clicks atomically
    const updatedUrl = await Url.findOneAndUpdate(
      { alias: alias },
      { $inc: { clicks: 1 } },
      { new: true } // return the updated document
    );

    if (!updatedUrl) {
      console.log("URL not found for alias:", alias);
      return null;
    }

    console.log("Data after click increment:", updatedUrl);
    return updatedUrl;
  } catch (error) {
    console.error("Error incrementing click count:", error);
    throw error;
  }
};



export const getAllUrlsWithClicks = async (req, res) => {
  try {
    const urls = await Url.find(
      {},
      { originalUrl: 1, alias: 1, clicks: 1, _id: 0 }
    ).sort({ clicks: -1 }).limit(5) // optional: sort by clicks descending

    return res.status(200).json({ data: urls });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



//import dayjs from "dayjs";
//import relativeTime from "dayjs/plugin/relativeTime";

//dayjs.extend(relativeTime);

export const listAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({}, {
      originalUrl: 1,
      alias: 1,
      clicks: 1,
      expiresAt: 1,
      createdAt: 1,
      _id: 0
    }).sort({ createdAt: -1 }); // newest first

    const result = urls.map(url => {
      const now = new Date();
      const createdAgo = dayjs(url.createdAt).fromNow(); // e.g., "2 days ago"

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
        createdAgo,
        expiresIn,
        expired
      };
    });

    return res.status(200).json({ data: result });

  } catch (error) {
    console.error("Error listing URLs:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
