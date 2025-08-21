import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function envOr(key, fallback) {
  return process.env[key] && process.env[key].trim() !== "" ? process.env[key] : fallback;
}

const defaultAdmins = [
  { email: "8857198499@student.cms.k12.nc.us", name: "Akmal Nazir", role: "EXEC_TECH", passEnv: "ADMIN2_PASSWORD", emailEnv: "ADMIN2_EMAIL" },
  { email: "3688274334@student.cms.k12.nc.us", name: "Sai Bethi", role: "EXEC_OUTREACH", passEnv: "ADMIN3_PASSWORD", emailEnv: "ADMIN3_EMAIL" },
  { email: "1485956757@student.cms.k12.nc.us", name: "Yin Ho", role: "PRESIDENT", passEnv: "ADMIN1_PASSWORD", emailEnv: "ADMIN1_EMAIL" },
];

async function main() {
  for (const def of defaultAdmins) {
    const email = envOr(def.emailEnv, def.email);
    const password = envOr(def.passEnv, "admin123"); // fallback dev password
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
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
    console.log(`Seeded admin: ${email} (role=${def.role})`);
  }
  console.log("✅ Admin users seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
