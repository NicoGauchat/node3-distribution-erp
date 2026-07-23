"use client";

import { useState } from "react";
import { Users, Send, Copy, Plus, Edit, Trash2 } from "lucide-react";
import type { DemoState, Customer, PriceList } from "@/lib/types";
import {
  findCustomer,
  getCustomerDebt,
  generateFollowUpMessage,
  generateCatalogMessage,
  generateCollectionMessage,
} from "@/lib/business";
import { formatCurrency, normalizeText } from "@/lib/format";
import { StatusBadge, WhatsAppBtn, CopyBtn, EmptyState, InfoRow, orderStatusLabel, inquiryStatusLabel } from "./ui";

export function CustomersView({
  state,
  selectedId,
  onSelect,
  onStartOrder,
  onCopyMessage,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: {
  state: DemoState;
  selectedId: string;
  onSelect: (id: string) => void;
  onStartOrder: (id: string) => void;
  onCopyMessage: (msg: string) => void;
  onAddCustomer: (data: Omit<Customer, "id">) => void;
  onUpdateCustomer: (id: string, changes: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    address: "",
    city: "",
    zone: "",
    customerType: "Kiosco",
    priceList: "minorista" as PriceList,
    creditLimit: 0,
    notes: "",
  });

  const selectedCustomer = selectedId ? findCustomer(state.customers, selectedId) : undefined;
  
  const customerOrders = selectedCustomer
    ? state.orders.filter((o) => o.customerId === selectedCustomer.id)
    : [];

  const openInquiries = selectedCustomer
    ? state.inquiries.filter((i) => i.customerId === selectedCustomer.id && ["nueva", "respondida", "cotizada", "seguimiento"].includes(i.status))
    : [];

  const firstDebtOrder = customerOrders.find(o => o.status === "entregado_sin_cobrar");

  const filteredCustomers = state.customers.filter((c) => {
    if (!searchQuery) return true;
    const query = normalizeText(searchQuery);
    return (
      normalizeText(c.businessName).includes(query) ||
      normalizeText(c.contactName).includes(query) ||
      c.phone.includes(searchQuery) ||
      normalizeText(c.zone).includes(query)
    );
  });

  const handleNew = () => {
    setFormData({
      businessName: "",
      contactName: "",
      phone: "",
      address: "",
      city: "",
      zone: "",
      customerType: "Kiosco",
      priceList: "minorista",
      creditLimit: 0,
      notes: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = () => {
    if (!selectedCustomer) return;
    setFormData({
      businessName: selectedCustomer.businessName,
      contactName: selectedCustomer.contactName,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address,
      city: selectedCustomer.city,
      zone: selectedCustomer.zone,
      customerType: selectedCustomer.customerType,
      priceList: selectedCustomer.priceList,
      creditLimit: selectedCustomer.creditLimit,
      notes: selectedCustomer.notes,
    });
    setEditingId(selectedCustomer.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      onUpdateCustomer(editingId, formData);
    } else {
      onAddCustomer({
        ...formData,
        status: "activo",
        currentDebt: 0,
      });
    }
    setShowForm(false);
  };

  return (
    <div className="content">
      {showForm && (
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">{editingId ? "Editar cliente" : "Nuevo cliente"}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Razón Social / Negocio</label>
                <input className="input" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Nombre de Contacto</label>
                <input className="input" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono / WhatsApp</label>
                <input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input className="input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ciudad</label>
                <input className="input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Zona</label>
                <input className="input" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Cliente</label>
                <select className="select" value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})}>
                  <option value="Kiosco">Kiosco</option>
                  <option value="Despensa">Despensa</option>
                  <option value="Almacén">Almacén</option>
                  <option value="Maxikiosco">Maxikiosco</option>
                  <option value="Bar">Bar</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Lista de Precios</label>
                <select className="select" value={formData.priceList} onChange={e => setFormData({...formData, priceList: e.target.value as any})}>
                  <option value="minorista">Minorista</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="especial">Especial</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Límite de Crédito</label>
                <input type="number" className="input" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Notas</label>
                <input className="input" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>
            <div className="actions" style={{ marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <div className="split" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <h2 className="card-title">Directorio de Clientes</h2>
                <input
                  className="input"
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleNew}>
                <Plus size={14} /> Nuevo cliente
              </button>
            </div>
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
                {filteredCustomers.map((c) => (
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
                <div className="actions">
                  <button className="btn btn-secondary btn-sm" onClick={handleEdit}>
                    <Edit size={14} /> Editar
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDeleteId(selectedCustomer.id)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
              {confirmDeleteId === selectedCustomer.id && (
                <div style={{ padding: 12, backgroundColor: "#fee2e2", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: "#991b1b", fontSize: 14 }}>¿Eliminar {selectedCustomer.businessName}? Esta acción no se puede deshacer.</span>
                  <div className="actions">
                    <button className="btn btn-danger btn-sm" onClick={() => { onDeleteCustomer(selectedCustomer.id); setConfirmDeleteId(null); }}>Confirmar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
                  </div>
                </div>
              )}
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
