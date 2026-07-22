"use client";

import { Plus, ArrowRight, Check, Send, Copy, Package } from "lucide-react";
import type { DemoState, NewOrderDraft, OrderStatus, Product } from "@/lib/types";
import {
  findCustomer,
  findProduct,
  getOrderTotal,
  getOrderBalance,
  generateOrderMessage,
  createWhatsAppUrl,
  orderStatusLabels,
} from "@/lib/business";
import { formatCurrency } from "@/lib/format";
import { StatusBadge, WhatsAppBtn, CopyBtn, EmptyState, orderStatusLabel } from "./ui";

export function OrdersView({
  state,
  draft,
  onDraftChange,
  onAddProduct,
  onUpdateQuantity,
  onRemoveLine,
  onSubmitOrder,
  onUpdateStatus,
  onCopyMessage,
}: {
  state: DemoState;
  draft: NewOrderDraft;
  onDraftChange: (d: NewOrderDraft) => void;
  onAddProduct: (p: Product) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveLine: (id: string) => void;
  onSubmitOrder: () => void;
  onUpdateStatus: (id: string, s: OrderStatus) => void;
  onCopyMessage: (msg: string) => void;
}) {
  const customer = draft.customerId ? findCustomer(state.customers, draft.customerId) : undefined;
  const priceList = customer?.priceList ?? "mayorista";

  const draftTotal = draft.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

  return (
    <div className="content">
      <div className="order-builder">
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Nuevo pedido</h2>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Cliente</label>
            <select
              className="select"
              value={draft.customerId}
              onChange={(e) => {
                onDraftChange({ ...draft, customerId: e.target.value, lines: [] });
              }}
            >
              <option value="">Seleccionar cliente...</option>
              {state.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName}
                </option>
              ))}
            </select>
          </div>
          {customer && (
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label>Lista de precios</label>
                <input className="input" value={customer.priceList} readOnly disabled />
              </div>
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Notas</label>
            <textarea
              className="textarea"
              value={draft.notes}
              onChange={(e) => onDraftChange({ ...draft, notes: e.target.value })}
              placeholder="Notas del pedido..."
            />
          </div>

          <div className="card-head" style={{ marginTop: 24 }}>
            <h3 className="card-title">Productos</h3>
          </div>
          <div className="product-picker">
            {state.products
              .filter((p) => p.active)
              .map((product) => (
                <div key={product.id} className="product-row">
                  <div>
                    <div className="text-bold">{product.name}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {product.sku} · Stock: {product.stock} {product.unit}
                    </div>
                  </div>
                  <div className="actions">
                    <div className="text-bold">{formatCurrency(product.prices[priceList])}</div>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={!draft.customerId}
                      onClick={() => onAddProduct(product)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Pedido en armado</h2>
          </div>
          {draft.lines.length === 0 ? (
            <EmptyState icon={Package} title="No hay productos" description="Agrega productos desde la lista." />
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {draft.lines.map((line) => {
                  const p = findProduct(state.products, line.productId);
                  if (!p) return null;
                  return (
                    <div key={line.productId} className="cart-line">
                      <div>
                        <div className="text-bold" style={{ fontSize: 13 }}>{p.name}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{formatCurrency(line.unitPrice)}</div>
                      </div>
                      <input
                        type="number"
                        className="qty-input"
                        value={line.quantity}
                        min={1}
                        onChange={(e) => onUpdateQuantity(line.productId, parseInt(e.target.value) || 1)}
                      />
                      <div className="text-bold text-right">
                        {formatCurrency(line.quantity * line.unitPrice)}
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 4 }}
                        onClick={() => onRemoveLine(line.productId)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="total-bar">
                <span>Total</span>
                <span>{formatCurrency(draftTotal)}</span>
              </div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-primary"
                  onClick={onSubmitOrder}
                  disabled={!draft.customerId || draft.lines.length === 0}
                >
                  <Check size={16} />
                  Crear pedido
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Tablero de pedidos</h2>
        </div>
        <div className="kanban">
          {["confirmado", "preparacion", "preparado", "entregado_sin_cobrar"].map((status) => {
            const cols = state.orders.filter((o) => o.status === status);
            return (
              <div key={status} className="kanban-col">
                <div className="kanban-col-title">
                  {orderStatusLabel(status as OrderStatus)} <span>{cols.length}</span>
                </div>
                {cols.map((order) => {
                  const c = findCustomer(state.customers, order.customerId);
                  const msg = c && generateOrderMessage(order, state.customers, state.products);
                  return (
                    <div key={order.id} className="mini-card">
                      <div className="split">
                        <span className="mini-card-title">#{order.number}</span>
                        <StatusBadge status={order.status} label={orderStatusLabel(order.status)} />
                      </div>
                      <div className="mini-card-sub" style={{ marginBottom: 8 }}>
                        {c?.businessName} • {formatCurrency(getOrderTotal(order))}
                      </div>
                      <div className="actions" style={{ marginTop: 8 }}>
                        {msg && c && <WhatsAppBtn phone={c.phone} message={msg} label="" />}
                        {msg && <CopyBtn text={msg} onCopy={onCopyMessage} label="" />}
                        {status === "confirmado" && (
                          <button className="btn btn-primary btn-sm" onClick={() => onUpdateStatus(order.id, "preparacion")}>
                            Avanzar <ArrowRight size={12} />
                          </button>
                        )}
                        {status === "preparacion" && (
                          <button className="btn btn-primary btn-sm" onClick={() => onUpdateStatus(order.id, "preparado")}>
                            Avanzar <ArrowRight size={12} />
                          </button>
                        )}
                        {status === "preparado" && (
                          <button className="btn btn-primary btn-sm" onClick={() => onUpdateStatus(order.id, "entregado_sin_cobrar")}>
                            Avanzar <ArrowRight size={12} />
                          </button>
                        )}
                        {status === "entregado_sin_cobrar" && (
                          <button className="btn btn-primary btn-sm" onClick={() => onUpdateStatus(order.id, "pagado")}>
                            Cobrar <Check size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
