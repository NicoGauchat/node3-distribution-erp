'use client'

import { useEffect, useState } from "react"
import { getPedidos, getClientes, getPagos, savePago, generarId, formatearMoneda, Pedido, Cliente, Pago } from "@/lib/data"
import { Search, DollarSign, CheckCircle, Send, Copy } from "lucide-react"

export default function CobranzasPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [pagoModal, setPagoModal] = useState<{ pedidoId: string; monto: number; maxMonto: number; clienteNombre: string } | null>(null)
  const [montoPago, setMontoPago] = useState(0)

  function cargar() {
    setPedidos(getPedidos())
    setClientes(getClientes())
    setPagos(getPagos())
  }
  useEffect(() => { cargar() }, [])

  const pendientesCobro = pedidos.filter(p => p.estado === 'entregado_sin_cobrar' || p.estado === 'entregado')
  const filtrados = pendientesCobro.filter(p =>
    p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  function handleRegistrarPago() {
    if (!pagoModal || montoPago <= 0) return
    const pago: Pago = {
      id: generarId(),
      pedidoId: pagoModal.pedidoId,
      monto: montoPago,
      fecha: new Date().toISOString().slice(0, 10),
      tipo: montoPago >= pagoModal.maxMonto ? 'total' : 'parcial',
      observacion: '',
    }
    savePago(pago)

    const pedido = pedidos.find(p => p.id === pagoModal.pedidoId)
    const totalPagos = [...pagos, pago].filter(pa => pa.pedidoId === pagoModal.pedidoId).reduce((s, pa) => s + pa.monto, 0)
    if (totalPagos >= pagoModal.maxMonto && pedido) {
      import('@/lib/data').then(mod => mod.updatePedido(pedido.id, { estado: 'pagado' }))
    }

    setPagoModal(null)
    setMontoPago(0)
    cargar()
  }

  function getMontoPagado(pedidoId: string): number {
    return pagos.filter(p => p.pedidoId === pedidoId).reduce((s, p) => s + p.monto, 0)
  }

  function getSaldo(pedidoId: string, total: number): number {
    return total - getMontoPagado(pedidoId)
  }

  const totalPorCobrar = filtrados.reduce((s, p) => s + getSaldo(p.id, p.total), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Cobranzas</h2>
        <div className="text-sm bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-medium">
          Por cobrar: {formatearMoneda(totalPorCobrar)}
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Buscar por cliente..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
      </div>

      <div className="grid gap-3">
        {filtrados.map(p => {
          const saldo = getSaldo(p.id, p.total)
          return (
            <div key={p.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.clienteNombre}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>Pedido: {p.id.toUpperCase()}</span>
                    <span>{p.fecha}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Saldo pendiente</div>
                  <div className="text-xl font-bold text-red-600">{formatearMoneda(saldo)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <button onClick={() => {
                  setPagoModal({ pedidoId: p.id, monto: saldo, maxMonto: p.total, clienteNombre: p.clienteNombre })
                  setMontoPago(saldo)
                }} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700">
                  <DollarSign className="w-4 h-4" /> Registrar pago
                </button>
                <button onClick={() => {
                  const msg = `Hola ${p.clienteNombre}, te recordamos que tenes pendiente un saldo de ${formatearMoneda(saldo)}. Por favor confirmanos cuando lo abonarias.`
                  navigator.clipboard.writeText(msg)
                }} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200">
                  <Copy className="w-4 h-4" /> Copiar recordatorio
                </button>
                <button onClick={() => {
                  const cliente = clientes.find(c => c.nombre === p.clienteNombre)
                  if (cliente) {
                    const msg = `Hola ${p.clienteNombre}, te recordamos que tenes pendiente un saldo de ${formatearMoneda(saldo)}. Por favor confirmanos cuando lo abonarias.`
                    window.open(`https://wa.me/${cliente.telefono}?text=${encodeURIComponent(msg)}`, '_blank')
                  }
                }} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700">
                  <Send className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>
          )
        })}
        {filtrados.length === 0 && <p className="text-gray-400 text-center py-8">No hay pedidos pendientes de cobro</p>}
      </div>

      {pagoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setPagoModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2">Registrar pago</h3>
            <p className="text-sm text-gray-500 mb-4">{pagoModal.clienteNombre} - Saldo: {formatearMoneda(pagoModal.monto)}</p>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Monto a cobrar</label>
            <input type="number" value={montoPago} onChange={e => setMontoPago(parseInt(e.target.value) || 0)}
              className="w-full border rounded-lg px-3 py-2 text-lg font-bold mb-4" min="1" max={pagoModal.maxMonto} />
            <div className="flex gap-2">
              <button onClick={handleRegistrarPago} disabled={montoPago <= 0} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
                <CheckCircle className="w-4 h-4 inline mr-1" /> Confirmar pago
              </button>
              <button onClick={() => setPagoModal(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
