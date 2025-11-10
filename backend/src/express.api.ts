import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { json, urlencoded } from "body-parser";
import * as http from "http";
import { Api } from "./helpers/api";
// import { ConfigManager, Config } from "./config";
import { AppRouting } from "./app.routing";
import compression = require("compression");
import cors = require("cors");
import { Server } from "./routes/server";
import express = require("express");
import mongoose from "mongoose";
import cookieSession = require("cookie-session");
require("dotenv").config();

export class ExpressApi {
  public app: express.Express;
  private router: express.Router;
  // private config: Config;

  constructor() {
    // this.config = new ConfigManager().config;
    this.app = express();
    this.app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5173/',
        'https://pad.meme',
        'https://www.pad.meme',
        'https://www.pad.meme/'
      ];
      
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

    this.router = express.Router();
    this.configure();
  }

  private configure() {
    this.configureMiddleware();
    this.configureBaseRoute();
    this.configureRoutes();
    this.errorHandler();
  }

  private configureMiddleware() {

    this.app.use(json({ limit: "50mb" }));
    this.app.use(compression());
    this.app.use(urlencoded({ limit: "50mb", extended: true }));
    this.app.use(
      cookieSession({
        name: "bezkoder-session",
        secret: process.env.JWT_SECRET || "beishfbsjgdvsvdgsvjdgzkoder-secret-key", // should use as secret environment variable
        httpOnly: true,
        sameSite: 'strict'
      })
    );
    
  }

  private configureBaseRoute() {
    this.app.use((request, res, next) => {
      if (request.url === "/") {
        return Api.ok(request, res, {
          name: "pad.meme",
          version: "2.0.0",
          env: "dev",
        });
      } else {
        next();
      }
    });
    this.app.use("/", this.router);
    new AppRouting(this.router);
  }

  private configureRoutes() {
    this.app.use((request: Request, res: Response, next: NextFunction) => {
      for (const key in request.query) {
        if (key) {
          request.query[key.toLowerCase()] = request.query[key];
        }
      }
      next();
    });
  }

  private errorHandler() {
    this.app.use(
      (
        error: ErrorRequestHandler,
        request: Request,
        res: Response,
        next: NextFunction
      ) => {
        if (request.body) {
        }
        Api.serverError(request, res, error);
      }
    );

    // catch 404 and forward to error handler
    this.app.use((request, res) => {
      Api.notFound(request, res);
    });
  }

  public run() {
    const serv = new Server();
    const port = process.env.BACKEND_PORT || 3001;
    const server = http.createServer(this.app);
    server.listen(port);
    server.on("error", this.onError);
    console.log({ port });
  }

  private onError(error: any) {
    const port = error.port;
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}