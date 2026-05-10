"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      if (!message) return;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const {
        severity = "info",
        duration = 3000,
        variant = "filled",
      } = options;

      setToasts((prev) => [...prev, { id, message, severity, variant }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (message, options = {}) =>
        showToast(message, { ...options, severity: "success" }),
      error: (message, options = {}) =>
        showToast(message, { ...options, severity: "error" }),
      info: (message, options = {}) =>
        showToast(message, { ...options, severity: "info" }),
      warning: (message, options = {}) =>
        showToast(message, { ...options, severity: "warning" }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1600,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxWidth: 380,
          width: "calc(100% - 32px)",
        }}
      >
        {toasts.map((toast) => (
          <Alert
            key={toast.id}
            severity={toast.severity}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
            sx={{ boxShadow: 3 }}
          >
            {toast.message}
          </Alert>
        ))}
      </Box>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
