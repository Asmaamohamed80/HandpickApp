import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  createOrder,
  getAllOrders,
  getRecentOrders,
  getOrdersByGovernorate,
  getDistinctBrands,
  getDistinctCategories,
  getProductReviews,
  createProductReview,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            category: z.string().min(1).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return getAllProducts(input?.category);
      }),
    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getProductById(input);
    }),
    brands: publicProcedure.query(async () => {
      return getDistinctBrands();
    }),
    categories: publicProcedure.query(async () => {
      return getDistinctCategories();
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          brand: z.string().min(1),
          category: z.string().min(1),
          price: z.string(),
          rating: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can create products");
        }
        return createProduct({
          name: input.name,
          brand: input.brand,
          category: input.category,
          price: input.price,
          rating: input.rating || "4.5",
          description: input.description,
          imageUrl: input.imageUrl,
        });
      }),
    delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can delete products");
      }
      return deleteProduct(input);
    }),
    reviews: router({
      list: publicProcedure.input(z.number()).query(async ({ input }) => {
        return getProductReviews(input);
      }),
      create: publicProcedure
        .input(
          z.object({
            productId: z.number(),
            reviewerName: z.string().min(2),
            reviewerEmail: z.string().email().optional(),
            rating: z.string(),
            comment: z.string().min(5),
          })
        )
        .mutation(async ({ input }) => {
          return createProductReview(input);
        }),
    }),
  }),

  orders: router({
    create: publicProcedure
      .input(
        z.object({
          userEmail: z.string().email(),
          governorate: z.string().min(1),
          productId: z.number(),
          whatsappNumber: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        return createOrder({
          userEmail: input.userEmail,
          governorate: input.governorate,
          productId: input.productId,
          whatsappNumber: input.whatsappNumber,
        });
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can view orders");
      }
      return getAllOrders();
    }),
  }),

  reports: router({
    getSummary: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can view reports");
      }
      const allOrders = await getAllOrders();
      const byGovernorate = await getOrdersByGovernorate();
      const recentOrders = await getRecentOrders(10);

      const topGovernorate = Object.entries(byGovernorate).sort(
        ([, a], [, b]) => b - a
      )[0];

      return {
        totalOrders: allOrders.length,
        topGovernorate: topGovernorate ? { name: topGovernorate[0], count: topGovernorate[1] } : null,
        byGovernorate,
        recentOrders,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
