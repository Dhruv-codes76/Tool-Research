import { prisma } from '../src/lib/prisma';
import { getSupabaseAdmin } from '../src/lib/supabase';

async function main() {
  console.log("🌱 Seeding database using configured client...");

  // 1. Ensure the single primary admin exists.
  //
  // IDEMPOTENT: this runs inside `npm run build` (deploy-db.js), so it must do
  // nothing once a primary admin already exists — otherwise every deploy would
  // re-send an invite email.
  const adminEmail = process.env.PRIMARY_ADMIN_EMAIL || 'dhruvnvishwa@gmail.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let user = await prisma.user.findFirst({ where: { isPrimaryAdmin: true } });

  if (!user) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existing) {
      // An account with this email already exists (e.g. previously seeded) —
      // promote it to primary without sending an invite; it already has (or can
      // create) a Supabase identity, so don't reset an ACTIVE user to INVITED.
      user = await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN', isPrimaryAdmin: true },
      });
      console.log("Promoted existing user to primary admin:", user.email);
    } else {
      // Brand-new primary admin: send the self-invite (set-password) link, then
      // create the Prisma row as INVITED. Invite is best-effort so a missing
      // Supabase service key / SMTP config doesn't abort the whole seed.
      try {
        await getSupabaseAdmin().auth.admin.inviteUserByEmail(adminEmail, {
          redirectTo: `${siteUrl}/auth/callback?next=/accept-invite`,
        });
        console.log("Sent primary admin self-invite to:", adminEmail);
      } catch (err) {
        console.warn(
          "⚠️  Could not send primary admin invite (configure SUPABASE_SERVICE_ROLE_KEY + SMTP). The admin can also sign in directly with this email once it exists in Supabase Auth. Reason:",
          err instanceof Error ? err.message : err
        );
      }

      user = await prisma.user.create({
        data: {
          name: adminEmail.split('@')[0],
          email: adminEmail,
          role: 'ADMIN',
          isPrimaryAdmin: true,
          status: 'INVITED',
          invitedAt: new Date(),
        },
      });
      console.log("Created primary admin user:", user.email);
    }
  }



  console.log("✅ Seeding finished successfully!");
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Seeding Error:", err);
  process.exit(1);
});
