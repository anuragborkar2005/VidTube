import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!err) {
    err = new Error("An unknown error occurred");
  }

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);

    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);

    const response = {
      ...error,
      message: error.message,
      ...(process.env.NODE_ENV === "developement"
        ? { stack: error.stack }
        : {}),
    };

    return res.status(error.statusCode).json(response);
  }
};

export { errorHandler };
