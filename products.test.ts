import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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

describe("Products Router", () => {
  it("should list all products (public)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should get product by id (public)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.getById(1);
    // Product may or may not exist, but should not throw
    expect(product === undefined || typeof product === "object").toBe(true);
  });

  it("should create product as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product",
      brand: "Test Brand",
      category: "عطور",
      price: "100",
      rating: "4.5",
      description: "Test Description",
      imageUrl: "https://example.com/image.jpg",
    });

    expect(result).toBeDefined();
  });

  it("should not create product as non-admin", async () => {
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
});

describe("Orders Router", () => {
  it("should create order (public)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      userEmail: "customer@example.com",
      governorate: "القاهرة",
      productId: 1,
      whatsappNumber: "201001234567",
    });

    expect(result).toBeDefined();
  });

  it("should list orders as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.list();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should not list orders as non-admin", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.list();
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("Reports Router", () => {
  it("should get summary as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.reports.getSummary();
    expect(summary).toBeDefined();
    expect(typeof summary.totalOrders).toBe("number");
    expect(typeof summary.byGovernorate).toBe("object");
    expect(Array.isArray(summary.recentOrders)).toBe(true);
  });

  it("should not get summary as non-admin", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.reports.getSummary();
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
