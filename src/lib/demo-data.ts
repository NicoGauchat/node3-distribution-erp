import type { Customer, DemoState, IncomingRequest, Order, Product } from "./types";
import { relativeDate } from "./format";

export const exampleMessage = `Hola, mandame para mañana:
- 4 cuartirolo al vacío
- 3 sandwicheras La Casona
- 20 mayonesas Cidia
- 10 prepizzas San Rafael
- 5 galletitas tipo Oreo
- 2 kilos de chips de chocolate negro
Si no hay Oreo avisame antes de cambiar.`;

type ProductSeed = [string, string, string, string, string, Product["saleUnit"], number, number, string[]];

const productSeeds: ProductSeed[] = [
  ["PRO-001", "Cuartirolo al vacío", "Ramolac", "pieza al vacío", "Lácteos", "unidad", 8450, 18, ["cuartirolo", "cuartirolo al vacio"]],
  ["PRO-002", "Sandwichera", "La Casona", "unidad", "Fiambres", "unidad", 4280, 24, ["sandwichera", "sandwicheras la casona"]],
  ["PRO-003", "Salchicha", "Demo", "paquete", "Fiambres", "paquete", 2380, 32, ["salchicha", "salchichas"]],
  ["PRO-004", "Mayonesa Cidia", "Cidia", "125 g", "Almacén", "unidad", 780, 86, ["mayonesa cidia", "mayonesas cidia", "cidia"]],
  ["PRO-005", "Galletitas con chips de chocolate", "Demo", "120 g", "Galletitas", "paquete", 1320, 28, ["galletitas con chips", "galletitas chips"]],
  ["PRO-006", "Prepizza x2", "San Rafael", "paquete x2", "Panificados", "paquete", 2140, 40, ["prepizza", "prepizzas", "prepizzas san rafael"]],
  ["PRO-007", "Pan lactal", "Demo", "500 g", "Panificados", "unidad", 1980, 15, ["pan lactal", "lactal"]],
  ["PRO-008", "Galletitas tipo Oreo", "Demo", "220 g", "Galletitas", "paquete", 1750, 4, ["oreo", "galletitas oreo", "galletitas tipo oreo"]],
  ["PRO-009", "Tapas para fajitas", "Demo", "paquete", "Panificados", "paquete", 2460, 12, ["tapas fajitas", "fajitas"]],
  ["PRO-010", "Nuez moscada molida premium", "Don Limón", "frasco", "Condimentos", "unidad", 1640, 20, ["nuez moscada", "moscada don limon"]],
  ["PRO-011", "Aceitunas en sachet", "Demo", "100 g", "Almacén", "unidad", 1190, 34, ["aceitunas", "aceitunas sachet"]],
  ["PRO-012", "Bolitas de chocolate", "Ecosan", "1 kg", "Repostería", "kilo", 9820, 9, ["bolitas chocolate", "bolitas ecosan"]],
  ["PRO-013", "Cereal azucarado", "Ecosan", "1 kg", "Cereales", "kilo", 7150, 11, ["cereal azucarado", "cereal ecosan"]],
  ["PRO-014", "Anillos frutados", "Demo", "1 kg", "Cereales", "kilo", 7680, 13, ["anillos frutados", "anillitos frutados"]],
  ["PRO-015", "Chips de chocolate negro", "Don Limón", "por kilo", "Repostería", "kilo", 12300, 7, ["chips negros", "chips chocolate negro", "chips de chocolate"]],
  ["PRO-016", "Levadura", "Demo", "500 g", "Panificados", "paquete", 3160, 18, ["levadura", "levadura 500"]],
  ["PRO-017", "Pan rallado", "Demo", "paquete", "Almacén", "paquete", 1420, 26, ["pan rallado"]],
];

export const demoProducts: Product[] = productSeeds.map((seed, index) => ({
  id: `product-${index + 1}`,
  code: seed[0], name: seed[1], brand: seed[2], presentation: seed[3], category: seed[4],
  saleUnit: seed[5], price: seed[6], demoStock: seed[7], minimumStock: index % 4 === 0 ? 10 : 6,
  aliases: seed[8], active: true, demoDescription: seed[2] === "Demo",
}));

export const demoCustomers: Customer[] = [
  { id: "customer-almacen", businessName: "Almacén La Esquina", contactName: "Marta Ruiz", phone: "+54 3492 555 103", address: "Bv. Lehmann 920", city: "Rafaela", saleCondition: "Cuenta corriente · 15 días", notes: "Avisar antes de reemplazar productos. Entregar por la mañana.", active: true },
  { id: "customer-despensa", businessName: "Despensa Don Pedro", contactName: "Pedro Giménez", phone: "+54 3492 555 102", address: "25 de Mayo 438", city: "Sunchales", saleCondition: "Contado", notes: "Recibe de 8 a 12 h.", active: true },
  { id: "customer-kiosco", businessName: "Kiosco Los Amigos", contactName: "Juan Álvarez", phone: "+54 3492 555 101", address: "Av. Santa Fe 1280", city: "Rafaela", saleCondition: "Cuenta corriente · 7 días", notes: "Preparar bebidas aparte.", active: true },
  { id: "customer-maxi", businessName: "Maxikiosco 24 hs", contactName: "Sofía Molina", phone: "+54 3492 555 105", address: "Mitre 744", city: "Rafaela", saleCondition: "Contado", notes: "Llamar al llegar.", active: true },
];

function demoRequests(): IncomingRequest[] {
  return [
    { id: "request-main", customerId: "customer-almacen", source: "text", originalText: exampleMessage, createdAt: relativeDate(12), status: "nuevo", detectedNotes: ["Si no hay Oreo, avisar antes de cambiar."] },
    { id: "request-audio", customerId: "customer-despensa", source: "transcribed_audio", originalText: "Mandame seis panes lactales, diez levaduras y cuatro paquetes de tapas para fajitas.", createdAt: relativeDate(48), status: "interpretado", detectedNotes: [] },
  ];
}

function demoOrders(): Order[] {
  return [
    { id: "order-1004", number: "001004", customerId: "customer-kiosco", sourceRequestId: null, source: "manual", status: "en_preparacion", createdAt: relativeDate(95), updatedAt: relativeDate(22), lines: [{ id: "line-1004-1", productId: "product-7", originalText: "8 pan lactal", packages: 8, quantity: 8, unit: "unidad", unitPrice: 1980, discount: 0, matchStatus: "recognized", matchConfidenceDemo: 1 }], notes: "", preparationNotes: "Separar por vencimiento.", discount: 0, shipping: 0, printedAt: relativeDate(30) },
    { id: "order-1003", number: "001003", customerId: "customer-maxi", sourceRequestId: null, source: "manual", status: "confirmado", createdAt: relativeDate(180), updatedAt: relativeDate(80), lines: [{ id: "line-1003-1", productId: "product-4", originalText: "12 mayonesa", packages: 12, quantity: 12, unit: "unidad", unitPrice: 780, discount: 0, matchStatus: "recognized", matchConfidenceDemo: 1 }], notes: "", preparationNotes: "", discount: 0, shipping: 2500, printedAt: null },
  ];
}

export function createInitialDemoState(): DemoState {
  return { products: demoProducts.map((item) => ({ ...item, aliases: [...item.aliases] })), customers: demoCustomers.map((item) => ({ ...item })), requests: demoRequests(), orders: demoOrders(), lastDemoSyncAt: null };
}

export const initialDemoState = createInitialDemoState();
