import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
}

interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: string;
}

interface AppState {
  currentUser: CurrentUser | null;
  currentTeamId: string;
  simulatedRole: 'superadmin' | 'manager' | 'executive' | null;
  myTeamMemberships: TeamMembership[];

  setCurrentUser: (user: CurrentUser | null) => void;
  setCurrentTeamId: (teamId: string) => void;
  setSimulatedRole: (role: 'superadmin' | 'manager' | 'executive' | null) => void;
  setMyTeamMemberships: (memberships: TeamMembership[]) => void;

  getEffectiveRole: () => 'superadmin' | 'manager' | 'executive';
  getRoleInTeam: (teamId: string) => 'superadmin' | 'manager' | 'executive';
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentTeamId: 'travel-sales',
      simulatedRole: null,
      myTeamMemberships: [],

      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentTeamId: (teamId) => set({ currentTeamId: teamId }),
      setSimulatedRole: (role) => set({ simulatedRole: role }),
      setMyTeamMemberships: (memberships) => set({ myTeamMemberships: memberships }),

      getEffectiveRole: () => {
        const { currentUser, currentTeamId, simulatedRole, myTeamMemberships } = get();
        if (!currentUser) return 'executive';
        if (currentUser.role === 'superadmin') {
          return simulatedRole || 'superadmin';
        }
        const membership = myTeamMemberships.find(m => m.teamId === currentTeamId);
        return (membership?.role as 'manager' | 'executive') || 'executive';
      },

      getRoleInTeam: (teamId: string) => {
        const { currentUser, simulatedRole, myTeamMemberships } = get();
        if (!currentUser) return 'executive';
        if (currentUser.role === 'superadmin') {
          return simulatedRole || 'superadmin';
        }
        const membership = myTeamMemberships.find(m => m.teamId === teamId);
        return (membership?.role as 'manager' | 'executive') || 'executive';
      },
    }),
    {
      name: 'suprans-store',
      partialize: (state) => ({ currentTeamId: state.currentTeamId, simulatedRole: state.simulatedRole }),
    }
  )
);
