import Image from "next/image";
import type { Customer, Order, Product } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { lineTotal, orderSubtotal, orderTotal, orderStatusLabels } from "@/lib/business";

type Props = { order: Order; customer: Customer; products: Product[] };

export function OrderNote({ order, customer, products }: Props) {
  const productFor = (id: string | null) => products.find((product) => product.id === id);
  const lineDiscount = order.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice - lineTotal(line), 0);

  return (
    <article className="a4-sheet" aria-label={`Nota de pedido ${order.number}`}>
      <header className="note-header">
        <div className="note-brand">
          <Image className="client-mark client-mark-print" src="/brand/el-bayo-logo.png" alt="Logo de El Bayo Distribuciones" width={150} height={150}/>
          <div><strong>EL BAYO DISTRIBUCIONES</strong><small>NOTA OPERATIVA · NO VÁLIDA COMO FACTURA</small></div>
        </div>
        <div className="note-title"><span>NOTA DE PEDIDO</span><strong>N.º {order.number}</strong></div>
      </header>

      <section className="note-meta">
        <div><span>Fecha</span><strong>{formatDateTime(order.createdAt)}</strong></div>
        <div><span>Operador</span><strong>Juan · Node3</strong></div>
        <div><span>Estado</span><strong>{orderStatusLabels[order.status]}</strong></div>
      </section>

      <section className="note-customer">
        <div><span>Cliente</span><strong>{customer.businessName}</strong></div>
        <div><span>Dirección</span><strong>{customer.address}</strong></div>
        <div><span>Localidad</span><strong>{customer.city}</strong></div>
        <div><span>Teléfono</span><strong>{customer.phone}</strong></div>
        <div><span>Condición</span><strong>{customer.saleCondition}</strong></div>
        <div className="note-wide"><span>Observaciones</span><strong>{order.notes || customer.notes || "—"}</strong></div>
      </section>

      <table className="note-table">
        <thead><tr><th>Código</th><th>Descripción</th><th className="numeric">Bultos</th><th className="numeric">Cantidad</th><th className="numeric">P. unit.</th><th className="numeric">Desc.</th><th className="numeric">Total</th></tr></thead>
        <tbody>
          {order.lines.map((line) => {
            const product = productFor(line.productId);
            return <tr key={line.id}><td>{product?.code ?? "—"}</td><td><strong>{product?.name ?? "Producto sin asignar"}</strong><small>{product ? `${product.brand} · ${product.presentation}` : line.originalText}</small></td><td className="numeric">{line.packages}</td><td className="numeric">{line.quantity} {line.unit}</td><td className="numeric">{formatCurrency(line.unitPrice)}</td><td className="numeric">{line.discount}%</td><td className="numeric"><strong>{formatCurrency(lineTotal(line))}</strong></td></tr>;
          })}
        </tbody>
      </table>

      <footer className="note-footer">
        <div className="note-preparation"><span>Observaciones para preparación</span><p>{order.preparationNotes || "Sin observaciones adicionales."}</p><div className="signature-grid"><div>Preparado por</div><div>Controlado por</div><div>Fecha y hora</div><div>Firma / conformidad</div></div></div>
        <div className="note-totals"><div><span>Total de bultos</span><strong>{order.lines.reduce((sum, line) => sum + line.packages, 0)}</strong></div><div><span>Subtotal</span><strong>{formatCurrency(orderSubtotal(order))}</strong></div><div><span>Descuento renglones</span><strong>-{formatCurrency(lineDiscount)}</strong></div><div><span>Descuento general</span><strong>-{formatCurrency(order.discount)}</strong></div><div><span>Flete</span><strong>{formatCurrency(order.shipping)}</strong></div><div className="grand-total"><span>Total</span><strong>{formatCurrency(orderTotal(order))}</strong></div></div>
      </footer>
    </article>
  );
}
