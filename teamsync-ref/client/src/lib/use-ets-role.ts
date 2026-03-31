import { createContext, useContext, useState, useCallback } from "react";
import {
  type EtsRoleId,
  type EtsSubRole,
  type EtsRoleDefinition,
  getStoredEtsRole,
  setStoredEtsRole,
  getStoredEtsSubRole,
  setStoredEtsSubRole,
  getEtsRole,
} from "./ets-role-config";

interface EtsRoleContextValue {
  roleId: EtsRoleId;
  subRole: EtsSubRole;
  role: EtsRoleDefinition;
  setRole: (id: EtsRoleId) => void;
  setSubRole: (sub: EtsSubRole) => void;
  isCashier: boolean;
}

export const EtsRoleContext = createContext<EtsRoleContextValue>({
  roleId: "partner",
  subRole: "owner",
  role: getEtsRole("partner"),
  setRole: () => {},
  setSubRole: () => {},
  isCashier: false,
});

export function useEtsRole(): EtsRoleContextValue {
  return useContext(EtsRoleContext);
}

export function useEtsRoleState() {
  const [roleId, setRoleIdState] = useState<EtsRoleId>(getStoredEtsRole);
  const [subRole, setSubRoleState] = useState<EtsSubRole>(getStoredEtsSubRole);

  const setRole = useCallback((id: EtsRoleId) => {
    setRoleIdState(id);
    setStoredEtsRole(id);
  }, []);

  const setSubRole = useCallback((sub: EtsSubRole) => {
    setSubRoleState(sub);
    setStoredEtsSubRole(sub);
  }, []);

  const role = getEtsRole(roleId);
  const isCashier = roleId === "partner" && subRole === "cashier";

  return { roleId, subRole, role, setRole, setSubRole, isCashier };
}
