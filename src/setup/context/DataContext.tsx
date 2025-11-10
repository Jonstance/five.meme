import { useState, createContext, PropsWithChildren } from "react";

interface DataContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  isWalletConnected: boolean;
  setIsWalletConnected: (value: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataContextProvider = ({ children }: PropsWithChildren) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <DataContext.Provider
      value={{
        isWalletConnected,
        setIsWalletConnected,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
