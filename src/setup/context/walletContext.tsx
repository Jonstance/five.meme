import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '../../utility/useWallet';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  chainId: string | number | null | undefined;
  balance: string;
  provider: any;
  signer: any;
  refreshBalance: () => Promise<void>;
  // Legacy compatibility
  setWallet: (wallet: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const wallet = useWallet();

  const contextValue: WalletContextType = {
    address: wallet.address ?? undefined,
    isConnected: wallet.isConnected,
    chainId: wallet.chainId,
    balance: wallet.balance,
    provider: wallet.provider,
    signer: wallet.signer,
    refreshBalance: wallet.refreshBalance,
    // Legacy compatibility
    setWallet: (wallet: string) => {
      console.warn('setWallet function is not implemented yet');
    },
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext;