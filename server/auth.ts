import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage-memory";
import type { User } from "@shared/schema";
import type { Express } from "express";
import session from "express-session";

export function setupAuth(app: Express) {
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "tu-secreto-super-seguro-cambialo-en-produccion",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "rut",
        passwordField: "password",
      },
      async (rut, password, done) => {
        try {
          const user = await storage.getUserByRut(rut);
          
          if (!user) {
            return done(null, false, { message: "RUT o contraseña incorrectos" });
          }

          const isValid = await bcrypt.compare(password, user.password);
          
          if (!isValid) {
            return done(null, false, { message: "RUT o contraseña incorrectos" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "No autenticado" });
}

// Middleware to check if user has admin role
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.role === "administrador") {
    return next();
  }
  res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador" });
}

// Middleware to check if user is mechanic or admin
export function isMechanic(req: any, res: any, next: any) {
  if (req.isAuthenticated() && (req.user.role === "mecanico" || req.user.role === "administrador")) {
    return next();
  }
  res.status(403).json({ message: "Acceso denegado. Se requiere rol de mecánico o administrador" });
}

// Type augmentation for Express
declare global {
  namespace Express {
    interface User {
      id: number;
      rut: string;
      name: string;
      role: string;
    }
  }
}
