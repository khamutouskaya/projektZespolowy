import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  show: (title: string, message?: string, type?: ToastType) => void;
  hide: () => void;
}

let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  type: "info",
  title: "",
  message: undefined,
  show: (title, message, type = "info") => {
    if (autoHideTimer) clearTimeout(autoHideTimer);
    set({ visible: true, type, title, message });
    autoHideTimer = setTimeout(() => {
      set({ visible: false });
    }, 3500);
  },
  hide: () => {
    if (autoHideTimer) clearTimeout(autoHideTimer);
    set({ visible: false });
  },
}));
