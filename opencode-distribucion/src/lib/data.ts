export type TipoCliente = 'minorista' | 'mayorista' | 'especial'
export type EstadoCliente = 'activo' | 'pausado' | 'moroso'
export type EstadoConsulta = 'nueva' | 'respondida' | 'cotizada' | 'en_seguimiento' | 'convertida' | 'perdida'
export type CanalConsulta = 'whatsapp' | 'instagram' | 'telefono' | 'web' | 'referido'
export type EstadoPedido = 'borrador' | 'confirmado' | 'en_preparacion' | 'preparado' | 'en_reparto' | 'entregado' | 'entregado_sin_cobrar' | 'pagado' | 'cancelado'

export interface Cliente {
  id: string
  nombre: string
  contacto: string
  telefono: string
  direccion: string
  localidad: string
  tipoCliente: TipoCliente
  listaPrecio: string
  limiteCredito: number
  deudaActual: number
  estado: EstadoCliente
  notas: string
  fechaCreacion: string
}

export interface Producto {
  id: string
  nombre: string
  sku: string
  categoria: string
  precioBase: number
  precioMayorista: number
  precioEspecial: number
  stock: number
  stockMinimo: number
  unidad: string
  activo: boolean
}

export interface ItemListaPrecio {
  productoId: string
  precio: number
}

export interface ListaPrecio {
  id: string
  nombre: string
  items: ItemListaPrecio[]
}

export interface Consulta {
  id: string
  clienteId: string | null
  clienteNombre: string
  canal: CanalConsulta
  consultaOriginal: string
  productosConsultados: string
  responsable: string
  proximaAccion: string
  fechaSeguimiento: string
  estado: EstadoConsulta
  motivoPerdida: string
  fecha: string
}

export interface ItemPedido {
  productoId: string
  productoNombre: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
}

export interface Pedido {
  id: string
  clienteId: string
  clienteNombre: string
  items: ItemPedido[]
  subtotal: number
  descuentoTotal: number
  total: number
  estado: EstadoPedido
  fecha: string
  fechaEntrega: string
  notas: string
}

export interface Pago {
  id: string
  pedidoId: string
  monto: number
  fecha: string
  tipo: 'total' | 'parcial'
  observacion: string
}

export interface PlantillaMensaje {
  id: string
  nombre: string
  plantilla: string
}

let dataInicializada = false

function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const clientesDemo: Cliente[] = [
  { id: 'c1', nombre: 'Kiosco Los Amigos', contacto: 'Carlos', telefono: '5493492123456', direccion: 'San Martin 123', localidad: 'Rafaela', tipoCliente: 'minorista', listaPrecio: 'minorista', limiteCredito: 100000, deudaActual: 45000, estado: 'activo', notas: 'Buen pagador', fechaCreacion: '2026-06-01' },
  { id: 'c2', nombre: 'Dietetica Natural', contacto: 'Maria', telefono: '5493493123457', direccion: 'Belgrano 456', localidad: 'Sunchales', tipoCliente: 'mayorista', listaPrecio: 'mayorista', limiteCredito: 200000, deudaActual: 0, estado: 'activo', notas: '', fechaCreacion: '2026-06-05' },
  { id: 'c3', nombre: 'Gimnasio Power', contacto: 'Luis', telefono: '5493492123458', direccion: 'Av. Urquiza 789', localidad: 'Rafaela', tipoCliente: 'especial', listaPrecio: 'especial', limiteCredito: 80000, deudaActual: 18000, estado: 'activo', notas: 'Compra suplementos', fechaCreacion: '2026-06-10' },
  { id: 'c4', nombre: 'Autoservicio Don Luis', contacto: 'Don Luis', telefono: '5493491123459', direccion: 'Mitre 321', localidad: 'Lehmann', tipoCliente: 'mayorista', listaPrecio: 'mayorista', limiteCredito: 300000, deudaActual: 120000, estado: 'moroso', notas: 'Vencimiento recurrente', fechaCreacion: '2026-05-20' },
  { id: 'c5', nombre: 'Ferreteria Central', contacto: 'Jorge', telefono: '5493492123460', direccion: 'Bv. Roca 654', localidad: 'Rafaela', tipoCliente: 'minorista', listaPrecio: 'minorista', limiteCredito: 50000, deudaActual: 0, estado: 'activo', notas: '', fechaCreacion: '2026-06-15' },
]

const productosDemo: Producto[] = [
  { id: 'p1', nombre: 'Creatina 300g', sku: 'CRE-001', categoria: 'Suplementos', precioBase: 12000, precioMayorista: 10000, precioEspecial: 10500, stock: 25, stockMinimo: 5, unidad: 'unidad', activo: true },
  { id: 'p2', nombre: 'Proteina 1kg', sku: 'PRO-001', categoria: 'Suplementos', precioBase: 18000, precioMayorista: 15000, precioEspecial: 16000, stock: 15, stockMinimo: 5, unidad: 'unidad', activo: true },
  { id: 'p3', nombre: 'Shaker 500ml', sku: 'SHA-001', categoria: 'Accesorios', precioBase: 3500, precioMayorista: 2800, precioEspecial: 3000, stock: 40, stockMinimo: 10, unidad: 'unidad', activo: true },
  { id: 'p4', nombre: 'Agua mineral pack x12', sku: 'AGU-001', categoria: 'Bebidas', precioBase: 6000, precioMayorista: 5000, precioEspecial: 5400, stock: 50, stockMinimo: 20, unidad: 'pack', activo: true },
  { id: 'p5', nombre: 'Gaseosa cola pack x6', sku: 'GAS-001', categoria: 'Bebidas', precioBase: 8500, precioMayorista: 7200, precioEspecial: 7600, stock: 30, stockMinimo: 10, unidad: 'pack', activo: true },
  { id: 'p6', nombre: 'Detergente 5L', sku: 'DET-001', categoria: 'Limpieza', precioBase: 4500, precioMayorista: 3800, precioEspecial: 4000, stock: 20, stockMinimo: 8, unidad: 'unidad', activo: true },
  { id: 'p7', nombre: 'Guantes nitrilo caja x100', sku: 'GUA-001', categoria: 'Descartables', precioBase: 8000, precioMayorista: 6800, precioEspecial: 7200, stock: 12, stockMinimo: 5, unidad: 'caja', activo: true },
  { id: 'p8', nombre: 'Tornillos pack x100', sku: 'TOR-001', categoria: 'Ferreteria', precioBase: 2500, precioMayorista: 2000, precioEspecial: 2200, stock: 5, stockMinimo: 10, unidad: 'pack', activo: true },
]

const listasPrecioDemo: ListaPrecio[] = [
  {
    id: 'minorista', nombre: 'Minorista',
    items: productosDemo.map(p => ({ productoId: p.id, precio: p.precioBase }))
  },
  {
    id: 'mayorista', nombre: 'Mayorista',
    items: productosDemo.map(p => ({ productoId: p.id, precio: p.precioMayorista }))
  },
  {
    id: 'especial', nombre: 'Cliente Especial',
    items: productosDemo.map(p => ({ productoId: p.id, precio: p.precioEspecial }))
  },
]

const consultasDemo: Consulta[] = [
  { id: 'q1', clienteId: null, clienteNombre: 'Jose (nuevo)', canal: 'whatsapp', consultaOriginal: 'Pasame precio de creatina, proteina y shakers', productosConsultados: 'Creatina 300g, Proteina 1kg, Shaker 500ml', responsable: 'Vendedor', proximaAccion: 'Enviar catalogo', fechaSeguimiento: '2026-07-23', estado: 'nueva', motivoPerdida: '', fecha: '2026-07-22' },
  { id: 'q2', clienteId: 'c3', clienteNombre: 'Gimnasio Power', canal: 'whatsapp', consultaOriginal: 'Tenes stock de detergente 5L para esta semana?', productosConsultados: 'Detergente 5L', responsable: 'Vendedor', proximaAccion: 'Confirmar stock y cotizar', fechaSeguimiento: '2026-07-22', estado: 'respondida', motivoPerdida: '', fecha: '2026-07-21' },
  { id: 'q3', clienteId: 'c1', clienteNombre: 'Kiosco Los Amigos', canal: 'whatsapp', consultaOriginal: 'Me armas promo para llevar 10 cajas?', productosConsultados: 'Varios', responsable: 'Vendedor', proximaAccion: 'Armar promo y enviar', fechaSeguimiento: '2026-07-23', estado: 'cotizada', motivoPerdida: '', fecha: '2026-07-20' },
  { id: 'q4', clienteId: 'c4', clienteNombre: 'Autoservicio Don Luis', canal: 'whatsapp', consultaOriginal: 'Cuanto me queda pendiente de la ultima compra?', productosConsultados: '', responsable: 'Admin', proximaAccion: 'Revisar deuda', fechaSeguimiento: '2026-07-22', estado: 'en_seguimiento', motivoPerdida: '', fecha: '2026-07-19' },
]

const pedidosDemo: Pedido[] = [
  {
    id: 'o1', clienteId: 'c2', clienteNombre: 'Dietetica Natural', fecha: '2026-07-20', fechaEntrega: '2026-07-22', estado: 'confirmado', notas: '',
    items: [
      { productoId: 'p1', productoNombre: 'Creatina 300g', cantidad: 5, precioUnitario: 10000, descuento: 0, subtotal: 50000 },
      { productoId: 'p2', productoNombre: 'Proteina 1kg', cantidad: 3, precioUnitario: 15000, descuento: 0, subtotal: 45000 },
    ],
    subtotal: 95000, descuentoTotal: 0, total: 95000,
  },
  {
    id: 'o2', clienteId: 'c1', clienteNombre: 'Kiosco Los Amigos', fecha: '2026-07-18', fechaEntrega: '2026-07-21', estado: 'en_preparacion', notas: '',
    items: [
      { productoId: 'p4', productoNombre: 'Agua mineral pack x12', cantidad: 10, precioUnitario: 6000, descuento: 0, subtotal: 60000 },
      { productoId: 'p5', productoNombre: 'Gaseosa cola pack x6', cantidad: 8, precioUnitario: 8500, descuento: 500, subtotal: 63500 },
    ],
    subtotal: 123500, descuentoTotal: 500, total: 123000,
  },
  {
    id: 'o3', clienteId: 'c3', clienteNombre: 'Gimnasio Power', fecha: '2026-07-15', fechaEntrega: '2026-07-16', estado: 'entregado_sin_cobrar', notas: '',
    items: [
      { productoId: 'p1', productoNombre: 'Creatina 300g', cantidad: 2, precioUnitario: 10500, descuento: 0, subtotal: 21000 },
    ],
    subtotal: 21000, descuentoTotal: 0, total: 21000,
  },
  {
    id: 'o4', clienteId: 'c4', clienteNombre: 'Autoservicio Don Luis', fecha: '2026-07-17', fechaEntrega: '2026-07-19', estado: 'preparado', notas: '',
    items: [
      { productoId: 'p6', productoNombre: 'Detergente 5L', cantidad: 12, precioUnitario: 3800, descuento: 0, subtotal: 45600 },
      { productoId: 'p7', productoNombre: 'Guantes nitrilo caja x100', cantidad: 6, precioUnitario: 6800, descuento: 0, subtotal: 40800 },
    ],
    subtotal: 86400, descuentoTotal: 0, total: 86400,
  },
  {
    id: 'o5', clienteId: 'c5', clienteNombre: 'Ferreteria Central', fecha: '2026-07-14', fechaEntrega: '2026-07-14', estado: 'cancelado', notas: 'Cliente cancelo por cambio de precio',
    items: [
      { productoId: 'p8', productoNombre: 'Tornillos pack x100', cantidad: 20, precioUnitario: 2500, descuento: 0, subtotal: 50000 },
    ],
    subtotal: 50000, descuentoTotal: 0, total: 50000,
  },
  {
    id: 'o6', clienteId: 'c2', clienteNombre: 'Dietetica Natural', fecha: '2026-07-22', fechaEntrega: '', estado: 'pagado', notas: '',
    items: [
      { productoId: 'p3', productoNombre: 'Shaker 500ml', cantidad: 10, precioUnitario: 2800, descuento: 0, subtotal: 28000 },
    ],
    subtotal: 28000, descuentoTotal: 0, total: 28000,
  },
]

const pagosDemo: Pago[] = [
  { id: 'pay1', pedidoId: 'o6', monto: 28000, fecha: '2026-07-22', tipo: 'total', observacion: 'Pago contado' },
  { id: 'pay2', pedidoId: 'o3', monto: 3000, fecha: '2026-07-18', tipo: 'parcial', observacion: 'Pago parcial' },
]

const plantillasMensaje: PlantillaMensaje[] = [
  { id: 'm1', nombre: 'Confirmacion de pedido', plantilla: 'Hola {{cliente}}, te confirmamos tu pedido del {{fecha}} por ${{total}}. Lo estamos preparando. Te avisamos cuando este listo.' },
  { id: 'm2', nombre: 'Pedido listo', plantilla: 'Hola {{cliente}}, tu pedido del {{fecha}} ya esta listo. Pasalo a buscar o coordinamos entrega.' },
  { id: 'm3', nombre: 'Recordatorio de pago', plantilla: 'Hola {{cliente}}, te recordamos que tenes pendiente un saldo de ${{deuda}}. Por favor confirmanos cuando lo abonarias.' },
  { id: 'm4', nombre: 'Envio de catalogo', plantilla: 'Hola {{cliente}}, te envio nuestra lista de precios actualizada. Consultame por disponibilidad y promos!' },
  { id: 'm5', nombre: 'Seguimiento consulta', plantilla: 'Hola {{cliente}}, te escribia para saber si viste la cotizacion que te envie. Consultame cualquier cosa!' },
]

function inicializarDatos() {
  if (dataInicializada) return
  const existe = localStorage.getItem('nd_clientes')
  if (!existe) {
    localStorage.setItem('nd_clientes', JSON.stringify(clientesDemo))
    localStorage.setItem('nd_productos', JSON.stringify(productosDemo))
    localStorage.setItem('nd_listas_precio', JSON.stringify(listasPrecioDemo))
    localStorage.setItem('nd_consultas', JSON.stringify(consultasDemo))
    localStorage.setItem('nd_pedidos', JSON.stringify(pedidosDemo))
    localStorage.setItem('nd_pagos', JSON.stringify(pagosDemo))
    localStorage.setItem('nd_plantillas', JSON.stringify(plantillasMensaje))
  }
  dataInicializada = true
}

function getData<T>(key: string): T[] {
  inicializarDatos()
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : []
}

function setData<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function getClientes(): Cliente[] { return getData<Cliente>('nd_clientes') }
export function getProductos(): Producto[] { return getData<Producto>('nd_productos') }
export function getListasPrecio(): ListaPrecio[] { return getData<ListaPrecio>('nd_listas_precio') }
export function getConsultas(): Consulta[] { return getData<Consulta>('nd_consultas') }
export function getPedidos(): Pedido[] { return getData<Pedido>('nd_pedidos') }
export function getPagos(): Pago[] { return getData<Pago>('nd_pagos') }
export function getPlantillas(): PlantillaMensaje[] { return getData<PlantillaMensaje>('nd_plantillas') }

export function getCliente(id: string): Cliente | undefined {
  return getClientes().find(c => c.id === id)
}

export function getProducto(id: string): Producto | undefined {
  return getProductos().find(p => p.id === id)
}

export function getListaPrecio(id: string): ListaPrecio | undefined {
  return getListasPrecio().find(l => l.id === id)
}

export function getPedidosCliente(clienteId: string): Pedido[] {
  return getPedidos().filter(p => p.clienteId === clienteId)
}

export function getConsultasCliente(clienteId: string): Consulta[] {
  return getConsultas().filter(c => c.clienteId === clienteId)
}

export function getPagosPedido(pedidoId: string): Pago[] {
  return getPagos().filter(p => p.pedidoId === pedidoId)
}

export function getDeudaCliente(clienteId: string): number {
  const pedidos = getPedidos().filter(
    p => p.clienteId === clienteId && (p.estado === 'entregado_sin_cobrar' || p.estado === 'entregado')
  )
  const pagos = getPagos().filter(p => pedidos.some(pd => pd.id === p.pedidoId))
  const totalPedidos = pedidos.reduce((sum, p) => sum + p.total, 0)
  const totalPagos = pagos.reduce((sum, p) => sum + p.monto, 0)
  return totalPedidos - totalPagos
}

export function getEstadoPedidoColor(estado: EstadoPedido): string {
  const colores: Record<EstadoPedido, string> = {
    borrador: 'bg-gray-100 text-gray-700',
    confirmado: 'bg-blue-100 text-blue-700',
    en_preparacion: 'bg-yellow-100 text-yellow-700',
    preparado: 'bg-indigo-100 text-indigo-700',
    en_reparto: 'bg-purple-100 text-purple-700',
    entregado: 'bg-green-100 text-green-700',
    entregado_sin_cobrar: 'bg-orange-100 text-orange-700',
    pagado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }
  return colores[estado]
}

export function getEstadoConsultaColor(estado: EstadoConsulta): string {
  const colores: Record<EstadoConsulta, string> = {
    nueva: 'bg-blue-100 text-blue-700',
    respondida: 'bg-yellow-100 text-yellow-700',
    cotizada: 'bg-purple-100 text-purple-700',
    en_seguimiento: 'bg-indigo-100 text-indigo-700',
    convertida: 'bg-green-100 text-green-700',
    perdida: 'bg-red-100 text-red-700',
  }
  return colores[estado]
}

export function formatearMoneda(n: number): string {
  return '$ ' + n.toLocaleString('es-AR')
}

export function saveCliente(cliente: Cliente) {
  const clientes = getClientes()
  setData('nd_clientes', [...clientes, cliente])
}

export function updateCliente(id: string, cambios: Partial<Cliente>) {
  const clientes = getClientes()
  setData('nd_clientes', clientes.map(c => c.id === id ? { ...c, ...cambios } : c))
}

export function saveProducto(producto: Producto) {
  const productos = getProductos()
  setData('nd_productos', [...productos, producto])
}

export function saveConsulta(consulta: Consulta) {
  const consultas = getConsultas()
  setData('nd_consultas', [...consultas, consulta])
}

export function updateConsulta(id: string, cambios: Partial<Consulta>) {
  const consultas = getConsultas()
  setData('nd_consultas', consultas.map(c => c.id === id ? { ...c, ...cambios } : c))
}

export function savePedido(pedido: Pedido) {
  const pedidos = getPedidos()
  setData('nd_pedidos', [...pedidos, pedido])
}

export function updatePedido(id: string, cambios: Partial<Pedido>) {
  const pedidos = getPedidos()
  setData('nd_pedidos', pedidos.map(p => p.id === id ? { ...p, ...cambios } : p))
}

export function savePago(pago: Pago) {
  const pagos = getPagos()
  setData('nd_pagos', [...pagos, pago])
  actualizarDeudaCliente(pago.pedidoId)
}

function actualizarDeudaCliente(pedidoId: string) {
  const pedido = getPedidos().find(p => p.id === pedidoId)
  if (!pedido) return
  const deuda = getDeudaCliente(pedido.clienteId)
  updateCliente(pedido.clienteId, { deudaActual: deuda })
}

export { generarId }
