import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReservationNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-2">Reservation Not Found</h2>
      <p className="text-muted-foreground mb-6">
        This reservation does not exist or may have expired.
      </p>
      <Button asChild>
        <Link href="/">Back to Products</Link>
      </Button>
    </div>
  );
}
