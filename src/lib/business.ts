import type { DemoState, Order, OrderLine, OrderStatus } from "./types";

export const orderStatusLabels: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  para_revisar: "Para revisar",
  confirmado: "Confirmado",
  impreso: "Impreso",
  en_preparacion: "En preparación",
  preparado: "Preparado",
  cancelado: "Cancelado",
};

export const sourceLabels = {
  text: "Mensaje",
  transcribed_audio: "Audio transcripto",
  manual: "Carga manual",
} as const;

export const matchLabels = {
  recognized: "Reconocido",
  possible: "Posible coincidencia",
  review: "Necesita revisión",
  not_found: "No encontrado",
} as const;

export function lineTotal(line: OrderLine): number {
  return line.quantity * line.unitPrice * (1 - line.discount / 100);
}

export function orderSubtotal(order: Pick<Order, "lines">): number {
  return order.lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function orderTotal(order: Pick<Order, "lines" | "discount" | "shipping">): number {
  return Math.max(0, orderSubtotal(order) - order.discount + order.shipping);
}

export function findCustomer(state: DemoState, id: string) {
  return state.customers.find((item) => item.id === id);
}

export function findProduct(state: DemoState, id: string | null) {
  return id ? state.products.find((item) => item.id === id) : undefined;
}

export function nextOrderNumber(orders: Order[]): string {
  const max = orders.reduce((current, order) => Math.max(current, Number(order.number) || 0), 1004);
  return String(max + 1).padStart(6, "0");
}

export function hasStockWarning(state: DemoState, line: OrderLine): boolean {
  const product = findProduct(state, line.productId);
  return Boolean(product && line.quantity > product.demoStock);
}

export function deductDemoStock(products: DemoState["products"], lines: OrderLine[]) {
  return products.map((product) => {
    const line = lines.find((item) => item.productId === product.id);
    return line ? { ...product, demoStock: Math.max(0, product.demoStock - line.quantity) } : product;
  });
}
