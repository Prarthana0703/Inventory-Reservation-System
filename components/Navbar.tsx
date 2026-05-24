import Link from "next/link";
import { Package } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Package className="h-5 w-5 text-primary" />
          StockReserve
        </Link>
        <span className="text-muted-foreground text-sm hidden sm:block">
          Multi-Warehouse Inventory
        </span>
      </div>
    </header>
  );
}
