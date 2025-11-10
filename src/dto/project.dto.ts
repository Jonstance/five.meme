import { Wallet } from "ethers";

export type ProjectDTO = {
  name?: string;

  symbol?: string;

  decimals?: number;

  logo?: string;

  presaleRate?: number;

  listingRate?: number;

  whitelist?: Boolean;

  softcap?: number;

  hardcap?: number;

  router?: string;

  refundType?: string;

  minBNB?: number;

  maxBNB?: number;

  liqPercent?: number;

  liqLockTime?: number;

  website?: string;

  description?: string;

  facebook?: string;

  twitter?: string;

  github?: string;

  telegram?: string;

  instagram?: string;

  discord?: string;

  reddit?: string;

  startTime?: Date;

  endTime?: Date;

  address?: string;

  tier?: number;

  firstRelease?: number;

  cyclePeriod?: number;

  tokenPerCycle?: number;

  vestEnabled?: Boolean;

  approved?: Boolean;

  bought?: number;

  ended?: Boolean;

  participants?: number;

  admin_wallet?: string;
  
  presaleAddress?: string;
  
  verification?: any[] | null;
};


export class NewProjectDto{
  _id?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  logo?: string;
  presaleRate?: number
  listingRate?: number;
  whitelist?: boolean;
  softcap?: number;
  hardcap?: number
  refundType?: string;
  router?: string;
  minBNB?: number;
  maxBNB?: number;
  liqPercent?: number;
  liqLockTime?: number;
  website?: string;
  description?: string;
  facebook?: string;
  twitter?: string;
  github?: string;
  telegram?: string;
  instagram?: string;
  discord?: string;
  reddit?: string;
  startTime?: string | Date;
  endTime?:  string | Date;
  address?: string;
  firstRelease?: number;
  cyclePeriod?: number;
  tokenPerCycle?: number;
  vestEnabled?: boolean;
  approved?: boolean;
  bought?: number;
  ended?: boolean;
  participants?: number;
  admin_wallet?: string;
  presaleAddress?: string;
  verification?: any[] | null;
  status?: string;
  createdAt?:  string | Date;
  isDeleted?: boolean;
  __v?: number
}