export type ViewKey = "inicio" | "pedidos" | "productos" | "clientes" | "configuracion";

export type RequestSource = "text" | "transcribed_audio" | "manual";

export type MatchStatus = "recognized" | "possible" | "review" | "not_found";

export type OrderStatus =
  | "nuevo"
  | "para_revisar"
  | "confirmado"
  | "impreso"
  | "en_preparacion"
  | "preparado"
  | "cancelado";

export type SaleUnit = "unidad" | "paquete" | "caja" | "bulto" | "kilo";

export type Product = {
  id: string;
  code: string;
  name: string;
  brand: string;
  presentation: string;
  category: string;
  saleUnit: SaleUnit;
  price: number;
  demoStock: number;
  minimumStock: number;
  aliases: string[];
  active: boolean;
  demoDescription?: boolean;
};

export type Customer = {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  address: string;
  city: string;
  saleCondition: string;
  notes: string;
  active: boolean;
};

export type IncomingRequest = {
  id: string;
  customerId: string;
  source: RequestSource;
  originalText: string;
  createdAt: string;
  status: "nuevo" | "interpretado" | "convertido";
  detectedNotes: string[];
};

export type OrderLine = {
  id: string;
  productId: string | null;
  originalText: string;
  packages: number;
  quantity: number;
  unit: SaleUnit;
  unitPrice: number;
  discount: number;
  matchStatus: MatchStatus;
  matchConfidenceDemo: number;
};

export type Order = {
  id: string;
  number: string;
  customerId: string;
  sourceRequestId: string | null;
  source: RequestSource;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  lines: OrderLine[];
  notes: string;
  preparationNotes: string;
  discount: number;
  shipping: number;
  printedAt: string | null;
};

export type DemoState = {
  products: Product[];
  customers: Customer[];
  requests: IncomingRequest[];
  orders: Order[];
  lastDemoSyncAt: string | null;
};

export type OrderDraft = {
  customerId: string;
  source: RequestSource;
  originalText: string;
  requestId: string | null;
  lines: OrderLine[];
  notes: string;
};
