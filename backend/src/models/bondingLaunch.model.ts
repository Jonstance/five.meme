import mongoose, { Schema, Document } from 'mongoose';

export interface IBondingLaunch extends Document {
  address: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  logoUrl: string;
  description: string;
  creator: string;
  createdAt: Date;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  progressPercent: number;
  holdersCount: number;
  currentPrice: number;
  liquidityBNB: number;
  verified: boolean;
  flagged: boolean;
  graduated: boolean;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  totalSupply: number;
  soldTokens: number;
  bnbRaised: number;
  lastUpdated: Date;
}

const BondingLaunchSchema: Schema = new Schema({
  address: { type: String, required: true, unique: true, index: true },
  tokenAddress: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  logoUrl: { type: String },
  description: { type: String },
  creator: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  marketCap: { type: Number, default: 0 },
  volume24h: { type: Number, default: 0, index: true },
  priceChange24h: { type: Number, default: 0 },
  progressPercent: { type: Number, default: 0 },
  holdersCount: { type: Number, default: 0 },
  currentPrice: { type: Number, default: 0 },
  liquidityBNB: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  flagged: { type: Boolean, default: false },
  graduated: { type: Boolean, default: false, index: true },
  website: { type: String },
  twitter: { type: String },
  telegram: { type: String },
  discord: { type: String },
  totalSupply: { type: Number, required: true },
  soldTokens: { type: Number, default: 0 },
  bnbRaised: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Indexes for efficient querying
BondingLaunchSchema.index({ marketCap: -1 });
BondingLaunchSchema.index({ createdAt: -1 });
BondingLaunchSchema.index({ graduated: 1, progressPercent: 1 });
BondingLaunchSchema.index({ name: 'text', symbol: 'text' });

export default mongoose.model<IBondingLaunch>('BondingLaunch', BondingLaunchSchema);
