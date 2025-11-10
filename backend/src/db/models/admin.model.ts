import mongoose, { Schema, Document } from "mongoose";
import { AdminLoginDto } from "../../dto/admin.dto";

const adminSchema: Schema = new Schema<AdminLoginDto>({
  email: {type: String, unique: true},
  password: String
});

export interface AdminModel extends AdminLoginDto, Document {}

export default mongoose.model<AdminModel>("admins", adminSchema);
