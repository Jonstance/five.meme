import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWalletClient, useAccount } from "wagmi";
import { ToastContainer, toast } from "react-toastify";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import copyIcon from "../../assets/icons/copy.svg";

import LockABI from "../../ABIs/Lock.json";
import STANDARDTOKEN_ABI from "../../ABIs/StandardToken.json";

import "./CreateLock.css";
import "react-toastify/dist/ReactToastify.css";

interface TokenInfo {
    balance: ethers.BigNumber | null;
    decimals: number | null;
    symbol: string;
    name: string;
    isValid: boolean;
}

interface LoadingState {
    fetchingToken: boolean;
    creatingLock: boolean;
}

interface ErrorState {
    token: string;
    amount: string;
    time: string;
}

// Constants
const LOCK_CONTRACT_ADDRESS = "0x89cb82123ece50ff6519ba01063af91023d06481";
const TOKEN_FETCH_DEBOUNCE_MS = 500;
const NAVIGATION_DELAY_MS = 2000;

const CreateLock = () => {
    // Form state
    const [token, setToken] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [isLiquidityToken, setIsLiquidityToken] = useState<boolean>(false);
    const [lockTitle, setLockTitle] = useState<string>("Token Lock");
    
    // Token info state
    const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
        balance: null,
        decimals: null,
        symbol: "",
        name: "",
        isValid: false
    });
    
    // UI state
    const [isLoading, setIsLoading] = useState<LoadingState>({
        fetchingToken: false,
        creatingLock: false
    });
    
    const [errors, setErrors] = useState<ErrorState>({
        token: "",
        amount: "",
        time: ""
    });

    const { data: walletClient } = useWalletClient();
    const { address: userWallet } = useAccount();
    const navigate = useNavigate();

    // Memoized validation functions
    const isValidAddress = useCallback((address: string): boolean => {
        try {
            return ethers.utils.isAddress(address);
        } catch {
            return false;
        }
    }, []);

    const isValidAmount = useCallback((amount: string, balance: ethers.BigNumber, decimals: number): boolean => {
        try {
            if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                return false;
            }
            const parsedAmount = ethers.utils.parseUnits(amount, decimals);
            return parsedAmount.gt(0) && parsedAmount.lte(balance);
        } catch {
            return false;
        }
    }, []);

    const isValidTime = useCallback((timeString: string): boolean => {
        try {
            const selectedTime = new Date(timeString);
            const now = new Date();
            // Add minimum lock time of 1 minute to prevent immediate unlocks
            const minLockTime = new Date(now.getTime() + 60000);
            return selectedTime > minLockTime;
        } catch {
            return false;
        }
    }, []);

    // Optimized debounce function with proper TypeScript typing
    const debounce = useCallback(<T extends (...args: any[]) => void>(
        func: T, 
        wait: number
    ): ((...args: Parameters<T>) => void) => {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }, []);

    // Enhanced error handling for token fetching
    const fetchTokenInfo = useCallback(
        debounce(async (tokenAddress: string) => {
            if (!isValidAddress(tokenAddress) || !walletClient || !userWallet) return;

            setIsLoading(prev => ({ ...prev, fetchingToken: true }));
            setErrors(prev => ({ ...prev, token: "" }));

            try {
                const provider = new ethers.providers.Web3Provider(walletClient.transport);
                const tokenContract = new ethers.Contract(tokenAddress, STANDARDTOKEN_ABI.abi, provider);

                // Use Promise.allSettled for better error handling
                const results = await Promise.allSettled([
                    tokenContract.balanceOf(userWallet),
                    tokenContract.decimals(),
                    tokenContract.symbol(),
                    tokenContract.name()
                ]);

                // Check if critical calls succeeded
                const [balanceResult, decimalsResult, symbolResult, nameResult] = results;
                
                if (balanceResult.status === 'rejected' || decimalsResult.status === 'rejected') {
                    throw new Error('Failed to fetch essential token information');
                }

                setTokenInfo({
                    balance: balanceResult.value,
                    decimals: decimalsResult.value,
                    symbol: symbolResult.status === 'fulfilled' ? symbolResult.value : "Unknown",
                    name: nameResult.status === 'fulfilled' ? nameResult.value : "Unknown Token",
                    isValid: true
                });
            } catch (error) {
                console.error('Token fetch error:', error);
                setTokenInfo({
                    balance: null,
                    decimals: null,
                    symbol: "",
                    name: "",
                    isValid: false
                });
                
                let errorMessage = "Invalid token address or unable to fetch token info";
                if (error instanceof Error) {
                    if (error.message.includes('network')) {
                        errorMessage = "Network error. Please check your connection.";
                    } else if (error.message.includes('revert')) {
                        errorMessage = "Token contract error. This may not be a valid ERC20 token.";
                    }
                }
                
                setErrors(prev => ({ ...prev, token: errorMessage }));
            } finally {
                setIsLoading(prev => ({ ...prev, fetchingToken: false }));
            }
        }, TOKEN_FETCH_DEBOUNCE_MS),
        [walletClient, userWallet, isValidAddress, debounce]
    );

    // Effect to fetch token info when token address changes
    useEffect(() => {
        if (token.trim()) {
            fetchTokenInfo(token.trim());
        } else {
            setTokenInfo({
                balance: null,
                decimals: null,
                symbol: "",
                name: "",
                isValid: false
            });
            setErrors(prev => ({ ...prev, token: "" }));
        }
    }, [token, fetchTokenInfo]);

    // Enhanced form validation with better error messages
    const validateForm = useCallback((): boolean => {
        const newErrors = { token: "", amount: "", time: "" };
        let isValid = true;

        // Token validation
        if (!token.trim()) {
            newErrors.token = "Token address is required";
            isValid = false;
        } else if (!isValidAddress(token.trim())) {
            newErrors.token = "Invalid token address format";
            isValid = false;
        } else if (!tokenInfo.isValid) {
            newErrors.token = "Unable to fetch token information. Please verify the address.";
            isValid = false;
        }

        // Amount validation with better error messages
        if (!amount.trim()) {
            newErrors.amount = "Amount is required";
            isValid = false;
        } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
            newErrors.amount = "Amount must be a positive number";
            isValid = false;
        } else if (tokenInfo.balance && tokenInfo.decimals) {
            if (!isValidAmount(amount, tokenInfo.balance, tokenInfo.decimals)) {
                const formattedBalance = ethers.utils.formatUnits(tokenInfo.balance, tokenInfo.decimals);
                newErrors.amount = `Amount exceeds available balance (${parseFloat(formattedBalance).toLocaleString()} ${tokenInfo.symbol})`;
                isValid = false;
            }
        }

        // Time validation with better error message
        if (!time.trim()) {
            newErrors.time = "Lock until date is required";
            isValid = false;
        } else if (!isValidTime(time)) {
            newErrors.time = "Lock date must be at least 1 minute in the future";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [token, amount, time, tokenInfo, isValidAddress, isValidAmount, isValidTime]);

    // Time preset helper functions
    const setTimeFromPreset = useCallback((value: number, unit: 'hour' | 'day' | 'week' | 'month' | 'year') => {
        const now = new Date();
        let futureDate = new Date(now);

        switch (unit) {
            case 'hour':
                futureDate.setHours(now.getHours() + value);
                break;
            case 'day':
                futureDate.setDate(now.getDate() + value);
                break;
            case 'week':
                futureDate.setDate(now.getDate() + (value * 7));
                break;
            case 'month':
                futureDate.setMonth(now.getMonth() + value);
                break;
            case 'year':
                futureDate.setFullYear(now.getFullYear() + value);
                break;
        }

        // Convert to datetime-local format
        const isoString = futureDate.toISOString();
        const localDateTime = isoString.slice(0, 16); // Remove seconds and timezone
        setTime(localDateTime);
    }, []);

    // Format selected time for display
    const formatSelectedTime = useCallback((timeString: string): string => {
        try {
            const date = new Date(timeString);
            return date.toLocaleString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return timeString;
        }
    }, []);

    // Calculate and display time duration
    const getTimeDuration = useCallback((timeString: string): string => {
        try {
            const selectedTime = new Date(timeString);
            const now = new Date();
            const diffMs = selectedTime.getTime() - now.getTime();
            
            if (diffMs <= 0) return "Invalid time";

            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.floor(diffDays / 7);
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);

            if (diffYears > 0) {
                return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
            } else if (diffMonths > 0) {
                return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
            } else if (diffWeeks > 0) {
                return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
            } else if (diffDays > 0) {
                return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
            } else if (diffHours > 0) {
                return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
            } else {
                return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
            }
        } catch {
            return "Invalid duration";
        }
    }, []);
    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Address copied to clipboard!");
        } catch (error) {
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast.success("Address copied to clipboard!");
            } catch (fallbackError) {
                toast.error("Failed to copy address. Please copy manually.");
            }
        }
    }, []);

    // Enhanced lock creation with better error handling and gas estimation
    const handleCreateLockClick = useCallback(async () => {
        if (!walletClient) {
            toast.error("No wallet client available. Please connect your wallet.");
            return;
        }

        if (!userWallet) {
            toast.error("Wallet not connected. Please connect your wallet.");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fix the form errors before proceeding.");
            return;
        }

        setIsLoading(prev => ({ ...prev, creatingLock: true }));

        try {
            const provider = new ethers.providers.Web3Provider(walletClient.transport);
            const signer = provider.getSigner();

            if (!tokenInfo.decimals) {
                throw new Error("Token decimals not available");
            }

            const parsedAmount = ethers.utils.parseUnits(amount, tokenInfo.decimals);
            const unixTime = Math.floor(new Date(time).getTime() / 1000);

            // Step 1: Check current allowance
            const tokenContract = new ethers.Contract(token.trim(), STANDARDTOKEN_ABI.abi, signer);
            const currentAllowance = await tokenContract.allowance(userWallet, LOCK_CONTRACT_ADDRESS);

            let loadingToast: any;

            // Step 2: Approve tokens if needed
            if (currentAllowance.lt(parsedAmount)) {
                loadingToast = toast.loading("Approving tokens...");
                
                // Reset allowance to 0 first if it's not 0 (for some tokens like USDT)
                if (currentAllowance.gt(0)) {
                    const resetTx = await tokenContract.approve(LOCK_CONTRACT_ADDRESS, 0);
                    await resetTx.wait();
                }
                
                const approveRes = await tokenContract.approve(LOCK_CONTRACT_ADDRESS, parsedAmount);
                await approveRes.wait();
            } else {
                loadingToast = toast.loading("Creating lock...");
            }

            // Step 3: Create lock
            toast.update(loadingToast, { 
                render: "Creating lock...", 
                type: "info", 
                isLoading: true 
            });

            const lockContract = new ethers.Contract(LOCK_CONTRACT_ADDRESS, LockABI, signer);

            // Estimate gas before sending transaction
            try {
                const gasEstimate = await lockContract.estimateGas.lock(
                    userWallet,
                    token.trim(),
                    isLiquidityToken,
                    parsedAmount,
                    unixTime,
                    lockTitle
                );
                
                const lockRes = await lockContract.lock(
                    userWallet,
                    token.trim(),
                    isLiquidityToken,
                    parsedAmount,
                    unixTime,
                    lockTitle,
                    { gasLimit: gasEstimate.mul(120).div(100) } // Add 20% buffer
                );

                await lockRes.wait();
            } catch (gasError) {
                // If gas estimation fails, try without gas limit
                const lockRes = await lockContract.lock(
                    userWallet,
                    token.trim(),
                    isLiquidityToken,
                    parsedAmount,
                    unixTime,
                    lockTitle
                );

                await lockRes.wait();
            }

            toast.update(loadingToast, { 
                render: "Lock created successfully!", 
                type: "success", 
                isLoading: false,
                autoClose: 5000
            });

            // Navigate after successful creation
            setTimeout(() => {
                navigate("/my_locks_list");
            }, NAVIGATION_DELAY_MS);

        } catch (error: any) {
            console.error("Error creating lock:", error);
            
            let errorMessage = "Error creating lock";
            
            if (error?.code === 4001) {
                errorMessage = "Transaction rejected by user";
            } else if (error?.code === -32603) {
                errorMessage = "Internal JSON-RPC error. Please try again.";
            } else if (error?.message) {
                if (error.message.includes("insufficient funds")) {
                    errorMessage = "Insufficient funds for transaction fees";
                } else if (error.message.includes("allowance")) {
                    errorMessage = "Token approval failed";
                } else if (error.message.includes("revert")) {
                    errorMessage = "Transaction reverted. Please check your inputs.";
                } else if (error.message.includes("gas")) {
                    errorMessage = "Gas estimation failed. Please try again.";
                } else if (error.message.includes("network")) {
                    errorMessage = "Network error. Please check your connection.";
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(prev => ({ ...prev, creatingLock: false }));
        }
    }, [
        walletClient, 
        userWallet, 
        validateForm, 
        tokenInfo.decimals, 
        amount, 
        time, 
        token, 
        isLiquidityToken, 
        lockTitle, 
        navigate
    ]);

    // Memoized balance formatting
    const formattedBalance = useMemo(() => {
        if (!tokenInfo.balance || !tokenInfo.decimals) return "";
        try {
            const formatted = ethers.utils.formatUnits(tokenInfo.balance, tokenInfo.decimals);
            return parseFloat(formatted).toLocaleString(undefined, { 
                maximumFractionDigits: 6 
            });
        } catch {
            return "Error";
        }
    }, [tokenInfo.balance, tokenInfo.decimals]);

    // Set max amount with better precision handling
    const setMaxAmount = useCallback(() => {
        if (tokenInfo.balance && tokenInfo.decimals) {
            const maxAmount = ethers.utils.formatUnits(tokenInfo.balance, tokenInfo.decimals);
            setAmount(maxAmount);
        }
    }, [tokenInfo.balance, tokenInfo.decimals]);

    // Check if form is ready for submission
    const isFormReady = useMemo(() => {
        return !isLoading.creatingLock && 
               !isLoading.fetchingToken && 
               tokenInfo.isValid && 
               userWallet && 
               token.trim() && 
               amount.trim() && 
               time.trim();
    }, [isLoading, tokenInfo.isValid, userWallet, token, amount, time]);

    return (
        <div className="create_lock">
            <Navbar />
            <ToastContainer position="top-right" />
            <form className="lock_form" onSubmit={(e) => e.preventDefault()}>
                {/* Token Address Input */}
                <div className="input_group">
                    <label htmlFor="token-address">Token or LP Token Address</label>
                    <input
                        id="token-address"
                        type="text"
                        onChange={(e) => setToken(e.target.value)}
                        value={token}
                        placeholder="0x..."
                        className={errors.token ? "error" : ""}
                        disabled={isLoading.creatingLock}
                    />
                    {errors.token && <span className="error-message">{errors.token}</span>}
                    {isLoading.fetchingToken && <span className="loading-message">Fetching token info...</span>}
                    {tokenInfo.isValid && (
                        <div className="token-info">
                            <span>{tokenInfo.name} ({tokenInfo.symbol})</span>
                            <span>Balance: {formattedBalance} {tokenInfo.symbol}</span>
                        </div>
                    )}
                </div>

                {/* Amount Input */}
                <div className="input_group">
                    <label htmlFor="amount">Amount</label>
                    <div className="amount-input-wrapper">
                        <input
                            id="amount"
                            type="text"
                            onChange={(e) => setAmount(e.target.value)}
                            value={amount}
                            placeholder="Enter Amount"
                            className={errors.amount ? "error" : ""}
                            disabled={isLoading.creatingLock || !tokenInfo.isValid}
                        />
                        {tokenInfo.isValid && (
                            <button 
                                type="button" 
                                className="max-button"
                                onClick={setMaxAmount}
                                disabled={isLoading.creatingLock}
                            >
                                MAX
                            </button>
                        )}
                    </div>
                    {errors.amount && <span className="error-message">{errors.amount}</span>}
                </div>

                {/* Lock Title Input */}
                <div className="input_group">
                    <label htmlFor="lock-title">Lock Title (Optional)</label>
                    <input
                        id="lock-title"
                        type="text"
                        onChange={(e) => setLockTitle(e.target.value)}
                        value={lockTitle}
                        placeholder="Enter lock description"
                        disabled={isLoading.creatingLock}
                        maxLength={50}
                    />
                </div>

                {/* Lock Until Input with Quick Presets */}
                <div className="input_group">
                    <label htmlFor="lock-time">Lock Until:</label>
                    
                    {/* Quick preset buttons */}
                    <div className="time-presets">
                        <button 
                            type="button" 
                            className="preset-btn"
                            onClick={() => setTimeFromPreset(1, 'hour')}
                            disabled={isLoading.creatingLock}
                        >
                            1 Hour
                        </button>
                        <button 
                            type="button" 
                            className="preset-btn"
                            onClick={() => setTimeFromPreset(1, 'day')}
                            disabled={isLoading.creatingLock}
                        >
                            1 Day
                        </button>
                        <button 
                            type="button" 
                            className="preset-btn"
                            onClick={() => setTimeFromPreset(1, 'week')}
                            disabled={isLoading.creatingLock}
                        >
                            1 Week
                        </button>
                        <button 
                            type="button" 
                            className="preset-btn"
                            onClick={() => setTimeFromPreset(1, 'month')}
                            disabled={isLoading.creatingLock}
                        >
                            1 Month
                        </button>
                        <button 
                            type="button" 
                            className="preset-btn"
                            onClick={() => setTimeFromPreset(3, 'month')}
                            disabled={isLoading.creatingLock}
                        >
                            3 Months
                        </button>
                        <button 
                            type="button" 
                            className="preset-btn"
                            onClick={() => setTimeFromPreset(1, 'year')}
                            disabled={isLoading.creatingLock}
                        >
                            1 Year
                        </button>
                    </div>

                    {/* Custom date/time picker */}
                    <div className="datetime-picker-wrapper">
                        <input
                            id="lock-time"
                            type="datetime-local"
                            onChange={(e) => setTime(e.target.value)}
                            value={time}
                            className={errors.time ? "error" : ""}
                            disabled={isLoading.creatingLock}
                            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                        />
                        <span className="datetime-helper">
                            Or select custom date and time above
                        </span>
                    </div>

                    {/* Display selected time in human readable format */}
                    {time && (
                        <div className="selected-time-display">
                            <span>Selected: {formatSelectedTime(time)}</span>
                            <span className="time-duration">
                                ({getTimeDuration(time)} from now)
                            </span>
                        </div>
                    )}

                    {errors.time && <span className="error-message">{errors.time}</span>}
                </div>

                {/* Liquidity Token Checkbox */}
                <div className="input_group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={isLiquidityToken}
                            onChange={(e) => setIsLiquidityToken(e.target.checked)}
                            disabled={isLoading.creatingLock}
                        />
                        This is a liquidity token
                    </label>
                </div>

                {/* Note */}
                <div className="note">
                    <span>Exclude pad.meme's lock address</span>{" "}
                    <span 
                        className="adr clickable" 
                        onClick={() => copyToClipboard(LOCK_CONTRACT_ADDRESS)}
                        title="Click to copy"
                    >
                        {LOCK_CONTRACT_ADDRESS}
                    </span>
                    <img 
                        src={copyIcon} 
                        alt="Copy icon" 
                        onClick={() => copyToClipboard(LOCK_CONTRACT_ADDRESS)}
                        className="copy-icon"
                    />
                    <span> from Fees, Max Transaction and Rewards.</span>
                </div>

                {/* Submit Button */}
                <div className="react_link">
                    <button 
                        type="button"
                        className="submit"
                        onClick={handleCreateLockClick}
                        disabled={!isFormReady}
                    >
                        {isLoading.creatingLock ? "Creating Lock..." : "Lock"}
                    </button>
                </div>
            </form>
            <Footer />
        </div>
    );
};

export default CreateLock;