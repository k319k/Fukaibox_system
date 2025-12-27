// UI state management store
// For client-side UI state that doesn't need to be persisted
import { create } from "zustand";

interface UIState {
    // Modal states
    loginModalOpen: boolean;
    setLoginModalOpen: (open: boolean) => void;

    // Sidebar state
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;

    // Theme
    theme: "dark" | "light";
    setTheme: (theme: "dark" | "light") => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Modal states
    loginModalOpen: false,
    setLoginModalOpen: (open) => set({ loginModalOpen: open }),

    // Sidebar state
    sidebarCollapsed: false,
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    // Theme
    theme: "dark",
    setTheme: (theme) => set({ theme }),
}));
