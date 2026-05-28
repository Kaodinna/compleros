"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

// ---- Panel ----
export interface PanelConfig {
  title: string;
  subtitle?: string;
  body: ReactNode;
  footer?: ReactNode;
}

interface AdminContextType {
  toastMessage: string;
  toastVisible: boolean;
  showToast: (msg: string) => void;
  panelOpen: boolean;
  panelConfig: PanelConfig | null;
  openPanel: (config: PanelConfig) => void;
  closePanel: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelConfig, setPanelConfig] = useState<PanelConfig | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToastVisible(false), 2800);
  }, []);

  const openPanel = useCallback((config: PanelConfig) => {
    setPanelConfig(config);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        toastMessage,
        toastVisible,
        showToast,
        panelOpen,
        panelConfig,
        openPanel,
        closePanel,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
