import { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface OrderLineItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export type FulfillmentStatus = "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Partially Shipped";
export type PaymentStatus = "Paid" | "Pending";

export interface FulfillmentStep {
  label: string;
  timestamp: string | null;
  completed: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: OrderLineItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentDate: string;
  paymentMethod: string;
  paymentReference: string;
  deliveryAddress: string;
  timeline: FulfillmentStep[];
  invoiceId: string;
}

export interface Invoice {
  id: string;
  number: string;
  orderId: string;
  date: string;
  items: OrderLineItem[];
  subtotal: number;
  gst: number;
  grandTotal: number;
  partnerName: string;
  partnerAddress: string;
  partnerGst: string;
  paymentReference: string;
  paymentMethod: string;
  status: "paid" | "pending";
  description: string;
  amount: number;
}

export type MilestoneStatus = "Paid" | "Due" | "Upcoming";

export interface PaymentMilestone {
  id: string;
  label: string;
  description: string;
  amount: number;
  percentage: string;
  status: MilestoneStatus;
  datePaid: string | null;
  dueDate: string | null;
}

function buildTimeline(fulfillmentStatus: FulfillmentStatus, orderDate: string): FulfillmentStep[] {
  const steps: { label: string; status: FulfillmentStatus | "Order Placed" | "Payment Confirmed" }[] = [
    { label: "Order Placed", status: "Order Placed" },
    { label: "Payment Confirmed", status: "Payment Confirmed" },
    { label: "Processing", status: "Processing" },
    { label: "Shipped", status: "Shipped" },
    { label: "Out for Delivery", status: "Out for Delivery" },
    { label: "Delivered", status: "Delivered" },
  ];

  const statusOrder: Record<string, number> = {
    "Order Placed": 0,
    "Payment Confirmed": 1,
    "Processing": 2,
    "Shipped": 3,
    "Partially Shipped": 3,
    "Out for Delivery": 4,
    "Delivered": 5,
  };

  const currentIdx = statusOrder[fulfillmentStatus] ?? 2;

  const baseDate = new Date(orderDate);
  return steps.map((step, idx) => {
    const completed = idx <= currentIdx;
    let timestamp: string | null = null;
    if (completed) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + idx);
      timestamp = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }
    return { label: step.label, timestamp, completed };
  });
}

const SEED_ORDERS: Order[] = [
  {
    id: "ORD-0038",
    date: "2026-03-10",
    items: [
      { id: 1, name: "LED Desk Lamp", category: "Electronics", price: 450, quantity: 50, lineTotal: 22500 },
      { id: 2, name: "Wireless Earbuds", category: "Electronics", price: 320, quantity: 100, lineTotal: 32000 },
      { id: 3, name: "Phone Stand", category: "Accessories", price: 120, quantity: 200, lineTotal: 24000 },
    ],
    itemCount: 350,
    subtotal: 78500,
    deliveryFee: 2000,
    total: 80500,
    paymentStatus: "Paid",
    fulfillmentStatus: "Delivered",
    paymentDate: "2026-03-10",
    paymentMethod: "Razorpay",
    paymentReference: "PAY-RZP-38001",
    deliveryAddress: "12, Lajpat Nagar, New Delhi - 110024",
    timeline: buildTimeline("Delivered", "2026-03-10"),
    invoiceId: "INV-0038",
  },
  {
    id: "ORD-0039",
    date: "2026-03-15",
    items: [
      { id: 4, name: "Wall Clock", category: "Home Decor", price: 280, quantity: 50, lineTotal: 14000 },
      { id: 5, name: "Ceramic Vase", category: "Home Decor", price: 350, quantity: 30, lineTotal: 10500 },
    ],
    itemCount: 80,
    subtotal: 24500,
    deliveryFee: 1000,
    total: 25500,
    paymentStatus: "Paid",
    fulfillmentStatus: "Shipped",
    paymentDate: "2026-03-15",
    paymentMethod: "Razorpay",
    paymentReference: "PAY-RZP-39001",
    deliveryAddress: "12, Lajpat Nagar, New Delhi - 110024",
    timeline: buildTimeline("Shipped", "2026-03-15"),
    invoiceId: "INV-0039",
  },
  {
    id: "ORD-0040",
    date: "2026-03-20",
    items: [
      { id: 7, name: "Travel Bag", category: "Fashion", price: 550, quantity: 50, lineTotal: 27500 },
      { id: 10, name: "Portable Charger", category: "Electronics", price: 520, quantity: 100, lineTotal: 52000 },
    ],
    itemCount: 150,
    subtotal: 79500,
    deliveryFee: 2000,
    total: 81500,
    paymentStatus: "Paid",
    fulfillmentStatus: "Processing",
    paymentDate: "2026-03-20",
    paymentMethod: "Razorpay",
    paymentReference: "PAY-RZP-40001",
    deliveryAddress: "12, Lajpat Nagar, New Delhi - 110024",
    timeline: buildTimeline("Processing", "2026-03-20"),
    invoiceId: "INV-0040",
  },
  {
    id: "ORD-0041",
    date: "2026-03-22",
    items: [
      { id: 9, name: "Essential Oil Diffuser", category: "Home Decor", price: 480, quantity: 30, lineTotal: 14400 },
      { id: 6, name: "Makeup Organizer", category: "Beauty", price: 180, quantity: 100, lineTotal: 18000 },
    ],
    itemCount: 130,
    subtotal: 32400,
    deliveryFee: 1000,
    total: 33400,
    paymentStatus: "Pending",
    fulfillmentStatus: "Processing",
    paymentDate: "—",
    paymentMethod: "—",
    paymentReference: "—",
    deliveryAddress: "12, Lajpat Nagar, New Delhi - 110024",
    timeline: buildTimeline("Processing", "2026-03-22"),
    invoiceId: "INV-0041",
  },
];

function ordersToInvoices(orders: Order[]): Invoice[] {
  return orders.map((order) => ({
    id: order.invoiceId,
    number: order.invoiceId,
    orderId: order.id,
    date: order.date,
    items: order.items,
    subtotal: order.subtotal,
    gst: Math.round(order.subtotal * 0.18),
    grandTotal: Math.round(order.subtotal * 1.18) + order.deliveryFee,
    partnerName: "Rajesh Kumar",
    partnerAddress: order.deliveryAddress,
    partnerGst: "07AABCU9603R1ZP",
    paymentReference: order.paymentReference,
    paymentMethod: order.paymentMethod,
    status: order.paymentStatus === "Paid" ? "paid" : "pending",
    description: `Order ${order.id} — ${order.itemCount} items`,
    amount: order.total,
  }));
}

const SEED_MILESTONES: PaymentMilestone[] = [
  {
    id: "M1",
    label: "Token Payment",
    description: "Initial booking token to confirm your franchise slot.",
    amount: 25000,
    percentage: "Fixed",
    status: "Paid",
    datePaid: "2026-01-15",
    dueDate: null,
  },
  {
    id: "M2",
    label: "Inventory Advance",
    description: "40% advance to initiate product procurement from factories.",
    amount: 120000,
    percentage: "40%",
    status: "Paid",
    datePaid: "2026-02-10",
    dueDate: null,
  },
  {
    id: "M3",
    label: "Pre-Shipping Balance",
    description: "50% balance before your inventory is dispatched from the warehouse.",
    amount: 150000,
    percentage: "50%",
    status: "Due",
    datePaid: null,
    dueDate: "2026-04-01",
  },
  {
    id: "M4",
    label: "Final Settlement",
    description: "10% final payment after inventory delivery and store setup completion.",
    amount: 30000,
    percentage: "10%",
    status: "Upcoming",
    datePaid: null,
    dueDate: "2026-05-15",
  },
];

let _orderCounter = 42;

interface EtsOrderStore {
  cart: CartItem[];
  orders: Order[];
  invoices: Invoice[];
  milestones: PaymentMilestone[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateCartQty: (id: number, qty: number) => void;
  clearCart: () => void;
  placeOrder: (deliveryAddress: string) => Order;
  getOrder: (id: string) => Order | undefined;
  getInvoice: (id: string) => Invoice | undefined;
  payMilestone: (milestoneId: string) => void;
}

const EtsOrderContext = createContext<EtsOrderStore | null>(null);

export function EtsOrderProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(ordersToInvoices(SEED_ORDERS));
  const [milestones, setMilestones] = useState<PaymentMilestone[]>(SEED_MILESTONES);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateCartQty = useCallback((id: number, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback((deliveryAddress: string): Order => {
    const orderNum = String(_orderCounter).padStart(4, "0");
    _orderCounter++;
    const orderId = `ORD-${orderNum}`;
    const invoiceId = `INV-${orderNum}`;
    const today = new Date().toISOString().split("T")[0];
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 50000 ? 2000 : 1000;
    const total = subtotal + deliveryFee;
    const items: OrderLineItem[] = cart.map(i => ({
      id: i.id, name: i.name, category: i.category, price: i.price, quantity: i.quantity, lineTotal: i.price * i.quantity,
    }));
    const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    const payRef = `PAY-RZP-${orderNum}01`;
    const newOrder: Order = {
      id: orderId,
      date: today,
      items,
      itemCount,
      subtotal,
      deliveryFee,
      total,
      paymentStatus: "Paid",
      fulfillmentStatus: "Processing",
      paymentDate: today,
      paymentMethod: "Razorpay",
      paymentReference: payRef,
      deliveryAddress,
      timeline: buildTimeline("Processing", today),
      invoiceId,
    };
    const newInvoice: Invoice = {
      id: invoiceId,
      number: invoiceId,
      orderId,
      date: today,
      items,
      subtotal,
      gst: Math.round(subtotal * 0.18),
      grandTotal: Math.round(subtotal * 1.18) + deliveryFee,
      partnerName: "Rajesh Kumar",
      partnerAddress: deliveryAddress,
      partnerGst: "07AABCU9603R1ZP",
      paymentReference: payRef,
      paymentMethod: "Razorpay",
      status: "paid",
      description: `Order ${orderId} — ${itemCount} items`,
      amount: total,
    };
    setOrders(prev => [newOrder, ...prev]);
    setInvoices(prev => [newInvoice, ...prev]);
    return newOrder;
  }, [cart]);

  const getOrder = useCallback((id: string) => orders.find(o => o.id === id), [orders]);
  const getInvoice = useCallback((id: string) => invoices.find(inv => inv.id === id), [invoices]);

  const payMilestone = useCallback((milestoneId: string) => {
    setMilestones(prev => {
      const updated = prev.map(m => {
        if (m.id === milestoneId) {
          return { ...m, status: "Paid" as MilestoneStatus, datePaid: new Date().toISOString().split("T")[0] };
        }
        return m;
      });
      const nextDueIdx = updated.findIndex(m => m.status === "Upcoming");
      if (nextDueIdx !== -1) {
        return updated.map((m, idx) => idx === nextDueIdx ? { ...m, status: "Due" as MilestoneStatus } : m);
      }
      return updated;
    });
  }, []);

  return (
    <EtsOrderContext.Provider value={{ cart, orders, invoices, milestones, addToCart, removeFromCart, updateCartQty, clearCart, placeOrder, getOrder, getInvoice, payMilestone }}>
      {children}
    </EtsOrderContext.Provider>
  );
}

export function useEtsOrders() {
  const ctx = useContext(EtsOrderContext);
  if (!ctx) throw new Error("useEtsOrders must be used within EtsOrderProvider");
  return ctx;
}
