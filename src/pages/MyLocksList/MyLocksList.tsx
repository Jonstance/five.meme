import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { ToastContainer, toast } from "react-toastify";

import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import LockABI from "../../ABIs/Lock.json";
import STANDARDTOKEN_ABI from "../../ABIs/StandardToken.json";

import "./MyLocksList.css";
import "react-toastify/dist/ReactToastify.css";

interface TokenDetail {
    name: string;
    symbol: string;
    decimals: number;
}

interface LoadingState {
    locks: boolean;
    tokens: boolean;
}

interface Lock {
    id?: ethers.BigNumber;
    token: string;
    owner: string;
    amount: ethers.BigNumber;
    lockDate?: ethers.BigNumber;
    tgeDate?: ethers.BigNumber;
    unlockDate?: number;
    unlockTime?: number;
    description?: string;
    cycle?: ethers.BigNumber;
    cycleBps?: ethers.BigNumber;
    tgeBps?: ethers.BigNumber;
    unlockedAmount?: ethers.BigNumber;
}

const MyLocksList = () => {
    // State management
    const [locks, setLocks] = useState<Lock[]>([]);
    const [tokenDetails, setTokenDetails] = useState<Record<string, TokenDetail>>({});
    const [loading, setLoading] = useState<LoadingState>({
        locks: false,
        tokens: false
    });
    const [error, setError] = useState<string | null>(null);

    // Wagmi hooks
    const { address: userAddress, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const LOCK_CONTRACT_ADDRESS = "0x89cb82123ece50ff6519ba01063af91023d06481";

    // Memoized provider and contract instances
    const provider = useMemo(() => {
        if (!walletClient) return null;
        return new ethers.providers.Web3Provider(walletClient.transport);
    }, [walletClient]);

    const lockContract = useMemo(() => {
        if (!provider) return null;
        const signer = provider.getSigner();
        return new ethers.Contract(LOCK_CONTRACT_ADDRESS, LockABI, signer);
    }, [provider]);

    // Helper function to create token contract
    const createTokenContract = useCallback((tokenAddress: string) => {
        if (!provider) return null;
        const signer = provider.getSigner();
        return new ethers.Contract(tokenAddress, STANDARDTOKEN_ABI.abi, signer);
    }, [provider]);

    // Fetch user's locks from contract
    const fetchUserLocks = useCallback(async () => {
        if (!lockContract || !userAddress) return [];

        try {
            setLoading(prev => ({ ...prev, locks: true }));
            setError(null);

            const userLocks = await lockContract.normalLocksForUser(userAddress);
            console.log("Raw user locks from contract:", userLocks);
            return userLocks;
        } catch (error) {
            console.error("Error fetching user locks:", error);
            throw new Error("Failed to fetch locks from contract");
        } finally {
            setLoading(prev => ({ ...prev, locks: false }));
        }
    }, [lockContract, userAddress]);

    // Fetch token details for a single token
    const fetchTokenDetails = useCallback(async (tokenAddress: string) => {
        const tokenContract = createTokenContract(tokenAddress);
        if (!tokenContract) throw new Error("Unable to create token contract");

        try {
            const [name, symbol, decimals] = await Promise.all([
                tokenContract.name().catch(() => "Unknown Token"),
                tokenContract.symbol().catch(() => "???"),
                tokenContract.decimals().catch(() => 18)
            ]);

            return {
                address: tokenAddress,
                name,
                symbol,
                decimals: Number(decimals.toString())
            };
        } catch (error) {
            console.error(`Error fetching token details for ${tokenAddress}:`, error);
            return {
                address: tokenAddress,
                name: "Unknown Token",
                symbol: "???",
                decimals: 18
            };
        }
    }, [createTokenContract]);

    // Batch fetch token details for multiple tokens
    const fetchMultipleTokenDetails = useCallback(async (tokenAddresses: string[]) => {
        if (tokenAddresses.length === 0) return {};

        try {
            setLoading(prev => ({ ...prev, tokens: true }));

            const tokenPromises = tokenAddresses.map(address => fetchTokenDetails(address));
            const tokenResults = await Promise.all(tokenPromises);

            const tokenDetailsMap: Record<string, TokenDetail> = {};
            tokenResults.forEach(token => {
                tokenDetailsMap[token.address] = {
                    name: token.name,
                    symbol: token.symbol,
                    decimals: token.decimals
                };
            });

            return tokenDetailsMap;
        } catch (error) {
            console.error("Error fetching token details:", error);
            toast.error("Some token details could not be loaded");
            return {};
        } finally {
            setLoading(prev => ({ ...prev, tokens: false }));
        }
    }, [fetchTokenDetails]);

    // Main function to load all user data
    const loadUserData = useCallback(async () => {
        if (!isConnected || !userAddress || !lockContract) {
            setLocks([]);
            setTokenDetails({});
            return;
        }

        try {
            // Fetch user locks
            const userLocks = await fetchUserLocks();
            console.log("User Locks:", userLocks);
            setLocks(userLocks);

            if (userLocks.length === 0) {
                setTokenDetails({});
                return;
            }

            // Extract unique token addresses
            const uniqueTokenAddresses = Array.from(new Set(
                userLocks.map((lock: Lock) => lock.token.toLowerCase())
            )) as string[];

            // Fetch token details for all unique tokens
            const tokenDetailsMap = await fetchMultipleTokenDetails(uniqueTokenAddresses);
            setTokenDetails(tokenDetailsMap);

        } catch (error) {
            console.error("Error loading user data:", error);
            setError(error instanceof Error ? error.message : "An unknown error occurred");
            toast.error("Failed to load your locks. Please try again.");
        }
    }, [isConnected, userAddress, lockContract, fetchUserLocks, fetchMultipleTokenDetails]);

    // Effect to load data when wallet connects or changes
    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    // Format token amount with proper decimals
    const formatTokenAmount = useCallback((amount: ethers.BigNumber, tokenAddress: string) => {
        try {
            const token = tokenDetails[tokenAddress.toLowerCase()];
            if (!token) return amount.toString();

            const decimals = token.decimals || 18;
            const formatted = ethers.utils.formatUnits(amount, decimals);
            const number = parseFloat(formatted);
            
            // Format with appropriate decimal places
            if (number >= 1000000) {
                return (number / 1000000).toFixed(2) + "M";
            } else if (number >= 1000) {
                return (number / 1000).toFixed(2) + "K";
            } else if (number >= 1) {
                return number.toFixed(4);
            } else {
                return number.toFixed(8);
            }
        } catch (error) {
            console.error("Error formatting amount:", error);
            return amount.toString();
        }
    }, [tokenDetails]);

    // Format lock expiry date - Updated to handle both timestamp formats
    const formatLockDate = useCallback((lock: Lock) => {
        try {
            // Try to get unlock timestamp from various possible fields
            let timestamp: number = 0;
            
            if (lock.tgeDate && typeof lock.tgeDate === 'object' && 'toNumber' in lock.tgeDate) {
                timestamp = (lock.tgeDate as ethers.BigNumber).toNumber();
            } else if (lock.unlockDate) {
                timestamp = lock.unlockDate;
            } else if (lock.unlockTime) {
                timestamp = lock.unlockTime;
            } else if (lock.lockDate && typeof lock.lockDate === 'object' && 'toNumber' in lock.lockDate) {
                timestamp = (lock.lockDate as ethers.BigNumber).toNumber();
            }

            if (timestamp === 0) return "No unlock date";

            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString();
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Invalid date";
        }
    }, []);

    // Check if lock is expired - Updated to handle both timestamp formats
    const isLockExpired = useCallback((lock: Lock) => {
        try {
            let timestamp: number = 0;
            
            if (lock.tgeDate && typeof lock.tgeDate === 'object' && 'toNumber' in lock.tgeDate) {
                timestamp = (lock.tgeDate as ethers.BigNumber).toNumber();
            } else if (lock.unlockDate) {
                timestamp = lock.unlockDate;
            } else if (lock.unlockTime) {
                timestamp = lock.unlockTime;
            }

            return timestamp > 0 && Date.now() > timestamp * 1000;
        } catch (error) {
            console.error("Error checking expiry:", error);
            return false;
        }
    }, []);

    // Format lock ID for display
    const formatLockId = useCallback((lock: Lock, index: number) => {
        if (lock.id && typeof lock.id === 'object' && 'toString' in lock.id) {
            const idNumber = (lock.id as ethers.BigNumber).toNumber();
            // For large numbers, show last 4 digits or simple increment
            if (idNumber > 10000) {
                return `#${String(idNumber).slice(-4)}`;
            }
            return `#${idNumber}`;
        }
        return `#${index + 1}`;
    }, []);

    // Get lock description
    const getLockDescription = useCallback((lock: Lock) => {
        return lock.description || "Token Lock";
    }, []);

    // Check if lock has vesting
    const hasVesting = useCallback((lock: Lock) => {
        try {
            const tgeBps = lock.tgeBps && typeof lock.tgeBps === 'object' ? 
                (lock.tgeBps as ethers.BigNumber).toNumber() : 0;
            const cycleBps = lock.cycleBps && typeof lock.cycleBps === 'object' ? 
                (lock.cycleBps as ethers.BigNumber).toNumber() : 0;
            
            return tgeBps > 0 || cycleBps > 0;
        } catch (error) {
            return false;
        }
    }, []);

    // Retry function for failed operations
    const retryLoadData = useCallback(() => {
        setError(null);
        loadUserData();
    }, [loadUserData]);

    // Loading component
    const LoadingSpinner = () => (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading your locks...</span>
        </div>
    );

    // Error component
    const ErrorDisplay = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
        <div className="error-display">
            <span className="error-message">Error: {error}</span>
            <button className="retry-button" onClick={onRetry}>
                Retry
            </button>
        </div>
    );

    // Empty state component
    const EmptyState = () => (
        <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <span className="empty-message">You have no locks</span>
            <p className="empty-description">
                Create your first token lock to get started
            </p>
            <Link to="/create_lock" className="create-lock-button">
                Create Lock
            </Link>
        </div>
    );

    // Lock card component - Updated with better data handling
    const LockCard = ({ lock, index }: { lock: Lock, index: number }) => {
        const token = tokenDetails[lock.token.toLowerCase()];
        const isExpired = isLockExpired(lock);
        const lockId = formatLockId(lock, index);
        const description = getLockDescription(lock);
        const hasVestingSchedule = hasVesting(lock);
        
        return (
            <div className={`lock_card ${isExpired ? 'expired' : ''}`} key={index}>
                <div className="lock-header">
                    <div className="title-section">
                        <span className="title dem">Lock {lockId}</span>
                        <span className="description dem">{description}</span>
                    </div>
                    <div className="badges">
                      {!isExpired && <span className="active-badge">Active</span>}
                        {hasVestingSchedule && <span className="vesting-badge">Vesting</span>}
                        {isExpired && <span className="expired-badge">Expired</span>}
                    </div>
                </div>
                
                <hr className="rule" />
                
                <div className="card_row">
                    <span className="l">Token</span>
                    <span className="r token-name">
                        {token ? `${token.name} (${token.symbol})` : "Loading..."}
                    </span>
                </div>

                <hr className="rule" />
                
                <div className="card_row">
                    <span className="l">Amount</span>
                    <div className="r amount">
                        {formatTokenAmount(lock.amount, lock.token)}
                        {token && <span className="token-symbol"> {token.symbol}</span>}
                    </div>
                </div>

                <hr className="rule" />
                
                <div className="card_row">
                    <span className="l">Unlock Date</span>
                    <span className="r unlock-date">
                        {formatLockDate(lock)}
                    </span>
                </div>

                <hr className="rule" />
                
                <div className="card-actions">
                    <Link 
                        className="react_link" 
                        to={`/my_locks/${lock.id || index}`}
                    >
                        <div className={`view ${isExpired ? 'unlock-ready' : ''}`}>
                            {isExpired ? "Unlock" : "View"}
                        </div>
                    </Link>
                </div>
            </div>
        );
    };

    // Wallet connection check
    if (!isConnected) {
        return (
            <div className="my_locks_list">
                <Navbar />
                <main className="page_wrapper">
                    <div className="connection-required">
                        <span>Please connect your wallet to view your locks</span>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="my_locks_list">
            <Navbar />
            <ToastContainer position="top-right" />
            
            <main className="page_wrapper">
                <div className="page-header">
                    <h1>My Token Locks</h1>
                    <div className="stats">
                        <span className="stat">
                            Total Locks: {locks.length}
                        </span>
                        {locks.length > 0 && (
                            <>
                                <span className="stat lock_active">
                                    Active: {locks.filter(lock => !isLockExpired(lock)).length}
                                </span>
                                <span className="stat lock_expired">
                                    Expired: {locks.filter(lock => isLockExpired(lock)).length}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="locks_wrapper">
                    {/* Loading State */}
                    {(loading.locks || loading.tokens) && <LoadingSpinner />}

                    {/* Error State */}
                    {error && !loading.locks && (
                        <ErrorDisplay error={error} onRetry={retryLoadData} />
                    )}

                    {/* Empty State */}
                    {!loading.locks && !error && locks.length === 0 && <EmptyState />}

                    {/* Locks List */}
                    {!loading.locks && !error && locks.length > 0 && (
                        <>
                            {locks.map((lock, index) => (
                                <LockCard key={lock.id ? (lock.id as ethers.BigNumber).toString() : index} lock={lock} index={index} />
                            ))}
                        </>
                    )}
                </div>

                {/* Refresh Button */}
                {locks.length > 0 && (
                    <div className="refresh-section">
                        <button 
                            className="refresh-button"
                            onClick={retryLoadData}
                            disabled={loading.locks || loading.tokens}
                        >
                            {loading.locks || loading.tokens ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
};

export default MyLocksList;