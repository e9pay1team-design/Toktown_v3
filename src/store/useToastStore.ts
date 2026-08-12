import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  /** 이모지/아이콘 종류 */
  kind: 'info' | 'success' | 'tokken' | 'error';
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, kind?: Toast['kind']) => void;
  dismiss: (id: number) => void;
}

let toastSeq = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, kind = 'info') => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
