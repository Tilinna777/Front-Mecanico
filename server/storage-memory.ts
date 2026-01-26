import bcrypt from "bcryptjs";
import type { User, Product, Purchase, WorkOrder, InsertUser, InsertProduct, InsertPurchase, InsertWorkOrder } from "@shared/schema";

// In-memory storage
let users: User[] = [];
let products: Product[] = [];
let purchases: Purchase[] = [];
let workOrders: WorkOrder[] = [];

// Initialize with mock data
async function initializeMockData() {
  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const mechanicPassword = await bcrypt.hash("mecanico123", 10);
  
  users = [
    {
      id: 1,
      rut: "11.111.111-1",
      password: adminPassword,
      name: "Administrador",
      role: "administrador",
      createdAt: new Date(),
    },
    {
      id: 2,
      rut: "22.222.222-2",
      password: mechanicPassword,
      name: "Juan Pérez",
      role: "mecanico",
      createdAt: new Date(),
    },
  ];

  // Create sample products
  products = [
    {
      id: 1,
      partNumber: "BRK-001",
      compatibleBrand: "Toyota",
      compatibleModel: "Corolla",
      year: 2020,
      provider: "Frenos Chile",
      stock: 50,
      quality: "Excellent",
    },
    {
      id: 2,
      partNumber: "BRK-002",
      compatibleBrand: "Nissan",
      compatibleModel: "Versa",
      year: 2019,
      provider: "Auto Parts SA",
      stock: 30,
      quality: "Good",
    },
  ];

  // Create sample purchases
  purchases = [
    {
      id: 1,
      date: new Date(),
      supplier: "Frenos Chile",
      totalCost: 250000,
      items: [{ productId: 1, quantity: 10, cost: 25000 }],
    },
  ];

  // Create sample work orders
  workOrders = [
    {
      id: 1,
      otNumber: 1001,
      patent: "AB-1234",
      brand: "Toyota",
      model: "Corolla",
      km: 50000,
      entryDate: new Date(),
      total: 150000,
      mechanic: "Juan Pérez",
      supervisor: "Carlos González",
      clientSignature: "Cliente",
      status: "pending",
      services: { padReplacement: true, discReplacement: false },
    },
  ];
}

initializeMockData();

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

export class MemoryStorage implements IStorage {
  // Users
  async getUserByRut(rut: string): Promise<User | undefined> {
    return users.find(u => u.rut === rut);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return users.find(u => u.id === id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: users.length + 1,
      ...user,
      createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
  }

  // Products
  async getProducts(search?: string): Promise<Product[]> {
    if (search) {
      const searchLower = search.toLowerCase();
      return products.filter(p => 
        p.partNumber.toLowerCase().includes(searchLower) ||
        p.compatibleModel.toLowerCase().includes(searchLower) ||
        p.compatibleBrand.toLowerCase().includes(searchLower)
      );
    }
    return [...products];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return products.find(p => p.id === id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: products.length + 1,
      ...product,
    };
    products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    products[index] = { ...products[index], ...product };
    return products[index];
  }

  async deleteProduct(id: number): Promise<void> {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
    }
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return [...purchases].sort((a, b) => 
      (b.date?.getTime() || 0) - (a.date?.getTime() || 0)
    );
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const newPurchase: Purchase = {
      id: purchases.length + 1,
      date: new Date(),
      ...purchase,
    };
    purchases.push(newPurchase);
    return newPurchase;
  }

  // Work Orders
  async getWorkOrders(search?: string): Promise<WorkOrder[]> {
    if (search) {
      const searchLower = search.toLowerCase();
      return workOrders.filter(wo =>
        wo.patent.toLowerCase().includes(searchLower) ||
        wo.model.toLowerCase().includes(searchLower)
      );
    }
    return [...workOrders].sort((a, b) => 
      (b.entryDate?.getTime() || 0) - (a.entryDate?.getTime() || 0)
    );
  }

  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    return workOrders.find(wo => wo.id === id);
  }

  async createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder> {
    const newOrder: WorkOrder = {
      id: workOrders.length + 1,
      otNumber: 1000 + workOrders.length + 1,
      entryDate: new Date(),
      status: "pending",
      ...workOrder,
    };
    workOrders.push(newOrder);
    return newOrder;
  }

  async updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder> {
    const index = workOrders.findIndex(wo => wo.id === id);
    if (index === -1) throw new Error("Work order not found");
    workOrders[index] = { ...workOrders[index], ...workOrder };
    return workOrders[index];
  }

  async deleteWorkOrder(id: number): Promise<void> {
    const index = workOrders.findIndex(wo => wo.id === id);
    if (index !== -1) {
      workOrders.splice(index, 1);
    }
  }
}

export const storage = new MemoryStorage();
