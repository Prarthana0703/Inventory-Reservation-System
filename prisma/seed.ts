import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  },
  {
    name: "Mechanical Keyboard",
    description: "Compact TKL mechanical keyboard with Cherry MX switches and RGB backlight.",
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400",
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and 100W PD.",
    imageUrl: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400",
  },
  {
    name: "Webcam 4K",
    description: "4K Ultra HD webcam with autofocus and built-in noise-cancelling mic.",
    imageUrl: "https://images.unsplash.com/photo-1587826080692-f439cd0b70a3?w=400",
  },
  {
    name: "Monitor Stand",
    description: "Adjustable aluminum monitor stand with built-in USB hub and cable management.",
    imageUrl: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400",
  },
  {
    name: "Desk Mat XL",
    description: "Extra-large desk mat (90x45cm) with non-slip base and smooth surface.",
    imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
  },
  {
    name: "Ergonomic Mouse",
    description: "Vertical ergonomic mouse reduces wrist strain with 6 programmable buttons.",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
  },
  {
    name: "LED Desk Lamp",
    description: "Smart LED desk lamp with wireless charging pad and adjustable color temperature.",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
  },
  {
    name: "Portable SSD",
    description: "1TB portable SSD with USB-C, read speeds up to 1000MB/s.",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400",
  },
  {
    name: "Phone Stand",
    description: "Adjustable aluminum phone and tablet stand with cable management slot.",
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
  },
];

const warehouses = [
  { name: "Mumbai Central", location: "Mumbai, Maharashtra" },
  { name: "Delhi North", location: "Delhi, NCR" },
  { name: "Bangalore Tech Park", location: "Bangalore, Karnataka" },
];

async function main() {
  console.log("Seeding database...");

  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  const createdWarehouses = await Promise.all(
    warehouses.map((w) => prisma.warehouse.create({ data: w }))
  );

  const createdProducts = await Promise.all(
    products.map((p) => prisma.product.create({ data: p }))
  );

  for (const product of createdProducts) {
    for (const warehouse of createdWarehouses) {
      const totalUnits = Math.floor(Math.random() * 20) + 5;
      await prisma.inventory.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          totalUnits,
          reservedUnits: 0,
        },
      });
    }
  }

  console.log(`Created ${createdProducts.length} products`);
  console.log(`Created ${createdWarehouses.length} warehouses`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
