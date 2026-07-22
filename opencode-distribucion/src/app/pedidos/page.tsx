'use client'

import { useEffect, useState } from "react"
import { getPedidos, updatePedido, formatearMoneda, getEstadoPedidoColor, Pedido, EstadoPedido } from "@/lib/data"
import Link from "next/link"
import { Plus, Search, ChevronRight, ChevronLeft } from "lucide-react"

const columnas: { titulo: string; estados: EstadoPedido[] }[] = [
  { titulo: 'Nuevos', estados: ['confirmado'] },
  { titulo: 'En preparacion', estados: ['en_preparacion'] },
  { titulo: 'Preparados', estados: ['preparado', 'en_reparto'] },
  { titulo: 'Entregados', estados: ['entregado', 'entregado_sin_cobrar'] },
  { titulo: 'Pagados', estados: ['pagado'] },
  { titulo: 'Cancelados', estados: ['cancelado'] },
]

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [vista, setVista] = useState<'kanban' | 'lista'>('kanban')

  function cargar() { setPedidos(getPedidos()) }
  useEffect(() => { cargar() }, [])

  const filtrados = pedidos.filter(p =>
    p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  function avanzarEstado(pedido: Pedido) {
    const orden: EstadoPedido[] = ['confirmado', 'en_preparacion', 'preparado', 'en_reparto', 'entregado', 'entregado_sin_cobrar']
    const idx = orden.indexOf(pedido.estado)
    if (idx >= 0 && idx < orden.length - 1) {
      updatePedido(pedido.id, { estado: orden[idx + 1] })
      cargar()
    }
  }

  function retrocederEstado(pedido: Pedido) {
    const orden = ['confirmado', 'en_preparacion', 'preparado', 'en_reparto', 'entregado', 'entregado_sin_cobrar'] as EstadoPedido[]
    const idx = orden.indexOf(pedido.estado)
    if (idx > 0) {
      updatePedido(pedido.id, { estado: orden[idx - 1] })
      cargar()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Pedidos</h2>
        <Link href="/pedidos/nuevo" className="flex items-center gap-1.5 bg-[#0f3b5e] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#1a5a8a] transition-colors">
          <Plus className="w-4 h-4" /> Nuevo pedido
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por cliente..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setVista('kanban')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${vista === 'kanban' ? 'bg-white shadow-sm' : ''}`}>Kanban</button>
          <button onClick={() => setVista('lista')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${vista === 'lista' ? 'bg-white shadow-sm' : ''}`}>Lista</button>
        </div>
      </div>

      {vista === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columnas.map(col => {
            const colPedidos = filtrados.filter(p => col.estados.includes(p.estado))
            const total = colPedidos.reduce((s, p) => s + p.total, 0)
            return (
              <div key={col.titulo} className="min-w-[220px] flex-1">
                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{col.titulo}</h3>
                    <span className="text-xs text-gray-500">{colPedidos.length} | {formatearMoneda(total)}</span>
                  </div>
                  <div className="space-y-2">
                    {colPedidos.map(p => (
                      <div key={p.id} className="bg-white rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{p.clienteNombre}</span>
                          <span className="text-xs text-gray-400">{p.fecha}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold">{formatearMoneda(p.total)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getEstadoPedidoColor(p.estado)}`}>{p.estado.replace(/_/g, ' ')}</span>
                        </div>
                        {!['cancelado', 'pagado'].includes(p.estado) && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t">
                            {p.estado !== 'confirmado' && (
                              <button onClick={() => retrocederEstado(p)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-3 h-3" /></button>
                            )}
                            {p.estado !== 'entregado_sin_cobrar' && (
                              <button onClick={() => {
                                if (p.estado === 'entregado') {
                                  updatePedido(p.id, { estado: 'pagado' })
                                  cargar()
                                } else {
                                  avanzarEstado(p)
                                }
                              }} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-3 h-3" /></button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Cliente</th>
                <th className="text-left p-3 font-medium">Fecha</th>
                <th className="text-left p-3 font-medium">Estado</th>
                <th className="text-right p-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.clienteNombre}</td>
                  <td className="p-3 text-gray-500">{p.fecha}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoPedidoColor(p.estado)}`}>{p.estado.replace(/_/g, ' ')}</span></td>
                  <td className="p-3 text-right font-bold">{formatearMoneda(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
