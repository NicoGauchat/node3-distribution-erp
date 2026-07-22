'use client'

import { useEffect, useState } from "react"
import { getProductos, getListasPrecio, formatearMoneda, Producto, ListaPrecio } from "@/lib/data"
import { Search, AlertTriangle } from "lucide-react"

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [listas, setListas] = useState<ListaPrecio[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [listaActiva, setListaActiva] = useState("minorista")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")

  useEffect(() => {
    setProductos(getProductos())
    setListas(getListasPrecio())
  }, [])

  const categorias = [...new Set(productos.map(p => p.categoria))]

  const filtrados = productos.filter(p =>
    (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.sku.toLowerCase().includes(busqueda.toLowerCase())) &&
    (!categoriaFiltro || p.categoria === categoriaFiltro)
  )

  const listaActual = listas.find(l => l.id === listaActiva)

  function getPrecioLista(productoId: string): number | null {
    if (!listaActual) return null
    const item = listaActual.items.find(i => i.productoId === productoId)
    return item ? item.precio : null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Productos y listas de precios</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre o SKU..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todas las categorias</option>
          {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="flex gap-1 mb-4">
        {listas.map(l => (
          <button key={l.id} onClick={() => setListaActiva(l.id)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${listaActiva === l.id ? 'bg-[#0f3b5e] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {l.nombre}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {filtrados.map(p => {
          const precio = getPrecioLista(p.id)
          const bajoStock = p.stock <= p.stockMinimo
          return (
            <div key={p.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.nombre}</h3>
                    <span className="text-xs text-gray-400">{p.sku}</span>
                    {bajoStock && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{p.categoria}</span>
                    <span>Stock: <span className={bajoStock ? 'text-orange-600 font-medium' : ''}>{p.stock} {p.unidad}</span></span>
                    <span>Stock min: {p.stockMinimo}</span>
                  </div>
                </div>
                <div className="text-right">
                  {precio !== null && (
                    <div>
                      <div className="text-sm text-gray-500">Precio {listaActual?.nombre}</div>
                      <div className="text-lg font-bold">{formatearMoneda(precio)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
