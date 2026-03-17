import { create } from 'zustand';

const useLoadingStore = create((set) => ({
    loadingCount: 0,
    isLoading: false,
    startLoading: () => set((state) => {
        const nextCount = state.loadingCount + 1;
        return { loadingCount: nextCount, isLoading: nextCount > 0 };
    }),
    stopLoading: () => set((state) => {
        const nextCount = Math.max(0, state.loadingCount - 1);
        return { loadingCount: nextCount, isLoading: nextCount > 0 };
    }),
}));

export default useLoadingStore;
