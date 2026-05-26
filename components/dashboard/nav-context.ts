"use client";

import { createContext, useContext } from "react";

export const NavCtx = createContext<{
  open: boolean;
  toggle: () => void;
  close: () => void;
}>({ open: false, toggle: () => {}, close: () => {} });

export const useNav = () => useContext(NavCtx);
