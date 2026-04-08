import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@inventoryhub.local";
  const password = "Admin@12345";
  const passwordHash = await bcrypt.hash(password, 12);

  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: Role.ADMIN
    }
  });

  if (existingAdmin) {
    const updated = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email,
        name: existingAdmin.name || "Inventory Admin",
        passwordHash,
        isActive: true
      }
    });

    console.log(`Admin reset successfully.`);
    console.log(`Email: ${updated.email}`);
    console.log(`Password: ${password}`);
    return;
  }

  const created = await prisma.user.create({
    data: {
      name: "Inventory Admin",
      email,
      passwordHash,
      role: Role.ADMIN,
      isActive: true
    }
  });

  console.log(`Admin created successfully.`);
  console.log(`Email: ${created.email}`);
  console.log(`Password: ${password}`);
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
