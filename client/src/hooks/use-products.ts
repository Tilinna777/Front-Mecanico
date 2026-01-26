import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Product {
  id: string;
  sku: string;
  nombre: string;
  marca: string | null;
  calidad: string | null;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  categoria: {
    id: string;
    nombre: string;
  } | null;
}

export interface CreateProductDTO {
  sku: string;
  nombre: string;
  marca?: string;
  calidad?: string;
  precio_venta: number;
  stock_actual?: number;
  stock_minimo?: number;
  categoria_id?: string;
}

export function useProducts(search?: string) {
  return useQuery<Product[]>({
    queryKey: ["products", search],
    queryFn: async () => {
      const url = search 
        ? `/api/products?search=${encodeURIComponent(search)}`
        : "/api/products";
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      
      // Adaptar datos del backend al formato del frontend
      return data.map((p: any) => ({
        id: p.id?.toString() || p.id,
        sku: p.partNumber || p.sku || "N/A",
        nombre: p.partNumber ? `${p.compatibleBrand} ${p.compatibleModel} (${p.year})` : (p.nombre || "Sin nombre"),
        marca: p.compatibleBrand || p.provider || p.marca || null,
        calidad: p.quality || p.calidad || null,
        precio_venta: p.precio_venta || 25000,
        stock_actual: p.stock || p.stock_actual || 0,
        stock_minimo: p.stock_minimo || 10,
        categoria: p.categoria || { id: "1", nombre: "General" },
      }));
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al crear producto");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateProductDTO>) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al actualizar producto");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { 
        method: "DELETE", 
        credentials: "include" 
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al eliminar producto");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
