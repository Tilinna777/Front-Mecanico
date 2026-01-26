import { z } from "zod";

// Client-only schemas and types (no drizzle or server DB code)
export const productSchema = z.object({
  id: z.number(),
  partNumber: z.string(),
  compatibleBrand: z.string(),
  compatibleModel: z.string(),
  year: z.number().int(),
  provider: z.string(),
  stock: z.number().int(),
  quality: z.string(),
});

export const insertProductSchema = productSchema.omit({ id: true });

export const purchaseItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int(),
  cost: z.number().int(),
});

export const purchaseSchema = z.object({
  id: z.number(),
  date: z.string(),
  supplier: z.string(),
  totalCost: z.number().int(),
  items: z.array(purchaseItemSchema),
});

export const insertPurchaseSchema = purchaseSchema.omit({ id: true, date: true });

export const workOrderSchema = z.object({
  id: z.number(),
  otNumber: z.number(),
  patent: z.string(),
  brand: z.string(),
  model: z.string(),
  km: z.number().int(),
  entryDate: z.string(),
  total: z.number().int(),
  mechanic: z.string(),
  supervisor: z.string(),
  clientSignature: z.string().nullable().optional(),
  status: z.string(),
  services: z.any(),
});

export const insertWorkOrderSchema = workOrderSchema.omit({ id: true, otNumber: true, entryDate: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = z.infer<typeof productSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = z.infer<typeof purchaseSchema>;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = z.infer<typeof workOrderSchema>;

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  products: {
    list: {
      method: "GET" as const,
      path: "/api/products",
      input: z.object({ search: z.string().optional() }).optional(),
      responses: { 200: z.array(productSchema) },
    },
    create: {
      method: "POST" as const,
      path: "/api/products",
      input: insertProductSchema,
      responses: { 201: productSchema, 400: errorSchemas.validation },
    },
    update: {
      method: "PUT" as const,
      path: "/api/products/:id",
      input: insertProductSchema.partial(),
      responses: { 200: productSchema, 404: errorSchemas.notFound },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/products/:id",
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
  },
  purchases: {
    list: {
      method: "GET" as const,
      path: "/api/purchases",
      responses: { 200: z.array(purchaseSchema) },
    },
    create: {
      method: "POST" as const,
      path: "/api/purchases",
      input: insertPurchaseSchema,
      responses: { 201: purchaseSchema, 400: errorSchemas.validation },
    },
  },
  workOrders: {
    list: {
      method: "GET" as const,
      path: "/api/work-orders",
      input: z.object({ search: z.string().optional() }).optional(),
      responses: { 200: z.array(workOrderSchema) },
    },
    create: {
      method: "POST" as const,
      path: "/api/work-orders",
      input: insertWorkOrderSchema,
      responses: { 201: workOrderSchema, 400: errorSchemas.validation },
    },
    update: {
      method: "PUT" as const,
      path: "/api/work-orders/:id",
      input: insertWorkOrderSchema.partial(),
      responses: { 200: workOrderSchema, 404: errorSchemas.notFound },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/work-orders/:id",
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
