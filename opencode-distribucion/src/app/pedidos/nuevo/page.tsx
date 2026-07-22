'use client'

import { Suspense, useEffect, useState } from "react"
import { getClientes, getProductos, getListasPrecio, savePedido, generarId, formatearMoneda, Cliente, Producto, ListaPrecio, ItemPedido, updateConsulta } from "@/lib/data"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Send, Copy } from "lucide-react"

export default function NuevoPedidoWrapper() {
  return <Suspense fallback={<div className="text-gray-500 p-8">Cargando...</div>}><NuevoPedido /></Suspense>
}

function NuevoPedido() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [listas, setListas] = useState<ListaPrecio[]>([])
  const [clienteId, setClienteId] = useState(searchParams.get('cliente') || searchParams.get('clienteId') || '')
  const [items, setItems] = useState<ItemPedido[]>([])
  const [notas, setNotas] = useState('')
  const [productoBusqueda, setProductoBusqueda] = useState('')
  const [mensajeWhatsApp, setMensajeWhatsApp] = useState('')
  const [mostrarMensaje, setMostrarMensaje] = useState(false)

  useEffect(() => {
    setClientes(getClientes())
    setProductos(getProductos())
    setListas(getListasPrecio())
  }, [])

  const clienteSel = clientes.find(c => c.id === clienteId)
  const listaPrecio = listas.find(l => l.id === clienteSel?.listaPrecio)

  const productosFiltrados = productos.filter(p =>
    p.activo && (p.nombre.toLowerCase().includes(productoBusqueda.toLowerCase()) || p.sku.toLowerCase().includes(productoBusqueda.toLowerCase()))
  )

  function getPrecio(productoId: string): number {
    if (!listaPrecio) return 0
    const item = listaPrecio.items.find(i => i.productoId === productoId)
    return item?.precio || 0
  }

  function agregarProducto(producto: Producto) {
    const existente = items.find(i => i.productoId === producto.id)
    if (existente) {
      setItems(items.map(i => i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioUnitario - (i.descuento || 0) } : i))
    } else {
      const precio = getPrecio(producto.id)
      setItems([...items, { productoId: producto.id, productoNombre: producto.nombre, cantidad: 1, precioUnitario: precio, descuento: 0, subtotal: precio }])
    }
    setProductoBusqueda('')
  }

  function actualizarCantidad(productoId: string, cantidad: number) {
    if (cantidad <= 0) {
      setItems(items.filter(i => i.productoId !== productoId))
      return
    }
    setItems(items.map(i => i.productoId === productoId ? { ...i, cantidad, subtotal: cantidad * i.precioUnitario - i.descuento } : i))
  }

  function actualizarDescuento(productoId: string, descuento: number) {
    setItems(items.map(i => i.productoId === productoId ? { ...i, descuento, subtotal: i.cantidad * i.precioUnitario - descuento } : i))
  }

  function quitarItem(productoId: string) {
    setItems(items.filter(i => i.productoId !== productoId))
  }

  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)
  const descuentoTotal = items.reduce((s, i) => s + (i.descuento || 0), 0)
  const total = items.reduce((s, i) => s + i.subtotal, 0)

  function handleCrearPedido() {
    if (!clienteId || items.length === 0) return
    const hoy = new Date().toISOString().slice(0, 10)
    const pedido = {
      id: generarId(),
      clienteId,
      clienteNombre: clienteSel!.nombre,
      items,
      subtotal,
      descuentoTotal,
      total,
      estado: 'confirmado' as const,
      fecha: hoy,
      fechaEntrega: '',
      notas,
    }
    savePedido(pedido)

    const consultaId = searchParams.get('consultaId')
    if (consultaId) {
      updateConsulta(consultaId, { estado: 'convertida' })
    }

    const msg = `Hola ${clienteSel!.nombre}, te confirmamos tu pedido del ${hoy} por ${formatearMoneda(total)}. Lo estamos preparando. Te avisamos cuando este listo.`
    setMensajeWhatsApp(msg)
    setMostrarMensaje(true)
  }

  function copiarMensaje() {
    navigator.clipboard.writeText(mensajeWhatsApp)
  }

  function abrirWhatsApp() {
    const telefono = clienteSel?.telefono || ''
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensajeWhatsApp)}`, '_blank')
  }

  if (mostrarMensaje) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="bg-white rounded-xl border p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Pedido creado!</h2>
          <p className="text-gray-500 mb-4">Total: {formatearMoneda(total)}</p>
          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm mb-4">
            <p>{mensajeWhatsApp}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={copiarMensaje} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
              <Copy className="w-4 h-4" /> Copiar mensaje
            </button>
            <button onClick={abrirWhatsApp} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              <Send className="w-4 h-4" /> Abrir WhatsApp
            </button>
          </div>
          <div className="mt-4">
            <Link href="/pedidos" className="text-sm text-blue-600 hover:underline">Volver a pedidos</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link href="/pedidos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a pedidos
      </Link>
      <h2 className="text-xl font-bold mb-4">Nuevo pedido</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Cliente</label>
            <select value={clienteId} onChange={e => { setClienteId(e.target.value); setItems([]) }}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} - {c.localidad}</option>)}
            </select>
            {clienteSel && (
              <div className="mt-2 flex gap-2 text-xs text-gray-500">
                <span>Lista: {clienteSel.listaPrecio}</span>
                <span>Credito: {formatearMoneda(clienteSel.limiteCredito)}</span>
                <span>Deuda: {formatearMoneda(clienteSel.deudaActual)}</span>
              </div>
            )}
          </div>

          {clienteId && (
            <div className="bg-white rounded-xl border p-4">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Agregar productos</label>
              <input type="text" placeholder="Buscar producto..." value={productoBusqueda} onChange={e => setProductoBusqueda(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-2" />
              {productoBusqueda && (
                <div className="border rounded-lg max-h-40 overflow-auto">
                  {productosFiltrados.map(p => (
                    <button key={p.id} onClick={() => agregarProducto(p)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-0 flex items-center justify-between">
                      <span>{p.nombre}</span>
                      <span className="text-gray-500">{formatearMoneda(getPrecio(p.id))}</span>
                    </button>
                  ))}
                  {productosFiltrados.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>}
                </div>
              )}
            </div>
          )}

          {items.length > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold mb-3">Productos seleccionados</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.productoId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.productoNombre}</div>
                      <div className="text-xs text-gray-500">{formatearMoneda(item.precioUnitario)} c/u</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)} className="w-7 h-7 flex items-center justify-center bg-white border rounded text-sm hover:bg-gray-100">-</button>
                      <input type="number" value={item.cantidad} onChange={e => actualizarCantidad(item.productoId, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 text-center border rounded py-1 text-sm" min="1" />
                      <button onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)} className="w-7 h-7 flex items-center justify-center bg-white border rounded text-sm hover:bg-gray-100">+</button>
                    </div>
                    <input type="number" value={item.descuento} onChange={e => actualizarDescuento(item.productoId, parseInt(e.target.value) || 0)}
                      placeholder="Dto" className="w-16 border rounded py-1 text-sm text-center" />
                    <div className="text-sm font-medium w-24 text-right">{formatearMoneda(item.subtotal)}</div>
                    <button onClick={() => quitarItem(item.productoId)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-3">Resumen</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatearMoneda(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Descuentos</span><span className="text-red-500">-{formatearMoneda(descuentoTotal)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatearMoneda(total)}</span></div>
            </div>
            <textarea placeholder="Notas del pedido..." value={notas} onChange={e => setNotas(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-3" rows={2} />
            <button onClick={handleCrearPedido} disabled={!clienteId || items.length === 0}
              className="w-full mt-3 bg-[#0f3b5e] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a5a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Confirmar pedido
            </button>
          </div>

          {clienteSel && (
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold text-sm mb-2">Cliente</h3>
              <p className="text-sm">{clienteSel.nombre}</p>
              <p className="text-xs text-gray-500">{clienteSel.direccion}, {clienteSel.localidad}</p>
              <p className="text-xs text-gray-500">Lista: {listaPrecio?.nombre}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
