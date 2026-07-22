"use client";

import { Users, Send, Copy } from "lucide-react";
import type { DemoState } from "@/lib/types";
import {
  findCustomer,
  getCustomerDebt,
  generateFollowUpMessage,
  generateCatalogMessage,
  generateCollectionMessage,
} from "@/lib/business";
import { formatCurrency } from "@/lib/format";
import { StatusBadge, WhatsAppBtn, CopyBtn, EmptyState, InfoRow, orderStatusLabel, inquiryStatusLabel } from "./ui";

export function CustomersView({
  state,
  selectedId,
  onSelect,
  onStartOrder,
  onCopyMessage,
}: {
  state: DemoState;
  selectedId: string;
  onSelect: (id: string) => void;
  onStartOrder: (id: string) => void;
  onCopyMessage: (msg: string) => void;
}) {
  const selectedCustomer = selectedId ? findCustomer(state.customers, selectedId) : undefined;
  
  const customerOrders = selectedCustomer
    ? state.orders.filter((o) => o.customerId === selectedCustomer.id)
    : [];

  const openInquiries = selectedCustomer
    ? state.inquiries.filter((i) => i.customerId === selectedCustomer.id && ["nueva", "respondida", "cotizada", "seguimiento"].includes(i.status))
    : [];

  const firstDebtOrder = customerOrders.find(o => o.status === "entregado_sin_cobrar");

  return (
    <div className="content">
      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Directorio de Clientes</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Zona</th>
                  <th>Lista</th>
                  <th>Deuda</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {state.customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="text-bold">{c.businessName}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        {c.contactName} • {c.phone}
                      </div>
                    </td>
                    <td>{c.zone}</td>
                    <td style={{ textTransform: "capitalize" }}>{c.priceList}</td>
                    <td>{formatCurrency(getCustomerDebt(c.id, state.orders) || c.currentDebt)}</td>
                    <td>
                      <StatusBadge status={c.status} label={c.status} />
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => onSelect(c.id)}>
                          Ver
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => onStartOrder(c.id)}>
                          Pedido
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          {selectedCustomer ? (
            <>
              <div className="card-head">
                <h2 className="card-title">{selectedCustomer.businessName}</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <InfoRow label="Contacto" value={selectedCustomer.contactName} />
                  <InfoRow label="WhatsApp" value={selectedCustomer.phone} />
                  <InfoRow label="Dirección" value={`${selectedCustomer.address}, ${selectedCustomer.city}`} />
                  <InfoRow label="Tipo" value={selectedCustomer.customerType} />
                  <InfoRow label="Lista" value={selectedCustomer.priceList} />
                  <InfoRow label="Límite crédito" value={formatCurrency(selectedCustomer.creditLimit)} />
                  <InfoRow label="Deuda actual" value={formatCurrency(getCustomerDebt(selectedCustomer.id, state.orders) || selectedCustomer.currentDebt)} />
                </div>

                {selectedCustomer.notes && (
                  <div className="msg-box">
                    <strong>Notas:</strong> {selectedCustomer.notes}
                  </div>
                )}

                <div>
                  <h3 className="card-sub text-bold" style={{ marginBottom: 8 }}>Últimos pedidos</h3>
                  {customerOrders.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {customerOrders.slice(0, 3).map((o) => (
                        <div key={o.id} className="split" style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 4 }}>
                          <span>#{o.number} • {o.createdAt}</span>
                          <StatusBadge status={o.status} label={orderStatusLabel(o.status)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted" style={{ fontSize: 13 }}>No hay pedidos.</div>
                  )}
                </div>

                <div>
                  <h3 className="card-sub text-bold" style={{ marginBottom: 8 }}>Consultas abiertas</h3>
                  {openInquiries.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {openInquiries.map((i) => (
                        <div key={i.id} className="split" style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 4 }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>{i.text}</span>
                          <StatusBadge status={i.status} label={inquiryStatusLabel(i.status)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted" style={{ fontSize: 13 }}>No hay consultas abiertas.</div>
                  )}
                </div>

                <div>
                  <h3 className="card-sub text-bold" style={{ marginBottom: 8 }}>Mensajes rápidos</h3>
                  <div className="quick-actions">
                    <WhatsAppBtn
                      phone={selectedCustomer.phone}
                      message={generateFollowUpMessage({ prospectName: selectedCustomer.contactName, text: "consulta", channel: "WhatsApp", status: "nueva", id: "", productHints: [], owner: "", nextAction: "", followUpDate: "", createdAt: "" })}
                      label="Seguimiento"
                    />
                    <CopyBtn
                      text={generateCatalogMessage(state.products, selectedCustomer)}
                      onCopy={onCopyMessage}
                      label="Catálogo"
                    />
                    {firstDebtOrder && (
                      <CopyBtn
                        text={generateCollectionMessage(firstDebtOrder, state.customers)}
                        onCopy={onCopyMessage}
                        label="Cobranza"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState icon={Users} title="Selecciona un cliente" description="Haz clic en 'Ver' para mostrar sus detalles." />
          )}
        </div>
      </div>
    </div>
  );
}
