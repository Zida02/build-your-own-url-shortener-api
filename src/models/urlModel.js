import mongoose from "mongoose";
import generateShortCode from "../utils/generateShortCode.js";


import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${env}`,
});


const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // references the User model
      required: true,
    },
    alias: {
      type: String,
    },
    newUrl: {
      type: String,
      required: true,
    },
    linkType: {
      type: String,
      enum: ["public", "private", "protected"],
      default: "public",
    },
    password: {
      type: String,
    },
    clicks: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    versionKey: false, // remove __v
  }
);

urlSchema.pre("validate", async function (next) {
  const baseUrl = "http://localhost:5050" || process.env.BASEURL;

  // Check if the user has NOT provided a shortCode
  if (!this.alias) {
    // ⬇️ Auto-generate code ONLY when the user hasn't provided one
    let code;
    let exists;
    do {
      code = generateShortCode();
      exists = await mongoose.models.Url.findOne({ alias: code });
    } while (exists);
    this.alias = code;
  } else {
    // ⬇️ User HAS provided a custom shortCode
    // We only need to check if it already exists (duplicate check)
    const exists = await mongoose.models.Url.findOne({
      alias: this.alias,
    });
    if (exists) {
      // If it exists, stop the save operation and return an error
      return next(new Error("Custom short code already exists"));
    }
    // If it does NOT exist, the code simply continues to the next step
    // without generating anything new, which is what you want.
  }

  // This runs for both cases: auto-generated or user-provided
  this.newUrl = `${baseUrl}/${this.alias}`;
  next();
});

const Url = mongoose.model("Url", urlSchema);
export default Url;
