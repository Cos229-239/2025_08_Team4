import React, { createContext, useContext, useState, useCallback } from "react";

const RightDrawerCtx = createContext(null);
export const useRightDrawer = () => useContext(RightDrawerCtx);

export function RightDrawerProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  return (
    <RightDrawerCtx.Provider value={{ open, openDrawer, closeDrawer }}>
      {children}
    </RightDrawerCtx.Provider>
  );
}
