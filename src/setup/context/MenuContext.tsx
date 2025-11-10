import React, { createContext, useState } from "react";

export const MenuContext = createContext({
  menuOpen: false,
  setMenuOpen: (state: boolean) => {},
});

const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MenuContext.Provider value={{ menuOpen, setMenuOpen }}>
      {children}
    </MenuContext.Provider>
  );
};

export default MenuProvider;