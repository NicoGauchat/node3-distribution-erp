'use client'

import { useEffect, useState } from "react"
import { getClientes, formatearMoneda, Cliente } from "@/lib/data"
import Link from "next/link"
import { Plus, Search, Phone } from "lucide-react"

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => { setClientes(getClientes()) }, [])

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.localidad.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Clientes</h2>
        <Link href="/clientes/nuevo" className="flex items-center gap-1.5 bg-[#0f3b5e] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#1a5a8a] transition-colors">
          <Plus className="w-4 h-4" /> Nuevo cliente
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Buscar por nombre o localidad..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-3">
        {filtrados.map(c => {
          const estadoColor = c.estado === 'activo' ? 'bg-green-100 text-green-700' : c.estado === 'moroso' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          return (
            <Link key={c.id} href={`/clientes/${c.id}`} className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.nombre}</h3>
                  <p className="text-sm text-gray-500">{c.localidad} - {c.direccion}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.telefono}</span>
                    <span>{c.contacto}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${estadoColor}`}>{c.estado}</div>
                  <div className="mt-1.5">
                    <div className="text-sm text-gray-500">Deuda</div>
                    <div className={`font-bold ${c.deudaActual > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatearMoneda(c.deudaActual)}</div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
