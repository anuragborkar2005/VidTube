import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required to generate tokens");
  }
  const user = await User.findById(userId);

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.tokens?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(500, "Refresh token is missing in cookies");
  }
  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const user = await User.findById(decoded?._id);
    if (!user) {
      throw new ApiError(500, "Invalid Refresh Token");
    }
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    const { accessToken, refreshAccessToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", { refreshToken: newRefreshToken }, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access and Refresh Token generated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while refreshing access tokens"
    );
  }
});

const registerUser = asyncHandler(async (req, res) => {
  // if (!res.body) {
  //   throw new ApiError(400, "Request body is missing");
  // }
  const { fullname, username, email, password } = req.body;

  // if (!req.files || !req.files.avatar || !req.files.coverImage) {
  //   throw new ApiError(400, "Avatar and cover image are required");
  // }
  //validation
  //   if (!fullname?.trim() === "") {
  //     throw new ApiError(400, "fields are required");
  //   }
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const userExists = await User.findOne({ $or: [{ username }, { email }] });

  if (userExists) {
    throw new ApiError(409, "Username or email already exists");
  }

  console.warn("req.files", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing");
  }
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is missing");
  }
  // if (avatarLocalPath) {
  //   const avatar = await uploadOnCloudinary(avatarLocalPath);
  // }
  // if (coverImageLocalPath) {
  //   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // }

  let avatar, coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  } catch (error) {
    throw new ApiError(500, "Error uploading images to Cloudinary");
  }

  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      username: username.toLowerCase(),
      email,
      password,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken "
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
  } catch (error) {
    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw new ApiError(
      500,
      "Something went wrong while registering Image deleted successfully"
    );
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Something went wrong"));
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const userData = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userData) {
    throw new ApiError(500, "Something went wrong while logging in");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const option = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken, userData },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate();
});

export { registerUser, loginUser, logoutUser };
