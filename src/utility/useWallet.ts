import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

export const useWallet = () => {
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Initialize provider and signer when wallet connects
  useEffect(() => {
    if (isConnected && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);
      setSigner(web3Provider.getSigner());
      setIsConnected(true);
    } else {
      setProvider(null);
      setSigner(null);
    }
  }, [isConnected]);

  // Get balance when address changes
  const getBalance = useCallback(async () => {
    if (provider && address) {
      try {
        const balance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error('Error getting balance:', error);
        setBalance('0');
      }
    }
  }, [provider, address]);

  useEffect(() => {
    if (address && provider) {
      getBalance();
    }
  }, [address, provider, getBalance]);

  

  
 

  

 
  return {
    // Connection state
    address,
    isConnected,
    status,
    balance,
    
    // Network info
    chainId,
    
    // Ethers objects
    provider,
    signer,
    
    // Actions
    refreshBalance: getBalance,
    
  };
};