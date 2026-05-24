import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      inventory: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = products.map((product) => {
    const stock = product.inventory.map((inv) => ({
      warehouseId: inv.warehouseId,
      warehouseName: inv.warehouse.name,
      warehouseLocation: inv.warehouse.location,
      totalUnits: inv.totalUnits,
      reservedUnits: inv.reservedUnits,
      availableUnits: inv.totalUnits - inv.reservedUnits,
    }));

    const totalAvailable = stock.reduce((sum, s) => sum + s.availableUnits, 0);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      stock,
      totalAvailable,
    };
  });

  return NextResponse.json(result);
}
