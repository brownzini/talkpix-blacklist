import "dotenv/config";
import cors from "cors";
import "express-async-errors";

import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";

import { router } from "@interfaces/http/routes";
import { AppError } from "@infrastructure/errors/AppError";

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_FRONT_END_URL,
  credentials: true              
}));

app.use(express.json());
app.set("trust proxy", true);
app.use(router);

app.use(
  (err: Error, request: Request, response: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      return response.status(err.statusCode).json({
        message: err.message,
      });
    }
    return response.status(500).json({
      status: "error",
      message: `Internal server error - ${err.message}`,
    });
  }
);

export { app };
