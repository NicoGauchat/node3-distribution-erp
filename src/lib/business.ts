import type {
  Customer,
  DemoState,
  Inquiry,
  InquiryStatus,
  NewOrderDraft,
  Order,
  OrderLine,
  OrderStatus,
  Product,
} from "./types";

export const orderStatusLabels: Record<OrderStatus, string> = {
  borrador: "Borrador",
  confirmado: "Confirmado",
  preparacion: "En preparacion",
  preparado: "Preparado",
  reparto: "En reparto",
  entregado: "Entregado",
  entregado_sin_cobrar: "Entregado sin cobrar",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  nueva: "Nueva",
  respondida: "Respondida",
  cotizada: "Cotizada",
  seguimiento: "En seguimiento",
  convertida: "Convertida",
  perdida: "Perdida",
};

export function getOrderTotal(order: Pick<Order, "lines" | "discount">): number {
  return Math.max(
    0,
    order.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) -
      order.discount,
  );
}

export function getOrderBalance(order: Order): number {
  if (order.status === "cancelado") {
    return 0;
  }

  return Math.max(0, getOrderTotal(order) - order.paidAmount);
}

export function getCustomerDebt(customerId: string, orders: Order[]): number {
  return orders
    .filter((order) => order.customerId === customerId)
    .reduce((sum, order) => sum + getOrderBalance(order), 0);
}

export function findCustomer(customers: Customer[], id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id);
}

export function findProduct(products: Product[], id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function createOrderNumber(orders: Order[]): string {
  const next = orders.length + 1;
  return String(next).padStart(4, "0");
}

export function buildOrderFromDraft(
  draft: NewOrderDraft,
  orders: Order[],
  customers: Customer[],
): Order {
  const customer = findCustomer(customers, draft.customerId);
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 7);

  return {
    id: `o-${Date.now()}`,
    number: createOrderNumber(orders),
    customerId: draft.customerId,
    inquiryId: draft.inquiryId,
    status: "confirmado",
    lines: draft.lines,
    discount: 0,
    createdAt: now.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    deliveryZone: customer?.zone ?? "Sin zona",
    owner: "Node3",
    notes: draft.notes,
    paidAmount: 0,
  };
}

export function buildSuggestedLines(
  inquiry: Inquiry,
  products: Product[],
  customer?: Customer,
): OrderLine[] {
  const hints = inquiry.productHints.map((hint) => hint.toLowerCase());
  const priceList = customer?.priceList ?? "mayorista";

  return products
    .filter((product) =>
      hints.some((hint) => product.name.toLowerCase().includes(hint.toLowerCase())),
    )
    .slice(0, 4)
    .map((product) => ({
      productId: product.id,
      quantity: product.category === "Bebidas" ? 4 : 1,
      unitPrice: product.prices[priceList],
    }));
}

export function getDashboardMetrics(state: DemoState) {
  const todaysOrders = state.orders.filter((order) => order.createdAt === "2026-07-22");
  const receivable = state.orders.reduce((sum, order) => sum + getOrderBalance(order), 0);
  const overdue = state.orders
    .filter((order) => order.dueDate < "2026-07-22")
    .reduce((sum, order) => sum + getOrderBalance(order), 0);

  return {
    todaySales: todaysOrders.reduce((sum, order) => sum + getOrderTotal(order), 0),
    pendingOrders: state.orders.filter((order) =>
      ["confirmado", "preparacion", "preparado", "reparto"].includes(order.status),
    ).length,
    deliveredUnpaid: state.orders.filter((order) => order.status === "entregado_sin_cobrar")
      .length,
    receivable,
    overdue,
    openInquiries: state.inquiries.filter((inquiry) =>
      ["nueva", "respondida", "cotizada", "seguimiento"].includes(inquiry.status),
    ).length,
    lowStock: state.products.filter((product) => product.stock <= product.minStock).length,
  };
}

export function generateOrderMessage(
  order: Order,
  customers: Customer[],
  products: Product[],
): string {
  const customer = findCustomer(customers, order.customerId);
  const lines = order.lines
    .map((line) => {
      const product = findProduct(products, line.productId);
      return `- ${line.quantity} ${product?.unit ?? "u."} ${product?.name ?? "Producto"} x ${line.unitPrice.toLocaleString("es-AR")}`;
    })
    .join("\n");

  return `Hola ${customer?.contactName ?? ""}, te confirmamos el pedido #${order.number}:\n${lines}\nTotal: ${getOrderTotal(order).toLocaleString("es-AR")} ARS\nEstado: ${orderStatusLabels[order.status]}.`;
}

export function generateCollectionMessage(
  order: Order,
  customers: Customer[],
): string {
  const customer = findCustomer(customers, order.customerId);
  return `Hola ${customer?.contactName ?? ""}, te recordamos que tenes pendiente un saldo de ${getOrderBalance(order).toLocaleString("es-AR")} ARS correspondiente al pedido #${order.number}. Podrias confirmarnos cuando lo abonarias?`;
}

export function generateFollowUpMessage(inquiry: Inquiry): string {
  return `Hola ${inquiry.prospectName}, te escribo por la consulta que nos hiciste: "${inquiry.text}". Si queres, te dejo armado el pedido con precio actualizado y disponibilidad.`;
}

export function createWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getDaysOverdue(dueDate: string): number {
  const due = new Date(`${dueDate}T12:00:00`);
  const today = new Date("2026-07-22T12:00:00"); // demo fixed date
  const diff = today.getTime() - due.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function generateCatalogMessage(
  products: Product[],
  customer?: Customer,
): string {
  const priceList = customer?.priceList ?? "mayorista";
  const lines = products
    .filter((p) => p.active)
    .slice(0, 8)
    .map((p) => `- ${p.name}: ${p.prices[priceList].toLocaleString("es-AR")} ARS`)
    .join("\n");
  return `Hola ${customer?.contactName ?? ""}, te paso nuestra lista actualizada (${priceList}):\n${lines}\nConsultanos stock y disponibilidad!`;
}
