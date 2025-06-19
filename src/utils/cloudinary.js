import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { configDotenv } from "dotenv";

configDotenv({
  path: "./.env",
});

//Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//Upload image to Cloudinary
export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      return null;
    }
    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File uploaded to Cloudinary:", res);
    fs.unlinkSync(filePath);
    return res;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    fs.unlinkSync(filePath);
    return null;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted Successfully ", response);
  } catch (error) {
    console.log("Delete from Cloudinary Failed: ", error);
    return null;
  }
};
