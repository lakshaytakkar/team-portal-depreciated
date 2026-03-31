import { createContext, useContext } from "react";
import { getDefaultVertical, getVerticalById, type Vertical } from "./verticals-config";

const STORAGE_KEY = "teamsync-vertical";

export function getStoredVerticalId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || getDefaultVertical().id;
  } catch {
    return getDefaultVertical().id;
  }
}

export function setStoredVerticalId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

export function getStoredVertical(): Vertical {
  return getVerticalById(getStoredVerticalId()) || getDefaultVertical();
}

interface VerticalContextValue {
  currentVertical: Vertical;
  setCurrentVertical: (id: string) => void;
}

export const VerticalContext = createContext<VerticalContextValue>({
  currentVertical: getDefaultVertical(),
  setCurrentVertical: () => {},
});

export function useVertical() {
  return useContext(VerticalContext);
}
