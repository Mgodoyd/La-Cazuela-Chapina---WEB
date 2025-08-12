import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { DashboardProductService } from '../services/productService';
import { DashboardOrderService } from '../services/orderService';
import type { DashboardOrder } from '../services/orderService';

interface DashboardModalProps {
  onClose: () => void;
}

type AggregatedPoint = { label: string; value: number };

const COLORS = ['#60a5fa', '#34d399', '#f472b6', '#f59e0b', '#a78bfa', '#f87171'];

export default function DashboardModal({ onClose }: DashboardModalProps) {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 2;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Cargamos ventas y productos en paralelo para mapear nombres
        const [ordersData, products] = await Promise.all([
          DashboardOrderService.getOrders(),
          DashboardProductService.getProducts(),
        ]);

        // Enriquecer items con nombre del producto
        const idToName = new Map(products.map(p => [p.id, p.name] as const));
        const enriched = ordersData.map(s => ({
          ...s,
          items: (s.items || []).map(i => ({
            ...i,
            productName: idToName.get(i.productId) || i.productName || 'Producto',
          })),
        }));

        setOrders(enriched);
      } catch (e: any) {
        setError(e?.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Helpers de clasificación (heurísticos si no hay tipo explícito)
  const isTamale = (name: string) => /tamal/i.test(name);
  const isBeverage = (name: string) => /(bebida|atole|pinol|cacao|cafe|café|chocolate)/i.test(name);
  const isSpicy = (name: string) => /(picante|chap[ií]n|spicy|rojo|verde)/i.test(name);

  // 5.1 Ventas diarias y mensuales
  const dailySales: AggregatedPoint[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of orders) {
      const d = new Date(s.createdAt || '');
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const total = (s.items || []).reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      map.set(key, (map.get(key) || 0) + total);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }));
  }, [orders]);

  const monthlySales: AggregatedPoint[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of orders) {
      const d = new Date(s.createdAt || '');
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      const total = (s.items || []).reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      map.set(key, (map.get(key) || 0) + total);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([label, value]) => ({ label, value }));
  }, [orders]);

  // 5.2 Tamales más vendidos (Top 5 por cantidad)
  const topTamales = useMemo(() => {
    const qtyByProduct = new Map<string, number>();
    for (const s of orders) {
      for (const i of s.items || []) {
        const name = i.productName || '';
        if (!isTamale(name)) continue;
        qtyByProduct.set(name, (qtyByProduct.get(name) || 0) + i.quantity);
      }
    }
    return Array.from(qtyByProduct.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [orders]);

  // 5.3 Bebidas preferidas por horario (agrupamos por franja y bebida)
  const beveragesBySlot = useMemo(() => {
    const slotOf = (dateStr: string) => {
      const h = new Date(dateStr).getHours();
      if (h < 11) return 'Mañana';
      if (h < 15) return 'Mediodía';
      if (h < 19) return 'Tarde';
      return 'Noche';
    };
    // slot -> bebida -> cantidad
    const map = new Map<string, Map<string, number>>();
    for (const s of orders) {
      const slot = slotOf(s.createdAt || '');
      for (const i of s.items || []) {
        const name = i.productName || '';
        if (!isBeverage(name)) continue;
        if (!map.has(slot)) map.set(slot, new Map());
        const inner = map.get(slot)!;
        inner.set(name, (inner.get(name) || 0) + i.quantity);
      }
    }
    const beverages = new Set<string>();
    for (const inner of map.values()) for (const k of inner.keys()) beverages.add(k);
    const slots = ['Mañana', 'Mediodía', 'Tarde', 'Noche'];
    const data = slots.map(slot => {
      const row: Record<string, any> = { slot };
      for (const b of beverages) row[b] = map.get(slot)?.get(b) || 0;
      return row;
    });
    return { beverages: Array.from(beverages), data };
  }, [orders]);

  // 5.4 Proporción picante vs no picante (sobre tamales, por cantidad)
  const spicyRatio = useMemo(() => {
    let spicy = 0, mild = 0;
    for (const s of orders) {
      for (const i of s.items || []) {
        const name = i.productName || '';
        if (!isTamale(name)) continue;
        if (isSpicy(name)) spicy += i.quantity; else mild += i.quantity;
      }
    }
    return [
      { name: 'Picante', value: spicy },
      { name: 'No picante', value: mild },
    ];
  }, [orders]);

  // 5.5 Utilidades por línea (ingresos por categoría)
  const profitByLine = useMemo(() => {
    const totals = { Tamales: 0, Bebidas: 0, Otros: 0 };
    for (const s of orders) {
      for (const i of s.items || []) {
        const name = i.productName || '';
        const revenue = i.quantity * i.unitPrice;
        if (isTamale(name)) totals.Tamales += revenue;
        else if (isBeverage(name)) totals.Bebidas += revenue;
        else totals.Otros += revenue;
      }
    }
    return [
      { label: 'Tamales', value: totals.Tamales },
      { label: 'Bebidas', value: totals.Bebidas },
      { label: 'Combos', value: totals.Otros },
    ];
  }, [orders]);

  // 5.6 Desperdicio de materias primas (placeholder: requiere endpoint de movimientos)
  // Mostramos tarjeta informativa si no hay datos.

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-7xl border border-white/20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-300">Cargando...</div>
          ) : error ? (
            <div className="text-center text-red-300">{error}</div>
          ) : (
            <>
              {(() => {
                const charts = [
                  (
                    <div key="daily" className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h3 className="text-white font-semibold mb-2">Ventas diarias</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailySales}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                            <XAxis dataKey="label" stroke="#cbd5e1" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip formatter={(v: any)=>`$${Number(v).toFixed(2)}`} labelFormatter={(l)=>`Fecha: ${l}`} />
                            <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ),
                  (
                    <div key="monthly" className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h3 className="text-white font-semibold mb-2">Ventas mensuales</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlySales}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                            <XAxis dataKey="label" stroke="#cbd5e1" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip formatter={(v: any)=>`$${Number(v).toFixed(2)}`} labelFormatter={(l)=>`Mes: ${l}`} />
                            <Bar dataKey="value" fill="#34d399" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ),
                  (
                    <div key="tamales" className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h3 className="text-white font-semibold mb-2">Top tamales vendidos</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topTamales}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                            <XAxis dataKey="label" stroke="#cbd5e1" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#f59e0b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ),
                  (
                    <div key="beverages" className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h3 className="text-white font-semibold mb-2">Bebidas preferidas por horario</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={beveragesBySlot.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                            <XAxis dataKey="slot" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip />
                            <Legend />
                            {beveragesBySlot.beverages.map((b, idx) => (
                              <Bar key={b} dataKey={b} stackId="a" fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ),
                  (
                    <div key="spicy" className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h3 className="text-white font-semibold mb-2">Proporción picante vs no picante</h3>
                      <div className="h-64 flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={spicyRatio} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                              {spicyRatio.map((_, idx) => (
                                <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ),
                  (
                    <div key="profit" className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h3 className="text-white font-semibold mb-2">Utilidades por línea (ingresos)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={profitByLine}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                            <XAxis dataKey="label" stroke="#cbd5e1" />
                            <YAxis stroke="#cbd5e1" />
                            <Tooltip formatter={(v: any)=>`$${Number(v).toFixed(2)}`} />
                            <Bar dataKey="value" fill="#a78bfa" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ),
                ];
                const totalPages = Math.max(1, Math.ceil(charts.length / pageSize));
                const start = (page - 1) * pageSize;
                const visible = charts.slice(start, start + pageSize);
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{visible}</div>
                    <div className="flex items-center justify-between mt-6 text-white/80">
                      <span className="text-sm">Página {page} de {totalPages}</span>
                      <div className="space-x-2">
                        <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Anterior</button>
                        <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Siguiente</button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


