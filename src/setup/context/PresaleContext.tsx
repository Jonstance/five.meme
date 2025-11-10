import { useState, createContext, useContext, ReactNode, useCallback } from "react";

// Define proper TypeScript interfaces
export interface PresaleData {
  // Token Information
  tokenAddress: string;
  tokenName: string;
  tokenDecimal: number;
  tokenSymbol: string;
  
  // Presale Configuration
  presaleRate: number;
  whitelist: boolean;
  softcap: number;
  hardcap: number;
  minimumBuy: number;
  maximumBuy: number;
  
  // Launch Configuration
  refundType: 'refund' | 'burn' | '';
  router: string;
  liquidity: number;
  listingRate: number;
  startTime: string;
  endTime: string;
  liquidityLockup: number;
  
  // Social Links & Branding
  logoUrl: string;
  websiteLink: string;
  twitterLink: string;
  instagramLink: string;
  facebookLink: string;
  telegramLink: string;
  githubLink: string;
  discordLink: string;
  redditLink: string;
  description: string;
  
  // Vesting Configuration
  vesting: boolean;
  firstReleaseForPresale: number;
  vestingPeriodEachCycle: number;
  presaleTokenReleaseEachCycle: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PresaleContextType {
  // State values
  tokenAddress: string;
  tokenName: string;
  tokenDecimal: number;
  tokenSymbol: string;
  presaleRate: number;
  whitelist: boolean;
  softcap: number;
  hardcap: number;
  minimumBuy: number;
  maximumBuy: number;
  refundType: 'refund' | 'burn' | '';
  router: string;
  liquidity: number;
  listingRate: number;
  startTime: string;
  endTime: string;
  liquidityLockup: number;
  logoUrl: string;
  websiteLink: string;
  twitterLink: string;
  instagramLink: string;
  facebookLink: string;
  telegramLink: string;
  githubLink: string;
  discordLink: string;
  redditLink: string;
  description: string;
  vesting: boolean;
  firstReleaseForPresale: number;
  vestingPeriodEachCycle: number;
  presaleTokenReleaseEachCycle: number;
  
  // Setters
  setTokenAddress: (value: string) => void;
  setTokenName: (value: string) => void;
  setTokenDecimal: (value: number) => void;
  setTokenSymbol: (value: string) => void;
  setPresaleRate: (value: number) => void;
  setWhitelist: (value: boolean) => void;
  setSoftcap: (value: number) => void;
  setHardcap: (value: number) => void;
  setMinimumBuy: (value: number) => void;
  setMaximumBuy: (value: number) => void;
  setRefundType: (value: 'refund' | 'burn' | '') => void;
  setRouter: (value: string) => void;
  setLiquidity: (value: number) => void;
  setListingRate: (value: number) => void;
  setStartTime: (value: string) => void;
  setEndTime: (value: string) => void;
  setLiquidityLockup: (value: number) => void;
  setLogoUrl: (value: string) => void;
  setWebsiteLink: (value: string) => void;
  setTwitterLink: (value: string) => void;
  setInstagramLink: (value: string) => void;
  setFacebookLink: (value: string) => void;
  setTelegramLink: (value: string) => void;
  setGithubLink: (value: string) => void;
  setDiscordLink: (value: string) => void;
  setRedditLink: (value: string) => void;
  setDescription: (value: string) => void;
  setVesting: (value: boolean) => void;
  setFirstReleaseForPresale: (value: number) => void;
  setVestingPeriodEachCycle: (value: number) => void;
  setPresaleTokenReleaseEachCycle: (value: number) => void;
  
  // Helper functions
  resetForm: () => void;
  validateForm: () => ValidationError[];
  getPresaleData: () => PresaleData;
  setPresaleData: (data: Partial<PresaleData>) => void;
  calculateTokensForSale: () => number;
  calculateMinTokensNeeded: () => number;
  isFormValid: boolean;
}

interface PresaleProviderProps {
  children: ReactNode;
}

// Create context with undefined default
export const PresaleContext = createContext<PresaleContextType | undefined>(undefined);

// Default values
const defaultValues: PresaleData = {
  tokenAddress: "",
  tokenName: "",
  tokenDecimal: 0,
  tokenSymbol: "",
  presaleRate: 0,
  whitelist: false,
  softcap: 0,
  hardcap: 0,
  minimumBuy: 0,
  maximumBuy: 0,
  refundType: "",
  router: "",
  liquidity: 0,
  listingRate: 0,
  startTime: "",
  endTime: "",
  liquidityLockup: 0,
  logoUrl: "",
  websiteLink: "",
  twitterLink: "",
  instagramLink: "",
  facebookLink: "",
  telegramLink: "",
  githubLink: "",
  discordLink: "",
  redditLink: "",
  description: "",
  vesting: false,
  firstReleaseForPresale: 0,
  vestingPeriodEachCycle: 0,
  presaleTokenReleaseEachCycle: 0,
};

const PresaleProvider: React.FC<PresaleProviderProps> = ({ children }) => {
  // Token Information
  const [tokenAddress, setTokenAddress] = useState<string>(defaultValues.tokenAddress);
  const [tokenName, setTokenName] = useState<string>(defaultValues.tokenName);
  const [tokenDecimal, setTokenDecimal] = useState<number>(defaultValues.tokenDecimal);
  const [tokenSymbol, setTokenSymbol] = useState<string>(defaultValues.tokenSymbol);
  
  // Presale Configuration
  const [presaleRate, setPresaleRate] = useState<number>(defaultValues.presaleRate);
  const [whitelist, setWhitelist] = useState<boolean>(defaultValues.whitelist);
  const [softcap, setSoftcap] = useState<number>(defaultValues.softcap);
  const [hardcap, setHardcap] = useState<number>(defaultValues.hardcap);
  const [minimumBuy, setMinimumBuy] = useState<number>(defaultValues.minimumBuy);
  const [maximumBuy, setMaximumBuy] = useState<number>(defaultValues.maximumBuy);
  
  // Launch Configuration
  const [refundType, setRefundType] = useState<'refund' | 'burn' | ''>(defaultValues.refundType);
  const [router, setRouter] = useState<string>(defaultValues.router);
  const [liquidity, setLiquidity] = useState<number>(defaultValues.liquidity);
  const [listingRate, setListingRate] = useState<number>(defaultValues.listingRate);
  const [startTime, setStartTime] = useState<string>(defaultValues.startTime);
  const [endTime, setEndTime] = useState<string>(defaultValues.endTime);
  const [liquidityLockup, setLiquidityLockup] = useState<number>(defaultValues.liquidityLockup);
  
  // Social Links & Branding
  const [logoUrl, setLogoUrl] = useState<string>(defaultValues.logoUrl);
  const [websiteLink, setWebsiteLink] = useState<string>(defaultValues.websiteLink);
  const [twitterLink, setTwitterLink] = useState<string>(defaultValues.twitterLink);
  const [instagramLink, setInstagramLink] = useState<string>(defaultValues.instagramLink);
  const [facebookLink, setFacebookLink] = useState<string>(defaultValues.facebookLink);
  const [telegramLink, setTelegramLink] = useState<string>(defaultValues.telegramLink);
  const [githubLink, setGithubLink] = useState<string>(defaultValues.githubLink);
  const [discordLink, setDiscordLink] = useState<string>(defaultValues.discordLink);
  const [redditLink, setRedditLink] = useState<string>(defaultValues.redditLink);
  const [description, setDescription] = useState<string>(defaultValues.description);
  
  // Vesting Configuration
  const [vesting, setVesting] = useState<boolean>(defaultValues.vesting);
  const [firstReleaseForPresale, setFirstReleaseForPresale] = useState<number>(defaultValues.firstReleaseForPresale);
  const [vestingPeriodEachCycle, setVestingPeriodEachCycle] = useState<number>(defaultValues.vestingPeriodEachCycle);
  const [presaleTokenReleaseEachCycle, setPresaleTokenReleaseEachCycle] = useState<number>(defaultValues.presaleTokenReleaseEachCycle);

  // Helper function to reset all form data
  const resetForm = useCallback(() => {
    setTokenAddress(defaultValues.tokenAddress);
    setTokenName(defaultValues.tokenName);
    setTokenDecimal(defaultValues.tokenDecimal);
    setTokenSymbol(defaultValues.tokenSymbol);
    setPresaleRate(defaultValues.presaleRate);
    setWhitelist(defaultValues.whitelist);
    setSoftcap(defaultValues.softcap);
    setHardcap(defaultValues.hardcap);
    setMinimumBuy(defaultValues.minimumBuy);
    setMaximumBuy(defaultValues.maximumBuy);
    setRefundType(defaultValues.refundType);
    setRouter(defaultValues.router);
    setLiquidity(defaultValues.liquidity);
    setListingRate(defaultValues.listingRate);
    setStartTime(defaultValues.startTime);
    setEndTime(defaultValues.endTime);
    setLiquidityLockup(defaultValues.liquidityLockup);
    setLogoUrl(defaultValues.logoUrl);
    setWebsiteLink(defaultValues.websiteLink);
    setTwitterLink(defaultValues.twitterLink);
    setInstagramLink(defaultValues.instagramLink);
    setFacebookLink(defaultValues.facebookLink);
    setTelegramLink(defaultValues.telegramLink);
    setGithubLink(defaultValues.githubLink);
    setDiscordLink(defaultValues.discordLink);
    setRedditLink(defaultValues.redditLink);
    setDescription(defaultValues.description);
    setVesting(defaultValues.vesting);
    setFirstReleaseForPresale(defaultValues.firstReleaseForPresale);
    setVestingPeriodEachCycle(defaultValues.vestingPeriodEachCycle);
    setPresaleTokenReleaseEachCycle(defaultValues.presaleTokenReleaseEachCycle);
  }, []);

  // Validation function
  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Token validation
    if (!tokenAddress.trim()) {
      errors.push({ field: 'tokenAddress', message: 'Token address is required' });
    }
    if (!tokenName.trim()) {
      errors.push({ field: 'tokenName', message: 'Token name is required' });
    }
    if (!tokenSymbol.trim()) {
      errors.push({ field: 'tokenSymbol', message: 'Token symbol is required' });
    }
    if (tokenDecimal < 0 || tokenDecimal > 18) {
      errors.push({ field: 'tokenDecimal', message: 'Token decimals must be between 0 and 18' });
    }

    // Presale configuration validation
    if (presaleRate <= 0) {
      errors.push({ field: 'presaleRate', message: 'Presale rate must be greater than 0' });
    }
    if (softcap <= 0) {
      errors.push({ field: 'softcap', message: 'Softcap must be greater than 0' });
    }
    if (hardcap <= softcap) {
      errors.push({ field: 'hardcap', message: 'Hardcap must be greater than softcap' });
    }
    if (minimumBuy <= 0) {
      errors.push({ field: 'minimumBuy', message: 'Minimum buy must be greater than 0' });
    }
    if (maximumBuy <= minimumBuy) {
      errors.push({ field: 'maximumBuy', message: 'Maximum buy must be greater than minimum buy' });
    }

    // Time validation
    if (!startTime) {
      errors.push({ field: 'startTime', message: 'Start time is required' });
    }
    if (!endTime) {
      errors.push({ field: 'endTime', message: 'End time is required' });
    }
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      errors.push({ field: 'endTime', message: 'End time must be after start time' });
    }
    if (startTime && new Date(startTime) <= new Date()) {
      errors.push({ field: 'startTime', message: 'Start time must be in the future' });
    }

    // Launch configuration validation
    if (!refundType) {
      errors.push({ field: 'refundType', message: 'Refund type is required' });
    }
    if (liquidity <= 0 || liquidity > 100) {
      errors.push({ field: 'liquidity', message: 'Liquidity percentage must be between 1 and 100' });
    }
    if (listingRate <= 0) {
      errors.push({ field: 'listingRate', message: 'Listing rate must be greater than 0' });
    }

    // Vesting validation
    if (vesting) {
      if (firstReleaseForPresale < 0 || firstReleaseForPresale > 100) {
        errors.push({ field: 'firstReleaseForPresale', message: 'First release must be between 0 and 100%' });
      }
      if (vestingPeriodEachCycle <= 0) {
        errors.push({ field: 'vestingPeriodEachCycle', message: 'Vesting period must be greater than 0' });
      }
      if (presaleTokenReleaseEachCycle <= 0) {
        errors.push({ field: 'presaleTokenReleaseEachCycle', message: 'Token release per cycle must be greater than 0' });
      }
    }

    return errors;
  }, [
    tokenAddress, tokenName, tokenSymbol, tokenDecimal, presaleRate,
    softcap, hardcap, minimumBuy, maximumBuy, startTime, endTime,
    refundType, liquidity, listingRate, vesting, firstReleaseForPresale,
    vestingPeriodEachCycle, presaleTokenReleaseEachCycle
  ]);

  // Get all presale data as object
  const getPresaleData = useCallback((): PresaleData => ({
    tokenAddress,
    tokenName,
    tokenDecimal,
    tokenSymbol,
    presaleRate,
    whitelist,
    softcap,
    hardcap,
    minimumBuy,
    maximumBuy,
    refundType,
    router,
    liquidity,
    listingRate,
    startTime,
    endTime,
    liquidityLockup,
    logoUrl,
    websiteLink,
    twitterLink,
    instagramLink,
    facebookLink,
    telegramLink,
    githubLink,
    discordLink,
    redditLink,
    description,
    vesting,
    firstReleaseForPresale,
    vestingPeriodEachCycle,
    presaleTokenReleaseEachCycle,
  }), [
    tokenAddress, tokenName, tokenDecimal, tokenSymbol, presaleRate,
    whitelist, softcap, hardcap, minimumBuy, maximumBuy, refundType,
    router, liquidity, listingRate, startTime, endTime, liquidityLockup,
    logoUrl, websiteLink, twitterLink, instagramLink, facebookLink,
    telegramLink, githubLink, discordLink, redditLink, description,
    vesting, firstReleaseForPresale, vestingPeriodEachCycle, presaleTokenReleaseEachCycle
  ]);

  // Set presale data from object
  const setPresaleData = useCallback((data: Partial<PresaleData>) => {
    if (data.tokenAddress !== undefined) setTokenAddress(data.tokenAddress);
    if (data.tokenName !== undefined) setTokenName(data.tokenName);
    if (data.tokenDecimal !== undefined) setTokenDecimal(data.tokenDecimal);
    if (data.tokenSymbol !== undefined) setTokenSymbol(data.tokenSymbol);
    if (data.presaleRate !== undefined) setPresaleRate(data.presaleRate);
    if (data.whitelist !== undefined) setWhitelist(data.whitelist);
    if (data.softcap !== undefined) setSoftcap(data.softcap);
    if (data.hardcap !== undefined) setHardcap(data.hardcap);
    if (data.minimumBuy !== undefined) setMinimumBuy(data.minimumBuy);
    if (data.maximumBuy !== undefined) setMaximumBuy(data.maximumBuy);
    if (data.refundType !== undefined) setRefundType(data.refundType);
    if (data.router !== undefined) setRouter(data.router);
    if (data.liquidity !== undefined) setLiquidity(data.liquidity);
    if (data.listingRate !== undefined) setListingRate(data.listingRate);
    if (data.startTime !== undefined) setStartTime(data.startTime);
    if (data.endTime !== undefined) setEndTime(data.endTime);
    if (data.liquidityLockup !== undefined) setLiquidityLockup(data.liquidityLockup);
    if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
    if (data.websiteLink !== undefined) setWebsiteLink(data.websiteLink);
    if (data.twitterLink !== undefined) setTwitterLink(data.twitterLink);
    if (data.instagramLink !== undefined) setInstagramLink(data.instagramLink);
    if (data.facebookLink !== undefined) setFacebookLink(data.facebookLink);
    if (data.telegramLink !== undefined) setTelegramLink(data.telegramLink);
    if (data.githubLink !== undefined) setGithubLink(data.githubLink);
    if (data.discordLink !== undefined) setDiscordLink(data.discordLink);
    if (data.redditLink !== undefined) setRedditLink(data.redditLink);
    if (data.description !== undefined) setDescription(data.description);
    if (data.vesting !== undefined) setVesting(data.vesting);
    if (data.firstReleaseForPresale !== undefined) setFirstReleaseForPresale(data.firstReleaseForPresale);
    if (data.vestingPeriodEachCycle !== undefined) setVestingPeriodEachCycle(data.vestingPeriodEachCycle);
    if (data.presaleTokenReleaseEachCycle !== undefined) setPresaleTokenReleaseEachCycle(data.presaleTokenReleaseEachCycle);
  }, []);

  // Calculate total tokens needed for sale
  const calculateTokensForSale = useCallback((): number => {
    return hardcap * presaleRate;
  }, [hardcap, presaleRate]);

  // Calculate minimum tokens needed (including liquidity)
  const calculateMinTokensNeeded = useCallback((): number => {
    const tokensForSale = calculateTokensForSale();
    const tokensForLiquidity = (hardcap * liquidity / 100) * listingRate;
    return tokensForSale + tokensForLiquidity;
  }, [calculateTokensForSale, hardcap, liquidity, listingRate]);

  // Check if form is valid
  const isFormValid = validateForm().length === 0;

  const contextValue: PresaleContextType = {
    // State values
    tokenAddress,
    tokenName,
    tokenDecimal,
    tokenSymbol,
    presaleRate,
    whitelist,
    softcap,
    hardcap,
    minimumBuy,
    maximumBuy,
    refundType,
    router,
    liquidity,
    listingRate,
    startTime,
    endTime,
    liquidityLockup,
    logoUrl,
    websiteLink,
    twitterLink,
    instagramLink,
    facebookLink,
    telegramLink,
    githubLink,
    discordLink,
    redditLink,
    description,
    vesting,
    firstReleaseForPresale,
    vestingPeriodEachCycle,
    presaleTokenReleaseEachCycle,

    // Setters
    setTokenAddress,
    setTokenName,
    setTokenDecimal,
    setTokenSymbol,
    setPresaleRate,
    setWhitelist,
    setSoftcap,
    setHardcap,
    setMinimumBuy,
    setMaximumBuy,
    setRefundType,
    setRouter,
    setLiquidity,
    setListingRate,
    setStartTime,
    setEndTime,
    setLiquidityLockup,
    setLogoUrl,
    setWebsiteLink,
    setTwitterLink,
    setInstagramLink,
    setFacebookLink,
    setTelegramLink,
    setGithubLink,
    setDiscordLink,
    setRedditLink,
    setDescription,
    setVesting,
    setFirstReleaseForPresale,
    setVestingPeriodEachCycle,
    setPresaleTokenReleaseEachCycle,

    // Helper functions
    resetForm,
    validateForm,
    getPresaleData,
    setPresaleData,
    calculateTokensForSale,
    calculateMinTokensNeeded,
    isFormValid,
  };

  return (
    <PresaleContext.Provider value={contextValue}>
      {children}
    </PresaleContext.Provider>
  );
};

// Custom hook to use the presale context
export const usePresaleContext = (): PresaleContextType => {
  const context = useContext(PresaleContext);
  if (context === undefined) {
    throw new Error('usePresaleContext must be used within a PresaleProvider');
  }
  return context;
};

export default PresaleProvider;