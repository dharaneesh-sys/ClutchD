import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import { connectWebSocket, disconnectWebSocket } from "../lib/socket";

// Mock user for development
const mockUsers = {
  customer: {
    id: "c1",
    email: "customer@demo.com",
    role: "customer",
    name: "Rahul Sharma",
  },
  mechanic: {
    id: "m1",
    email: "mechanic@demo.com",
    role: "mechanic",
    name: "Vijay Kumar",
    phone: "9876543210",
    experience: "5",
    expertise: ["engine", "brakes", "electrical"],
    location: "RS Puram, Coimbatore",
    rating: 4.7,
    isOnline: true,
  },
  garage: {
    id: "g1",
    email: "garage@demo.com",
    role: "garage",
    name: "SpeedFix Auto Garage",
    ownerName: "Suresh Patel",
    phone: "9876543211",
    location: "Saibaba Colony, Coimbatore",
    services: ["engine", "brakes", "ac", "electrical", "tires"],
    mechanicCount: 8,
    operatingHours: "8:00 AM - 9:00 PM",
    rating: 4.5,
  },
  admin: {
    id: "a1",
    email: "admin@clutchd.com",
    role: "admin",
    name: "Admin",
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Try real backend API
          const response = await api.post("/auth/login", { email, password });
          
          if (response.data.token && typeof window !== "undefined") {
            localStorage.setItem("clutchd_token", response.data.token);
            connectWebSocket(response.data.token);
          }
          
          set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          return response.data.user;
          
        } catch (error) {
          console.warn("Backend login failed, using fallback mock data.", error.message);
          
          // If it's a real auth error (not network), set error state
          if (error.response?.status === 401 || error.response?.status === 403) {
            set({ isLoading: false, error: "Invalid email or password" });
            return null;
          }

          // Fallback: Simulate API delay (network error / backend down)
          await new Promise((r) => setTimeout(r, 800));

          let user;
          if (email.includes("mechanic")) user = mockUsers.mechanic;
          else if (email.includes("garage")) user = mockUsers.garage;
          else if (email.includes("admin")) user = mockUsers.admin;
          else user = mockUsers.customer;
          
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        }
      },

      signup: async (data, role) => {
        set({ isLoading: true, error: null });
        
        try {
          const payload = { ...data, role };
          const response = await api.post("/auth/signup", payload);
          
          if (response.data.token && typeof window !== "undefined") {
            localStorage.setItem("clutchd_token", response.data.token);
            connectWebSocket(response.data.token);
          }
          
          set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          return response.data.user;
          
        } catch (error) {
          console.warn("Backend signup failed, using fallback mock data.", error.message);
          
          // If it's a real validation error, set error state
          if (error.response?.status === 400 || error.response?.status === 409) {
            const msg = error.response?.data?.detail || "Signup failed. Please try again.";
            set({ isLoading: false, error: msg });
            return null;
          }

          // Fallback logic (network error / backend down)
          await new Promise((r) => setTimeout(r, 1000));
          const user = { id: "new_" + Date.now(), email: data.email, role, name: data.fullName || data.garageName || "User" };
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (e) {
          // ignore
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem("clutchd_token");
          disconnectWebSocket();
        }
        set({ user: null, isAuthenticated: false, error: null });
        // Navigate to auth page
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      },

      updateProfile: async (profileData) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          console.warn("updateProfile called without a logged-in user");
          return null;
        }

        set({ isLoading: true, error: null });
        try {
          // Attempt actual backend update
          const response = await api.patch("/auth/me", profileData);
          if (response.data?.user) {
            set({ user: response.data.user, isLoading: false });
            return response.data.user;
          }
          // Response was 2xx but no user payload — fall through to local update
          throw new Error("No user data in response");
        } catch (error) {
          console.warn("Backend updateProfile failed, updating local state.", error.message);
          // Fallback to local store update if backend fails
          try {
            const updatedUser = { ...useAuthStore.getState().user, ...profileData };
            set({ user: updatedUser, isLoading: false, error: null });
            return updatedUser;
          } catch (fallbackError) {
            console.error("Failed to update local state:", fallbackError);
            set({ isLoading: false });
            return null;
          }
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "auth-storage",
    }
  )
);
