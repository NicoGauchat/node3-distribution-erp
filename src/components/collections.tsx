"use client";

import { useState } from "react";
import { Check, WalletCards } from "lucide-react";
import type { DemoState, PaymentMethod } from "@/lib/types";
import {
  findCustomer,
  getOrderTotal,
  getOrderBalance,
  getDaysOverdue,
  generateCollectionMessage,
  isReceivableOrder,
} from "@/lib/business";
import { formatCurrency, formatDate, normalizeText } from "@/lib/format";
import { WhatsAppBtn, CopyBtn, MetricCard } from "./ui";

export function CollectionsView({
  state,
  onRegisterPayment,
  onCopyMessage,
}: {
  state: DemoState;
  onRegisterPayment: (
    orderId: string,
    amount: number | undefined,
    method: PaymentMethod,
    reference?: string,
  ) => void;
  onCopyMessage: (msg: string) => void;
}) {
  const [partialAmounts, setPartialAmounts] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Transferencia");
  const [reference, setReference] = useState("");

  const pending = state.orders.filter((o) => isReceivableOrder(o) && getOrderBalance(o) > 0);
  
  const totalPendiente = pending.reduce((sum, o) => sum + getOrderBalance(o), 0);
  const clientesConDeuda = new Set(pending.map(o => o.customerId)).size;

  const filteredPending = pending.filter(o => {
    if (!searchQuery) return true;
    const q = normalizeText(searchQuery);
    const customer = findCustomer(state.customers, o.customerId);
    const matchesCustomer = customer ? normalizeText(customer.businessName).includes(q) : false;
    const matchesOrder = o.number.toLowerCase().includes(q.toLowerCase());
    return matchesCustomer || matchesOrder;
  });

  return (
    <div className="content">
      <div className="metrics-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <MetricCard icon={WalletCards} label="Total pendiente" value={formatCurrency(totalPendiente)} color="amber" />
        <MetricCard icon={WalletCards} label="Pedidos sin cobrar" value={pending.length.toString()} color="blue" />
        <MetricCard icon={WalletCards} label="Clientes con deuda" value={clientesConDeuda.toString()} color="violet" />
      </div>

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Cuentas por Cobrar</h2>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <div className="collection-filters">
            <input
              className="input"
              placeholder="Buscar por cliente o #pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select className="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              <option>Efectivo</option>
              <option>Transferencia</option>
              <option>Mercado Pago</option>
              <option>Cheque</option>
            </select>
            <input
              className="input"
              placeholder="Referencia (opcional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Saldo</th>
                <th>Vence</th>
                <th>Días</th>
                <th>Mensaje</th>
                <th>Cobro</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.map((order) => {
                const customer = findCustomer(state.customers, order.customerId);
                const overdueDays = getDaysOverdue(order.dueDate);
                
                let overdueClass = "overdue ok";
                let overdueLabel = "Al día";
                if (overdueDays > 0) {
                  overdueClass = overdueDays <= 3 ? "overdue warn" : "overdue crit";
                  overdueLabel = `${overdueDays}d`;
                }

                const msg = generateCollectionMessage(order, state.customers);

                return (
                  <tr key={order.id}>
                    <td>#{order.number}</td>
                    <td>
                      <div className="text-bold">{customer?.businessName}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{customer?.zone}</div>
                    </td>
                    <td>{formatCurrency(getOrderTotal(order))}</td>
                    <td className="text-bold">{formatCurrency(getOrderBalance(order))}</td>
                    <td>{formatDate(order.dueDate)}</td>
                    <td className={overdueClass}>{overdueLabel}</td>
                    <td>
                      <div className="actions">
                        {customer && <WhatsAppBtn phone={customer.phone} message={msg} label="" />}
                        <CopyBtn text={msg} onCopy={onCopyMessage} label="" />
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <input
                          type="number"
                          className="qty-input partial-input"
                          placeholder="Monto"
                          value={partialAmounts[order.id] || ""}
                          onChange={(e) => setPartialAmounts({ ...partialAmounts, [order.id]: e.target.value })}
                        />
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const val = parseFloat(partialAmounts[order.id]);
                            if (val > 0) {
                              onRegisterPayment(order.id, val, paymentMethod, reference);
                              setPartialAmounts({ ...partialAmounts, [order.id]: "" });
                              setReference("");
                            }
                          }}
                        >
                          Parcial
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            onRegisterPayment(order.id, undefined, paymentMethod, reference);
                            setReference("");
                          }}
                        >
                          Total
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
