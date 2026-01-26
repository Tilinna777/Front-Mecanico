import { db } from "./db";
import {
  products, purchases, workOrders, users,
  type InsertProduct, type InsertPurchase, type InsertWorkOrder, type InsertUser,
  type Product, type Purchase, type WorkOrder, type User
} from "@shared/schema";
import { eq, ilike, desc, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUserByRut(rut: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(search?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;

  // Work Orders
  getWorkOrders(search?: string): Promise<WorkOrder[]>;
  getWorkOrder(id: number): Promise<WorkOrder | undefined>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder>;
  deleteWorkOrder(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUserByRut(rut: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.rut, rut));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Products
  async getProducts(search?: string): Promise<Product[]> {
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      return await db.select().from(products).where(
        or(
          ilike(products.partNumber, searchLower),
          ilike(products.compatibleModel, searchLower),
          ilike(products.compatibleBrand, searchLower)
        )
      ).orderBy(desc(products.id));
    }
    return await db.select().from(products).orderBy(desc(products.id));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.date));
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
    return newPurchase;
  }

  // Work Orders
  async getWorkOrders(search?: string): Promise<WorkOrder[]> {
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      return await db.select().from(workOrders).where(
        or(
          ilike(workOrders.patent, searchLower),
          ilike(workOrders.model, searchLower)
        )
      ).orderBy(desc(workOrders.entryDate));
    }
    return await db.select().from(workOrders).orderBy(desc(workOrders.entryDate));
  }

  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    const [order] = await db.select().from(workOrders).where(eq(workOrders.id, id));
    return order;
  }

  async createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder> {
    const [newOrder] = await db.insert(workOrders).values(workOrder).returning();
    return newOrder;
  }

  async updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder> {
    const [updated] = await db.update(workOrders).set(workOrder).where(eq(workOrders.id, id)).returning();
    return updated;
  }

  async deleteWorkOrder(id: number): Promise<void> {
    await db.delete(workOrders).where(eq(workOrders.id, id));
  }
}

export const storage = new DatabaseStorage();
