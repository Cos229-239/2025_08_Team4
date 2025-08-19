// components/RightDrawerContext.jsx
import { createContext, useContext, useMemo, useState } from "react";

const RightDrawerContext = createContext({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const RightDrawerProvider = ({ children }) => {
  const [isOpen, setOpen] = useState(false);
  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  const value = useMemo(() => ({ isOpen, openDrawer, closeDrawer }), [isOpen]);
  return (
    <RightDrawerContext.Provider value={value}>
      {children}
    </RightDrawerContext.Provider>
  );
};

export const useRightDrawer = () => useContext(RightDrawerContext);
