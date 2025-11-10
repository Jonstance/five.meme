import mongoose, { Schema, Document } from "mongoose";
import { ProjectDto } from "../../dto/project.dto";

const projectSchema: Schema = new Schema<ProjectDto>({
  name: String,
  symbol: String,
  decimals: Number,
  logo: String,
  presaleRate: Number,
  listingRate: Number,
  whitelist: Boolean,
  softcap: Number,
  hardcap: Number,
  refundType: String,
  router: String,
  minBNB: Number,
  maxBNB: Number,
  liqPercent: Number,
  liqLockTime: Number,
  website: String,
  description: String,
  facebook: String,
  twitter: String,
  github: String,
  telegram: String,
  instagram: String,
  discord: String,
  reddit: String,
  startTime: Date,
  endTime: Date,
  address: String,
  tier: Number,
  firstRelease: Number,
  cyclePeriod: Number,
  tokenPerCycle: Number,
  vestEnabled: Boolean,
  approved: Boolean,
  bought: Number,
  ended: Boolean,
  participants: Number,
  admin_wallet: String,
  presaleAddress: String,
  verification: [String],
  status: String,
  createdAt: Date,
  isDeleted: { type: Boolean, defaults: false }
});

projectSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

projectSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

export interface ProjectModel extends ProjectDto, Document {}

// const ProjectModel = model<ProjectDto>('projects', projectSchema);
export default mongoose.model<ProjectModel>("projects", projectSchema);
