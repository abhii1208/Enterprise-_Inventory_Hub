import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminCount = await prisma.user.count({
    where: {
      role: "ADMIN"
    }
  });

  if (adminCount === 0) {
    console.log("No admin exists yet. Use the one-time first-admin registration screen in the app.");
    console.log("Seeding skipped so bootstrap registration remains available.");
    return;
  }

  console.log("Admin account detected. No default users were seeded.");
  console.log("Inventory data can be imported, previewed, and searched by any signed-in user.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
