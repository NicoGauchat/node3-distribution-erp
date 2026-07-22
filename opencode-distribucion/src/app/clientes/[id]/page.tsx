'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getCliente, formatearMoneda, getPedidosCliente, getConsultasCliente, Pedido, Consulta, getEstadoPedidoColor } from "@/lib/data"
import Link from "next/link"
import { ArrowLeft, Phone, MapPin, User } from "lucide-react"

export default function ClienteDetalle() {
  const params = useParams()
  const [cliente, setCliente] = useState<any>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [consultas, setConsultas] = useState<Consulta[]>([])

  useEffect(() => {
    const c = getCliente(params.id as string)
    setCliente(c)
    if (c) {
      setPedidos(getPedidosCliente(c.id))
      setConsultas(getConsultasCliente(c.id))
    }
  }, [params.id])

  if (!cliente) return <div className="text-gray-500">Cargando...</div>

  const estadoColor = cliente.estado === 'activo' ? 'bg-green-100 text-green-700' : cliente.estado === 'moroso' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'

  return (
    <div>
      <Link href="/clientes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a clientes
      </Link>

      <div className="bg-white rounded-xl border p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{cliente.nombre}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor}`}>{cliente.estado}</span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-1.5"><User className="w-4 h-4" /> {cliente.contacto}</p>
              <p className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {cliente.telefono}</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {cliente.direccion}, {cliente.localidad}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Deuda actual</div>
            <div className={`text-2xl font-bold ${cliente.deudaActual > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatearMoneda(cliente.deudaActual)}</div>
            <div className="text-xs text-gray-400 mt-1">Limite: {formatearMoneda(cliente.limiteCredito)}</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-0.5 rounded">{cliente.tipoCliente}</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded">Lista: {cliente.listaPrecio}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Pedidos</h3>
            <Link href={`/pedidos/nuevo?cliente=${cliente.id}`} className="text-sm text-blue-600 hover:underline">Nuevo pedido</Link>
          </div>
          {pedidos.length === 0 ? <p className="text-sm text-gray-400">Sin pedidos</p> : (
            <div className="space-y-2">
              {pedidos.map(p => (
                <div key={p.id} className="text-sm py-1.5 border-b last:border-0 flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-xs">{p.fecha}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${getEstadoPedidoColor(p.estado)}`}>{p.estado.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="font-medium">{formatearMoneda(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-3">Consultas</h3>
          {consultas.length === 0 ? <p className="text-sm text-gray-400">Sin consultas</p> : (
            <div className="space-y-2">
              {consultas.map(c => (
                <div key={c.id} className="text-sm py-1.5 border-b last:border-0">
                  <p className="truncate">{c.consultaOriginal}</p>
                  <span className="text-xs text-gray-400">{c.fecha}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
