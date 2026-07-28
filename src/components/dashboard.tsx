"use client";

import {
  CreditCard,
  ClipboardList,
  WalletCards,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  Plus,
  Package,
} from "lucide-react";
import type { DemoState, ViewKey, Inquiry, OrderStatus } from "@/lib/types";
import {
  getDashboardMetrics,
  findCustomer,
  getOrderTotal,
} from "@/lib/business";
import { formatCurrency, formatDate, getLocalDateKey } from "@/lib/format";
import { MetricCard, StatusBadge, orderStatusLabel } from "@/components/ui";

export function DashboardView({
  state,
  onNavigate,
  onConvertInquiry,
  onUpdateStatus,
}: {
  state: DemoState;
  onNavigate: (view: ViewKey) => void;
  onConvertInquiry: (inquiry: Inquiry) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}) {
  const metrics = getDashboardMetrics(state);

  const activeOrders = state.orders
    .filter((o) =>
      ["confirmado", "preparacion", "preparado", "reparto", "entregado_sin_cobrar"].includes(
        o.status
      )
    )
    .slice(0, 5);

  const lowStockProducts = state.products
    .filter((p) => p.stock <= p.minStock)
    .slice(0, 5);

  return (
    <>
      <div className="dashboard-intro">
        <div>
          <span className="eyebrow">Resumen operativo</span>
          <h1>Así está el negocio hoy</h1>
          <p>Pedidos, cobranzas y alertas importantes en un solo lugar.</p>
        </div>
        <div className="health-pill">
          <span className="health-dot" /> Operación activa
        </div>
      </div>

      <div className="metrics-row">
        <MetricCard
          icon={CreditCard}
          label="Ventas hoy"
          value={formatCurrency(metrics.todaySales)}
          note={`Pedidos creados el ${formatDate(getLocalDateKey())}`}
          color="green"
        />
        <MetricCard
          icon={ClipboardList}
          label="Pedidos pendientes"
          value={String(metrics.pendingOrders)}
          note="Por preparar o entregar"
          color="blue"
        />
        <MetricCard
          icon={WalletCards}
          label="Por cobrar"
          value={formatCurrency(metrics.receivable)}
          note={`${formatCurrency(metrics.overdue)} vencido`}
          color="amber"
        />
        <MetricCard
          icon={MessageCircle}
          label="Consultas abiertas"
          value={String(metrics.openInquiries)}
          note="Para seguir o convertir"
          color="violet"
        />
      </div>

      <div className="quick-actions">
        <button className="quick-action" onClick={() => onNavigate("pedidos")}>
          <span className="quick-action-icon blue"><Plus size={20} /></span>
          <span className="quick-action-copy"><strong>Nuevo pedido</strong><small>Cargar una venta</small></span>
          <ArrowRight size={16} className="quick-action-arrow" />
        </button>
        <button className="quick-action" onClick={() => onNavigate("consultas")}>
          <span className="quick-action-icon violet"><MessageCircle size={20} /></span>
          <span className="quick-action-copy"><strong>Nueva consulta</strong><small>Registrar un mensaje</small></span>
          <ArrowRight size={16} className="quick-action-arrow" />
        </button>
        <button className="quick-action" onClick={() => onNavigate("cobrar")}>
          <span className="quick-action-icon amber"><WalletCards size={20} /></span>
          <span className="quick-action-copy"><strong>Ver cobranzas</strong><small>Seguir saldos pendientes</small></span>
          <ArrowRight size={16} className="quick-action-arrow" />
        </button>
        <button className="quick-action" onClick={() => onNavigate("clientes")}>
          <span className="quick-action-icon green"><Package size={20} /></span>
          <span className="quick-action-copy"><strong>Buscar cliente</strong><small>Ver cuenta e historial</small></span>
          <ArrowRight size={16} className="quick-action-arrow" />
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Pedidos activos</div>
              <div className="card-sub">Seguimiento de entregas pendientes</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("pedidos")}>
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.length > 0 ? (
                  activeOrders.map((order) => {
                    const customer = findCustomer(state.customers, order.customerId);
                    return (
                      <tr key={order.id}>
                        <td className="text-bold">#{order.number}</td>
                        <td>{customer?.businessName ?? "Desconocido"}</td>
                        <td>{formatCurrency(getOrderTotal(order))}</td>
                        <td>
                          <StatusBadge
                            status={order.status}
                            label={orderStatusLabel(order.status)}
                          />
                        </td>
                        <td>
                          {order.status === "confirmado" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onUpdateStatus(order.id, "preparacion")}
                            >
                              Preparar
                            </button>
                          )}
                          {order.status === "preparacion" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onUpdateStatus(order.id, "preparado")}
                            >
                              Listo
                            </button>
                          )}
                          {order.status === "preparado" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onUpdateStatus(order.id, "reparto")}
                            >
                              Repartir
                            </button>
                          )}
                          {order.status === "reparto" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onUpdateStatus(order.id, "entregado_sin_cobrar")}
                            >
                              Entregado
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No hay pedidos activos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Alertas</div>
              <div className="card-sub">Stock crítico y avisos</div>
            </div>
            <AlertTriangle size={18} className="text-muted" />
          </div>
          <div>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div key={p.id} className="mini-card split">
                  <div>
                    <div className="mini-card-title">{p.name}</div>
                    <div className="mini-card-sub text-muted">
                      Stock: {p.stock} {p.unit}
                    </div>
                  </div>
                  <span className="badge badge-warning">Bajo stock</span>
                </div>
              ))
            ) : (
              <div className="empty">
                <Check size={24} />
                <div className="empty-title">Todo en orden</div>
                <div className="empty-desc">Sin alertas críticas</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
