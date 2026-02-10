import { createContext, useContext } from "react";

export interface Toast {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
}

export interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextType>(null!);

export const useToast = () => useContext(ToastContext);
