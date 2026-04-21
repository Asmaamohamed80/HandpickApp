import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { isSupabaseConfigured, loginWithGithub } from "@/lib/supabase";

export function Header() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const logoutMutation = useAuth().logout;

  const handleLogout = async () => {
    await logoutMutation?.();
    navigate("/");
  };
  const authReady = isSupabaseConfigured;

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
                onClick={() => navigate("/admin")}
                variant={location === "/admin" ? "default" : "outline"}
                className={location === "/admin" ? "btn-primary" : "btn-secondary"}
              >
                لوحة التحكم
              </Button>
              <Button
                onClick={() => navigate("/reports")}
                variant={location === "/reports" ? "default" : "outline"}
                className={location === "/reports" ? "btn-primary" : "btn-secondary"}
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
                  if (!authReady) {
                    alert("تسجيل الدخول غير مُفعّل بعد. أضف متغيرات Supabase Auth في Render.");
                    return;
                  }
                  alert("تعذر بدء تسجيل الدخول حالياً");
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
