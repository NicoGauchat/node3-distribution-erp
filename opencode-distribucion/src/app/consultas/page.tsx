'use client'

import { useEffect, useState } from "react"
import { getConsultas, updateConsulta, formatearMoneda, getEstadoConsultaColor, Consulta, generarId } from "@/lib/data"
import Link from "next/link"
import { Plus, Search, MessageSquare, CheckCircle, XCircle } from "lucide-react"

const estados = ['nueva', 'respondida', 'cotizada', 'en_seguimiento', 'convertida', 'perdida']

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [nueva, setNueva] = useState({ clienteNombre: '', consultaOriginal: '', canal: 'whatsapp' as const, responsable: 'Vendedor' })

  function cargar() { setConsultas(getConsultas()) }
  useEffect(() => { cargar() }, [])

  const filtradas = consultas.filter(c =>
    (!filtroEstado || c.estado === filtroEstado) &&
    (c.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) || c.consultaOriginal.toLowerCase().includes(busqueda.toLowerCase()))
  )

  function handleCrear() {
    if (!nueva.clienteNombre || !nueva.consultaOriginal) return
    const consulta: Consulta = {
      id: generarId(), clienteId: null, clienteNombre: nueva.clienteNombre,
      canal: nueva.canal, consultaOriginal: nueva.consultaOriginal,
      productosConsultados: '', responsable: nueva.responsable,
      proximaAccion: '', fechaSeguimiento: '', estado: 'nueva',
      motivoPerdida: '', fecha: new Date().toISOString().slice(0, 10)
    }
    import('@/lib/data').then(mod => mod.saveConsulta(consulta))
    setNueva({ clienteNombre: '', consultaOriginal: '', canal: 'whatsapp', responsable: 'Vendedor' })
    setShowForm(false)
    cargar()
  }

  function cambiarEstado(id: string, estado: string) {
    updateConsulta(id, { estado: estado as any })
    cargar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Consultas y oportunidades</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-[#0f3b5e] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#1a5a8a] transition-colors">
          <Plus className="w-4 h-4" /> Nueva consulta
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-4 mb-4">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input type="text" placeholder="Cliente o prospecto" value={nueva.clienteNombre} onChange={e => setNueva({ ...nueva, clienteNombre: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm" />
            <select value={nueva.canal} onChange={e => setNueva({ ...nueva, canal: e.target.value as any })}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="telefono">Telefono</option>
              <option value="web">Web</option>
              <option value="referido">Referido</option>
            </select>
          </div>
          <textarea placeholder="Consulta original" value={nueva.consultaOriginal} onChange={e => setNueva({ ...nueva, consultaOriginal: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3" rows={2} />
          <div className="flex gap-2">
            <button onClick={handleCrear} className="bg-[#0f3b5e] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#1a5a8a]">Guardar</button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-3 py-1.5">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          {estados.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="grid gap-2">
        {filtradas.map(c => (
          <div key={c.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{c.clienteNombre}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoConsultaColor(c.estado)}`}>{c.estado.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-400">{c.canal}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{c.consultaOriginal}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{c.fecha}</span>
                  <span>Resp: {c.responsable}</span>
                  {c.proximaAccion && <span>Prox: {c.proximaAccion}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                {c.estado !== 'convertida' && c.estado !== 'perdida' && (
                  <>
                    <button onClick={() => cambiarEstado(c.id, 'convertida')} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Convertir a pedido">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => cambiarEstado(c.id, 'perdida')} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Marcar como perdida">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                {['nueva', 'respondida'].includes(c.estado) && (
                  <button onClick={() => cambiarEstado(c.id, 'cotizada')} className="p-1.5 hover:bg-purple-50 rounded-lg text-purple-600" title="Cotizar">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {c.estado === 'convertida' && (
              <Link href={`/pedidos/nuevo?clienteId=${c.clienteId || ''}&consultaId=${c.id}`}
                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                Crear pedido desde esta consulta
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
