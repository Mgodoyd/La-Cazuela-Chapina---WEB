import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardProductService } from '../services/productService';
import { DashboardOrderService } from '../services/orderService';
import type { DashboardOrder } from '../types/dashboardOrder';
import type { DashboardModalProps } from '../types/modals';
import { ModalFrame } from './ModalFrame';


//colores para los graficos
const CHART_COLORS = ['#0f172a', '#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'];

const chartsPerPage = 2;

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

const sumOrderTotal = (order: DashboardOrder) =>
  (order.items || []).reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

export default function DashboardModal({ onClose }: DashboardModalProps) {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersData, products] = await Promise.all([
          DashboardOrderService.getOrders(),
          DashboardProductService.getProducts(),
        ]);

        const idToName = new Map(products.map((p) => [p.id, p.name] as const));
        const enriched = ordersData.map((order) => ({
          ...order,
          items: (order.items || []).map((item) => ({
            ...item,
            productName:
              idToName.get(item.productId) || item.productName || 'Producto',
          })),
        }));

        setOrders(enriched);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error cargando datos';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + sumOrderTotal(order), 0),
    [orders]
  );

  const totalOrders = orders.length;

  const totalItemsSold = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + (order.items || []).reduce((acc, item) => acc + item.quantity, 0),
        0
      ),
    [orders]
  );

  const averageTicket = totalOrders
    ? totalRevenue / totalOrders
    : 0;

  const isTamale = (name: string) => /tamal/i.test(name);
  const isBeverage = (name: string) =>
    /(bebida|atole|pinol|cacao|cafe|chocolate)/i.test(name);
  const isSpicy = (name: string) =>
    /(picante|chapin|spicy|rojo|verde)/i.test(name);

  const dailySales: AggregatedPoint[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) {
      const created = new Date(order.createdAt || '');
      if (Number.isNaN(created.getTime())) continue;
      const label = created.toISOString().slice(0, 10);
      map.set(label, (map.get(label) || 0) + sumOrderTotal(order));
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));
  }, [orders]);

  const monthlySales: AggregatedPoint[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) {
      const created = new Date(order.createdAt || '');
      if (Number.isNaN(created.getTime())) continue;
      const label = `${created.getFullYear()}-${String(
        created.getMonth() + 1
      ).padStart(2, '0')}`;
      map.set(label, (map.get(label) || 0) + sumOrderTotal(order));
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));
  }, [orders]);

  const topTamales = useMemo(() => {
    const qtyByProduct = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items || []) {
        const name = item.productName || '';
        if (!isTamale(name)) continue;
        qtyByProduct.set(name, (qtyByProduct.get(name) || 0) + item.quantity);
      }
    }
    return Array.from(qtyByProduct.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [orders]);

  const beveragesBySlot = useMemo(() => {
    const buckets: Record<string, Record<string, number>> = {};
    const slotFor = (dateStr: string) => {
      const hour = new Date(dateStr).getHours();
      if (hour < 11) return 'Manana';
      if (hour < 15) return 'Mediodia';
      if (hour < 19) return 'Tarde';
      return 'Noche';
    };

    for (const order of orders) {
      const slot = slotFor(order.createdAt || new Date().toISOString());
      buckets[slot] = buckets[slot] || {};
      for (const item of order.items || []) {
        const name = item.productName || '';
        if (!isBeverage(name)) continue;
        buckets[slot][name] = (buckets[slot][name] || 0) + item.quantity;
      }
    }

    const beverages = Array.from(
      new Set(
        Object.values(buckets).flatMap((slot) => Object.keys(slot))
      )
    );

    const data = Object.entries(buckets).map(([slot, values]) => {
      const entry: Record<string, number | string> = { slot };
      for (const beverage of beverages) {
        entry[beverage] = values[beverage] || 0;
      }
      return entry;
    });

    return { beverages, data };
  }, [orders]);

  const spicyRatio = useMemo(() => {
    let spicy = 0;
    let mild = 0;
    for (const order of orders) {
      for (const item of order.items || []) {
        const name = item.productName || '';
        if (!isTamale(name)) continue;
        if (isSpicy(name)) spicy += item.quantity;
        else mild += item.quantity;
      }
    }
    return [
      { name: 'Picante', value: spicy },
      { name: 'No picante', value: mild },
    ];
  }, [orders]);

  const profitByLine = useMemo(() => {
    let tamales = 0;
    let beverages = 0;
    let others = 0;
    for (const order of orders) {
      for (const item of order.items || []) {
        const name = item.productName || '';
        const total = item.quantity * item.unitPrice;
        if (isTamale(name)) tamales += total;
        else if (isBeverage(name)) beverages += total;
        else others += total;
      }
    }
    return [
      { label: 'Tamales', value: tamales },
      { label: 'Bebidas', value: beverages },
      { label: 'Otros', value: others },
    ];
  }, [orders]);

  const chartBlocks = useMemo(() => {
    const blocks = [
      {
        key: 'daily',
        title: 'Ingresos diarios',
        content: (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip formatter={(v: any) => v.toFixed?.(2) || v} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ),
      },
      {
        key: 'monthly',
        title: 'Ingresos mensuales',
        content: (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip formatter={(v: any) => v.toFixed?.(2) || v} />
              <Bar dataKey="value" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        ),
      },
      {
        key: 'tamales',
        title: 'Top tamales por ventas',
        content: (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topTamales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip />
              <Bar dataKey="value" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        ),
      },
      {
        key: 'beverages',
        title: 'Bebidas por franja horaria',
        content: (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={beveragesBySlot.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="slot" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip />
              <Legend />
              {beveragesBySlot.beverages.map((beverage, index) => (
                <Bar
                  key={beverage}
                  dataKey={beverage}
                  stackId="a"
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ),
      },
      {
        key: 'spicy',
        title: 'Tamales picantes vs suaves',
        content: (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spicyRatio}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                label
              >
                {spicyRatio.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ),
      },
      {
        key: 'profit',
        title: 'Ingresos por linea',
        content: (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitByLine}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip formatter={(v: any) => v.toFixed?.(2) || v} />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        ),
      },
    ];
    return blocks.filter((block) => {
      if (block.key === 'beverages') return beveragesBySlot.beverages.length > 0;
      if (block.key === 'spicy') return spicyRatio.some((s) => s.value > 0);
      if (block.key === 'tamales') return topTamales.length > 0;
      return true;
    });
  }, [dailySales, monthlySales, topTamales, beveragesBySlot, spicyRatio, profitByLine]);

  const chartPages = Math.max(1, Math.ceil(chartBlocks.length / chartsPerPage));
  const visibleCharts = chartBlocks.slice(
    (page - 1) * chartsPerPage,
    page * chartsPerPage
  );

  return (
    <ModalFrame
      title="Panel analitico"
      description="Revisa el desempeno de ventas y preferencias de los clientes."
      onClose={onClose}
      width="xl"
    >
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">
          Cargando indicadores...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ingresos totales
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                Q{totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500">
                Generados por {totalOrders} pedidos
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ticket promedio
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                Q{averageTicket.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500">
                Por pedido completado
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Productos vendidos
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalItemsSold}
              </p>
              <p className="text-sm text-slate-500">
                Total de unidades despachadas
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pedidos
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalOrders}
              </p>
              <p className="text-sm text-slate-500">
                Registrados en el periodo
              </p>
            </div>
          </div>

          {visibleCharts.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {visibleCharts.map((block) => (
                  <div
                    key={block.key}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="text-base font-semibold text-slate-900">
                      {block.title}
                    </h3>
                    <div className="mt-4 h-72">{block.content}</div>
                  </div>
                ))}
              </div>
              {chartPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Pagina {page} de {chartPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((prev) => Math.min(chartPages, prev + 1))
                      }
                      disabled={page === chartPages}
                      className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </ModalFrame>
  );
}
