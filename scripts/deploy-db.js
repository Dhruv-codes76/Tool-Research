const { execSync } = require('child_process');

console.log("🚀 Starting database deployment step...");

// 1. Resolve URLs from Vercel environment variables
const directUrl = process.env.DIRECT_URL || process.env.PROD_DIRECT_URL || process.env.DATABASE_URL;
const pooledUrl = process.env.DATABASE_URL || process.env.PROD_DATABASE_URL;

if (!directUrl) {
  console.error("❌ No DIRECT_URL or DATABASE_URL found. Skipping database deployment.");
  process.exit(1);
}

try {
  // 2. Resolve failed migration (P3018) via Prisma CLI before deploying
  console.log("🩹 Resolving stuck migration 20260630182811_slug_optional via CLI...");
  try {
    execSync('npx prisma migrate resolve --applied 20260630182811_slug_optional', {
      env: { ...process.env, DATABASE_URL: directUrl }, 
      stdio: 'inherit'
    });
  } catch (e) {
    console.log("Note: Resolve command skipped or already applied.");
  }

  // 3. Run Migrations using the Direct Connection (Required for schema changes)
  console.log("📦 Running prisma migrate deploy...");
  execSync('npx prisma migrate deploy', { 
    env: { ...process.env, DATABASE_URL: directUrl }, 
    stdio: 'inherit' 
  });
  console.log("✅ Migrations applied successfully!");

  // 3. Run Seed Script using the Pooled Connection (Required for normal queries)
  if (pooledUrl) {
    console.log("🌱 Running prisma db seed...");
    execSync('npx prisma db seed', {
      env: { ...process.env, DATABASE_URL: pooledUrl },
      stdio: 'inherit'
    });
    console.log("✅ Database seeded successfully!");
  }

} catch (error) {
  console.error("❌ Database deployment failed:", error.message);
  process.exit(1);
}
