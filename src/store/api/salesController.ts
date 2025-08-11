import type { Sale } from "../store/salesSlice";

export function computeSalesByDay(sales: Sale[]) {
  const map = new Map<string, number>();
  for (const s of sales) {
    const day = s.createdAt.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + s.total);
  }
  return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
}

export function computePicanteRatio(sales: Sale[]) {
  const counts: Record<string, number> = { sin: 0, suave: 0, chapin: 0 };
  for (const s of sales) for (const l of s.lines) if (l.kind === "tamal") counts[l.config.picante] += l.quantity;
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function computeBebidasPorHora(sales: Sale[]) {
  const map = new Map<number, number>();
  for (const s of sales) {
    const hour = new Date(s.createdAt).getHours();
    let cantidad = 0;
    for (const l of s.lines) if (l.kind === "bebida") cantidad += l.quantity;
    map.set(hour, (map.get(hour) ?? 0) + cantidad);
  }
  return Array.from(map.entries()).map(([hour, cantidad]) => ({ hour, cantidad }));
}

export function computeTodayTotal(sales: Sale[]) {
  const today = new Date().toISOString().slice(0, 10);
  return sales.filter(s => s.createdAt.slice(0, 10) === today).reduce((sum, s) => sum + s.total, 0);
}

export function computeMonthTotal(sales: Sale[]) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return sales
    .filter(s => {
      const d = new Date(s.createdAt);
      return d.getFullYear() === y && d.getMonth() === m;
    })
    .reduce((sum, s) => sum + s.total, 0);
} 