import { create } from "zustand";
import { Visit } from "../../modules/visits/visits.types";
import { visits as initialVisits } from "../../modules/visits/data/visits";

interface VisitState {
  visits: Visit[];
  addVisit: (visit: Visit) => void;
  cancelVisit: (visitId: string) => void;
}

export const useVisitStore = create<VisitState>((set) => ({
  visits: initialVisits,

  addVisit: (visit) =>
    set((state) => ({ visits: [visit, ...state.visits] })),

  cancelVisit: (visitId) =>
    set((state) => ({
      visits: state.visits.map((v) =>
        v.id === visitId ? { ...v, status: "cancelled" as const } : v,
      ),
    })),
}));
