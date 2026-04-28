import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { loginWithGithub } from "@/lib/supabase";

export function Header() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const logoutMutation = useAuth().logout;
  const isControlPage = location === "/control" || location === "/admin";
  const isReportsPage = location === "/reports";

  const handleLogout = async () => {
    await logoutMutation?.();
    navigate("/");
  };
  return (
    <header className="header-elegant sticky top-0 z-50">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-accent/15 border border-accent/30">
            <span className="text-xl font-bold text-accent">H</span>
          </div>
          <div className="leading-tight">
            <h1 className="text-3xl font-bold text-foreground">Handpick</h1>
            <p className="text-sm text-muted-foreground">منتقى بعناية</p>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {user?.role === "admin" && (
            <>
              <Button
                onClick={() => navigate("/control")}
                variant={isControlPage ? "default" : "outline"}
                className={isControlPage ? "btn-primary" : "btn-secondary"}
              >
                لوحة التحكم
              </Button>
              <Button
                onClick={() => navigate("/reports")}
                variant={isReportsPage ? "default" : "outline"}
                className={isReportsPage ? "btn-primary" : "btn-secondary"}
              >
                التقارير
              </Button>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-foreground text-sm">{user.name || user.email}</span>
              <Button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                loginWithGithub().catch((error) => {
                  console.error("[Auth] GitHub login failed", error);
                  alert(
                    error instanceof Error
                      ? error.message
                      : "تعذر بدء تسجيل الدخول. تأكد من إضافة SUPABASE_URL و SUPABASE_ANON_KEY في Render ثم أعد النشر."
                  );
                });
              }}
              className="btn-primary flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
