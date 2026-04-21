'use client';

import { useEffect, useState } from 'react';
import { api, Dashboard } from '@/lib/api';
import {
  Building2, BookOpen, LogIn, LogOut, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data) return <p className="text-red-500">Error al cargar el dashboard</p>;

  const statusData = Object.entries(data.reservationsByStatus).map(([name, value]) => ({
    name, value
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Hoteles Activos"
          value={`${data.activeHotels} / ${data.totalHotels}`}
          icon={<Building2 className="text-primary-500" size={24} />}
        />
        <KpiCard
          title="Total Reservas"
          value={data.totalReservations.toString()}
          icon={<BookOpen className="text-green-500" size={24} />}
        />
        <KpiCard
          title="Check-ins Hoy"
          value={data.todayCheckIns.toString()}
          icon={<LogIn className="text-amber-500" size={24} />}
        />
        <KpiCard
          title="Check-outs Hoy"
          value={data.todayCheckOuts.toString()}
          icon={<LogOut className="text-purple-500" size={24} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Tendencia de Ocupación (%)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.occupancyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                fontSize={12}
              />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                formatter={(v: number) => [`${v.toFixed(1)}%`, 'Ocupación']}
              />
              <Area
                type="monotone"
                dataKey="occupancyRate"
                stroke="#3b82f6"
                fill="#3b82f620"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Reservations by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Reservas por Estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                fontSize={11}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Hotels */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Top 5 Hoteles por Reservas</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.topHotels} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              width={200}
              fontSize={12}
              tickFormatter={(v) => v.length > 25 ? v.slice(0, 25) + '...' : v}
            />
            <Tooltip />
            <Bar dataKey="reservationCount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-5 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border h-96" />
        <div className="bg-white rounded-xl shadow-sm border h-96" />
      </div>
    </div>
  );
}
