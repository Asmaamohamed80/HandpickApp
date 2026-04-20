const appUrl = process.env.APP_URL;

if (!appUrl) {
  console.error("Missing APP_URL. Example: APP_URL=https://your-app.vercel.app");
  process.exit(1);
}

const check = async (path) => {
  const url = `${appUrl.replace(/\/+$/, "")}${path}`;
  const res = await fetch(url);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new Error(`${path} failed (${res.status}): ${JSON.stringify(body)}`);
  }

  console.log(`OK ${path}`, body ?? "");
};

try {
  await check("/api/health");
  await check("/api/health/db");
  console.log("Production readiness checks passed.");
} catch (error) {
  console.error("Production readiness check failed:", error);
  process.exit(1);
}
