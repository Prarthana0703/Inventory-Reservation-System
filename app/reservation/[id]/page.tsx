import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReservationDetails } from "@/components/ReservationDetails";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReservationPage({ params }: PageProps) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, imageUrl: true, description: true } },
      warehouse: { select: { name: true, location: true } },
    },
  });

  if (!reservation) {
    notFound();
  }

  const reservationData = {
    ...reservation,
    expiresAt: reservation.expiresAt.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ReservationDetails reservation={reservationData} />
    </div>
  );
}
