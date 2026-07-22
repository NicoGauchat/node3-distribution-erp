'use client'

import { useEffect, useState } from "react"
import { getPlantillas, getClientes, PlantillaMensaje, Cliente } from "@/lib/data"
import { Copy, Send, Search, MessageSquare } from "lucide-react"

export default function MensajesPage() {
  const [plantillas, setPlantillas] = useState<PlantillaMensaje[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState("")
  const [mensajePersonalizado, setMensajePersonalizado] = useState("")

  useEffect(() => {
    setPlantillas(getPlantillas())
    setClientes(getClientes())
  }, [])

  const clienteSel = clientes.find(c => c.id === clienteId)

  function reemplazarVariables(plantilla: string): string {
    let msg = plantilla
    if (clienteSel) {
      msg = msg.replace(/\{\{cliente\}\}/g, clienteSel.nombre)
      msg = msg.replace(/\{\{deuda\}\}/g, clienteSel.deudaActual.toLocaleString('es-AR'))
    }
    msg = msg.replace(/\{\{fecha\}\}/g, new Date().toLocaleDateString('es-AR'))
    msg = msg.replace(/\{\{total\}\}/g, '0')
    return msg
  }

  function usarPlantilla(plantilla: string) {
    setMensajePersonalizado(reemplazarVariables(plantilla))
  }

  function copiarMensaje() {
    navigator.clipboard.writeText(mensajePersonalizado)
  }

  function abrirWhatsApp() {
    if (!clienteSel) return
    window.open(`https://wa.me/${clienteSel.telefono}?text=${encodeURIComponent(mensajePersonalizado)}`, '_blank')
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mensajes para WhatsApp</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Seleccionar cliente (opcional)</label>
            <select value={clienteId} onChange={e => setClienteId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Sin cliente especifico</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {clienteSel && (
              <div className="mt-2 text-xs text-gray-500">
                WhatsApp: {clienteSel.telefono} | Deuda: $ {clienteSel.deudaActual.toLocaleString('es-AR')}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-3">Plantillas</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {plantillas.map(p => (
                <button key={p.id} onClick={() => usarPlantilla(p.plantilla)}
                  className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" /> {p.nombre}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{p.plantilla}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mensaje personalizado</label>
            <textarea value={mensajePersonalizado} onChange={e => setMensajePersonalizado(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Escribi o seleccioná una plantilla..." />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-3">Acciones</h3>
            <div className="space-y-2">
              <button onClick={copiarMensaje} disabled={!mensajePersonalizado}
                className="w-full flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50">
                <Copy className="w-4 h-4" /> Copiar mensaje
              </button>
              <button onClick={abrirWhatsApp} disabled={!mensajePersonalizado || !clienteSel}
                className="w-full flex items-center justify-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                <Send className="w-4 h-4" /> Abrir en WhatsApp
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-sm mb-2">Variables disponibles</h3>
            <div className="space-y-1 text-xs text-gray-500">
              <code className="block bg-gray-50 px-2 py-1 rounded">{'{{cliente}}'} - Nombre del cliente</code>
              <code className="block bg-gray-50 px-2 py-1 rounded">{'{{deuda}}'} - Deuda actual</code>
              <code className="block bg-gray-50 px-2 py-1 rounded">{'{{fecha}}'} - Fecha de hoy</code>
              <code className="block bg-gray-50 px-2 py-1 rounded">{'{{total}}'} - Monto del pedido</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
