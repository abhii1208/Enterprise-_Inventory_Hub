import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const adminPassword = await bcrypt.hash("Admin@12345", 12);
    const userPassword = await bcrypt.hash("User@12345", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@inventoryhub.local" },
        update: {},
        create: {
            name: "Inventory Admin",
            email: "admin@inventoryhub.local",
            passwordHash: adminPassword,
            role: Role.ADMIN
        }
    });
    await prisma.user.upsert({
        where: { email: "user@inventoryhub.local" },
        update: {},
        create: {
            name: "Inventory User",
            email: "user@inventoryhub.local",
            passwordHash: userPassword,
            role: Role.USER
        }
    });
    const importLog = await prisma.importLog.create({
        data: {
            fileName: "seed-inventory.xlsx",
            uploadedById: admin.id,
            rowsImported: 3,
            failedRows: 0,
            status: "COMPLETED",
            summary: "Initial demo dataset"
        }
    });
    await prisma.inventoryItem.createMany({
        data: [
            {
                skuCode: "SKU-1001",
                skuCodeNormalized: "sku-1001",
                itemName: "Premium Cotton Shirt",
                shelf: "A-01",
                type: "Apparel",
                quantity: 24,
                size: "M",
                color: "Stone Blue",
                imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
                importLogId: importLog.id
            },
            {
                skuCode: "SKU-1002",
                skuCodeNormalized: "sku-1002",
                itemName: "Structured Office Tote",
                shelf: "B-07",
                type: "Accessories",
                quantity: 9,
                size: "Large",
                color: "Espresso",
                imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
                importLogId: importLog.id
            },
            {
                skuCode: "SKU-1002",
                skuCodeNormalized: "sku-1002",
                itemName: "Structured Office Tote",
                shelf: "B-08",
                type: "Accessories",
                quantity: 4,
                size: "Large",
                color: "Black",
                imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
                importLogId: importLog.id
            }
        ]
    });
    await prisma.auditLog.create({
        data: {
            actorId: admin.id,
            action: "SEED_COMPLETED",
            entityType: "SYSTEM",
            description: "Seed data created"
        }
    });
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
