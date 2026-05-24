import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
  });

  if (expiredReservations.length === 0) {
    return NextResponse.json({ message: "No expired reservations", released: 0 });
  }

  let released = 0;

  for (const reservation of expiredReservations) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: "RELEASED" },
        });

        await tx.inventory.update({
          where: {
            productId_warehouseId: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
          },
          data: { reservedUnits: { decrement: reservation.quantity } },
        });
      });

      released++;
    } catch {
      console.error(`Failed to release reservation ${reservation.id}`);
    }
  }

  return NextResponse.json({ message: `Released ${released} reservations`, released });
}
