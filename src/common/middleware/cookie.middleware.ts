/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { envConfig } from "../config/env";

@Injectable()
export class CookieMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const token = req.cookies?.authToken; // The auth token cookie
    const refreshToken = req.cookies?.refreshToken; // The refresh token cookie

    // Extract user information from the auth token
    if (token) {
      try {
        const decoded = jwt.verify(token, envConfig("JWT_SECRET"));
        req["user"] = decoded; // Attach the decoded user to the request
        console.log("decoded", decoded);
      } catch (error) {
        console.error(
          `[${HttpStatus.UNAUTHORIZED}] Invalid auth token:`,
          (error as Error).message
        );
      }
    }

    // Extract refresh token information
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, envConfig("JWT_SECRET"));
        req["refreshToken"] = decoded; // Attach the decoded refresh token to the request
      } catch (error) {
        console.error(
          `[${HttpStatus.UNAUTHORIZED}] Invalid refresh token:`,
          (error as Error).message
        );
      }
    }

    next();
  }
}
