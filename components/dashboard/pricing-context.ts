"use client";

import { createContext, useContext } from "react";

export const PricingCtx = createContext<{ open: () => void }>({ open: () => {} });
export const usePricing = () => useContext(PricingCtx);
