# Plan de prototipo: sistema operativo para distribuidoras y seguimiento de consultas

Fecha: 2026-07-22
Proyecto: Node3
Objetivo inmediato: conseguir conversaciones comerciales, pilotos pagos o compromisos reales antes de invertir en un ERP completo.

## 1. Resumen ejecutivo

Node3 no deberia intentar vender "un ERP completo" ni construir un SaaS grande desde cero como primera apuesta. La estrategia mas conveniente es vender una solucion productizada, simple y adaptable para distribuidoras y mayoristas chicos/medianos que hoy trabajan con WhatsApp, Excel y procesos manuales.

La oferta debe entrar por un dolor concreto:

> "Te ordenamos pedidos, clientes, precios y cobranzas sin sacarte WhatsApp del medio."

El prototipo debe mostrar el flujo completo desde una consulta o pedido por WhatsApp hasta el pedido registrado, preparado, entregado, cobrado o pendiente. Tiene que ser suficientemente realista para vender una implementacion inicial paga, pero no debe prometer integraciones complejas todavia.

La primera meta no es tener software perfecto. La primera meta es validar si empresas reales pagarian por:

- Setup inicial.
- Adaptacion a su flujo.
- Carga inicial de clientes/productos.
- Soporte y mantenimiento mensual.
- Mejoras posteriores si el flujo se repite en varios clientes.

## 2. Contexto tomado del documento interno

Fuente interna: Google Doc "NODE 3", pestaña 18.

Puntos centrales extraidos:

- El SaaS puro desde cero es riesgoso para Node3 hoy porque exige mucha construccion antes de validar y no genera caja rapido.
- El desarrollo a medida puede facturar, pero fragmenta el foco si se acepta cualquier proyecto.
- El mejor modelo para Node3 es hibrido: producto base adaptable + implementacion inicial paga + abono mensual.
- El nicho con mejor encaje es distribuidoras y mayoristas chicos/medianos de Rafaela, Santa Fe y region.
- El problema principal es operativo: pedidos por WhatsApp, listas de precios en Excel, seguimiento manual, stock confuso y cobranzas desordenadas.
- La version minima debe cubrir clientes, productos, listas de precios, pedidos, estados, deudas/cobranzas, dashboard y mensajes preparados para WhatsApp.
- No hace falta integrar la API de WhatsApp al comienzo. Para el prototipo y primer piloto alcanza con generar mensajes listos para copiar o abrir por link.
- La venta inicial debe hacerse por referidos, WhatsApp y reuniones cortas, no esperando trafico organico.
- Criterio de abandono: si despues de 20 a 25 conversaciones calificadas no aparece al menos 1 piloto pago, revisar nicho/oferta.
- Criterio de duplicar la apuesta: 3 clientes pagos similares, onboarding menor a 7-14 dias y 70% de funcionalidades repetidas.

## 3. Investigacion de mercado y funcionalidades reales

Los sistemas reales de distribuidoras muestran un patron claro. Las funciones que mas se repiten son:

- Pedidos de venta.
- Clientes y cuentas corrientes.
- Stock e inventario.
- Listas de precios por cliente o tipo de cliente.
- Preventa o vendedores en ruta.
- Reparto, hojas de ruta y entregas.
- Cobranzas.
- Facturacion electronica.
- Reportes comerciales.
- Historial por cliente.

Esto confirma que el dolor existe, pero tambien confirma que Node3 no debe competir de entrada como ERP completo. Debe entrar por una capa mas simple, rapida y cercana.

Referencias consultadas:

- Natural Software define el software mayorista alrededor de ventas mayoristas, stock, listas de precios, facturacion y cuentas corrientes: https://www.naturalsoftware.com.ar/software-gestion-mayoristas/
- Pracsys posiciona distribuidoras como gestion central + fuerza de ventas en ruta + repartos con tracking + cobranzas: https://pracsys.com.ar/industrias/distribuidoras
- AGIS muestra ciclo comercial completo: pedidos, stock, reparto, cobranzas, facturacion, cuentas corrientes y app de vendedores: https://www.americagis.com.ar/administrativo-contable/distribuidoras-y-mayoristas
- Flexxus resalta logistica/reparto, remitos, hojas de ruta, proveedores y ordenes de compra: https://flexxus.com.ar/software-y-sistemas-de-gestion-para-distribuidores-y-mayoristas/
- Genuino resume el eje administrativo como pedidos, stock, precios, clientes, cobranzas y facturacion desde un panel: https://www.genuinosoft.com/sistema-para-distribuidoras-administracion
- BCNSOFT muestra precios de mercado para software de distribuidoras desde ARS 84.900 + IVA/mes, con configuracion inicial y soporte: https://bcnsoft.com.ar/software-para-distribuidoras/
- Zoho Inventory valida como funciones comunes stock multi-almacen, ordenes, envios, reportes, alertas y roles: https://www.zoho.com/us/inventory/
- Odoo CRM valida el enfoque de oportunidades, pipeline, actividades, historial y proxima accion: https://www.odoo.com/app/crm-features
- SAP Business One confirma que un ERP SMB normalmente integra finanzas, compras, inventario, ventas, CRM y reportes: https://www.sap.com/products/erp/business-one.html
- WhatsApp Business reporta que la mensajeria ya es canal central de comercio y soporte, con preferencia alta por comunicarse con negocios via mensajes: https://whatsappbusiness.com/resources/resource-library/state-of-business-messaging/
- CACE muestra que el canal online y la logistica siguen siendo relevantes en Argentina, con crecimiento de compradores online y preferencia por entrega a domicilio: https://cace.org.ar/pages/estadisticas
- Leadsales valida el patron de CRM visual para WhatsApp con columnas, seguimiento, respuestas rapidas y automatizaciones: https://leadsales.io/

## 4. Posicionamiento recomendado

Nombre de trabajo:

- Node3 Distribucion
- Alternativa mas directa para vender: "Panel de pedidos y cobranzas para distribuidoras"

No vender como:

- ERP completo.
- SaaS generico.
- Sistema a medida abierto.
- Bot de WhatsApp con IA.
- Pagina web para distribuidoras.

Vender como:

- Orden operativo para distribuidoras que venden por WhatsApp.
- Menos pedidos perdidos.
- Precios actualizados en un solo lugar.
- Cobranzas visibles.
- Seguimiento de consultas y pedidos sin depender del chat suelto.
- Implementacion cercana y rapida por un equipo local.

Promesa comercial:

> En una semana te dejamos un panel simple para registrar clientes, productos, pedidos y deudas, con mensajes listos para WhatsApp, para que tu equipo deje de depender de chats sueltos y planillas.

## 5. Cliente ideal inicial

Tipo de empresa:

- Distribuidora o mayorista chico/mediano.
- 2 a 20 personas en operacion comercial/administrativa.
- Vende por WhatsApp, telefono o vendedores.
- Usa Excel, cuaderno o sistema viejo para precios, stock y cuentas.
- Tiene clientes recurrentes.
- Da credito o deja saldos pendientes.
- Le duelen las consultas repetidas, los pedidos mal cargados o las cobranzas olvidadas.

Rubros prioritarios:

- Bebidas.
- Alimentos.
- Limpieza.
- Suplementos/dieteticas al por mayor.
- Ferreteria/repuestos.
- Insumos para comercios.
- Descartables.
- Distribucion regional con reparto propio.

Senales de buen prospecto:

- Publica catalogo o precios por WhatsApp/Instagram.
- Tiene muchos clientes recurrentes.
- Atiende consultas de stock y precio todo el dia.
- Vende con listas diferentes por tipo de cliente.
- Permite comprar fiado o con cuenta corriente.
- Hace reparto o prepara pedidos.
- El dueño no tiene visibilidad diaria de pedidos pendientes y deuda.

## 6. Problemas que debe cubrir el prototipo

Problemas principales:

1. Los pedidos quedan mezclados en WhatsApp.
2. Los precios estan en Excel o en la cabeza de una persona.
3. Se pasan precios viejos o incorrectos.
4. No se ve facil que pedidos estan pendientes, preparados o entregados.
5. No se sabe rapido quien debe plata.
6. Se pierden seguimientos de consultas que "casi compran".
7. El dueño no tiene tablero simple de ventas, pendientes y deuda.
8. El vendedor pierde tiempo escribiendo los mismos mensajes.

Problemas que NO debe prometer resolver en la demo inicial:

- Contabilidad completa.
- Facturacion electronica real AFIP/ARCA.
- Integracion real con WhatsApp API.
- Ruteo automatico avanzado.
- WMS completo con picking por ubicacion.
- Integracion con bancos o billeteras.
- Multi-sucursal compleja.
- Offline real.
- App nativa.
- IA generativa automatica respondiendo clientes.

## 7. Alcance del prototipo

El prototipo debe ser una aplicacion web funcional con datos demo. Debe poder mostrarse en notebook durante una reunion y tambien en celular. La prioridad es demostrar el flujo y el valor, no dejar lista la arquitectura final.

Stack sugerido para prototipo:

- Frontend: Next.js + React + TypeScript.
- UI: Tailwind CSS + shadcn/ui o componentes propios simples.
- Iconos: lucide-react.
- Datos: mock data en memoria o localStorage.
- Deploy demo: Vercel.
- Export demo: CSV simple para clientes/productos/pedidos.

Stack sugerido para piloto pago:

- Next.js + TypeScript.
- PostgreSQL gestionado en Supabase o Neon.
- Auth simple por email/password.
- Prisma o Drizzle.
- Hosting en Vercel.
- Backups programados.
- Auditoria basica de acciones.

## 8. Modulos del prototipo

### 8.1 Dashboard operativo

Objetivo: que el dueño entienda el negocio en 20 segundos.

Debe mostrar:

- Ventas de hoy.
- Pedidos pendientes.
- Pedidos preparados.
- Pedidos entregados sin cobrar.
- Total por cobrar.
- Clientes con deuda.
- Consultas abiertas.
- Productos con bajo stock.

Acciones rapidas:

- Nuevo pedido.
- Nueva consulta.
- Nuevo cliente.
- Nuevo producto.
- Ver deudas.
- Ver pedidos pendientes.

### 8.2 Clientes

Campos:

- Nombre comercial.
- Contacto.
- Telefono/WhatsApp.
- Direccion.
- Localidad/zona.
- Tipo de cliente.
- Lista de precios asignada.
- Limite de credito.
- Deuda actual.
- Estado: activo, pausado, moroso.
- Notas internas.

Vista del cliente:

- Ultimos pedidos.
- Saldo pendiente.
- Consultas abiertas.
- Mensajes rapidos.
- Historial de actividad.

### 8.3 Productos y listas de precios

Campos de producto:

- Nombre.
- SKU/codigo interno.
- Categoria.
- Precio base.
- Precio mayorista.
- Precio especial.
- Stock disponible.
- Stock minimo.
- Unidad de medida.
- Imagen opcional.
- Estado activo/inactivo.

Funciones:

- Buscar producto rapido.
- Filtrar por categoria.
- Detectar bajo stock.
- Simular actualizacion masiva desde Excel/CSV.
- Asignar lista de precios por cliente.

### 8.4 Consultas y oportunidades

Este modulo cubre el "sistema de seguimiento de consultas" mencionado por el usuario y lo integra con la distribuidora.

Estados sugeridos:

- Nueva.
- Respondida.
- Cotizada.
- En seguimiento.
- Convertida a pedido.
- Perdida.

Campos:

- Cliente o prospecto.
- Canal: WhatsApp, Instagram, telefono, web, referido.
- Consulta original.
- Productos consultados.
- Responsable.
- Proxima accion.
- Fecha de seguimiento.
- Motivo de perdida.

Valor:

- Evita que una consulta quede enterrada en WhatsApp.
- Permite recordar a quien volver a escribir.
- Convierte consultas en pedidos.
- Sirve para empresas que todavia no necesitan ERP, pero si seguimiento comercial.

### 8.5 Pedidos

Flujo:

1. Seleccionar cliente.
2. Ver lista de precios correspondiente.
3. Agregar productos y cantidades.
4. Calcular subtotal, descuentos y total.
5. Definir estado.
6. Generar mensaje de confirmacion para WhatsApp.

Estados:

- Borrador.
- Confirmado.
- En preparacion.
- Preparado.
- En reparto.
- Entregado.
- Entregado sin cobrar.
- Pagado.
- Cancelado.

Vista de pedidos:

- Tabla filtrable.
- Kanban por estado.
- Busqueda por cliente.
- Total por estado.
- Alertas de pedidos vencidos o sin cobrar.

### 8.6 Cobranzas y cuenta corriente

Debe mostrar:

- Clientes con deuda.
- Monto pendiente.
- Fecha del pedido.
- Vencimiento.
- Dias vencidos.
- Responsable.
- Estado del cobro.

Funciones:

- Registrar pago total o parcial.
- Marcar promesa de pago.
- Generar recordatorio para WhatsApp.
- Filtrar morosos.
- Ver deuda por zona o vendedor.

Mensaje ejemplo:

> Hola, te recordamos que tenes pendiente un saldo de $45.000 correspondiente al pedido del 08/07. Podrias confirmarnos cuando lo abonarias?

### 8.7 Mensajes rapidos para WhatsApp

No integrar API en el prototipo. Usar generacion de texto + link `wa.me`.

Plantillas:

- Confirmacion de pedido.
- Estado de pedido.
- Recordatorio de pago.
- Envio de catalogo/lista.
- Seguimiento de consulta.
- Aviso de bajo stock o producto alternativo.

Funciones:

- Copiar mensaje.
- Abrir WhatsApp con mensaje prearmado.
- Guardar ultima fecha de contacto.

### 8.8 Reportes simples

Reportes del prototipo:

- Ventas por dia.
- Ventas por cliente.
- Ventas por categoria.
- Productos mas vendidos.
- Deuda total.
- Deuda vencida.
- Consultas convertidas a pedidos.
- Pedidos pendientes por estado.

No hacer BI avanzado. Solo graficos simples y datos accionables.

## 9. Flujo demo principal

Demo de 10 a 15 minutos:

1. Mostrar dashboard: ventas, pedidos pendientes y deuda.
2. Entrar a consultas: aparece un cliente que pregunto por productos por WhatsApp.
3. Convertir consulta en pedido.
4. Agregar productos usando lista de precios del cliente.
5. Confirmar pedido y generar mensaje de WhatsApp.
6. Cambiar estado a preparado y luego entregado sin cobrar.
7. Ver que aparece en cobranzas.
8. Generar recordatorio de pago.
9. Mostrar ficha del cliente con historial.
10. Cerrar con dashboard actualizado.

Frase de cierre:

> Esto no reemplaza todo tu sistema actual de un dia para el otro. Ordena el flujo que hoy mas tiempo y plata te hace perder: consultas, pedidos, precios y cobranzas.

## 10. Datos demo recomendados

Clientes demo:

- Kiosco Los Amigos, Rafaela centro, deuda ARS 45.000.
- Dietetica Natural, Sunchales, deuda ARS 0.
- Gimnasio Power, Rafaela norte, deuda ARS 18.000.
- Autoservicio Don Luis, Lehmann, deuda ARS 120.000.
- Ferreteria Central, Rafaela, deuda ARS 0.

Productos demo:

- Creatina 300g.
- Proteina 1kg.
- Shaker.
- Agua mineral pack x12.
- Gaseosa cola pack x6.
- Detergente 5L.
- Guantes nitrilo caja x100.
- Tornillos pack x100.

Listas de precios:

- Minorista.
- Mayorista.
- Cliente especial.

Pedidos demo:

- Pedido confirmado de Dietetica Natural.
- Pedido pendiente de Kiosco Los Amigos.
- Pedido entregado sin cobrar de Gimnasio Power.
- Pedido preparado para Autoservicio Don Luis.
- Pedido cancelado con motivo.

Consultas demo:

- "Pasame precio de creatina, proteina y shakers."
- "Tenes stock de detergente 5L para esta semana?"
- "Me armas promo para llevar 10 cajas?"
- "Cuanto me queda pendiente de la ultima compra?"

## 11. Roadmap por fases

### Fase 0: preparacion comercial y prototipo clickable

Duracion: 2 a 4 dias.

Entregables:

- Landing simple de Node3 Distribucion.
- Demo web con datos ficticios.
- Guion de demo.
- Lista de 30 prospectos.
- Mensaje de contacto por WhatsApp.
- Formulario de relevamiento.

Exito:

- 10 conversaciones calificadas.
- 5 demos agendadas.
- Feedback claro sobre precio/dolor.

### Fase 1: piloto pago acotado

Duracion: 7 a 14 dias por cliente.

Alcance:

- Auth basica.
- Clientes reales.
- Productos reales.
- Listas de precios.
- Pedidos.
- Cobranzas.
- Mensajes de WhatsApp manuales.
- Dashboard.
- Importacion inicial desde Excel.

No incluir salvo pago adicional:

- Facturacion electronica.
- WhatsApp API.
- App mobile nativa.
- Integracion con sistema contable.
- Multi-deposito avanzado.
- ver si seguimiento de consultas y oportunidades

Exito:

- El cliente carga pedidos reales.
- El dueño usa el dashboard.
- El equipo registra deudas/cobros.
- Aparecen mejoras repetibles.

### Fase 2: producto base repetible

Duracion: 4 a 8 semanas despues de validar 2-3 pilotos.

Alcance:

- Multiempresa.
- Roles.
- Backups.
- Auditoria.
- Exportaciones.
- Mejoras de UX.
- Reportes.
- Onboarding asistido.
- Paquetes comerciales.

### Fase 3: ERP vertical progresivo

Solo despues de ventas reales.

Modulos candidatos:

- Facturacion electronica ARCA.
- Integracion con sistemas contables.
- Reparto y hoja de ruta.
- App para preventistas.
- App para repartidores.
- Stock multi-deposito.
- Compras/proveedores.
- Alertas de reposicion.
- Integracion WhatsApp Business API.
- Portal B2B para clientes.

## 12. Pricing inicial sugerido

Estos valores deben revisarse al momento de vender por inflacion y complejidad, pero sirven como marco inicial.

Oferta de validacion:

- Diagnostico + demo adaptada: gratis 
- Piloto pago: ARS 500.000 a 800.000.
- Implementacion estandar: ARS 800.000 a 1.800.000.
- Mensualidad piloto: ARS 90.000 a 150.000.
- Mensualidad cliente estable: ARS 120.000 a 300.000.

Regla:

- No hacer pilotos gratis salvo que el cliente sea estrategico y entregue acceso fuerte a otros prospectos.
- Cobrar setup porque la carga inicial, adaptacion y capacitacion son trabajo real.
- La mensualidad debe cubrir hosting, soporte, backups y mejoras menores.

## 13. Plan comercial inmediato

### Lista de prospectos

Armar 30 prospectos locales/regionales:

- 10 por red personal.
- 10 por directorios/camaras/locales conocidos.
- 10 por busqueda en Google Maps, Instagram y WhatsApp visible.

Datos a cargar:

- Empresa.
- Rubro.
- Contacto.
- WhatsApp.
- Ciudad.
- Senal de dolor observada.
- Referido posible.
- Estado.
- Fecha de contacto.
- Proxima accion.

### Mensaje inicial

Hola, [Nombre]. Soy [Nombre] de Node3, un equipo de software de Rafaela. Estamos ayudando a distribuidoras y mayoristas que hoy toman pedidos por WhatsApp y terminan mezclando precios, pedidos y cobranzas entre chats y Excel. Armamos una demo simple para ordenar ese flujo sin meter un ERP pesado. Si te sirve, te la muestro en 15 minutos y vemos si tiene sentido para ustedes. -> a revisar

### Preguntas de descubrimiento

1. Como toman pedidos hoy?
2. Cuantos pedidos reciben por dia o semana?
3. Donde tienen la lista de precios?
4. Manejan listas diferentes por cliente?
5. Como controlan stock antes de confirmar?
6. Como saben que pedidos estan pendientes o preparados?
7. Dan cuenta corriente o credito?
8. Como reclaman cobranzas?
9. Cuanto tiempo pierden por dia en mensajes repetidos?
10. Que sistema usan hoy, si usan alguno? -> deberia ser primera
11. Que parte les genera mas errores o discusiones?
12. Si eso se ordenara en una semana, cuanto valdria para ustedes?

### Criterios de calificacion

Prospecto bueno:

- Reconoce el problema.
- Tiene pedidos recurrentes.
- Tiene dinero pendiente de cobrar.
- Usa WhatsApp intensamente.
- Acepta demo.
- Puede decidir o te conecta con quien decide.

Prospecto malo:

- Solo quiere una pagina web barata.
- No tiene clientes recurrentes.
- No tiene volumen de pedidos.
- Quiere ERP completo sin pagar.
- Pide integraciones complejas antes de validar.

## 14. Riesgos y mitigaciones

Riesgo: competir contra ERP grandes.
Mitigacion: no vender como reemplazo total. Vender como capa operativa rapida.

Riesgo: cada cliente pide cosas distintas.
Mitigacion: aceptar solo cambios que se alineen con pedidos, clientes, precios, cobranzas o seguimiento.

Riesgo: WhatsApp API complica tiempos y costos.
Mitigacion: arrancar con mensajes prearmados y link a WhatsApp.

Riesgo: el cliente no carga datos.
Mitigacion: incluir onboarding obligatorio y carga inicial asistida desde Excel.

Riesgo: quieren facturacion electronica desde el dia uno.
Mitigacion: tratarla como modulo fase 3 o integracion paga, no como nucleo del prototipo.

Riesgo: el equipo de Node3 construye demasiado.
Mitigacion: prototipo de venta primero; piloto pago despues; producto completo solo con 3 clientes similares.

## 15. Criterios de decision

Abandonar o pivotear si:

- 20 a 25 conversaciones calificadas no generan ningun piloto pago.
- Los prospectos no reconocen el dolor.
- Todos piden ERP contable/fiscal completo como condicion.
- El precio aceptado no cubre implementacion y soporte.

Duplicar apuesta si:

- Hay 3 clientes pagos del mismo tipo.
- El onboarding se puede completar en 7 a 14 dias.
- 70% de las funciones se repiten.
- El dashboard y cobranzas se usan semanalmente.
- El cliente recomienda a otro negocio similar.

## 16. Backlog priorizado del prototipo

P0 obligatorio:

- Layout responsive.
- Dashboard.
- Clientes.
- Productos.
- Listas de precios.
- Consultas.
- Pedidos.
- Estados de pedido.
- Cobranzas.
- Mensajes de WhatsApp prearmados.
- Datos demo realistas.

P1 deseable:

- Kanban de pedidos.
- Kanban de consultas.
- Busqueda global.
- Importacion CSV simulada.
- Exportacion CSV.
- Filtros por zona, cliente, estado y vendedor.
- Vista de ficha de cliente con historial.

P2 despues de validar:

- Auth.
- Base de datos real.
- Multiempresa.
- Roles.
- Auditoria.
- Facturacion electronica.
- Reparto/rutas.
- Integracion WhatsApp API.
- Portal cliente.

## 17. Pantallas necesarias

1. Dashboard.
2. Clientes.
3. Detalle de cliente.
4. Productos/listas de precios.
5. Consultas.
6. Nuevo pedido.
7. Pedidos por estado.
8. Cobranzas.
9. Mensajes rapidos.
10. Configuracion demo.

## 18. Primer prototipo: definicion exacta

Version: demo comercial funcional.

Debe permitir:

- Crear/ cargar una consulta.
- Convertir consulta en pedido.
- Crear pedido desde cero.
- Seleccionar cliente y aplicar lista de precios.
- Agregar productos y calcular total.
- Cambiar estado del pedido.
- Marcar como entregado sin cobrar.
- Registrar pago.
- Ver deuda actualizada.
- Generar mensaje de WhatsApp.
- Ver metricas actualizadas en dashboard.

Puede simular:

- Stock.
- Importacion Excel.
- Usuarios.
- Notificaciones.
- Configuracion.

No debe incluir:

- Backend real obligatorio.
- Login real obligatorio.
- Pasarela de pago.
- WhatsApp API.
- Facturacion electronica.
- App mobile nativa.

## 19. Prompt de continuidad para otra IA o entorno

Usar este prompt si se necesita continuar en otro chat:

```text
Estoy trabajando en Node3, un equipo de software de Rafaela, Argentina, que necesita validar y facturar rapido. La estrategia definida es NO construir un SaaS grande ni vender ERP completo desde cero. Vamos a crear primero un prototipo comercial para distribuidoras y mayoristas chicos/medianos que venden por WhatsApp y hoy manejan pedidos, precios, stock y cobranzas con Excel/chats.

Objetivo: desarrollar una demo web funcional para mostrar a empresas y conseguir pilotos pagos. La oferta es: "Te ordenamos pedidos, clientes, precios y cobranzas sin sacarte WhatsApp del medio".

Contexto clave:
- Modelo recomendado: producto base adaptable + implementacion inicial paga + abono mensual.
- Cliente ideal: distribuidora/mayorista regional con clientes recurrentes, WhatsApp intensivo, listas de precios, pedidos manuales y cobranzas pendientes.
- MVP: clientes, productos, listas de precios, consultas, pedidos, estados de pedido, cobranzas/cuenta corriente, dashboard y mensajes preparados para WhatsApp.
- No integrar WhatsApp API todavia. Usar copiar mensaje o link wa.me.
- No incluir facturacion electronica, contabilidad completa, rutas avanzadas ni multi-deposito real en prototipo.
- La demo debe mostrar el flujo: consulta por WhatsApp -> convertir en pedido -> preparar -> entregar sin cobrar -> generar deuda -> enviar recordatorio -> registrar pago -> dashboard actualizado.
- Stack sugerido para prototipo: Next.js + React + TypeScript + Tailwind + lucide-react, datos mock/localStorage, deploy en Vercel.
- Datos demo: clientes como Kiosco Los Amigos, Dietetica Natural, Gimnasio Power; productos como creatina, proteina, bebidas, limpieza; estados de pedidos y deudas.
- Validacion comercial: armar 30 prospectos, conseguir 10 conversaciones, 5 demos, buscar 1 piloto pago. Duplicar si hay 3 clientes pagos similares y 70% de funcionalidades repetidas.

Necesito que continues con el desarrollo del prototipo, respetando este alcance. Primero proponeme estructura de pantallas/componentes y luego implementa la demo funcional.
```

## 20. Proximo paso recomendado

Si este plan esta aprobado, el siguiente paso es construir el prototipo comercial. No empezar por backend ni login. Empezar por la experiencia visible:

1. Crear app Next.js.
2. Cargar datos demo.
3. Construir dashboard.
4. Construir flujo consulta -> pedido -> cobranza.
5. Agregar mensajes WhatsApp.
6. Pulir demo responsive.
7. Preparar guion de venta.

