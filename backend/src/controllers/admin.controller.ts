import { Request, Response, Router } from "express";
import HttpException from "../errorHandling/Exceptions/httpException";
import AdminService from "../services/admin.service";
import { AppRoute } from "../app-route";
import adminModel from "../db/models/admin.model";
import { Api } from "../helpers";
import jwt = require("jsonwebtoken");
import bcrypt = require("bcryptjs");
import Config from "../config/auth.config";
import authJwt from "../middlewares/authJwt";
import projectModel from "../db/models/project.model";
export class AdminController implements AppRoute {
  public route = "/admin";
  public router: Router = Router();
  constructor() {
    this.router.post(
      "/verify",
      [authJwt.verifyToken, authJwt.isAdmin],
      this.vefication
    );
    this.router.post("/login", this.login);
    this.router.post("/signup", this.signup);
    this.router.get("/signout", this.signout);
    this.router.get(
      "/cancel/:id",
      [authJwt.verifyToken, authJwt.isAdmin],
      this.cancelPresale
    );
  }

  async vefication(req: Request, res: Response) {
    try {
      const verification = req.body;
      const updated = await AdminService.updateVerification(verification);
      return Api.ok(req, res, updated);
    } catch (error: any) {
      throw new HttpException(error.status, error.message);
    }
  }

  async cancelPresale(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const project = await projectModel.findOneAndUpdate(
        { _id: id },
        {
          isDeleted: true,
        }
      );
      if (project)
        return res.status(200).send({ message: "presale cancelled" });

      return res
        .status(500)
        .send({ message: "sorry something went wrong, we couldn't cancel it" });
    } catch (error: any) {
      return res.status(500).send({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const user = await adminModel.findOne({ email: req.body.email });

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          message: "Invalid Password!",
        });
      }

      const token = jwt.sign({ id: user.id }, Config.secret, {
        expiresIn: 86400, // 24 hours
      });

      if (req.session !== undefined) {
        req.session.token = token;
      }

      return res.status(200).send({
        id: user.id,
        email: user.email,
        token
      });
    } catch (error: any) {
      return res.status(500).send({ message: error.message });
    }
  }

  async signup(req: Request, res: Response) {
    try {
      const ip = req.ip;
      const allowedIp = process.env.ALLOWED_IP;
      if(allowedIp){
        if(ip !== allowedIp){
          res.status(401).send({ message: "Sorry, You're not permitted to create accounts" });
          return;
        }   
      }

      const user = await AdminService.signUp({email: req.body.email, password: req.body.password});
      console.log({ user });
      if (user) res.send({ message: "User registered successfully!" });
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  }

  async signout(req: Request, res: Response) {
    try {
      if (req.session !== undefined) {
        req.session = undefined;
      }
      return res.status(200).send({
        message: "You've been signed out!",
      });
    } catch (error: any) {
      return res.status(500).send({ message: error.message });
    }
  }
}
