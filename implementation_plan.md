# Plan de Mejora — Node3 Distribución

> Basado en análisis del prototipo actual, investigación de competidores (Flexxus, Odoo, Cin7, inFlow, Natural Software) y dolor real de distribuidoras PyME argentinas.

---

## Diagnóstico del prototipo actual

### ✅ Lo que funciona bien
- Flujo completo Consulta → Pedido → Entrega → Cobranza
- WhatsApp como canal central (links wa.me)
- CRUD de clientes y productos
- Kanban visual de pedidos
- Pago parcial/total en cobranzas
- UI premium con design system coherente

### ⚠️ Gaps críticos detectados

| Área | Gap principal | Impacto |
|------|--------------|---------|
| Pedidos | No valida stock ni límite de crédito | Pedidos imposibles de cumplir |
| Productos | Sin costo de reposición ni márgenes | No sabés si ganás o perdés plata |
| Cobranzas | Sin historial de pagos ni método de pago | Sin trazabilidad financiera |
| Clientes | Sin CUIT, condición fiscal, ni cuenta corriente | No podés facturar |
| Inventario | Stock no se descuenta al vender | Números falsos |
| Reportes | No existen | Cero visibilidad de rentabilidad |
| Usuarios | Sin login ni roles | Imposible dar acceso a empleados |
| Facturación | No existe | No cumple regulaciones AFIP |
| Logística | Sin hojas de ruta | Reparto desorganizado |

---

## Estructura del plan

El plan se divide en **4 fases**, de menor a mayor complejidad. Cada fase agrega valor real y es vendible por sí misma.

```
Fase 0 (ahora)     → Prototipo vendible — cerrar la demo
Fase 1 (2-3 meses) → MVP comercial — primeros clientes pagando  
Fase 2 (4-6 meses) → V1 completa — producto competitivo
Fase 3 (6-12 meses)→ V2 escala — diferenciación y crecimiento
```

---

## Fase 0 — Prototipo vendible
**Objetivo:** Que la demo no tenga huecos evidentes que frenen la venta.
**Esfuerzo:** ~1-2 semanas

### 0.1 Validaciones básicas en pedidos
- ⚡ Alertar si stock insuficiente al agregar producto
- ⚡ Alertar si cliente supera límite de crédito
- ⚡ Alertar si cliente está marcado como moroso
- **Por qué:** Un distribuidor en la demo va a intentar romperlo. Si puede crear un pedido por 500 unidades cuando hay 8 en stock, pierde credibilidad.

### 0.2 Descuento de stock al confirmar pedido
- Al pasar un pedido a "confirmado", descontar unidades del inventario
- Al cancelar, devolver stock
- **Por qué:** Si el stock no se mueve, el catálogo parece estático y falso.

### 0.3 Búsqueda y filtros en tablas
- Búsqueda por nombre en clientes, productos y pedidos
- Filtro por estado en pedidos y cobranzas
- Filtro por categoría en productos
- **Por qué:** Con 6 datos demo se ve bien, con 200 clientes reales es inutilizable sin filtros.

### 0.4 Confirmación de eliminación
- Modal de confirmación antes de borrar cliente o producto
- Validar que no tenga pedidos activos antes de permitir borrar
- **Por qué:** Borrar un cliente con pedidos rompe la app.

### 0.5 Fecha dinámica (quitar hardcoded)
- Reemplazar `"2026-07-22"` hardcodeado por `new Date()` real
- **Por qué:** Si alguien prueba la demo mañana, los días vencidos muestran datos incorrectos.

### 0.6 Limpiar keywords de consultas
- Actualizar el regex de product hints para que use los productos reales del catálogo kiosquero (no "detergente", "creatina", etc.)
- **Por qué:** Si alguien prueba pegar un mensaje de WhatsApp, los hints no van a detectar nada.

---

## Fase 1 — MVP comercial
**Objetivo:** Producto funcional para los primeros 5-10 clientes pagando.
**Esfuerzo:** ~2-3 meses de desarrollo

### 1.1 Backend y autenticación
| Tarea | Detalle |
|-------|---------|
| Base de datos | PostgreSQL o Supabase (hosted) |
| API | Next.js API routes o tRPC |
| Auth | Login con email/password (NextAuth o Supabase Auth) |
| Roles | Admin, Vendedor, Repartidor (3 roles iniciales) |
| Multi-tenant | Cada distribuidora tiene sus datos aislados |

> **Por qué:** Sin backend no hay multi-usuario. El vendedor y el dueño no pueden usar la app al mismo tiempo. Sin login, no podés cobrar por el servicio.

### 1.2 Cuenta corriente del cliente
- Historial cronológico: facturas emitidas, pagos recibidos, notas de crédito
- Saldo actualizado en tiempo real
- Exportar resumen de cuenta en PDF
- **Por qué:** "¿Cuánto me debe Kiosco Los Amigos?" es la pregunta #1 de todo distribuidor. Hoy no tiene respuesta trazable.

### 1.3 Registro de pagos mejorado
| Campo | Opciones |
|-------|----------|
| Método de pago | Efectivo, Transferencia, Cheque, Mercado Pago |
| Referencia | Nro transferencia, nro cheque, CBU |
| Fecha del pago | Editable (no siempre es hoy) |
| Comprobante | Upload foto/PDF (opcional) |
- Historial de pagos por pedido y por cliente
- **Por qué:** "¿Cuándo pagó?" y "¿Cómo pagó?" son preguntas diarias. Sin método de pago registrado no hay control de caja.

### 1.4 Datos fiscales del cliente
- CUIT/CUIL
- Condición fiscal (Responsable Inscripto, Monotributo, Exento, Consumidor Final)
- Dirección fiscal
- **Por qué:** Sin estos datos no podés emitir factura. Y si vas a integrar AFIP después, los necesitás desde el día 1.

### 1.5 Costo de producto y margen
- Agregar campo `costPrice` (costo de reposición) a cada producto
- Calcular margen bruto por producto, por pedido y por cliente
- Alerta visual cuando un precio de venta está por debajo del costo
- **Por qué:** En Argentina con inflación del 50-100% anual, si no controlás márgenes estás perdiendo plata sin saberlo. Esta es la feature que más valor agrega.

### 1.6 Movimientos de stock
- Registrar cada movimiento: venta, ingreso de compra, ajuste manual, rotura, devolución
- Log auditable con fecha, motivo, usuario y cantidad
- **Por qué:** "¿Por qué hay 8 packs de Coca y el sistema dice 48?" Si no hay log, no hay control.

### 1.7 Hoja de ruta / Despacho
- Agrupar pedidos preparados por zona de entrega
- Lista de despacho: cliente, dirección, pedido, monto a cobrar
- Marcar "entregado" desde la lista
- Imprimir o compartir por WhatsApp al chofer
- **Por qué:** Hoy el reparto se organiza en papel o de memoria. Una lista digital con el monto a cobrar reduce errores y faltantes.

### 1.8 Reportes básicos
| Reporte | Datos clave |
|---------|-------------|
| Ventas del período | Total vendido por día/semana/mes, comparación |
| Ranking de productos | Top 10 más vendidos, top 10 por margen |
| Deuda por antigüedad | 0-30, 31-60, 61-90, 90+ días |
| Ranking de clientes | Por volumen de compra y por deuda |
| Stock crítico | Productos bajo mínimo |

- **Por qué:** "¿Cómo me fue este mes?" es imposible de responder hoy. Los reportes convierten datos en decisiones.

---

## Fase 2 — V1 completa
**Objetivo:** Producto competitivo con el mercado. Poder competir contra Flexxus, Natural Software, etc.
**Esfuerzo:** ~3-4 meses adicionales

### 2.1 Facturación electrónica AFIP
- Integración con WSFE de AFIP (Factura A, B, C)
- Generación de CAE
- PDF de factura con diseño profesional
- Remito electrónico (COT para ARBA si aplica)
- **Complejidad:** Alta. Requiere certificados digitales, manejo de errores AFIP, y lógica fiscal.
- **Modelo de negocio:** Cobrar como módulo adicional (+$20 USD/mes).

### 2.2 App móvil para repartidores (PWA)
- Vista simplificada de hoja de ruta
- Marcar entrega con firma digital y foto
- Registrar cobranza en el punto (efectivo, transferencia, cheque)
- Funcionar offline y sincronizar cuando hay señal
- **Por qué:** El repartidor es el eslabón más débil de la cadena. Hoy anota en papelitos y al volver al depósito reconstruyen lo que pasó.

### 2.3 Listas de precios dinámicas
- Crear listas de precios personalizadas (no solo 3 fijas)
- Reglas de markup sobre costo (ej: "Mayorista = costo + 25%")
- Actualización masiva de precios por porcentaje
- Precios especiales por cliente
- **Por qué:** Con inflación, actualizar 200 productos × 3 listas manualmente es un trabajo de 4 horas que se hace cada semana.

### 2.4 Compras y proveedores
- Directorio de proveedores (nombre, CUIT, contacto, productos que provee)
- Orden de compra al proveedor
- Ingreso de mercadería contra orden de compra
- Cuentas por pagar (lo que le debés al proveedor)
- **Por qué:** La mitad del negocio es comprar bien. Sin control de compras, no hay control de costos.

### 2.5 Gestión de lotes y vencimientos
- Asignar lote y fecha de vencimiento al ingresar mercadería
- FEFO automático (First Expired, First Out) al armar pedidos
- Alertas de productos próximos a vencer (90, 60, 30 días)
- Promociones automáticas para liquidar stock por vencer
- **Por qué:** Una distribuidora de alimentos que no controla vencimientos pierde mercadería y puede tener problemas legales/sanitarios.

### 2.6 Caja y tesorería
- Apertura y cierre de caja diario
- Registro de gastos operativos
- Cartera de cheques (propios y de terceros) con fechas de vencimiento
- Conciliación bancaria básica
- **Por qué:** "¿Cuánta plata hay en la caja?" y "¿Cuántos cheques tengo por cobrar?" son preguntas diarias que hoy se resuelven con Excel o de memoria.

---

## Fase 3 — V2 escala
**Objetivo:** Diferenciación competitiva. Features que no tiene la competencia local.
**Esfuerzo:** 6-12 meses, desarrollo continuo

### 3.1 WhatsApp Business API
- Recibir mensajes automáticamente en la app
- Crear consultas/pedidos desde mensajes entrantes
- Enviar confirmaciones, remitos y recordatorios automáticos
- Bot básico: "¿Cuánto debo?" → responde con saldo
- **Modelo:** Módulo premium (+$15-25 USD/mes)

### 3.2 Portal B2B para clientes
- El kiosquero entra a un link, ve SU lista de precios, SU saldo, y puede hacer pedidos
- Catálogo con fotos, stock en tiempo real
- Historial de pedidos y cuenta corriente
- **Por qué:** Reduce 80% de las consultas por WhatsApp. El cliente se auto-gestiona.
- **Modelo:** Módulo premium (+$35 USD/mes)

### 3.3 Optimización de rutas
- Integración con Google Maps Distance Matrix API
- Ordenar paradas de entrega por ruta óptima
- Estimar tiempo total de reparto
- **Por qué:** Un distribuidor con 30 paradas puede ahorrar 1-2 horas/día con rutas optimizadas.

### 3.4 Reportes avanzados y BI
- Dashboard con gráficos interactivos (Chart.js o Recharts)
- Análisis ABC de productos (80/20)
- Comparación mes a mes con tendencias
- Proyección de cobranza futura (flujo de fondos)
- Rotación de inventario por producto
- Margen bruto por cliente/zona/vendedor
- **Por qué:** Pasar de "¿cómo me fue?" a "¿qué voy a hacer?" es el salto de gestión que justifica un software premium.

### 3.5 App de preventa para vendedores
- Catálogo offline con precios del cliente
- Ver deuda y crédito disponible antes de visitar
- Tomar pedidos en la calle sin conexión
- Sincronizar al volver al WiFi
- **Por qué:** El preventista es el motor de ventas de una distribuidora. Si puede tomar pedidos más rápido, vende más.

### 3.6 Multi-depósito
- Stock por depósito (central + camión como depósito móvil)
- Transferencias entre depósitos
- Vista consolidada y vista por ubicación
- **Por qué:** Muchas distribuidoras tienen depósito central + 2-3 camiones que salen cargados. Necesitan saber qué hay en cada lugar.

---

## Modelo de precios sugerido

Basado en benchmarking de competidores argentinos y capacidad de pago de PyMEs:

| Plan | Precio | Incluye |
|------|--------|---------|
| **Starter** | $50 USD/mes | Panel web, pedidos, clientes, productos, cobranzas, WhatsApp links, 2 usuarios |
| **Pro** | $90 USD/mes | Todo Starter + reportes, cuenta corriente, stock con movimientos, hoja de ruta, 5 usuarios |
| **Business** | $150 USD/mes | Todo Pro + facturación AFIP, caja y tesorería, app repartidores, usuarios ilimitados |
| **Add-ons** | Variable | WhatsApp API (+$20), Portal B2B (+$35), App preventa (+$15/vendedor) |

> **Insight clave:** El precio de entrada debe ser bajo ($50) para no competir contra Excel. El upgrade a Pro se justifica con "¿sabés cuánto margen tenés?" y "¿podés ver la deuda en tiempo real?".

---

## Priorización por impacto de negocio

```
         ALTO IMPACTO
              │
   ┌──────────┼──────────┐
   │  QUICK   │  CORE    │
   │  WINS    │  VALUE   │
   │          │          │
   │ • Filtros│ • Backend│
   │ • Valid. │ • Cta cte│
   │ • Stock  │ • Pagos  │
   │   desc.  │ • Costos │
   │ • Fecha  │ • Stock  │
   │   real   │   mov.   │
   │          │ • Reportes│
   │          │ • Hoja   │
   │          │   ruta   │
BAJO ─────────┼──────────── ALTO
ESFUERZO      │          ESFUERZO
   │          │          │
   │  NICE    │ PREMIUM  │
   │  TO HAVE │ MODULES  │
   │          │          │
   │ • Lotes  │ • AFIP   │
   │ • UI     │ • App    │
   │   polish │   móvil  │
   │          │ • WA API │
   │          │ • B2B    │
   │          │ • Rutas  │
   └──────────┼──────────┘
              │
         BAJO IMPACTO
```

---

## Recomendación de ejecución

> [!IMPORTANT]
> **Fase 0 primero.** Las validaciones, filtros y fecha dinámica son cambios de 1-2 semanas que hacen la diferencia entre una demo que convence y una que genera dudas. Implementar ANTES de las próximas reuniones comerciales.

> [!TIP]
> **Fase 1 es el MVP real.** Backend + cuenta corriente + costos + reportes básicos es lo mínimo para que un distribuidor pague mensualmente. Sin backend, no hay producto comercial — solo una demo.

> [!NOTE]
> **Fases 2-3 se financian con facturación.** No tiene sentido construir facturación AFIP o app móvil antes de tener 10 clientes pagando. Esas features se construyen con revenue, no con inversión especulativa.
