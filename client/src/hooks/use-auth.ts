import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export interface User {
  id: string;
  rut: string;
  nombre: string;
  name?: string; // Backend usa 'name' a veces
  role: "ADMIN" | "WORKER" | "administrador" | "mecanico";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (!response.ok) {
          return null;
        }
        
        const data = await response.json();
        // Normalizar el nombre si viene como 'name'
        if (data.name && !data.nombre) {
          data.nombre = data.name;
        }
        return data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { rut: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al iniciar sesión");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      // Redirigir según el rol (compatible con backend antiguo y nuevo)
      const isAdmin = data.role === "ADMIN" || data.role === "administrador";
      if (isAdmin) {
        setLocation("/dashboard");
      } else {
        setLocation("/work-orders"); // Workers van directo a órdenes de trabajo
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cerrar sesión");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      setLocation("/login");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN" || user?.role === "administrador",
    isWorker: user?.role === "WORKER" || user?.role === "mecanico" || user?.role === "ADMIN" || user?.role === "administrador",
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
  };
}
