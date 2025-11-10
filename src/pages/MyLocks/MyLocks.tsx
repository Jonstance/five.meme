import Footer from "../../components/Footer/Footer"
import Navbar from "../../components/Navbar/Navbar"
import "./MyLocks.css"
import { ethers } from "ethers"
import LockABI from "../../ABIs/Lock.json"
import STANDARDTOKEN_ABI from "../../ABIs/StandardToken.json";
import { useState, useEffect, useCallback, useMemo } from "react"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAccount, useWalletClient } from "wagmi"; // Wagmi hooks
import { useParams, useNavigate } from 'react-router-dom';



interface TokenDetail {
    name: string;
    symbol: string;
    decimals: number;
}

interface Lock {
    id: ethers.BigNumber;
    token: string;
    owner: string;
    amount: ethers.BigNumber;
    lockDate: ethers.BigNumber;
    tgeDate: ethers.BigNumber;
    cycle: ethers.BigNumber;
    cycleBps: ethers.BigNumber;
    tgeBps: ethers.BigNumber;
    unlockedAmount: ethers.BigNumber;
    description: string;
}

const MyLocks = () => {
    const { lockId } = useParams();
    const navigate = useNavigate();
    const [lock, setLock] = useState<Lock | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [allTokenDetails, setAllTokenDetails] = useState<Record<string, TokenDetail>>({});
  const [locks, setLocks] = useState<Lock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const { address: userWallet, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const provider = useMemo(() => {
        if (!walletClient) return null;
        return new ethers.providers.Web3Provider(walletClient.transport);
    }, [walletClient]);
    const LOCK_CONTRACT_ADDRESS = "0x89cb82123ece50ff6519ba01063af91023d06481"

    const lockContract = useMemo(() => {
        if (!provider) return null;
        return new ethers.Contract(LOCK_CONTRACT_ADDRESS, LockABI, provider.getSigner());
    }, [provider]);

    



    const handleGetAllNormalUserLocks = useCallback(async (userAddress: string) => {
        if (!userAddress || !lockContract) return [];
        try {
            return await lockContract.normalLocksForUser(userAddress);
        } catch (error) {
            console.error("Error fetching locks:", error);
            throw error;
        }
    }, [lockContract]);

    const getLockInfoById = (lockId: any) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!walletClient) throw new Error("No wallet client available. Please connect your wallet.");

            const provider = new ethers.providers.Web3Provider(walletClient.transport);
                const signer = provider.getSigner()
                const eLockContract = new ethers.Contract(LOCK_CONTRACT_ADDRESS, LockABI, signer)

                const lockDetails = await eLockContract.getLockById(lockId)
                console.log(lockDetails);

                resolve(lockDetails)
            }
            catch (error: any) {
                console.log(error)
                reject({})
            }


        })
    }

    const unLockUserLock = (lockId: any) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!walletClient) throw new Error("No wallet client available. Please connect your wallet.");

            const provider = new ethers.providers.Web3Provider(walletClient.transport);
                const signer = provider.getSigner()
                const eLockContract = new ethers.Contract(LOCK_CONTRACT_ADDRESS, LockABI, signer)

                await eLockContract.unlock(lockId)

                resolve(true)
            }
            catch (error: any) {
                console.log(error)
                if (error.data !== undefined) {
                    reject(error.data.message)
                } else {
                    reject("An Error occured")
                }
            }
        })
    }
    interface TokenDetailsResponse {
        tokenAddress: string;
        tokenName: string;
        tokenSymbol: string;
        tokenDecimals: number;
    }

    const getTokenDetails = (tokenAddress: string): Promise<TokenDetailsResponse> => {
        return new Promise(async (resolve,reject)=>{
            if (!walletClient) throw new Error("No wallet client available. Please connect your wallet.");

            const provider = new ethers.providers.Web3Provider(walletClient.transport);
                const signer = provider.getSigner()
            const tokenContract =  new ethers.Contract(tokenAddress, STANDARDTOKEN_ABI.abi, signer)
            const tokenNameReq =  tokenContract.name()
            const tokenSymbolReq =  tokenContract.symbol()
            const tokenDecimalsReq = tokenContract.decimals()
    
            try{
                const tokenDetailsPromise = await Promise.all([tokenNameReq, tokenSymbolReq, tokenDecimalsReq])
    
                const response =  {
                    tokenAddress : tokenAddress,
                    tokenName : tokenDetailsPromise[0],
                    tokenSymbol : tokenDetailsPromise[1],
                    tokenDecimals : Number(tokenDetailsPromise[2].toString())
                }
        
                resolve(response)
            }
            catch(error){
                console.log(error )
                reject(false)
            }
          
            
        })
    }
    const handleTokenData = async (addressDetailToFetch: any) => {
        const promiseData: any = [];
    
        addressDetailToFetch.map((eachAddress:any) => {
          promiseData.push(getTokenDetails(eachAddress));
        });
    
        try {
          const promiseResponse = await Promise.all(promiseData);
    
          console.log(promiseResponse);
    
          let tokenDetails: any = {};
    
          promiseResponse.map((eachTokenData: any) => {
            let tokenData = {
              name: eachTokenData.tokenName,
              symbol: eachTokenData.tokenSymbol,
              decimals: eachTokenData.tokenDecimals,
            };
    
            tokenDetails[eachTokenData.tokenAddress] = tokenData;
          });
    
          setAllTokenDetails({ ...tokenDetails });
    
          // console.log(tokenDetails);
    
          // setAllTokenDetails([...promiseResponse])
        } catch (error) {
          console.log(error);
        }
      };
    
      const handleGetUserLocks = async () => {
        console.log(userWallet);
    
        try {
          if (!userWallet) return;
          const userNormalLocks: any = handleGetAllNormalUserLocks(userWallet);
    
          const promiseData: any = await Promise.all(userNormalLocks);
    
    
          const allLocks: any = promiseData;
    
    
          const allTokensToFetchData: any = [];
    
          allLocks.map((eachLock: any) => {
            if (allTokensToFetchData.includes(eachLock.token)) {
              return;
            }
    
            allTokensToFetchData.push(eachLock.token);
          });
    
          console.log(allTokensToFetchData);
    
          setLocks(allLocks);
    
          if (allLocks.length > 0) {
            handleTokenData(allTokensToFetchData);
          }
        } catch (error) {
          console.log(error);
          toast("There was an error fetching your Locks");
        }
      };
    
      const loadLockDetails = useCallback(async () => {
        if (!lockId || !lockContract) return;
        try {
            setLoading(true);
            const lockDetails = await lockContract.getLockById(lockId);
            
            // Transform the array response into an object
            const lock: Lock = {
                id: lockDetails.id,
                token: lockDetails.token,
                owner: lockDetails.owner,
                amount: lockDetails.amount,
                lockDate: lockDetails.lockDate,
                tgeDate: lockDetails.tgeDate,
                cycle: lockDetails.cycle,
                cycleBps: lockDetails.cycleBps,
                tgeBps: lockDetails.tgeBps,
                unlockedAmount: lockDetails.unlockedAmount,
                description: lockDetails.description
            };
            
            setLock(lock);
            
            // Get token details
            const tokenDetails = await getTokenDetails(lock.token);
            setAllTokenDetails({
                [lock.token]: {
                    name: tokenDetails.tokenName,
                    symbol: tokenDetails.tokenSymbol,
                    decimals: tokenDetails.tokenDecimals,
                }
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load lock details");
        } finally {
            setLoading(false);
        }
    }, [lockId, lockContract]);

    const handleUnlock = async () => {
        if (!lock || !lockContract) return;
        
        try {
            setIsUnlocking(true);
            const tx = await lockContract.unlock(lockId);
            toast.info("Unlocking in progress...");
            
            await tx.wait();
            toast.success("Successfully unlocked!");
            navigate('/my_locks_list');
        } catch (error: any) {
            console.error(error);
            toast.error(error.data?.message || "Failed to unlock");
        } finally {
            setIsUnlocking(false);
        }
    };

    useEffect(() => {
        if (isConnected && userWallet) {
            loadLockDetails();
        }
    }, [isConnected, userWallet, loadLockDetails]);

    if (!isConnected) {
        return (
            <div className="my_locks">
                <Navbar />
                <ToastContainer position="top-right" />
                <main className="locks_wrapper">
                    <p>Please connect your wallet to view locks</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="my_locks">
                <Navbar />
                <main className="locks_wrapper">
                    <p>Loading lock details...</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="my_locks">
            <Navbar />
            <ToastContainer position="top-right" />
            <main className="locks_wrapper">
                {lock && (
                    <>
                        <div className="lock_card left">
                            <span className="title">Lock info</span>
                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Total Amount Locked</span>
                                <span className="r">
                                    {ethers.utils.formatUnits(
                                        lock.amount,
                                        allTokenDetails[lock.token]?.decimals || 18
                                    )}
                                </span>
                            </div>
                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Token Address</span>
                                <span className="r adr">{lock.token}</span>
                            </div>
                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Token Name</span>
                                <span className="r">{allTokenDetails[lock.token]?.name || 'N/A'}</span>
                            </div>

                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Token Symbol</span>
                                <span className="r">{allTokenDetails[lock.token]?.symbol || 'N/A'}</span>
                            </div>
                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Token Decimals</span>
                                <span className="r">{allTokenDetails[lock.token]?.decimals || 18}</span>
                            </div>
                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Owner</span>
                                <span className="r adr">{lock.owner}</span>
                            </div>
                            <hr className="rule" />
                        </div>

                        <div className="lock_card">
                            <span className="title">Lock Records</span>
                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Amount</span>
                                <span className="r">
                                    {ethers.utils.formatUnits(
                                        lock.amount,
                                        allTokenDetails[lock.token]?.decimals || 18
                                    )}
                                </span>
                            </div>
                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Lock Time</span>
                                <span className="r">
                                    {lock.lockDate ? new Date(lock.lockDate.toNumber() * 1000).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                            <hr className="rule" />
                            <div className="card_row">
                                <span className="l">Unlock Time</span>
                                <span className="r">
                                    {lock.tgeDate ? new Date(lock.tgeDate.toNumber() * 1000).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                            <hr className="rule" />

                            <button 
                                className="unlock"
                                onClick={handleUnlock}
                                disabled={isUnlocking || Date.now() < (lock?.tgeDate.toNumber() || 0) * 1000}
                            >
                                {isUnlocking ? 'Unlocking...' : 'Unlock'}
                            </button>
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyLocks