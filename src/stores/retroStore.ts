import { create } from "zustand";

import { retroRepository } from "@/lib/repositories";
import type {
  CreateRetroInput,
  UpdateRetroInput,
} from "@/lib/repositories";
import type {
  RetroMethod,
  RetroType,
  Retrospective,
} from "@/types/retro";

export interface RetroFilter {
  type: RetroType | "all";
  method: RetroMethod | "all";
  query: string;
  sort: "newest" | "oldest";
}

interface RetroState {
  items: Retrospective[];
  loaded: boolean;
  loading: boolean;
  error?: string;
  filter: RetroFilter;
}

interface RetroActions {
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  create: (input: CreateRetroInput) => Promise<Retrospective>;
  update: (id: string, patch: UpdateRetroInput) => Promise<Retrospective>;
  remove: (id: string) => Promise<void>;
  setFilter: (patch: Partial<RetroFilter>) => void;
  resetFilter: () => void;
}

const initialFilter: RetroFilter = {
  type: "all",
  method: "all",
  query: "",
  sort: "newest",
};

export const useRetroStore = create<RetroState & RetroActions>((set, get) => ({
  items: [],
  loaded: false,
  loading: false,
  error: undefined,
  filter: initialFilter,

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: undefined });
    try {
      const items = await retroRepository.list();
      set({ items, loaded: true, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  refresh: async () => {
    try {
      const items = await retroRepository.list();
      set({ items, loaded: true, error: undefined });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  create: async (input) => {
    const retro = await retroRepository.create(input);
    set({ items: [retro, ...get().items] });
    return retro;
  },

  update: async (id, patch) => {
    const updated = await retroRepository.update(id, patch);
    set({
      items: get().items.map((r) => (r.id === id ? updated : r)),
    });
    return updated;
  },

  remove: async (id) => {
    await retroRepository.remove(id);
    set({ items: get().items.filter((r) => r.id !== id) });
  },

  setFilter: (patch) =>
    set({ filter: { ...get().filter, ...patch } }),

  resetFilter: () => set({ filter: initialFilter }),
}));

export function selectFilteredRetros(
  state: RetroState & RetroActions,
): Retrospective[] {
  let items = [...state.items];

  if (state.filter.type !== "all") {
    items = items.filter((r) => r.type === state.filter.type);
  }

  if (state.filter.method !== "all") {
    items = items.filter((r) => r.method === state.filter.method);
  }

  const query = state.filter.query.trim().toLowerCase();
  if (query) {
    items = items.filter((r) => r.title.toLowerCase().includes(query));
  }

  items.sort((a, b) => {
    const cmp = a.retroDate.localeCompare(b.retroDate);
    return state.filter.sort === "newest" ? -cmp : cmp;
  });

  return items;
}
