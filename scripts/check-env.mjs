/**
 * يتحقق من متغيرات البيئة المحلية (نفس منطق السيرفر تقريباً).
 * تشغيل: pnpm check:env
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });

function pick(...keys) {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return { key: k, value: v };
  }
  return null;
}

const url = pick(
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL"
);

const anon = pick(
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
);

const service = pick("SUPABASE_SERVICE_ROLE_KEY");

const database = pick("SUPABASE_DATABASE_URL", "DATABASE_URL");

let ok = true;

console.log("\n=== Handpick — فحص البيئة المحلية ===\n");

if (!url) {
  ok = false;
  console.log("❌ رابط Supabase: غير موجود");
  console.log("   أضف واحداً من: SUPABASE_URL أو VITE_SUPABASE_URL أو NEXT_PUBLIC_SUPABASE_URL\n");
} else {
  console.log(`✅ رابط Supabase: موجود (${url.key})`);
}

if (!anon) {
  ok = false;
  console.log("❌ مفتاح المتصفح (anon / publishable): غير موجود");
  console.log(
    "   أضف واحداً من: SUPABASE_ANON_KEY أو SUPABASE_PUBLISHABLE_KEY أو NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\n"
  );
} else {
  console.log(`✅ مفتاح المتصفح: موجود (${anon.key})`);
}

if (!service) {
  ok = false;
  console.log("❌ SUPABASE_SERVICE_ROLE_KEY: غير موجود (مطلوب للسيرفر)\n");
} else {
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: موجود`);
}

if (!database) {
  console.log("⚠️  قاعدة البيانات: SUPABASE_DATABASE_URL أو DATABASE_URL غير موجودة (قد يفشل الـ API)\n");
} else {
  console.log(`✅ قاعدة البيانات: موجودة (${database.key})`);
}

if (ok) {
  console.log("\n✅ الإعدادات الأساسية للـ Supabase كاملة محلياً.");
  console.log("   جرّب: pnpm dev ثم افتح http://localhost:3000/api/client-config\n");
  console.log("---");
  console.log("ما لا يمكن أتمتته من الكود: إدخال نفس المتغيرات في Render يدوياً ثم Deploy.\n");
  process.exit(0);
}

console.log("\nعدّل ملف .env.local في جذر المشروع ثم أعد: pnpm check:env\n");
process.exit(1);
