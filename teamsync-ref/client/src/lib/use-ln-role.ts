import { createContext, useContext, useState, useCallback } from "react";
import {
  type LnRoleId,
  type LnRoleDefinition,
  getStoredLnRole,
  setStoredLnRole,
  getLnRole,
} from "./ln-role-config";

interface LnRoleContextValue {
  roleId: LnRoleId;
  role: LnRoleDefinition;
  setRole: (id: LnRoleId) => void;
}

export const LnRoleContext = createContext<LnRoleContextValue>({
  roleId: "client",
  role: getLnRole("client"),
  setRole: () => {},
});

export function useLnRole(): LnRoleContextValue {
  return useContext(LnRoleContext);
}

export function useLnRoleState() {
  const [roleId, setRoleIdState] = useState<LnRoleId>(getStoredLnRole);

  const setRole = useCallback((id: LnRoleId) => {
    setRoleIdState(id);
    setStoredLnRole(id);
  }, []);

  const role = getLnRole(roleId);

  return { roleId, role, setRole };
}
