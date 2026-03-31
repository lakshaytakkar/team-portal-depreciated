import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface State {
  toasts: ToastItem[];
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function emit() {
  listeners.forEach((l) => l({ ...memoryState }));
}

function addToast(type: ToastType, title: string, description?: string) {
  const id = genId();
  const toast: ToastItem = { id, type, title, description };
  memoryState = { toasts: [...memoryState.toasts, toast].slice(-5) };
  emit();

  setTimeout(() => {
    removeToast(id);
  }, 3000);

  return id;
}

function removeToast(id: string) {
  memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== id) };
  emit();
}

function toast(props: { title: string; description?: string; variant?: "default" | "destructive" }) {
  const type: ToastType = props.variant === "destructive" ? "error" : "info";
  return addToast(type, props.title, props.description);
}

function showSuccess(title: string, description?: string) {
  return addToast("success", title, description);
}

function showError(title: string, description?: string) {
  return addToast("error", title, description);
}

function showInfo(title: string, description?: string) {
  return addToast("info", title, description);
}

function showWarning(title: string, description?: string) {
  return addToast("warning", title, description);
}

function useToast() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}

export { useToast, toast, showSuccess, showError, showInfo, showWarning };
