import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status !== "PENDING") {
    return NextResponse.json(
      { error: `Cannot release a ${reservation.status} reservation` },
      { status: 400 }
    );
  }

  const released = await prisma.$transaction(async (tx) => {
    const updated = await tx.reservation.update({
      where: { id },
      data: { status: "RELEASED" },
      include: {
        product: { select: { name: true, imageUrl: true, description: true } },
        warehouse: { select: { name: true, location: true } },
      },
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

    return updated;
  });

  return NextResponse.json(released);
}
