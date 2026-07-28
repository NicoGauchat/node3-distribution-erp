"use client";

import { Copy, Send, type LucideIcon } from "lucide-react";
import type { InquiryStatus, OrderStatus } from "@/lib/types";
import { createWhatsAppUrl } from "@/lib/business";

/* ═══ Status labels ═══ */

const orderLabels: Record<OrderStatus, string> = {
  borrador: "Borrador",
  confirmado: "Confirmado",
  preparacion: "En preparación",
  preparado: "Preparado",
  reparto: "En reparto",
  entregado: "Entregado",
  entregado_sin_cobrar: "Entregado s/cobrar",
  pagado: "Pagado",
  cancelado: "Cancelado",
};

const inquiryLabels: Record<InquiryStatus, string> = {
  nueva: "Nueva",
  respondida: "Respondida",
  cotizada: "Cotizada",
  seguimiento: "En seguimiento",
  convertida: "Convertida",
  perdida: "Perdida",
};

export function orderStatusLabel(status: OrderStatus): string {
  return orderLabels[status] ?? status;
}

export function inquiryStatusLabel(status: InquiryStatus): string {
  return inquiryLabels[status] ?? status;
}

export function statusVariant(status: string): string {
  const map: Record<string, string> = {
    borrador: "neutral",
    confirmado: "info",
    preparacion: "info",
    preparado: "success",
    reparto: "warning",
    entregado: "success",
    entregado_sin_cobrar: "danger",
    pagado: "success",
    cancelado: "neutral",
    nueva: "info",
    respondida: "success",
    cotizada: "warning",
    seguimiento: "warning",
    convertida: "violet",
    perdida: "neutral",
    activo: "success",
    pausado: "warning",
    moroso: "danger",
  };
  return map[status] ?? "neutral";
}

/* ═══ Components ═══ */

export function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note?: string;
  color?: "green" | "blue" | "amber" | "violet";
}) {
  return (
    <div className={`metric-card ${color ?? ""}`}>
      <div className="metric-head">
        <span className="metric-icon"><Icon size={17} /></span>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value">{value}</div>
      {note && <div className="metric-note">{note}</div>}
    </div>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span className={`badge badge-${statusVariant(status)}`}>{label}</span>
  );
}

export function WhatsAppBtn({
  phone,
  message,
  label = "WhatsApp",
}: {
  phone: string;
  message: string;
  label?: string;
}) {
  return (
    <a
      className="btn btn-whatsapp btn-sm"
      href={createWhatsAppUrl(phone, message)}
      target="_blank"
      rel="noreferrer"
      title="Enviar por WhatsApp"
    >
      <Send size={14} />
      {label}
    </a>
  );
}

export function CopyBtn({
  text,
  label = "Copiar",
  onCopy,
}: {
  text: string;
  label?: string;
  onCopy: (msg: string) => void;
}) {
  return (
    <button
      className="btn btn-secondary btn-sm"
      onClick={() => onCopy(text)}
      title="Copiar mensaje"
    >
      <Copy size={14} />
      {label}
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="empty">
      <Icon size={32} />
      <div className="empty-title">{title}</div>
      {description && <div className="empty-desc">{description}</div>}
    </div>
  );
}

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
