import { useState, createContext } from "react";

const PageContext = createContext();

export const PageContextProvider = ({ children }) => {
  const [showUserAddress, setShowUserAddress] = useState(false);
  const [showWalletText, setShowWalletText] = useState(false);

  return (
    <PageContext.Provider
      value={{
        showUserAddress,
        setShowUserAddress,
        showWalletText,
        setShowWalletText,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export default PageContext;
