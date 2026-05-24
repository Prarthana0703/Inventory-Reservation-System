"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { ProductWithStock } from "@/types";

interface ProductCardProps {
  product: ProductWithStock;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    product.stock[0]?.warehouseId ?? ""
  );
  const [loading, setLoading] = useState(false);

  const selectedStock = product.stock.find((s) => s.warehouseId === selectedWarehouseId);
  const availableUnits = selectedStock?.availableUnits ?? 0;
  const isOutOfStock = availableUnits === 0;

  const warehouseOptions = product.stock.map((s) => ({
    value: s.warehouseId,
    label: `${s.warehouseName} (${s.availableUnits} available)`,
  }));

  async function handleReserve() {
    if (!selectedWarehouseId) {
      toast({ title: "Select a warehouse", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const idempotencyKey = `${product.id}-${selectedWarehouseId}-${Date.now()}`;

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: selectedWarehouseId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: response.status === 409 ? "Out of Stock" : "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Reserved!", description: "Item reserved for 10 minutes." });
      router.push(`/reservation/${data.id}`);
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="flex-1 pt-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base leading-tight">{product.name}</h3>
          <Badge variant={product.totalAvailable > 5 ? "default" : "secondary"} className="shrink-0">
            {product.totalAvailable} left
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Select Warehouse
          </label>
          <Select
            value={selectedWarehouseId}
            onChange={setSelectedWarehouseId}
            options={warehouseOptions}
          />
        </div>

        {selectedStock && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted rounded p-2">
              <div className="text-muted-foreground">Total Stock</div>
              <div className="font-semibold">{selectedStock.totalUnits}</div>
            </div>
            <div className="bg-muted rounded p-2">
              <div className="text-muted-foreground">Available</div>
              <div className={`font-semibold ${availableUnits === 0 ? "text-destructive" : "text-green-600"}`}>
                {availableUnits}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full"
          onClick={handleReserve}
          disabled={isOutOfStock || loading}
        >
          {loading ? "Reserving..." : isOutOfStock ? "Out of Stock" : "Reserve Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
