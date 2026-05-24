export type WarehouseStock = {
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
};

export type ProductWithStock = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  stock: WarehouseStock[];
  totalAvailable: number;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
};

export type Reservation = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "RELEASED";
  expiresAt: string;
  createdAt: string;
  product: {
    name: string;
    imageUrl: string;
    description: string;
  };
  warehouse: {
    name: string;
    location: string;
  };
};
