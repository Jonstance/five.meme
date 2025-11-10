import { UpdateVerificationDto } from "../dto/update-verification.dto";
import HttpException from "../errorHandling/Exceptions/httpException";
import projectService from "./project.service";
import HttpStatusCode from "../errorHandling/statusCodes/httpStatusCodes";
import { ErrorMessages } from "../errorHandling/errorMessages/errorMessages";
import ProjectModel from "../db/models/project.model";
import { sign } from "crypto";
import adminModel from "../db/models/admin.model";
import bcrypt = require("bcryptjs");



export async function updateVerification(
  updateVerificationDto: UpdateVerificationDto
) {
  try {
    if (!updateVerificationDto.id) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "id " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }

    const isAvailable = await projectService.findOneProject(
      updateVerificationDto.id
    );
    if (!isAvailable) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Project " + ErrorMessages.NO_RECORD_FOUND
      );
    }

    let project: any;
    if (isAvailable?.verification) {
      const vs = isAvailable?.verification.filter(
        (val: any) => val !== updateVerificationDto.verification && val !== null
      );
      let newV = [...vs, updateVerificationDto.verification];
      project = await ProjectModel.findByIdAndUpdate(updateVerificationDto.id, {
        verification: newV,
      });
    } else {
      project = await ProjectModel.findByIdAndUpdate(
        updateVerificationDto.id,
        { verification: [updateVerificationDto.verification] },
        { upsert: true }
      );
    }

    if (!project) {
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorMessages.UPDATE_FAILED
      );
    }
    return project;
  } catch (error: any) {
    throw new HttpException(error.status, error.message);
  }
}

export async function  signUp({email, password}: {email: string, password: string}){
  try {
    if(!email){
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "email " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }
    if (!password) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "password " + ErrorMessages.CANNOT_BE_EMPTY
      );
    }



    const emailExists = await adminModel.findOne({email: email});
     if (emailExists) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "Email Already exists!"
      );
     }

     const user = await adminModel.create({
      email,
      password: bcrypt.hashSync(password, 8),
     })

     if(!user){
      throw new HttpException(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Sorry We could\'t create that user"
      );
     }

     return user;
  } catch (error) {
    throw new HttpException(error.status, error.message)
  }
}

export default {
  updateVerification,
  signUp
};
