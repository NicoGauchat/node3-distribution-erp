"use client";

import { FileSpreadsheet, Boxes } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { EmptyState, StatusBadge } from "./ui";

export function ProductsView({
  products,
  onImport,
}: {
  products: Product[];
  onImport: () => void;
}) {
  return (
    <div className="content">
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <h2 className="card-title">Importación desde Excel</h2>
        </div>
        <div className="split">
          <div className="msg-box" style={{ flex: 1, marginRight: 16 }}>
            Puedes actualizar el catálogo de productos y listas de precios subiendo un archivo Excel.
          </div>
          <button className="btn btn-primary" onClick={onImport}>
            <FileSpreadsheet size={16} />
            Importar Excel
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2 className="card-title">Catálogo de Productos</h2>
        </div>
        {products.length === 0 ? (
          <EmptyState icon={Boxes} title="No hay productos" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Minorista</th>
                  <th>Mayorista</th>
                  <th>Especial</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="text-bold">{p.name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        {p.sku} • {p.unit}
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      <StatusBadge 
                        status={p.stock > p.minStock ? "activo" : "pausado"} 
                        label={`${p.stock}`} 
                      />
                    </td>
                    <td>{formatCurrency(p.prices.minorista)}</td>
                    <td>{formatCurrency(p.prices.mayorista)}</td>
                    <td>{formatCurrency(p.prices.especial)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
