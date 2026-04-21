import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { sdk } from "./sdk";
import { getSupabaseUserFromBearer } from "./supabaseAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const supabaseUser = await getSupabaseUserFromBearer(opts.req.headers.authorization);
  if (supabaseUser) {
    await db.upsertUser({
      openId: supabaseUser.id,
      name: supabaseUser.name ?? null,
      email: supabaseUser.email ?? null,
      loginMethod: supabaseUser.provider ?? "supabase",
      lastSignedIn: new Date(),
    });
    user = (await db.getUserByOpenId(supabaseUser.id)) ?? null;
  }

  try {
    if (!user) {
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Local development fallback to avoid OAuth setup friction.
  if (!user && ENV.devAuthBypass && !ENV.isProduction) {
    user = {
      id: 0,
      openId: "local-dev-admin",
      name: "Local Admin",
      email: "local-admin@example.com",
      loginMethod: "dev-bypass",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
