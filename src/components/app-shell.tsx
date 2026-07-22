"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  Boxes,
  WalletCards,
  MessageCircle,
  Plus,
  RefreshCcw,
  Check,
  type LucideIcon,
} from "lucide-react";

import type {
  DemoState,
  ViewKey,
  NewOrderDraft,
  OrderStatus,
  Product,
  Customer,
  Inquiry,
} from "@/lib/types";

import {
  buildOrderFromDraft,
  buildSuggestedLines,
  findCustomer,
  findProduct,
  getOrderTotal,
  getOrderBalance,
  getDashboardMetrics,
  generateOrderMessage,
  generateCollectionMessage,
  generateFollowUpMessage,
  generateCatalogMessage,
  getDaysOverdue,
  createWhatsAppUrl,
} from "@/lib/business";

import { initialDemoState } from "@/lib/demo-data";
import { formatCurrency, normalizeText } from "@/lib/format";

import { DashboardView } from "@/components/dashboard";
import { OrdersView } from "@/components/orders";
import { CustomersView } from "@/components/customers";
import { ProductsView } from "@/components/products";
import { CollectionsView } from "@/components/collections";
import { InquiriesView } from "@/components/inquiries";

const STORAGE_KEY = "node3-demo";

const navItems: Array<{ key: ViewKey; label: string; icon: LucideIcon }> = [
  { key: "inicio", label: "Inicio", icon: LayoutDashboard },
  { key: "pedidos", label: "Pedidos", icon: Package },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "productos", label: "Productos", icon: Boxes },
  { key: "cobrar", label: "Cobrar", icon: WalletCards },
  { key: "consultas", label: "Consultas", icon: MessageCircle },
];

const pageTitles: Record<ViewKey, { title: string; sub: string }> = {
  inicio: { title: "Panel operativo", sub: "Todo el negocio en una vista." },
  pedidos: { title: "Pedidos", sub: "Crear, preparar y entregar." },
  clientes: { title: "Clientes", sub: "Tu cartera comercial." },
  productos: { title: "Productos", sub: "Catálogo y listas de precios." },
  cobrar: { title: "Cobrar", sub: "Deuda pendiente y recordatorios." },
  consultas: { title: "Consultas", sub: "Seguimiento de oportunidades." },
};

const emptyDraft: NewOrderDraft = { customerId: "", lines: [], notes: "" };

function loadState(): DemoState {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
  }
  return initialDemoState;
}

export function ErpApp() {
  const [view, setView] = useState<ViewKey>("inicio");
  const [state, setState] = useState<DemoState>(() => loadState());
  const [selectedCustomerId, setSelectedCustomerId] = useState("c-kiosco-amigos");
  const [draft, setDraft] = useState<NewOrderDraft>(emptyDraft);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2600);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const metrics = useMemo(() => getDashboardMetrics(state), [state]);

  const showToast = (msg: string) => setToast(msg);

  const resetDemo = () => {
    setState(initialDemoState);
    setDraft(emptyDraft);
    showToast("Datos de demostración reiniciados");
  };

  const addProductToDraft = (product: Product) => {
    const customer = state.customers.find((c) => c.id === draft.customerId);
    const priceList = customer?.priceList ?? "mayorista";

    setDraft((prev) => {
      const existing = prev.lines.find((l) => l.productId === product.id);
      if (existing) {
        return {
          ...prev,
          lines: prev.lines.map((l) =>
            l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l
          ),
        };
      }
      return {
        ...prev,
        lines: [
          ...prev.lines,
          {
            productId: product.id,
            quantity: 1,
            unitPrice: product.prices[priceList],
          },
        ],
      };
    });
  };

  const updateDraftQuantity = (productId: string, qty: number) => {
    setDraft((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)),
    }));
  };

  const removeDraftLine = (productId: string) => {
    setDraft((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.productId !== productId),
    }));
  };

  const submitDraftOrder = () => {
    if (!draft.customerId || draft.lines.length === 0) return;

    const newOrder = buildOrderFromDraft(draft, state.orders, state.customers);

    setState((prev) => {
      let inquiries = prev.inquiries;
      if (draft.inquiryId) {
        inquiries = prev.inquiries.map((i) =>
          i.id === draft.inquiryId
            ? { ...i, status: "convertida", convertedOrderId: newOrder.id }
            : i
        );
      }
      return {
        ...prev,
        orders: [...prev.orders, newOrder],
        inquiries,
      };
    });

    setDraft(emptyDraft);
    showToast(`Pedido #${newOrder.number} creado con éxito`);
  };

  const convertInquiry = (inquiry: Inquiry) => {
    let customerId = inquiry.customerId;

    if (!customerId) {
      const newCustomer: Customer = {
        id: `c-${Date.now()}`,
        businessName: inquiry.prospectName,
        contactName: inquiry.prospectName,
        phone: "",
        address: "",
        city: "",
        zone: "Sin zona",
        customerType: "Nuevo",
        priceList: "mayorista",
        creditLimit: 0,
        currentDebt: 0,
        status: "activo",
        notes: "Creado desde consulta",
      };
      setState((prev) => ({
        ...prev,
        customers: [...prev.customers, newCustomer],
      }));
      customerId = newCustomer.id;
    }

    const lines = buildSuggestedLines(
      inquiry,
      state.products,
      state.customers.find((c) => c.id === customerId)
    );

    setDraft({
      customerId,
      inquiryId: inquiry.id,
      lines,
      notes: `Viene de consulta: ${inquiry.text}`,
    });
    setView("pedidos");
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  };

  const registerPayment = (orderId: string, amount?: number) => {
    setState((prev) => {
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order) return prev;

      const total = getOrderTotal(order);
      const paid = amount !== undefined ? order.paidAmount + amount : total;

      const balance = Math.max(0, total - paid);
      let status = order.status;

      if (balance === 0 && !["cancelado"].includes(status)) {
        status = "pagado";
      }

      return {
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, paidAmount: paid, status } : o
        ),
      };
    });
    showToast("Pago registrado con éxito");
  };

  const copyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    showToast("Mensaje copiado al portapapeles");
  };

  const createInquiry = (text: string) => {
    const hintRegex = /(agua|gaseosa|detergente|guantes|creatina|proteina|shaker|tornillos)/gi;
    const matches = text.match(hintRegex) || [];
    const hints = [
      ...new Set(matches.map((m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())),
    ];

    const newInquiry: Inquiry = {
      id: `i-${Date.now()}`,
      prospectName: "Nuevo Prospecto",
      channel: "WhatsApp",
      text,
      productHints: hints,
      status: "nueva",
      owner: "Node3",
      nextAction: "Responder consulta",
      followUpDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => ({
      ...prev,
      inquiries: [newInquiry, ...prev.inquiries],
    }));
    showToast("Nueva consulta registrada");
  };

  const simulateExcelImport = () => {
    const newProducts: Product[] = [
      {
        id: `p-${Date.now()}-1`,
        sku: "BEB-080",
        name: "Energizante lata pack x12",
        category: "Bebidas",
        unit: "pack",
        stock: 36,
        minStock: 15,
        prices: { minorista: 18000, mayorista: 15000, especial: 14400 },
        active: true,
      },
      {
        id: `p-${Date.now()}-2`,
        sku: "GOL-090",
        name: "Chocolate tableta caja x20",
        category: "Golosinas",
        unit: "caja",
        stock: 25,
        minStock: 10,
        prices: { minorista: 26000, mayorista: 21500, especial: 20000 },
        active: true,
      },
    ];

    setState((prev) => ({
      ...prev,
      products: [...newProducts, ...prev.products],
    }));
    showToast("2 productos importados desde Excel");
  };

  const startOrderForCustomer = (customerId: string) => {
    setDraft({ ...emptyDraft, customerId });
    setView("pedidos");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">N3</span>
          <div>
            <div className="brand-name">Node3</div>
            <div className="brand-sub">Distribución</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`nav-item ${view === item.key ? "active" : ""}`}
                onClick={() => setView(item.key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          Prototipo comercial — pedidos, clientes, precios y cobranzas sin integrar WhatsApp API.
        </div>
      </aside>

      <div className="main-area">
        <div className="mobile-nav">
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`nav-item ${view === item.key ? "active" : ""}`}
                  onClick={() => setView(item.key)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <header className="header">
          <div>
            <div className="header-title">{pageTitles[view].title}</div>
            <div className="header-sub">{pageTitles[view].sub}</div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setDraft({ ...emptyDraft, customerId: state.customers[0]?.id ?? "" });
                setView("pedidos");
              }}
            >
              <Plus size={16} /> Pedido
            </button>
            <button className="btn btn-secondary" onClick={() => setView("consultas")}>
              <MessageCircle size={16} /> Consulta
            </button>
            <button className="btn btn-ghost" onClick={resetDemo}>
              <RefreshCcw size={16} /> Reiniciar
            </button>
          </div>
        </header>

        <section className="content">
          {view === "inicio" && (
            <DashboardView
              state={state}
              onNavigate={setView}
              onConvertInquiry={convertInquiry}
              onUpdateStatus={updateOrderStatus}
            />
          )}
          {view === "pedidos" && (
            <OrdersView
              state={state}
              draft={draft}
              onDraftChange={setDraft}
              onAddProduct={addProductToDraft}
              onUpdateQuantity={updateDraftQuantity}
              onRemoveLine={removeDraftLine}
              onSubmitOrder={submitDraftOrder}
              onUpdateStatus={updateOrderStatus}
              onCopyMessage={copyMessage}
            />
          )}
          {view === "clientes" && (
            <CustomersView
              state={state}
              selectedId={selectedCustomerId}
              onSelect={setSelectedCustomerId}
              onStartOrder={startOrderForCustomer}
              onCopyMessage={copyMessage}
            />
          )}
          {view === "productos" && (
            <ProductsView products={state.products} onImport={simulateExcelImport} />
          )}
          {view === "cobrar" && (
            <CollectionsView
              state={state}
              onRegisterPayment={registerPayment}
              onCopyMessage={copyMessage}
            />
          )}
          {view === "consultas" && (
            <InquiriesView
              state={state}
              onConvertInquiry={convertInquiry}
              onCreateInquiry={createInquiry}
              onCopyMessage={copyMessage}
            />
          )}
        </section>
      </div>

      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
