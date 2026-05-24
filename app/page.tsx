"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, Package } from "lucide-react";
import type { ProductWithStock } from "@/types";

async function fetchProducts(): Promise<ProductWithStock[]> {
  const response = await fetch("/api/products");
  if (!response.ok) throw new Error("Failed to load products");
  return response.json();
}

export default function HomePage() {
  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive font-medium mb-2">Failed to load products</p>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground">
          Browse products across our warehouses. Reserve items for 10 minutes to complete your purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
