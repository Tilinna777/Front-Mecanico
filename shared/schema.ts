import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  rut: text("rut").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  name: text("name").notNull(),
  role: text("role").notNull(), // "mecanico" or "administrador"
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  partNumber: text("part_number").notNull(),
  compatibleBrand: text("compatible_brand").notNull(),
  compatibleModel: text("compatible_model").notNull(),
  year: integer("year").notNull(),
  provider: text("provider").notNull(),
  stock: integer("stock").notNull().default(0),
  quality: text("quality").notNull(), // Excellent, Good, Regular, Bad
  price: integer("price").notNull().default(0),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  supplier: text("supplier").notNull(),
  totalCost: integer("total_cost").notNull(),
  items: json("items").notNull(), // Array of { productId, quantity, cost }
});

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  otNumber: serial("ot_number"), // Display ID
  patent: text("patent").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  km: integer("km").notNull(),
  entryDate: timestamp("entry_date").defaultNow(),
  total: integer("total").notNull(),
  mechanic: text("mechanic").notNull(),
  supervisor: text("supervisor").notNull(),
  clientSignature: text("client_signature"), // Could be base64 or just a name for now
  status: text("status").notNull().default("pending"), // pending, completed, delivered
  services: json("services").notNull(), // { padReplacement: boolean, ... }
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const loginSchema = z.object({
  rut: z.string().min(1, "RUT es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true, date: true });
export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true, otNumber: true, entryDate: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
