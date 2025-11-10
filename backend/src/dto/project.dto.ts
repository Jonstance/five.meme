

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

  startTime: string;

  endTime?: string;

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

  verification: any;

  admin_wallet: string;

  isDeleted?: Boolean;

  status?: String;

  presaleAddress?: String;

  createdAt?: string;
};

export class ProjectDto {
  name?: string;

  symbol?: string;

  decimals?: number;

  logo?: string;

  presaleRate?: number;

  listingRate?: number;

  whitelist?: Boolean;

  softcap?: number;

  hardcap?: number;

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

  startTime!: string;

  endTime?: string;

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

  verification?: any;

  admin_wallet?: string;

  isDeleted?: Boolean;

  presaleAddress?: String;

  status?: String; 

  createdAt?: string;
  }

  export enum StatusEnum {
    COMING_SOON ="Coming Soon",
    LIVE ="Live",

    FAILED = "Failed",

    COMPLETED = "Completed", 

    FINALISE = "Finalise"
  }