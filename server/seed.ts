import { db } from "./db";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Iniciando seed de la base de datos...");

  try {
    // Crear usuario administrador por defecto
    const adminRut = "11.111.111-1";
    const existingAdmin = await storage.getUserByRut(adminRut);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await storage.createUser({
        rut: adminRut,
        password: hashedPassword,
        name: "Administrador",
        role: "ADMIN",
      });
      console.log("✅ Usuario ADMIN creado:");
      console.log("   RUT: 11.111.111-1");
      console.log("   Contraseña: admin123");
      console.log("   Rol: ADMIN");
    } else {
      console.log("ℹ️  Usuario administrador ya existe");
    }

    // Crear usuario trabajador de ejemplo
    const workerRut = "22.222.222-2";
    const existingWorker = await storage.getUserByRut(workerRut);

    if (!existingWorker) {
      const hashedPassword = await bcrypt.hash("worker123", 10);
      await storage.createUser({
        rut: workerRut,
        password: hashedPassword,
        name: "Juan Pérez",
        role: "WORKER",
      });
      console.log("✅ Usuario WORKER creado:");
      console.log("   RUT: 22.222.222-2");
      console.log("   Contraseña: worker123");
      console.log("   Rol: WORKER");
    } else {
      console.log("ℹ️  Usuario trabajador ya existe");
    }

    console.log("\n🎉 Seed completado exitosamente!");
  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
