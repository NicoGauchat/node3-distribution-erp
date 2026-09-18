"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowLeft, Boxes, Check, CheckCircle2, ChevronRight, CircleHelp,
  ClipboardCheck, Clock3, FileText, Filter, Home, Link2, LoaderCircle, MessageCircle,
  Minus, Package, Pencil, Plus, Printer, RefreshCcw, Save, Search, Settings2,
  ShoppingCart, Trash2, Upload, Users, Volume2, X,
  type LucideIcon,
} from "lucide-react";
import type { DemoState, MatchStatus, Order, OrderDraft, OrderLine, OrderStatus, Product, RequestSource, ViewKey } from "@/lib/types";
import { createInitialDemoState, exampleMessage, initialDemoState } from "@/lib/demo-data";
import { formatCurrency, formatDateTime, formatTime, normalizeText } from "@/lib/format";
import { deductDemoStock, findCustomer, findProduct, hasStockWarning, lineTotal, matchLabels, nextOrderNumber, orderStatusLabels, orderTotal, sourceLabels } from "@/lib/business";
import { interpretMessage } from "@/lib/interpret";
import { OrderNote } from "@/components/order-note";

const STORAGE_KEY = "disnode-el-bayo-demo-v1";
const blankDraft: OrderDraft = { customerId: "", source: "text", originalText: "", requestId: null, lines: [], notes: "" };

const navItems: Array<{ key: ViewKey; label: string; icon: LucideIcon }> = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "pedidos", label: "Pedidos", icon: ShoppingCart },
  { key: "productos", label: "Productos", icon: Boxes },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "configuracion", label: "Configuración demo", icon: Settings2 },
];

const statusOrder: OrderStatus[] = ["nuevo", "para_revisar", "confirmado", "impreso", "en_preparacion", "preparado"];
const filterStatuses: Array<"todos" | OrderStatus> = ["todos", "nuevo", "para_revisar", "confirmado", "impreso", "en_preparacion", "preparado"];

function statusClass(status: OrderStatus | MatchStatus) {
  if (["recognized", "preparado"].includes(status)) return "success";
  if (["possible", "review", "para_revisar"].includes(status)) return "warning";
  if (["not_found", "cancelado"].includes(status)) return "danger";
  if (["confirmado", "impreso", "en_preparacion"].includes(status)) return "info";
  return "neutral";
}

function loadStoredState(): DemoState {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return createInitialDemoState();
  return JSON.parse(saved) as DemoState;
}

export function ErpApp() {
  const [state, setState] = useState<DemoState>(initialDemoState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [view, setView] = useState<ViewKey>("inicio");
  const [workspace, setWorkspace] = useState<"new" | "edit" | "preview" | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OrderDraft>(blankDraft);
  const [interpreting, setInterpreting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const resetCancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try { setState(loadStoredState()); } catch { setState(createInitialDemoState()); setStorageError(true); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [state, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (resetOpen) resetCancelRef.current?.focus();
  }, [resetOpen]);

  if (!ready) {
    return <div className="app-loading"><LoaderCircle className="spin" size={24}/><span>Preparando la demostración…</span></div>;
  }

  const selectedOrder = state.orders.find((order) => order.id === selectedOrderId) ?? null;
  const showToast = (message: string) => setToast(message);

  const navigate = (next: ViewKey) => { setView(next); setWorkspace(null); setSelectedOrderId(null); };
  const startNewOrder = (pasteExample = false) => {
    setDraft({ ...blankDraft, customerId: state.customers[0]?.id ?? "", originalText: pasteExample ? exampleMessage : "" });
    setWorkspace("new"); setSelectedOrderId(null); setView("pedidos");
  };
  const openRequest = (requestId: string) => {
    const request = state.requests.find((item) => item.id === requestId);
    if (!request) return;
    setDraft({ customerId: request.customerId, source: request.source, originalText: request.originalText, requestId: request.id, lines: [], notes: request.detectedNotes.join(" ") });
    setWorkspace("new"); setView("pedidos");
  };
  const openOrder = (id: string, target: "edit" | "preview" = "edit") => { setSelectedOrderId(id); setWorkspace(target); setView("pedidos"); };

  const updateOrder = (id: string, updater: (order: Order) => Order) => {
    setState((current) => ({ ...current, orders: current.orders.map((order) => order.id === id ? updater(order) : order) }));
  };

  const handleInterpret = () => {
    if (!draft.customerId) { showToast("Elegí un cliente para continuar."); return; }
    if (!draft.originalText.trim()) { showToast("Pegá o escribí el mensaje del pedido."); return; }
    setInterpreting(true);
    window.setTimeout(() => {
      const lines = interpretMessage(draft.originalText, state.products).map((line) => {
        const normalized = normalizeText(line.originalText);
        if (normalized.includes("oreo") || normalized.includes("audio")) return { ...line, matchStatus: "review" as const, matchConfidenceDemo: 0.55 };
        if (normalized.includes("chips de chocolate")) return { ...line, matchStatus: "possible" as const, matchConfidenceDemo: 0.7 };
        return line;
      });
      setDraft((current) => ({ ...current, lines }));
      if (draft.requestId) setState((current) => ({ ...current, requests: current.requests.map((request) => request.id === draft.requestId ? { ...request, status: "interpretado" } : request) }));
      setInterpreting(false);
      showToast(lines.length ? "Revisá los productos antes de confirmar." : "No encontramos productos. Agregalos manualmente.");
    }, 650);
  };

  const setDraftLine = (id: string, changes: Partial<OrderLine>) => setDraft((current) => ({ ...current, lines: current.lines.map((line) => line.id === id ? { ...line, ...changes } : line) }));
  const chooseDraftProduct = (lineId: string, productId: string) => {
    const product = state.products.find((item) => item.id === productId);
    setDraftLine(lineId, { productId: productId || null, unitPrice: product?.price ?? 0, unit: product?.saleUnit ?? "unidad", matchStatus: product ? "recognized" : "not_found", matchConfidenceDemo: product ? 1 : 0 });
  };
  const addDraftLine = () => setDraft((current) => ({ ...current, lines: [...current.lines, { id: `draft-${Date.now()}`, productId: null, originalText: "Producto agregado manualmente", packages: 1, quantity: 1, unit: "unidad", unitPrice: 0, discount: 0, matchStatus: "not_found", matchConfidenceDemo: 0 }] }));

  const confirmDraft = () => {
    if (!draft.customerId) { showToast("Elegí un cliente para confirmar."); return; }
    if (!draft.lines.length) { showToast("El pedido necesita al menos un producto."); return; }
    if (draft.lines.some((line) => !line.productId)) { showToast("Elegí un producto del catálogo en cada renglón."); return; }
    const now = new Date().toISOString();
    const order: Order = { id: `order-${Date.now()}`, number: nextOrderNumber(state.orders), customerId: draft.customerId, sourceRequestId: draft.requestId, source: draft.source, status: "confirmado", createdAt: now, updatedAt: now, lines: draft.lines, notes: draft.notes, preparationNotes: "", discount: 0, shipping: 0, printedAt: null };
    setState((current) => ({ ...current, orders: [order, ...current.orders], requests: current.requests.map((request) => request.id === draft.requestId ? { ...request, status: "convertido" } : request) }));
    setSelectedOrderId(order.id); setWorkspace("edit"); showToast(`Pedido ${order.number} confirmado.`);
  };

  const changeOrderStatus = (order: Order, status: OrderStatus) => {
    if (status === order.status) return;
    setState((current) => ({
      ...current,
      products: status === "en_preparacion" && order.status !== "en_preparacion" ? deductDemoStock(current.products, order.lines) : current.products,
      orders: current.orders.map((item) => item.id === order.id ? { ...item, status, updatedAt: new Date().toISOString(), printedAt: status === "impreso" ? new Date().toISOString() : item.printedAt } : item),
    }));
    showToast(`Pedido marcado como ${orderStatusLabels[status].toLowerCase()}.`);
  };

  const handlePrint = (order: Order) => {
    changeOrderStatus(order, "impreso");
    window.setTimeout(() => window.print(), 50);
  };

  const resetDemo = () => {
    const fresh = createInitialDemoState();
    setState(fresh); setDraft(blankDraft); setWorkspace(null); setSelectedOrderId(null); setView("inicio"); setResetOpen(false);
    showToast("La demostración volvió a su estado inicial.");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar print-hidden">
        <div className="client-brand"><Image className="client-mark" src="/brand/el-bayo-logo.png" alt="Logo de El Bayo Distribuciones" width={150} height={150} priority/><div><strong>El Bayo Distribuciones</strong><small>Gestionado con Disnode</small></div></div>
        <nav aria-label="Secciones principales">
          {navItems.map(({ key, label, icon: Icon }) => <button key={key} className={`nav-button ${view === key && !workspace ? "active" : ""}`} onClick={() => navigate(key)}><Icon aria-hidden="true" size={19}/><span>{label}</span>{key === "pedidos" && state.requests.some((request) => request.status === "nuevo") ? <span className="nav-badge">1</span> : null}</button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="demo-pill"><span /> Datos de demostración</div>
        <p className="sidebar-footer">Prototipo desarrollado por Node3</p>
      </aside>

      <main className="main-area">
        <header className="topbar print-hidden">
          <div className="topbar-title"><span>DISNODE</span><strong>{workspace === "new" ? "Nuevo pedido" : workspace === "preview" ? "Vista previa A4" : workspace === "edit" ? `Pedido ${selectedOrder?.number ?? ""}` : navItems.find((item) => item.key === view)?.label}</strong></div>
          <div className="topbar-actions"><span className="demo-label">DEMO</span><button className="button secondary compact" onClick={() => setResetOpen(true)}><RefreshCcw size={16} aria-hidden="true"/> Restablecer</button></div>
        </header>

        {storageError ? <div className="storage-error" role="alert"><AlertTriangle size={18}/> No pudimos guardar los cambios en este navegador. Liberá espacio o habilitá el almacenamiento local y volvé a intentar.</div> : null}

        <div className={`page ${workspace === "preview" ? "preview-page" : ""}`}>
          {workspace === "new" ? <NewOrderView state={state} draft={draft} setDraft={setDraft} interpreting={interpreting} onInterpret={handleInterpret} onChooseProduct={chooseDraftProduct} onLineChange={setDraftLine} onAddLine={addDraftLine} onRemoveLine={(id) => setDraft((current) => ({ ...current, lines: current.lines.filter((line) => line.id !== id) }))} onBack={() => { setWorkspace(null); setView("pedidos"); }} onConfirm={confirmDraft} onToast={showToast}/> : null}
          {workspace === "edit" && selectedOrder ? <OrderEditor state={state} order={selectedOrder} onBack={() => { setWorkspace(null); setView("pedidos"); }} onUpdate={(updater) => updateOrder(selectedOrder.id, updater)} onPreview={() => setWorkspace("preview")} onStatus={(status) => changeOrderStatus(selectedOrder, status)} onToast={showToast}/> : null}
          {workspace === "preview" && selectedOrder ? <OrderPreview state={state} order={selectedOrder} onBack={() => setWorkspace("edit")} onPrint={() => handlePrint(selectedOrder)} onStatus={(status) => changeOrderStatus(selectedOrder, status)}/> : null}
          {!workspace && view === "inicio" ? <HomeView state={state} onNew={() => startNewOrder(false)} onPaste={() => startNewOrder(true)} onRequest={openRequest} onOrder={openOrder}/> : null}
          {!workspace && view === "pedidos" ? <OrdersView state={state} onNew={() => startNewOrder(false)} onOpen={openOrder} onRequest={openRequest}/> : null}
          {!workspace && view === "productos" ? <ProductsView state={state} setState={setState} onToast={showToast}/> : null}
          {!workspace && view === "clientes" ? <CustomersView state={state}/> : null}
          {!workspace && view === "configuracion" ? <SettingsView state={state} setState={setState} onToast={showToast}/> : null}
        </div>
      </main>

      <nav className="mobile-nav print-hidden" aria-label="Navegación móvil">{navItems.map(({ key, label, icon: Icon }) => <button key={key} className={view === key && !workspace ? "active" : ""} onClick={() => navigate(key)}><Icon size={20}/><span>{key === "configuracion" ? "Config." : label}</span></button>)}</nav>
      {toast ? <div className="toast" role="status"><CheckCircle2 size={18}/>{toast}</div> : null}
      {resetOpen ? <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setResetOpen(false); }}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title"><button className="icon-button dialog-close" aria-label="Cerrar" onClick={() => setResetOpen(false)}><X size={19}/></button><AlertTriangle className="dialog-icon" size={26}/><h2 id="reset-title">¿Restablecer la demostración?</h2><p>Se perderán los pedidos y ajustes guardados en este navegador. Esta acción no afecta ningún sistema real.</p><div className="dialog-actions"><button ref={resetCancelRef} className="button secondary" onClick={() => setResetOpen(false)}>Volver</button><button className="button danger" onClick={resetDemo}>Restablecer demostración</button></div></div></div> : null}
    </div>
  );
}

function PageIntro({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return <div className="page-intro"><div>{eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}<h1>{title}</h1><p>{description}</p></div>{actions ? <div className="page-actions">{actions}</div> : null}</div>;
}

function StatusBadge({ status, label }: { status: OrderStatus | MatchStatus; label?: string }) { return <span className={`status-badge ${statusClass(status)}`}><span aria-hidden="true"/>{label ?? (status in orderStatusLabels ? orderStatusLabels[status as OrderStatus] : matchLabels[status as MatchStatus])}</span>; }

function HomeView({ state, onNew, onPaste, onRequest, onOrder }: { state: DemoState; onNew: () => void; onPaste: () => void; onRequest: (id: string) => void; onOrder: (id: string) => void }) {
  const newCount = state.requests.filter((request) => request.status === "nuevo").length;
  const reviewCount = state.requests.filter((request) => request.status === "interpretado").length + state.orders.filter((order) => order.status === "para_revisar").length;
  const readyCount = state.orders.filter((order) => ["confirmado", "impreso"].includes(order.status)).length;
  const mainRequest = state.requests.find((request) => request.id === "request-main");
  return <>
    <PageIntro eyebrow="Hoy en El Bayo" title="Buen día" description="Estos son los pedidos que necesitan atención." actions={<><button className="button secondary" onClick={onPaste}><MessageCircle size={18}/> Pegar mensaje de WhatsApp</button><button className="button primary" onClick={onNew}><Plus size={18}/> Cargar pedido</button></>}/>
    <section className="attention-grid" aria-label="Resumen de pedidos"><button onClick={() => mainRequest && onRequest(mainRequest.id)}><span className="attention-icon new"><MessageCircle size={20}/></span><span><strong>{newCount}</strong><small>Pedidos nuevos</small></span><ChevronRight size={18}/></button><button><span className="attention-icon review"><CircleHelp size={20}/></span><span><strong>{reviewCount}</strong><small>Para revisar</small></span><ChevronRight size={18}/></button><button><span className="attention-icon ready"><ClipboardCheck size={20}/></span><span><strong>{readyCount}</strong><small>Listos para preparar</small></span><ChevronRight size={18}/></button></section>
    <section className="panel"><div className="panel-heading"><div><h2>Pedidos recientes</h2><p>Mensajes y pedidos ordenados por última actividad.</p></div></div><div className="recent-list">
      {mainRequest ? <article className="recent-row featured"><div className="source-icon"><MessageCircle size={20}/></div><div className="recent-main"><div className="row-title"><strong>{findCustomer(state, mainRequest.customerId)?.businessName}</strong><StatusBadge status={mainRequest.status === "nuevo" ? "nuevo" : "para_revisar"}/></div><p>Cuartirolo, sandwicheras, mayonesa y otros productos</p><small>Mensaje de WhatsApp · {formatTime(mainRequest.createdAt)}</small></div><button className="button primary" onClick={() => onRequest(mainRequest.id)}>Revisar pedido <ChevronRight size={17}/></button></article> : null}
      {state.orders.slice(0, 3).map((order) => <article className="recent-row" key={order.id}><div className="source-icon"><FileText size={20}/></div><div className="recent-main"><div className="row-title"><strong>{findCustomer(state, order.customerId)?.businessName}</strong><StatusBadge status={order.status}/></div><p>{order.lines.map((line) => findProduct(state, line.productId)?.name).filter(Boolean).slice(0, 3).join(", ")}</p><small>{sourceLabels[order.source]} · Actualizado {formatTime(order.updatedAt)}</small></div><button className="button secondary" onClick={() => onOrder(order.id)}>Abrir <ChevronRight size={17}/></button></article>)}
    </div></section>
  </>;
}

function NewOrderView({ state, draft, setDraft, interpreting, onInterpret, onChooseProduct, onLineChange, onAddLine, onRemoveLine, onBack, onConfirm, onToast }: { state: DemoState; draft: OrderDraft; setDraft: React.Dispatch<React.SetStateAction<OrderDraft>>; interpreting: boolean; onInterpret: () => void; onChooseProduct: (lineId: string, productId: string) => void; onLineChange: (id: string, changes: Partial<OrderLine>) => void; onAddLine: () => void; onRemoveLine: (id: string) => void; onBack: () => void; onConfirm: () => void; onToast: (message: string) => void }) {
  const total = draft.lines.reduce((sum, line) => sum + lineTotal(line), 0);
  return <><button className="back-link" onClick={onBack}><ArrowLeft size={17}/> Volver a pedidos</button><PageIntro eyebrow="Ingreso de pedido" title="Revisá el mensaje recibido" description="La interpretación es una ayuda de esta demostración. Podés corregir todos los datos antes de confirmar."/>
    <div className="intake-grid">
      <section className="panel message-panel"><div className="panel-heading"><div><h2>Mensaje original</h2><p>Elegí el origen y pegá el contenido tal como llegó.</p></div><span className="demo-label">SIMULACIÓN</span></div>
        <fieldset className="source-choice"><legend>Origen del pedido</legend>{(["text", "transcribed_audio", "manual"] as RequestSource[]).map((source) => <label key={source}><input type="radio" name="source" checked={draft.source === source} onChange={() => setDraft((current) => ({ ...current, source }))}/><span>{sourceLabels[source]}</span></label>)}</fieldset>
        {draft.source === "transcribed_audio" ? <div className="audio-demo"><Volume2 size={20}/><div><strong>Audio transcripto para esta demostración</strong><small>00:24 · Reproducción no disponible</small></div><button disabled aria-label="Reproducir audio simulado">▶</button></div> : null}
        <label className="field"><span>Cliente</span><select value={draft.customerId} onChange={(event) => setDraft((current) => ({ ...current, customerId: event.target.value }))}><option value="">Elegí un cliente</option>{state.customers.filter((customer) => customer.active).map((customer) => <option key={customer.id} value={customer.id}>{customer.businessName}</option>)}</select></label>
        <label className="field"><span>{draft.source === "manual" ? "Detalle del pedido" : "Texto recibido"}</span><textarea rows={12} value={draft.originalText} onChange={(event) => setDraft((current) => ({ ...current, originalText: event.target.value }))} placeholder="Pegá acá el mensaje de WhatsApp"/></label>
        <div className="inline-actions"><button className="text-button" onClick={() => setDraft((current) => ({ ...current, originalText: exampleMessage }))}>Usar mensaje de ejemplo</button><button className="button primary" onClick={onInterpret} disabled={interpreting}>{interpreting ? <><LoaderCircle className="spin" size={18}/> Interpretando…</> : <><Search size={18}/> Interpretar pedido</>}</button></div>
      </section>
      <section className="panel result-panel"><div className="panel-heading"><div><h2>Productos detectados</h2><p>{draft.lines.length ? "Confirmá cada coincidencia y corregí lo que haga falta." : "Después de interpretar, vas a ver acá los renglones editables."}</p></div>{draft.lines.length ? <span className="line-count">{draft.lines.length} renglones</span> : null}</div>
        {!draft.lines.length ? <div className="empty-state"><span><Package size={30}/></span><h3>Listo para interpretar</h3><p>Vamos a buscar productos, cantidades y presentaciones sin modificar el mensaje original.</p></div> : <div className="detected-lines">{draft.lines.map((line) => { const product = findProduct(state, line.productId); return <article key={line.id} className={`detected-line ${statusClass(line.matchStatus)}`}><div className="detected-head"><div><small>“{line.originalText}”</small><StatusBadge status={line.matchStatus}/></div><button className="icon-button danger-ghost" aria-label="Quitar renglón" onClick={() => onRemoveLine(line.id)}><Trash2 size={17}/></button></div><label className="field compact"><span>Producto reconocido</span><select value={line.productId ?? ""} onChange={(event) => onChooseProduct(line.id, event.target.value)}><option value="">Elegí un producto del catálogo</option>{state.products.filter((item) => item.active).map((item) => <option value={item.id} key={item.id}>{item.name} · {item.brand}</option>)}</select></label><div className="line-controls"><label className="field compact"><span>Cantidad</span><div className="stepper"><button aria-label="Restar cantidad" onClick={() => onLineChange(line.id, { quantity: Math.max(1, line.quantity - 1), packages: Math.max(1, line.packages - 1) })}><Minus size={16}/></button><input aria-label="Cantidad" type="number" min="1" value={line.quantity} onChange={(event) => onLineChange(line.id, { quantity: Math.max(1, Number(event.target.value)), packages: Math.max(1, Number(event.target.value)) })}/><button aria-label="Sumar cantidad" onClick={() => onLineChange(line.id, { quantity: line.quantity + 1, packages: line.packages + 1 })}><Plus size={16}/></button></div></label><label className="field compact"><span>Unidad</span><select value={line.unit} onChange={(event) => onLineChange(line.id, { unit: event.target.value as OrderLine["unit"] })}>{["unidad", "paquete", "caja", "bulto", "kilo"].map((unit) => <option key={unit}>{unit}</option>)}</select></label><div className="line-price"><span>Precio</span><strong>{formatCurrency(product?.price ?? line.unitPrice)}</strong></div></div></article>; })}<button className="button dashed" onClick={onAddLine}><Plus size={17}/> Agregar producto faltante</button></div>}
      </section>
    </div>
    {draft.lines.length ? <section className="confirmation-bar"><div><span>Cliente</span><strong>{state.customers.find((customer) => customer.id === draft.customerId)?.businessName ?? "Sin seleccionar"}</strong></div><div><span>Renglones</span><strong>{draft.lines.length}</strong></div><div><span>Unidades / bultos</span><strong>{draft.lines.reduce((sum, line) => sum + line.quantity, 0)}</strong></div><div><span>Total</span><strong>{formatCurrency(total)}</strong></div><div className="confirmation-actions"><button className="button secondary" onClick={() => onToast("El borrador quedó guardado en esta sesión.")}><Save size={17}/> Guardar borrador</button><button className="button primary" onClick={onConfirm}><Check size={18}/> Confirmar pedido</button></div>{draft.notes ? <p><strong>Observación detectada:</strong> {draft.notes}</p> : null}</section> : null}
  </>;
}

function OrdersView({ state, onNew, onOpen, onRequest }: { state: DemoState; onNew: () => void; onOpen: (id: string) => void; onRequest: (id: string) => void }) {
  const [filter, setFilter] = useState<"todos" | OrderStatus>("todos");
  const [search, setSearch] = useState("");
  const rows = useMemo(() => state.orders.filter((order) => filter === "todos" || order.status === filter).filter((order) => { const customer = findCustomer(state, order.customerId); const haystack = normalizeText(`${order.number} ${customer?.businessName ?? ""} ${order.lines.map((line) => findProduct(state, line.productId)?.name).join(" ")}`); return haystack.includes(normalizeText(search)); }), [state, filter, search]);
  const pendingRequests = state.requests.filter((request) => request.status !== "convertido");
  return <><PageIntro title="Pedidos" description="Revisá mensajes recibidos y seguí cada pedido hasta su preparación." actions={<button className="button primary" onClick={onNew}><Plus size={18}/> Cargar pedido</button>}/>
    {pendingRequests.length ? <section className="inbox-callout"><MessageCircle size={22}/><div><strong>{pendingRequests.length} {pendingRequests.length === 1 ? "mensaje espera" : "mensajes esperan"} revisión</strong><p>Abrilo para interpretar productos y cantidades.</p></div><button className="button secondary" onClick={() => onRequest(pendingRequests[0].id)}>Revisar ahora</button></section> : null}
    <section className="panel"><div className="order-tools"><div className="tabs" role="tablist" aria-label="Filtrar pedidos">{filterStatuses.map((status) => <button role="tab" aria-selected={filter === status} className={filter === status ? "active" : ""} key={status} onClick={() => setFilter(status)}>{status === "todos" ? "Todos" : orderStatusLabels[status]}</button>)}</div><label className="search-field"><Search size={18}/><span className="sr-only">Buscar pedidos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cliente, número o producto"/></label></div>
      {!rows.length ? <div className="empty-state"><span><Filter size={28}/></span><h3>Sin resultados</h3><p>Probá con otra búsqueda o elegí “Todos”.</p></div> : <div className="order-list">{rows.map((order) => { const customer = findCustomer(state, order.customerId); return <button className="order-row" key={order.id} onClick={() => onOpen(order.id)}><div><span className="order-number">#{order.number}</span><strong>{customer?.businessName}</strong><small>{formatDateTime(order.createdAt)} · {sourceLabels[order.source]}</small></div><div><span>{order.lines.length} renglones</span><strong>{formatCurrency(orderTotal(order))}</strong></div><div><StatusBadge status={order.status}/><small>Act. {formatTime(order.updatedAt)}</small></div><ChevronRight size={19}/></button>; })}</div>}
    </section></>;
}

function OrderEditor({ state, order, onBack, onUpdate, onPreview, onStatus, onToast }: { state: DemoState; order: Order; onBack: () => void; onUpdate: (updater: (order: Order) => Order) => void; onPreview: () => void; onStatus: (status: OrderStatus) => void; onToast: (message: string) => void }) {
  const customer = findCustomer(state, order.customerId);
  const updateLine = (id: string, changes: Partial<OrderLine>) => onUpdate((current) => ({ ...current, lines: current.lines.map((line) => line.id === id ? { ...line, ...changes } : line), updatedAt: new Date().toISOString() }));
  const nextStatus = statusOrder[statusOrder.indexOf(order.status) + 1];
  return <><button className="back-link" onClick={onBack}><ArrowLeft size={17}/> Volver a pedidos</button><PageIntro eyebrow={`Pedido #${order.number}`} title={customer?.businessName ?? "Pedido"} description={`${formatDateTime(order.createdAt)} · ${sourceLabels[order.source]}`} actions={<><StatusBadge status={order.status}/><button className="button primary" onClick={onPreview}><FileText size={18}/> Generar nota A4</button></>}/>
    <div className="editor-layout"><section className="panel"><div className="panel-heading"><div><h2>Productos</h2><p>Corregí cantidades, unidades, precios o descuentos.</p></div></div><div className="editor-table-wrap"><table className="editor-table"><thead><tr><th>Producto</th><th>Bultos</th><th>Cantidad</th><th>Unidad</th><th>Precio</th><th>Desc.</th><th>Total</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{order.lines.map((line) => { const product = findProduct(state, line.productId); const stockWarning = hasStockWarning(state, line); return <tr key={line.id}><td><strong>{product?.name ?? "Sin producto"}</strong><small>{product?.code} · {product?.presentation}</small>{stockWarning ? <span className="stock-warning"><AlertTriangle size={14}/> Supera el stock demo ({product?.demoStock})</span> : null}</td><td><input aria-label={`Bultos de ${product?.name}`} className="number-input" type="number" min="1" value={line.packages} onChange={(event) => updateLine(line.id, { packages: Number(event.target.value) })}/></td><td><input aria-label={`Cantidad de ${product?.name}`} className="number-input" type="number" min="1" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) })}/></td><td><select aria-label={`Unidad de ${product?.name}`} value={line.unit} onChange={(event) => updateLine(line.id, { unit: event.target.value as OrderLine["unit"] })}>{["unidad", "paquete", "caja", "bulto", "kilo"].map((unit) => <option key={unit}>{unit}</option>)}</select></td><td><input aria-label={`Precio de ${product?.name}`} className="money-input" type="number" min="0" value={line.unitPrice} onChange={(event) => updateLine(line.id, { unitPrice: Number(event.target.value) })}/></td><td><input aria-label={`Descuento de ${product?.name}`} className="number-input" type="number" min="0" max="100" value={line.discount} onChange={(event) => updateLine(line.id, { discount: Number(event.target.value) })}/></td><td className="numeric"><strong>{formatCurrency(lineTotal(line))}</strong></td><td><button className="icon-button danger-ghost" aria-label={`Quitar ${product?.name}`} onClick={() => onUpdate((current) => ({ ...current, lines: current.lines.filter((item) => item.id !== line.id) }))}><Trash2 size={17}/></button></td></tr>; })}</tbody></table></div><button className="button dashed" onClick={() => onUpdate((current) => ({ ...current, lines: [...current.lines, { id: `line-${Date.now()}`, productId: state.products[0]?.id ?? null, originalText: "Agregado manualmente", packages: 1, quantity: 1, unit: state.products[0]?.saleUnit ?? "unidad", unitPrice: state.products[0]?.price ?? 0, discount: 0, matchStatus: "recognized", matchConfidenceDemo: 1 }] }))}><Plus size={17}/> Agregar producto</button></section>
      <aside className="editor-side"><section className="panel"><h2>Datos del cliente</h2><dl className="detail-list"><div><dt>Contacto</dt><dd>{customer?.contactName}</dd></div><div><dt>Dirección</dt><dd>{customer?.address}, {customer?.city}</dd></div><div><dt>Condición</dt><dd>{customer?.saleCondition}</dd></div></dl></section><section className="panel"><label className="field"><span>Observaciones del cliente</span><textarea rows={3} value={order.notes} onChange={(event) => onUpdate((current) => ({ ...current, notes: event.target.value }))}/></label><label className="field"><span>Nota interna para preparación</span><textarea rows={3} value={order.preparationNotes} onChange={(event) => onUpdate((current) => ({ ...current, preparationNotes: event.target.value }))}/></label><div className="form-pair"><label className="field"><span>Descuento general</span><input type="number" min="0" value={order.discount} onChange={(event) => onUpdate((current) => ({ ...current, discount: Number(event.target.value) }))}/></label><label className="field"><span>Flete</span><input type="number" min="0" value={order.shipping} onChange={(event) => onUpdate((current) => ({ ...current, shipping: Number(event.target.value) }))}/></label></div></section><section className="order-total-card"><span>Total del pedido</span><strong>{formatCurrency(orderTotal(order))}</strong><small>{order.lines.length} renglones · {order.lines.reduce((sum, line) => sum + line.packages, 0)} bultos</small></section>{order.lines.some((line) => hasStockWarning(state, line)) ? <button className="button warning full" onClick={() => onToast("El stock mostrado es local y simulado. Podés continuar con el pedido.")}><AlertTriangle size={17}/> Revisar stock</button> : null}<button className="button secondary full" onClick={() => onToast("El pedido quedó guardado.")}><Save size={17}/> Guardar cambios</button>{nextStatus ? <button className="button primary full" onClick={() => onStatus(nextStatus)}><Check size={17}/> Marcar como {orderStatusLabels[nextStatus].toLowerCase()}</button> : null}</aside>
    </div></>;
}

function OrderPreview({ state, order, onBack, onPrint, onStatus }: { state: DemoState; order: Order; onBack: () => void; onPrint: () => void; onStatus: (status: OrderStatus) => void }) {
  const customer = findCustomer(state, order.customerId);
  if (!customer) return null;
  return <><div className="preview-toolbar print-hidden"><button className="button secondary" onClick={onBack}><ArrowLeft size={17}/> Volver a editar</button><div><span className="demo-label">VISTA PREVIA</span><small>La hoja se imprime en tamaño A4</small></div><div><button className="button secondary" onClick={() => onStatus("confirmado")}><Check size={17}/> Marcar confirmado</button><button className="button primary" onClick={onPrint}><Printer size={18}/> Imprimir</button>{order.status === "impreso" || order.status === "confirmado" ? <button className="button secondary" onClick={() => onStatus("en_preparacion")}><Package size={17}/> En preparación</button> : null}</div></div><OrderNote order={order} customer={customer} products={state.products}/></>;
}

function ProductsView({ state, setState, onToast }: { state: DemoState; setState: React.Dispatch<React.SetStateAction<DemoState>>; onToast: (message: string) => void }) {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("Todas"); const [showAdd, setShowAdd] = useState(false); const [editingId, setEditingId] = useState<string | null>(null);
  const categories = ["Todas", ...new Set(state.products.map((product) => product.category))];
  const products = state.products.filter((product) => category === "Todas" || product.category === category).filter((product) => normalizeText(`${product.name} ${product.brand} ${product.code} ${product.aliases.join(" ")}`).includes(normalizeText(search)));
  const adjustStock = (id: string, amount: number) => setState((current) => ({ ...current, products: current.products.map((product) => product.id === id ? { ...product, demoStock: Math.max(0, product.demoStock + amount) } : product) }));
  const updateProduct = (id: string, changes: Partial<Product>) => setState((current) => ({ ...current, products: current.products.map((product) => product.id === id ? { ...product, ...changes } : product) }));
  return <><PageIntro title="Productos" description="Catálogo local usado para interpretar los mensajes de esta demostración." actions={<button className="button primary" onClick={() => setShowAdd((value) => !value)}><Plus size={18}/> Agregar producto</button>}/>{showAdd ? <section className="panel quick-add"><strong>Alta rápida de producto demo</strong><p>Se crea un producto con datos iniciales para que completes la ficha.</p><button className="button secondary" onClick={() => { const product: Product = { id: `product-${Date.now()}`, code: `DEMO-${state.products.length + 1}`, name: "Producto nuevo", brand: "Demo", presentation: "unidad", category: "Otros", saleUnit: "unidad", price: 0, demoStock: 0, minimumStock: 0, aliases: [], active: true, demoDescription: true }; setState((current) => ({ ...current, products: [...current.products, product] })); setEditingId(product.id); setSearch(""); setCategory("Todas"); setShowAdd(false); onToast("Producto demo agregado. Completá sus datos en la ficha abierta."); }}>Crear producto demo</button></section> : null}
    <section className="panel"><div className="catalog-tools"><label className="search-field"><Search size={18}/><span className="sr-only">Buscar productos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, código o alias"/></label><label className="select-label"><span>Categoría</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="product-grid">{products.map((product) => <article className="product-card" key={product.id}><div className="product-top"><div><span className="product-code">{product.code}</span><h3>{product.name}</h3><p>{product.brand} · {product.presentation}</p></div><button className="icon-button" aria-label={`Editar ${product.name}`} aria-expanded={editingId === product.id} onClick={() => setEditingId((current) => current === product.id ? null : product.id)}><Pencil size={17}/></button></div>{editingId === product.id ? <div className="product-editor"><label className="field compact"><span>Código</span><input value={product.code} onChange={(event) => updateProduct(product.id, { code: event.target.value })}/></label><label className="field compact"><span>Nombre</span><input value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value })}/></label><label className="field compact"><span>Marca</span><input value={product.brand} onChange={(event) => updateProduct(product.id, { brand: event.target.value })}/></label><label className="field compact"><span>Presentación</span><input value={product.presentation} onChange={(event) => updateProduct(product.id, { presentation: event.target.value })}/></label><label className="field compact"><span>Precio</span><input type="number" min="0" value={product.price} onChange={(event) => updateProduct(product.id, { price: Math.max(0, Number(event.target.value)) })}/></label><label className="field compact"><span>Unidad de venta</span><select value={product.saleUnit} onChange={(event) => updateProduct(product.id, { saleUnit: event.target.value as Product["saleUnit"] })}>{["unidad", "paquete", "caja", "bulto", "kilo"].map((unit) => <option key={unit}>{unit}</option>)}</select></label><label className="field compact product-editor-wide"><span>Alias separados por coma</span><input value={product.aliases.join(", ")} onChange={(event) => updateProduct(product.id, { aliases: event.target.value.split(",").map((alias) => alias.trim()).filter(Boolean) })}/></label><button className="button secondary compact product-editor-wide" onClick={() => { setEditingId(null); onToast("Cambios del producto guardados en esta demo."); }}><Check size={16}/> Guardar cambios</button></div> : null}<div className="product-data"><div><span>Precio</span><strong>{formatCurrency(product.price)}</strong></div><div><span>Stock demo</span><strong className={product.demoStock <= product.minimumStock ? "low-stock" : ""}>{product.demoStock} {product.saleUnit}</strong></div></div><div className="stock-controls"><button aria-label={`Restar stock de ${product.name}`} onClick={() => adjustStock(product.id, -1)}><Minus size={16}/></button><span>Ajustar stock demo</span><button aria-label={`Sumar stock de ${product.name}`} onClick={() => adjustStock(product.id, 1)}><Plus size={16}/></button></div><div className="aliases"><span>Alias</span><p>{product.aliases.length ? product.aliases.join(" · ") : "Sin alias"}</p></div>{product.demoDescription ? <small className="demo-data-note">Descripción basada en datos demo; requiere confirmación.</small> : null}<label className="switch-row"><span>{product.active ? "Activo" : "Inactivo"}</span><input type="checkbox" checked={product.active} onChange={() => updateProduct(product.id, { active: !product.active })}/></label></article>)}</div>{!products.length ? <div className="empty-state"><Search size={28}/><h3>No encontramos productos</h3><p>Probá con otra palabra o categoría.</p></div> : null}</section></>;
}

function CustomersView({ state }: { state: DemoState }) {
  const [selectedId, setSelectedId] = useState(state.customers[0]?.id ?? ""); const [search, setSearch] = useState(""); const customer = state.customers.find((item) => item.id === selectedId);
  const filtered = state.customers.filter((item) => normalizeText(`${item.businessName} ${item.contactName} ${item.city}`).includes(normalizeText(search)));
  return <><PageIntro title="Clientes" description="Datos básicos y preferencias necesarias para preparar los pedidos."/><div className="customers-layout"><section className="panel"><label className="search-field"><Search size={18}/><span className="sr-only">Buscar clientes</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente o localidad"/></label><div className="customer-list">{filtered.map((item) => <button key={item.id} className={selectedId === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}><span className="customer-avatar">{item.businessName.slice(0, 2).toUpperCase()}</span><span><strong>{item.businessName}</strong><small>{item.contactName} · {item.city}</small></span><ChevronRight size={18}/></button>)}</div></section>{customer ? <section className="panel customer-detail"><div className="panel-heading"><div><span className="eyebrow">Ficha del cliente</span><h2>{customer.businessName}</h2><p>{customer.active ? "Cliente activo" : "Cliente inactivo"}</p></div></div><dl className="detail-list large"><div><dt>Contacto</dt><dd>{customer.contactName}</dd></div><div><dt>WhatsApp</dt><dd>{customer.phone}</dd></div><div><dt>Dirección</dt><dd>{customer.address}, {customer.city}</dd></div><div><dt>Condición de venta</dt><dd>{customer.saleCondition}</dd></div><div><dt>Preferencias</dt><dd>{customer.notes}</dd></div><div><dt>Último pedido</dt><dd>{state.orders.find((order) => order.customerId === customer.id) ? formatDateTime(state.orders.find((order) => order.customerId === customer.id)!.createdAt) : "Sin pedidos"}</dd></div></dl><h3>Pedidos recientes</h3>{state.orders.filter((order) => order.customerId === customer.id).slice(0, 3).map((order) => <div className="mini-order" key={order.id}><span>#{order.number}</span><StatusBadge status={order.status}/><strong>{formatCurrency(orderTotal(order))}</strong></div>)}</section> : null}</div></>;
}

function SettingsView({ state, setState, onToast }: { state: DemoState; setState: React.Dispatch<React.SetStateAction<DemoState>>; onToast: (message: string) => void }) {
  const [syncing, setSyncing] = useState(false);
  const simulate = () => { setSyncing(true); window.setTimeout(() => { setState((current) => ({ ...current, lastDemoSyncAt: new Date().toISOString(), products: current.products.map((product, index) => index < 4 ? { ...product, demoStock: product.demoStock + (index % 2 ? -1 : 2) } : product) })); setSyncing(false); onToast("Stock demo actualizado con cantidades simuladas."); }, 900); };
  return <><PageIntro eyebrow="Configuración demo" title="Conexión con el sistema actual" description="En una siguiente etapa, Disnode podría leer productos, precios y stock desde el sistema que ya utiliza El Bayo." actions={<span className="simulation-badge"><Link2 size={17}/> Simulación</span>}/><section className="notice"><AlertTriangle size={20}/><div><strong>Esta pantalla no representa una conexión real</strong><p>Las alternativas y cantidades se muestran únicamente para conversar sobre una futura integración.</p></div></section><section className="integration-grid"><article><span><Upload size={22}/></span><h2>Importar Excel o CSV</h2><p>Leer un archivo exportado desde el sistema actual.</p><small>Alternativa por evaluar</small></article><article><span><RefreshCcw size={22}/></span><h2>Consultar automáticamente</h2><p>Requiere revisar qué accesos ofrece el sistema.</p><small>Alternativa por evaluar</small></article><article><span><Boxes size={22}/></span><h2>Stock simplificado</h2><p>Mantener cantidades locales sólo para preparar pedidos.</p><small>Disponible en esta demo</small></article></section><div className="settings-grid"><section className="panel"><h2>Información pendiente</h2><p className="panel-copy">Antes de definir una integración necesitamos confirmar:</p><ul className="check-list">{["Nombre y versión del sistema", "Exportaciones disponibles", "Formato de códigos de producto", "Acceso a base de datos o servicio de consulta", "Momento en que se descuenta stock", "Manejo de unidades y bultos"].map((item) => <li key={item}><span/><span>{item}</span></li>)}</ul></section><section className="panel sync-card"><div><span className="demo-label">DATOS SIMULADOS</span><h2>Actualización de stock</h2><p>Modifica algunas cantidades locales para mostrar cómo se vería el resultado.</p></div><div className="last-sync"><Clock3 size={18}/><span>Última actualización<strong>{state.lastDemoSyncAt ? formatDateTime(state.lastDemoSyncAt) : "Todavía no se ejecutó"}</strong></span></div><button className="button primary full" onClick={simulate} disabled={syncing}>{syncing ? <><LoaderCircle className="spin" size={18}/> Actualizando…</> : <><RefreshCcw size={18}/> Simular actualización de stock</>}</button></section></div></>;
}
