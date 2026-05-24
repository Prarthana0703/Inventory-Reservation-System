import { prisma } from "@/lib/prisma";
import { getIdempotencyResult, setIdempotencyResult } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idempotencyKey = request.headers.get("Idempotency-Key");

  if (idempotencyKey) {
    const cached = await getIdempotencyResult(`confirm:${idempotencyKey}`);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status === "CONFIRMED") {
    return NextResponse.json({ error: "Already confirmed" }, { status: 400 });
  }

  if (reservation.status === "RELEASED") {
    return NextResponse.json({ error: "Reservation was released" }, { status: 400 });
  }

  if (new Date() > reservation.expiresAt) {
    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
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

    return NextResponse.json({ error: "Reservation expired" }, { status: 410 });
  }

  const confirmed = await prisma.$transaction(async (tx) => {
    const updated = await tx.reservation.update({
      where: { id },
      data: { status: "CONFIRMED" },
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
      data: {
        totalUnits: { decrement: reservation.quantity },
        reservedUnits: { decrement: reservation.quantity },
      },
    });

    return updated;
  });

  if (idempotencyKey) {
    await setIdempotencyResult(`confirm:${idempotencyKey}`, JSON.stringify(confirmed));
  }

  return NextResponse.json(confirmed);
}
