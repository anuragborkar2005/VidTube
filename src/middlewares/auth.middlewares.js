import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  console.log("verifyJwt: req.cookies:", req.cookies);
  console.log("verifyJwt: Authorization header:", req.header("Authorization"));
  let token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.log("Unauthorised");
      throw new ApiError(401, "Unauthorized");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Invalid Access Token");
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
