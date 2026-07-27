"use client";

import { useState } from "react";
import { MessageCircle, Check } from "lucide-react";
import type { DemoState, Inquiry, InquiryStatus } from "@/lib/types";
import { generateFollowUpMessage } from "@/lib/business";
import { formatDate, normalizeText } from "@/lib/format";
import { StatusBadge, CopyBtn, inquiryStatusLabel } from "./ui";

export function InquiriesView({
  state,
  onConvertInquiry,
  onCreateInquiry,
  onUpdateInquiry,
  onCopyMessage,
}: {
  state: DemoState;
  onConvertInquiry: (inquiry: Inquiry) => void;
  onCreateInquiry: (text: string) => void;
  onUpdateInquiry: (id: string, changes: Partial<Inquiry>) => void;
  onCopyMessage: (msg: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [newText, setNewText] = useState("");

  const filteredInquiries = state.inquiries.filter((i) => {
    if (!query) return true;
    const q = normalizeText(query);
    return (
      normalizeText(i.prospectName).includes(q) ||
      normalizeText(i.text).includes(q)
    );
  });

  return (
    <div className="content">
      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Bandeja comercial</h2>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <input
              type="text"
              className="input"
              placeholder="Buscar prospecto o consulta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Prospecto / Cliente</th>
                  <th>Consulta</th>
                  <th>Estado</th>
                  <th>Próxima acción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className="text-bold">{i.prospectName}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        {i.channel} • {formatDate(i.createdAt)}
                      </div>
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: "normal" }}>{i.text}</td>
                    <td>
                      <select
                        className="select inquiry-status"
                        value={i.status}
                        onChange={(e) => onUpdateInquiry(i.id, { status: e.target.value as InquiryStatus })}
                        aria-label={`Estado de la consulta de ${i.prospectName}`}
                      >
                        <option value="nueva">Nueva</option>
                        <option value="respondida">Respondida</option>
                        <option value="cotizada">Cotizada</option>
                        <option value="seguimiento">En seguimiento</option>
                        <option value="perdida">Perdida</option>
                        <option value="convertida">Convertida</option>
                      </select>
                    </td>
                    <td style={{ maxWidth: 150, whiteSpace: "normal", fontSize: 12 }}>{i.nextAction}</td>
                    <td>
                      <div className="actions">
                        <CopyBtn
                          text={generateFollowUpMessage(i)}
                          onCopy={onCopyMessage}
                          label="Resp"
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onConvertInquiry(i)}
                          title="Convertir en pedido"
                          disabled={i.status === "convertida" || i.status === "perdida"}
                        >
                          <Check size={14} /> Convertir
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
          <div className="card-head">
            <h2 className="card-title">Nueva consulta</h2>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Mensaje de WhatsApp</label>
            <textarea
              className="textarea"
              placeholder="Pega aquí el mensaje del cliente..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              style={{ minHeight: 120 }}
            />
          </div>
          <div className="msg-box" style={{ marginBottom: 16 }}>
            Ingresa manualmente la consulta o copia y pega el texto desde WhatsApp. El sistema intentará extraer productos y asignar estado automáticamente.
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={() => {
              if (newText.trim()) {
                onCreateInquiry(newText);
                setNewText("");
              }
            }}
            disabled={!newText.trim()}
          >
            <MessageCircle size={16} /> Cargar consulta
          </button>
        </div>
      </div>
    </div>
  );
}
