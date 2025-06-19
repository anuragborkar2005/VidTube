import jwt from "jsonwebtoken";
import { User } from "../models/user.models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  let token = req.cookie?.accessToken || req.header("Authorization");

  try {
  } catch (error) {}
});
