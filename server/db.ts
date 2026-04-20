import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { InsertUser, users, products, orders, InsertProduct, InsertOrder } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { ProductCategory } from "@shared/const";
import postgres from "postgres";

let _db: ReturnType<typeof drizzle> | null = null;
let _sql: postgres.Sql | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _sql = postgres(ENV.databaseUrl, { ssl: "require" });
      _db = drizzle(_sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _sql = null;
    }
  }
  return _db;
}

export async function pingDatabase() {
  if (!ENV.databaseUrl) {
    return {
      ok: false,
      reason: "SUPABASE_DATABASE_URL is not configured",
    } as const;
  }

  try {
    if (!_sql) {
      await getDb();
    }
    if (!_sql) {
      return { ok: false, reason: "Database client is not initialized" } as const;
    }
    await _sql`select 1 as ok`;
    return { ok: true } as const;
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown database error",
    } as const;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProducts(category?: ProductCategory) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db
      .select()
      .from(products)
      .where(eq(products.category, category))
      .orderBy(products.createdAt);
  }
  return db.select().from(products).orderBy(products.createdAt);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orders).values(data);
  // Get the created order
  const result = await db.select().from(orders).where(eq(orders.userEmail, data.userEmail)).orderBy(desc(orders.createdAt)).limit(1);
  return result[0] || data;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(orders.createdAt);
}

export async function getRecentOrders(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(orders.createdAt).limit(limit);
}

export async function getOrdersByGovernorate() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(orders);
  const grouped: Record<string, number> = {};
  result.forEach(order => {
    grouped[order.governorate] = (grouped[order.governorate] || 0) + 1;
  });
  return grouped;
}

// TODO: add feature queries here as your schema grows.
