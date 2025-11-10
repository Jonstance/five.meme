export enum verificationTypes {
  KYC = "KYC",
  AUDIT = "AUDIT",
  SAFU = "SAFU",
}

export type UpdateVerificationDto = {
  verification: string | verificationTypes;
  id: string;
};
