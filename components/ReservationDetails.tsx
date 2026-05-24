"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { toast } from "@/hooks/use-toast";
import type { Reservation } from "@/types";

interface ReservationDetailsProps {
  reservation: Reservation;
}

function getStatusBadge(status: string) {
  if (status === "CONFIRMED") return <Badge className="bg-green-500">Confirmed</Badge>;
  if (status === "RELEASED") return <Badge variant="destructive">Released</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

export function ReservationDetails({ reservation: initialReservation }: ReservationDetailsProps) {
  const router = useRouter();
  const [reservation, setReservation] = useState(initialReservation);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const handleExpire = useCallback(() => {
    setIsExpired(true);
    toast({
      title: "Reservation Expired",
      description: "Your reservation has expired. The item is available again.",
      variant: "destructive",
    });
  }, []);

  async function handleConfirm() {
    setConfirmLoading(true);
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/confirm`, {
        method: "POST",
        headers: { "Idempotency-Key": `confirm-${reservation.id}` },
      });

      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Failed to confirm", description: data.error, variant: "destructive" });
        return;
      }

      setReservation(data);
      toast({ title: "Purchase Confirmed!", description: "Your order has been placed." });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleCancel() {
    setCancelLoading(true);
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/release`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Failed to cancel", description: data.error, variant: "destructive" });
        return;
      }

      setReservation(data);
      toast({ title: "Reservation cancelled", description: "Your item has been released." });
      setTimeout(() => router.push("/"), 1500);
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setCancelLoading(false);
    }
  }

  const isPending = reservation.status === "PENDING";
  const isConfirmed = reservation.status === "CONFIRMED";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Reservation</h1>
        {getStatusBadge(reservation.status)}
      </div>

      {isPending && !isExpired && (
        <CountdownTimer expiresAt={reservation.expiresAt} onExpire={handleExpire} />
      )}

      {isExpired && reservation.status === "PENDING" && (
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
          <p className="text-destructive font-semibold">Reservation Expired</p>
        </div>
      )}

      {isConfirmed && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
          <p className="text-green-700 font-semibold text-lg">Purchase Confirmed!</p>
          <p className="text-sm text-green-600 mt-1">Thank you for your order.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0">
              <Image
                src={reservation.product.imageUrl}
                alt={reservation.product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div>
              <p className="font-semibold">{reservation.product.name}</p>
              <p className="text-sm text-muted-foreground">{reservation.product.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted rounded p-3">
              <div className="text-muted-foreground text-xs mb-1">Warehouse</div>
              <div className="font-medium">{reservation.warehouse.name}</div>
              <div className="text-xs text-muted-foreground">{reservation.warehouse.location}</div>
            </div>
            <div className="bg-muted rounded p-3">
              <div className="text-muted-foreground text-xs mb-1">Quantity</div>
              <div className="font-medium">{reservation.quantity} unit(s)</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Reservation ID: <span className="font-mono">{reservation.id}</span></p>
            <p>Created: {new Date(reservation.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {isPending && !isExpired && (
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={confirmLoading || cancelLoading}
          >
            {confirmLoading ? "Processing..." : "Confirm Purchase"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={confirmLoading || cancelLoading}
          >
            {cancelLoading ? "Cancelling..." : "Cancel"}
          </Button>
        </div>
      )}

      {(isExpired || reservation.status === "RELEASED") && (
        <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
          Back to Products
        </Button>
      )}

      {isConfirmed && (
        <Button className="w-full" onClick={() => router.push("/")}>
          Continue Shopping
        </Button>
      )}
    </div>
  );
}
