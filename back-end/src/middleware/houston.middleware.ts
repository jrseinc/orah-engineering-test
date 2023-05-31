import { Request, Response, NextFunction } from "express";

/**
 * Custom error object interface with optional statusCode and required message.
 */
export interface HoustonCustomError extends Error {
  statusCode?: number;
  message: any;
}

/**
 * Error handling middleware for handling custom errors in the Express application.
 * @param {HoustonCustomError} error - The custom error object.
 * @param {Request} request - The request object.
 * @param {Response} response - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function houston(
  error: HoustonCustomError,
  request: Request,
  response: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  console.log(error); // Log the error for debugging purposes

  response.status(statusCode).json({ error: message }); // Send the error response
}
