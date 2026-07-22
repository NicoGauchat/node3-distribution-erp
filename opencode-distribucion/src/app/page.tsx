'use client'

import { useEffect, useState } from "react"
import { getPedidos, getClientes, getConsultas, getProductos, formatearMoneda, Pedido, Cliente, getEstadoPedidoColor, EstadoPedido } from "@/lib/data"
import { ShoppingCart, Users, ClipboardList, DollarSign, AlertTriangle, HelpCircle, TrendingUp, Package } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [stats, setStats] = useState({ ventasHoy: 0, pendientes: 0, preparados: 0, sinCobrar: 0, porCobrar: 0, clientesDeuda: 0, consultasAbiertas: 0, stockBajo: 0 })

  useEffect(() => {
    const pedidos = getPedidos()
    const clientes = getClientes()
    const consultas = getConsultas()
    const productos = getProductos()

    const hoy = new Date().toISOString().slice(0, 10)
    setStats({
      ventasHoy: pedidos.filter(p => p.fecha === hoy && p.estado !== 'cancelado').reduce((s, p) => s + p.total, 0),
      pendientes: pedidos.filter(p => ['confirmado', 'en_preparacion'].includes(p.estado)).length,
      preparados: pedidos.filter(p => ['preparado', 'en_reparto'].includes(p.estado)).length,
      sinCobrar: pedidos.filter(p => p.estado === 'entregado_sin_cobrar').length,
      porCobrar: pedidos.filter(p => p.estado === 'entregado_sin_cobrar' || p.estado === 'entregado').reduce((s, p) => s + p.total, 0),
      clientesDeuda: clientes.filter(c => c.deudaActual > 0).length,
      consultasAbiertas: consultas.filter(c => !['convertida', 'perdida'].includes(c.estado)).length,
      stockBajo: productos.filter(p => p.stock <= p.stockMinimo).length,
    })
  }, [])

  const tarjetas = [
    { label: 'Ventas de hoy', valor: formatearMoneda(stats.ventasHoy), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pedidos pendientes', valor: stats.pendientes, icon: ClipboardList, color: 'bg-blue-50 text-blue-600', href: '/pedidos' },
    { label: 'Pedidos preparados', valor: stats.preparados, icon: Package, color: 'bg-indigo-50 text-indigo-600', href: '/pedidos' },
    { label: 'Sin cobrar', valor: stats.sinCobrar, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600', href: '/cobranzas' },
    { label: 'Total por cobrar', valor: formatearMoneda(stats.porCobrar), icon: DollarSign, color: 'bg-red-50 text-red-600', href: '/cobranzas' },
    { label: 'Clientes con deuda', valor: stats.clientesDeuda, icon: Users, color: 'bg-yellow-50 text-yellow-600', href: '/clientes' },
    { label: 'Consultas abiertas', valor: stats.consultasAbiertas, icon: HelpCircle, color: 'bg-purple-50 text-purple-600', href: '/consultas' },
    { label: 'Productos bajo stock', valor: stats.stockBajo, icon: ShoppingCart, color: 'bg-pink-50 text-pink-600', href: '/productos' },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {tarjetas.map((t) => {
          const Icono = t.icon
          const contenido = (
            <div className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t.label}</span>
                <div className={`p-2 rounded-lg ${t.color}`}><Icono className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-bold">{t.valor}</div>
            </div>
          )
          return t.href ? <Link key={t.label} href={t.href}>{contenido}</Link> : contenido
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <UltimosPedidos />
        <ProximasConsultas />
      </div>
    </div>
  )
}

function UltimosPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  useEffect(() => {
    setPedidos(getPedidos().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5))
  }, [])

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Ultimos pedidos</h3>
        <Link href="/pedidos" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
      </div>
      <div className="space-y-2">
        {pedidos.map(p => (
          <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
            <div>
              <span className="font-medium">{p.clienteNombre}</span>
              <span className="text-gray-400 ml-2 text-xs">{p.fecha}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatearMoneda(p.total)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoPedidoColor(p.estado)}`}>{p.estado.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProximasConsultas() {
  const [consultas, setConsultas] = useState<any[]>([])
  useEffect(() => {
    setConsultas(getConsultas().filter(c => !['convertida', 'perdida'].includes(c.estado)).slice(0, 4))
  }, [])

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Consultas activas</h3>
        <Link href="/consultas" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
      </div>
      <div className="space-y-2">
        {consultas.map(c => (
          <div key={c.id} className="text-sm py-1.5 border-b last:border-0">
            <div className="flex items-center justify-between">
              <span className="font-medium">{c.clienteNombre}</span>
              <span className="text-xs text-gray-400">{c.fecha}</span>
            </div>
            <p className="text-gray-500 truncate mt-0.5">{c.consultaOriginal}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
