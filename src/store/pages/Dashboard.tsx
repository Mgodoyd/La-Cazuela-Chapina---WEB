import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { selectSales } from "../store/salesSlice";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card } from "../components/UI";
import { computeBebidasPorHora, computeMonthTotal, computePicanteRatio, computeSalesByDay, computeTodayTotal } from "../controllers/salesController";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardPage() {
  const sales = useAppSelector(selectSales);

  const byDay = useMemo(() => computeSalesByDay(sales), [sales]);
  const picanteRatio = useMemo(() => computePicanteRatio(sales), [sales]);
  const bebidasPorHora = useMemo(() => computeBebidasPorHora(sales), [sales]);
  const totalHoy = useMemo(() => computeTodayTotal(sales), [sales]);
  const totalMes = useMemo(() => computeMonthTotal(sales), [sales]);

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Ventas de hoy">
          <div className="text-3xl font-bold">Q {totalHoy.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Ingresos del día</div>
        </Card>
        <Card title="Ventas del mes">
          <div className="text-3xl font-bold">Q {totalMes.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Acumulado del mes</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ventas por día (Q)">
          <BarChart width={500} height={260} data={byDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#2563eb" />
          </BarChart>
        </Card>
        <Card title="Proporción picante">
          <PieChart width={500} height={260}>
            <Pie data={picanteRatio} dataKey="value" nameKey="name" outerRadius={100} label>
              {picanteRatio.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>
      </div>

      <Card title="Bebidas por hora (cantidad)">
        <BarChart width={900} height={260} data={bebidasPorHora}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cantidad" fill="#16a34a" />
        </BarChart>
      </Card>
    </div>
  );
} 