import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// helper: get env var or fallback
function envOr(key, fallback) {
  return process.env[key] && process.env[key].trim() !== "" ? process.env[key] : fallback;
}

const defaultAdmins = [
  {
    email: "8857198499@student.cms.k12.nc.us",
    name: "Akmal Nazir",
    role: "EXEC_TECH",
    passEnv: "ADMIN2_PASSWORD",
    emailEnv: "ADMIN2_EMAIL",
  },
  {
    email: "3688274334@student.cms.k12.nc.us",
    name: "Sai Bethi",
    role: "EXEC_OUTREACH",
    passEnv: "ADMIN3_PASSWORD",
    emailEnv: "ADMIN3_EMAIL",
  },
  {
    email: "1485956757@student.cms.k12.nc.us",
    name: "Yin Ho",
    role: "PRESIDENT",
    passEnv: "ADMIN1_PASSWORD",
    emailEnv: "ADMIN1_EMAIL",
  },
];

async function main() {
  // 1. Seed default admins
  for (const def of defaultAdmins) {
    const email = envOr(def.emailEnv, def.email);
    const password = envOr(def.passEnv, "admin123");
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: def.name,
        role: def.role,
        approved: true,
        passwordHash,
      },
    });

    // ensure account exists
    await prisma.account.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, cash: 100000 },
    });

    console.log(`✅ Seeded admin: ${email} (role=${def.role})`);
  }

  // 2. Backfill accounts for all users
  const users = await prisma.user.findMany();
  for (const u of users) {
    await prisma.account.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, cash: 100000 },
    });
  }
  console.log("✅ Backfilled accounts for all users");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
