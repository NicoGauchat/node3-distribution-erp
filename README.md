# Disnode — Prototipo para El Bayo Distribuciones

Disnode es un prototipo frontend desarrollado por Node3. Su objetivo es demostrar cómo centralizar, revisar y convertir pedidos recibidos por WhatsApp en notas A4 imprimibles.

## Estado del proyecto

Este repositorio contiene una demostración y no está listo para producción. Los datos, la interpretación de mensajes, el audio de ejemplo, el stock y cualquier referencia a integraciones son simulados: no hay conexión con WhatsApp, un backend ni un sistema externo.

## Alcance actual

- Flujo mensaje → interpretación → corrección → pedido → nota A4 → preparación.
- Gestión demostrativa de pedidos, productos y clientes.
- Interpretación local y determinística del mensaje de ejemplo, con coincidencias que requieren revisión.
- Edición de productos, cantidades, precios, descuentos, alias y stock demo.
- Nota operativa A4 imprimible, distinta de una factura fiscal.
- Datos demo definidos en el frontend.
- Persistencia local en el navegador mediante `localStorage`.
- Restablecimiento de los datos demo desde el control “Reiniciar datos de demostración”.

## Fuera de alcance

- Backend y base de datos remota.
- WhatsApp API y recepción automática de mensajes.
- Transcripción o interpretación real mediante servicios externos.
- Facturación fiscal.
- Integración real con stock.
- Autenticación, permisos y seguridad productivos.

## Stack

- Next.js 16.2.11.
- React 19.2.8.
- TypeScript 5.9.3.
- Lucide React 0.468.0.
- CSS propio.

## Requisitos

- Node.js 20.9.0 o posterior, requisito declarado por la versión instalada de Next.js. Se recomienda una versión LTS compatible.
- npm; el repositorio incluye `package-lock.json` con formato lockfile 3.

## Instalación y desarrollo

Desde la raíz del repositorio:

```bash
npm ci
npm run dev
```

La aplicación de desarrollo se abre normalmente en `http://localhost:3000`.

## Scripts disponibles

| Comando | Función |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo de Next.js. |
| `npm run build` | Genera el build de producción. |
| `npm run start` | Inicia el build de producción previamente generado. |
| `npm run typecheck` | Ejecuta TypeScript sin emitir archivos. |

No hay una suite unitaria o E2E persistida en el repositorio. La verificación funcional se realiza contra la aplicación compilada con Playwright CLI.

## Estructura del repositorio

- `src/app/`: entrada de Next.js, layout global y estilos de la aplicación principal.
- `src/components/`: shell y vistas funcionales del prototipo principal.
- `src/lib/`: tipos, reglas de negocio, formatos y datos demo.
- `opencode-distribucion/`: segundo prototipo Next.js independiente, con su propio `package.json`, lockfile, README y `AGENTS.md`. No debe confundirse con la aplicación principal ni modificarse sin un alcance explícito.
- `PLAN_PROTOTIPO_ERP_DISTRIBUIDORAS_NODE3.md` e `implementation_plan.md`: material de planificación existente.

La aplicación principal es la ubicada en la raíz: su paquete se llama `node3-distribucion-prototipo` y es la versión que centraliza las vistas mediante `src/components/app-shell.tsx`.

## Datos demo

Los datos iniciales de la aplicación principal están definidos en `src/lib/demo-data.ts`. Al abrir la aplicación se guardan en `localStorage` bajo una clave propia del prototipo y los cambios permanecen sólo en ese navegador.

Para volver al estado inicial, usar el botón con la descripción accesible “Reiniciar datos de demostración” en la interfaz. No utilizar información real o sensible en los datos locales de la demo.

## Pruebas y verificación

Las comprobaciones disponibles actualmente son:

```bash
npm run typecheck
npm run build
```

`typecheck` valida los tipos y `build` verifica que Next.js pueda producir la aplicación. Para la revisión manual, ejecutar `npm run start`, abrir `http://localhost:3000` y recorrer el caso demo completo. En este entorno también se verificó el flujo con Playwright CLI en 1366 × 768, 1024 px, 390 px y 360 px, junto con consola, persistencia local y salida de impresión.

## Impresión A4

La vista previa se abre desde un pedido confirmado. Al imprimir, los estilos ocultan navegación y controles, fuerzan A4 vertical, repiten el encabezado de la tabla y evitan cortar renglones. La salida es una nota operativa, no una factura fiscal.

## Identidad visual

El logo provisto por El Bayo se conserva sin reinterpretaciones en `public/brand/el-bayo-logo.png` y se utiliza tanto en la navegación como en la nota operativa A4.

## Advertencia

No cargar información real sensible ni presentar esta demostración como un sistema productivo. Sus datos, automatizaciones e integraciones son locales o simulados.
