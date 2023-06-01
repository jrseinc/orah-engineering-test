import { Request, Response, NextFunction } from "express";

/**
 * Custom Class For Handling Errors
 */
export class HoustonCustomError extends Error {
  constructor(public readonly statusCode: number, message: string,public readonly errors?: any) {
    super(message)
  }
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
  const errors = error.errors || {}

  console.log(error); // Log the error for debugging purposes

  response.status(statusCode).json({ message, errors }); // Send the error response
}
