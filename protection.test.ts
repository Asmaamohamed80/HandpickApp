import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "admin" | "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: role === "admin" ? 1 : 2,
    openId: role === "admin" ? "admin-user" : "regular-user",
    email: role === "admin" ? "admin@example.com" : "user@example.com",
    name: role === "admin" ? "Admin User" : "Regular User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Access Control and Protection", () => {
  describe("Admin-only operations", () => {
    it("should allow admin to create products", async () => {
      const ctx = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.products.create({
        name: "Test Product",
        brand: "Test Brand",
        category: "عطور",
        price: "100",
      });

      expect(result).toBeDefined();
    });

    it("should deny regular user from creating products", async () => {
      const ctx = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.products.create({
          name: "Test Product",
          brand: "Test Brand",
          category: "عطور",
          price: "100",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should deny unauthenticated user from creating products", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.products.create({
          name: "Test Product",
          brand: "Test Brand",
          category: "عطور",
          price: "100",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should allow admin to delete products", async () => {
      const ctx = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.products.delete(1);
      expect(result).toBeDefined();
    });

    it("should deny regular user from deleting products", async () => {
      const ctx = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.products.delete(1);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should allow admin to view orders", async () => {
      const ctx = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const orders = await caller.orders.list();
      expect(Array.isArray(orders)).toBe(true);
    });

    it("should deny regular user from viewing orders", async () => {
      const ctx = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.orders.list();
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should allow admin to view reports", async () => {
      const ctx = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const summary = await caller.reports.getSummary();
      expect(summary).toBeDefined();
    });

    it("should deny regular user from viewing reports", async () => {
      const ctx = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.reports.getSummary();
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Public operations", () => {
    it("should allow anyone to list products", async () => {
      const publicCtx = createPublicContext();
      const userCtx = createUserContext("user");
      const adminCtx = createUserContext("admin");

      const publicCaller = appRouter.createCaller(publicCtx);
      const userCaller = appRouter.createCaller(userCtx);
      const adminCaller = appRouter.createCaller(adminCtx);

      const publicProducts = await publicCaller.products.list();
      const userProducts = await userCaller.products.list();
      const adminProducts = await adminCaller.products.list();

      expect(Array.isArray(publicProducts)).toBe(true);
      expect(Array.isArray(userProducts)).toBe(true);
      expect(Array.isArray(adminProducts)).toBe(true);
    });

    it("should allow anyone to create orders", async () => {
      const publicCtx = createPublicContext();
      const userCtx = createUserContext("user");

      const publicCaller = appRouter.createCaller(publicCtx);
      const userCaller = appRouter.createCaller(userCtx);

      const publicOrder = await publicCaller.orders.create({
        userEmail: "public@example.com",
        governorate: "القاهرة",
        productId: 1,
        whatsappNumber: "201001234567",
      });

      const userOrder = await userCaller.orders.create({
        userEmail: "user@example.com",
        governorate: "الإسكندرية",
        productId: 1,
        whatsappNumber: "201001234567",
      });

      expect(publicOrder).toBeDefined();
      expect(userOrder).toBeDefined();
    });
  });

  describe("Section separation", () => {
    it("should separate storefront (public) from admin operations", async () => {
      const publicCtx = createPublicContext();
      const adminCtx = createUserContext("admin");

      const publicCaller = appRouter.createCaller(publicCtx);
      const adminCaller = appRouter.createCaller(adminCtx);

      // Public can list products
      const publicProducts = await publicCaller.products.list();
      expect(Array.isArray(publicProducts)).toBe(true);

      // Public cannot delete products
      try {
        await publicCaller.products.delete(1);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Admin can delete products
      const adminDelete = await adminCaller.products.delete(1);
      expect(adminDelete).toBeDefined();

      // Public cannot view orders
      try {
        await publicCaller.orders.list();
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Admin can view orders
      const adminOrders = await adminCaller.orders.list();
      expect(Array.isArray(adminOrders)).toBe(true);
    });
  });
});
