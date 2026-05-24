import { prisma } from "@/lib/prisma";
import { acquireLock, releaseLock, getIdempotencyResult, setIdempotencyResult } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reservationSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  if (idempotencyKey) {
    const cached = await getIdempotencyResult(idempotencyKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }
  }

  const body = await request.json();
  const parsed = reservationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { productId, warehouseId, quantity } = parsed.data;
  const lockKey = `inventory:${productId}:${warehouseId}`;

  const locked = await acquireLock(lockKey, 10);
  if (!locked) {
    return NextResponse.json({ error: "Server busy, please retry" }, { status: 503 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId },
        },
      });

      if (!inventory) {
        return { error: "Inventory not found", status: 404 };
      }

      const availableStock = inventory.totalUnits - inventory.reservedUnits;

      if (availableStock < quantity) {
        return { error: "Not enough stock", status: 409 };
      }

      await tx.inventory.update({
        where: { productId_warehouseId: { productId, warehouseId } },
        data: { reservedUnits: { increment: quantity } },
      });

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const reservation = await tx.reservation.create({
        data: { productId, warehouseId, quantity, status: "PENDING", expiresAt },
        include: {
          product: { select: { name: true, imageUrl: true, description: true } },
          warehouse: { select: { name: true, location: true } },
        },
      });

      return { data: reservation, status: 201 };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (idempotencyKey) {
      await setIdempotencyResult(idempotencyKey, JSON.stringify(result.data));
    }

    return NextResponse.json(result.data, { status: 201 });
  } finally {
    await releaseLock(lockKey);
  }
}
