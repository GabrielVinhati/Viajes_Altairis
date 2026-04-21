'use client';

import { useEffect, useState } from 'react';
import { api, AvailabilityItem, HotelList } from '@/lib/api';
import { CalendarRange, Search } from 'lucide-react';

export default function AvailabilityPage() {
  const [data, setData] = useState<AvailabilityItem[]>([]);
  const [hotels, setHotels] = useState<HotelList[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    api.getHotels('pageSize=200').then(r => setHotels(r.items));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (hotelId) params.set('hotelId', hotelId);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    api.getAvailability(params.toString()).then(setData).finally(() => setLoading(false));
  }, [hotelId, dateFrom, dateTo]);

  // Filter by search
  const filtered = data.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.hotelName.toLowerCase().includes(q) ||
      item.roomTypeName.toLowerCase().includes(q);
  });

  // Group by hotel+roomType
  const grouped = filtered.reduce((acc, item) => {
    const key = `${item.hotelName} - ${item.roomTypeName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, AvailabilityItem[]>);

  // Unique dates
  const dates = Array.from(new Set(filtered.map(d => d.date))).sort();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CalendarRange size={24} /> Disponibilidad e Inventario
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por hotel o tipo de habitación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={hotelId}
          onChange={(e) => setHotelId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos los hoteles</option>
          {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <input
          type="date" value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
        <input
          type="date" value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* Availability Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 animate-pulse h-64" />
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-500 py-12">No hay datos de disponibilidad</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[200px]">
                    Hotel / Habitación
                  </th>
                  {dates.map(date => (
                    <th key={date} className="px-2 py-2 font-medium text-gray-600 text-center min-w-[60px]">
                      {new Date(date).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(grouped).map(([key, items]) => (
                  <tr key={key}>
                    <td className="px-3 py-2 font-medium text-gray-800 sticky left-0 bg-white border-r">
                      {key}
                    </td>
                    {dates.map(date => {
                      const item = items.find(i => i.date === date);
                      if (!item) return <td key={date} className="px-2 py-2 text-center text-gray-300">-</td>;

                      const rate = item.totalRooms > 0 ? item.bookedRooms / item.totalRooms : 0;
                      const bg = rate >= 0.9 ? 'bg-red-100 text-red-700'
                        : rate >= 0.7 ? 'bg-amber-100 text-amber-700'
                        : rate >= 0.4 ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-green-100 text-green-700';

                      return (
                        <td key={date} className={`px-2 py-2 text-center font-medium ${bg}`}>
                          {item.availableRooms}/{item.totalRooms}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t bg-gray-50 flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Alta disponibilidad</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-300" /> Media</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Baja</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> Crítica (&gt;90%)</span>
          </div>
        </div>
      )}
    </div>
  );
}
