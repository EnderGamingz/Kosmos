import { SortParams } from '@models/sort.ts';
import { create } from 'zustand';

export type SortState = {
  search?: string;
  sort: SortParams;
  actions: {
    reset: () => void;
    search: (search: string) => void;
    sort: (sort: SortParams) => void;
  };
};

export const useSearchState = create<SortState>(set => ({
  sort: {},
  actions: {
    reset: () => set({ sort: {}, search: undefined }),
    search: (search: string) => set({ search }),
    sort: (sort: SortParams) => set({ sort }),
  },
}));
