import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { ensureSupabase, loginWithGithub } from "./lib/supabase";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Only redirect if trying to access protected routes
  const protectedRoutes = ["/control", "/admin", "/reports"];
  const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));
  
  if (isProtectedRoute) {
    loginWithGithub().catch((error) => {
      console.error("[Auth] Redirect to login failed", error);
    });
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        const doFetch = (token?: string) => {
          const headers = new Headers(init?.headers ?? {});
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers,
          });
        };

        return ensureSupabase().then((s) => {
          if (!s) return doFetch();
          return s.auth.getSession().then(({ data }) => {
            const token = data.session?.access_token;
            return doFetch(token);
          });
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
