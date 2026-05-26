"use client";

import { usePricing } from "./pricing-context";

export default function SeePlansButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = usePricing();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
