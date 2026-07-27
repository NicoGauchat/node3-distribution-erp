"use client";

import { useState } from "react";
import { FileSpreadsheet, Boxes, Plus, Edit, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCurrency, normalizeText } from "@/lib/format";
import { EmptyState, StatusBadge } from "./ui";

type ProductFormData = Omit<Product, "id">;

const initialFormState: ProductFormData = {
  sku: "",
  name: "",
  category: "Otro",
  unit: "unidad",
  costPrice: 0,
  stock: 0,
  minStock: 0,
  prices: { minorista: 0, mayorista: 0, especial: 0 },
  active: true,
};

export function ProductsView({
  products,
  onImport,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: {
  products: Product[];
  onImport: () => void;
  onAddProduct: (data: Omit<Product, "id">) => void;
  onUpdateProduct: (id: string, changes: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleOpenNew = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      unit: product.unit,
      costPrice: product.costPrice,
      stock: product.stock,
      minStock: product.minStock,
      prices: { ...product.prices },
      active: product.active,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (editingId) {
      onUpdateProduct(editingId, formData);
    } else {
      onAddProduct(formData);
    }
    handleClose();
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  const filteredProducts = products.filter(p => {
    if (categoryFilter && categoryFilter !== "Todas" && p.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = normalizeText(searchQuery);
      if (!normalizeText(p.name).includes(q) && !normalizeText(p.sku).includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="content">
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <h2 className="card-title">Actualización masiva de catálogo</h2>
        </div>
        <div className="split">
          <div className="msg-box" style={{ flex: 1, marginRight: 16 }}>
            Simulá una actualización desde Excel para mostrar cómo se incorporan productos y precios. El importador de archivos reales queda para la versión piloto.
          </div>
          <button className="btn btn-primary" onClick={onImport}>
            <FileSpreadsheet size={16} />
            Simular importación
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <h2 className="card-title">{editingId ? "Editar producto" : "Nuevo producto"}</h2>
          </div>
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  className="input" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input 
                  className="input" 
                  value={formData.sku} 
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select 
                  className="select" 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Bebidas</option>
                  <option>Golosinas</option>
                  <option>Snacks</option>
                  <option>Galletitas</option>
                  <option>Helados</option>
                  <option>Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unidad</label>
                <select 
                  className="select" 
                  value={formData.unit} 
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option>pack</option>
                  <option>caja</option>
                  <option>bolsa</option>
                  <option>unidad</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock</label>
                <input 
                  type="number"
                  className="input" 
                  value={formData.stock} 
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} 
                />
              </div>
              <div className="form-group">
                <label>Stock mínimo</label>
                <input 
                  type="number"
                  className="input" 
                  value={formData.minStock} 
                  onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Costo de reposición</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Math.max(0, Number(e.target.value)) })}
                />
              </div>
              <div className="form-group">
                <label>Precio minorista</label>
                <input 
                  type="number"
                  className="input" 
                  value={formData.prices.minorista} 
                  onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, minorista: Number(e.target.value) } })} 
                />
              </div>
              <div className="form-group">
                <label>Precio mayorista</label>
                <input 
                  type="number"
                  className="input" 
                  value={formData.prices.mayorista} 
                  onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, mayorista: Number(e.target.value) } })} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio especial</label>
                <input 
                  type="number"
                  className="input" 
                  value={formData.prices.especial} 
                  onChange={(e) => setFormData({ ...formData, prices: { ...formData.prices, especial: Number(e.target.value) } })} 
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select 
                  className="select" 
                  value={formData.active ? "Activo" : "Inactivo"} 
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === "Activo" })}
                >
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>
            </div>
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
            <button className="btn btn-ghost" onClick={handleClose}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div className="split" style={{ width: "100%" }}>
            <input
              className="input"
              placeholder="Buscar producto o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, maxWidth: 300 }}
            />
            <select
              className="select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: 150 }}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button className="btn btn-primary btn-sm" onClick={handleOpenNew}>
              <Plus size={16} />
              Nuevo producto
            </button>
          </div>
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
                  <th>Costo</th>
                  <th>Minorista</th>
                  <th>Mayorista</th>
                  <th>Margen mayorista</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
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
                    <td>{formatCurrency(p.costPrice)}</td>
                    <td>{formatCurrency(p.prices.minorista)}</td>
                    <td>{formatCurrency(p.prices.mayorista)}</td>
                    <td>
                      <StatusBadge
                        status={p.prices.mayorista > p.costPrice ? "activo" : "moroso"}
                        label={`${p.costPrice > 0 ? Math.round(((p.prices.mayorista - p.costPrice) / p.prices.mayorista) * 100) : 0}%`}
                      />
                    </td>
                    <td>
                      <div className="actions">
                        {confirmDeleteId === p.id ? (
                          <>
                            <span style={{ fontSize: 13, marginRight: 8 }}>¿Eliminar?</span>
                            <button className="btn btn-danger btn-sm" onClick={() => {
                              onDeleteProduct(p.id);
                              setConfirmDeleteId(null);
                            }}>
                              Sí
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeleteId(null)}>
                              No
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(p)}>
                              <Edit size={14} />
                              Editar
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDeleteId(p.id)}>
                              <Trash2 size={14} />
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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
