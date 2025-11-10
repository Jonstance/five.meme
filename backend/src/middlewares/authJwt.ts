import jwt = require("jsonwebtoken");
import adminModel from "../db/models/admin.model";
import config from "../config/auth.config";
import { Request, Response, NextFunction } from "express";
// const User = db.user;

async function verifyToken(req: Request | any, res: Response, next: NextFunction) {
  let token = req.session ? req.session.token : "";
  if(!token){
    token = req.headers?.authorization;
  }

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
}

async function isAdmin(req: Request | any, res: Response, next: NextFunction) {
  try {
    const user = await adminModel.findById(req.userId);

    if (user) return next();

    return res.status(403).send({
      message: "Require Admin Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate User role!",
    });
  }
}

export default {
  verifyToken,
  isAdmin,
};
