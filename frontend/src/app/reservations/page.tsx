'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, Reservation, PagedResult, CreateReservation, RoomType } from '@/lib/api';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
  CheckedIn: 'bg-green-100 text-green-700',
  CheckedOut: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
  CheckedIn: 'Check-in',
  CheckedOut: 'Check-out',
};

export default function ReservationsPage() {
  const [result, setResult] = useState<PagedResult<Reservation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', '15');
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    api.getReservations(params.toString()).then(setResult).finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: number, status: string) => {
    await api.updateReservationStatus(id, status);
    load();
  };

  const handleCreate = async (data: CreateReservation) => {
    await api.createReservation(data);
    setShowForm(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus size={16} /> Nueva Reserva
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por referencia o huésped..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Referencia</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Huésped</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Hotel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Habitación</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check-in</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check-out</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : result?.items.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{res.bookingReference}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{res.guestName}</div>
                    <div className="text-xs text-gray-500">{res.guestEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{res.hotelName}</td>
                  <td className="px-4 py-3 text-gray-600">{res.roomTypeName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(res.checkIn).toLocaleDateString('es')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(res.checkOut).toLocaleDateString('es')}
                  </td>
                  <td className="px-4 py-3 font-medium">€{res.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={res.status}
                      onChange={(e) => handleStatusChange(res.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[res.status] || 'bg-gray-100'}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">{result.totalCount} reservas</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm">Pág. {result.page} de {result.totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(result.totalPages, p + 1))}
                disabled={page === result.totalPages}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 hover:bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && <ReservationFormModal onClose={() => setShowForm(false)} onSubmit={handleCreate} />}
    </div>
  );
}


function ReservationFormModal({
  onClose, onSubmit
}: {
  onClose: () => void;
  onSubmit: (data: CreateReservation) => Promise<void>;
}) {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [form, setForm] = useState({
    guestName: '', guestEmail: '', checkIn: '', checkOut: '', numberOfGuests: 1, notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getRoomTypes().then(setRooms);
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!selectedRoomId) errs.room = 'Debe seleccionar una habitación';
    if (!form.guestName.trim()) errs.guestName = 'El nombre del huésped es obligatorio';
    if (form.guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) {
      errs.guestEmail = 'Formato de email inválido. Ej: guest@ejemplo.com';
    }
    if (!form.checkIn) errs.checkIn = 'La fecha de check-in es obligatoria';
    if (!form.checkOut) errs.checkOut = 'La fecha de check-out es obligatoria';

    if (form.checkIn && form.checkOut) {
      if (form.checkOut <= form.checkIn) {
        errs.checkOut = 'El check-out debe ser posterior al check-in';
      }
    }

    if (form.numberOfGuests < 1) errs.guests = 'Debe haber al menos 1 huésped';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return false;

    // Check for retroactive dates
    const today = new Date().toISOString().split('T')[0];
    if (form.checkIn < today) {
      if (!confirm('Las fechas seleccionadas están en el pasado. ¿Desea registrar una reserva retroactiva en el sistema?')) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        roomTypeId: selectedRoomId!,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        numberOfGuests: form.numberOfGuests,
        notes: form.notes || undefined,
      });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Nueva Reserva</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div className="block">
            <span className="text-sm font-medium text-gray-700">Habitación <span className="text-red-500">*</span></span>
            <SearchableSelect
              options={rooms.map(r => ({ id: r.id, label: `${r.hotelName} – ${r.name}`, sublabel: `€${r.basePrice}` }))}
              value={selectedRoomId}
              onChange={(id) => { setSelectedRoomId(id); setErrors(e => ({ ...e, room: '' })); }}
              placeholder="Seleccionar habitación..."
              searchPlaceholder="Buscar hotel o habitación..."
            />
            {errors.room && <p className="text-xs text-red-500 mt-1">{errors.room}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Nombre Huésped <span className="text-red-500">*</span></span>
              <input type="text" value={form.guestName}
                onChange={(e) => { setForm({ ...form, guestName: e.target.value }); setErrors(er => ({ ...er, guestName: '' })); }}
                className={`input-field mt-1 ${errors.guestName ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input type="email" value={form.guestEmail}
                placeholder="guest@ejemplo.com"
                onChange={(e) => { setForm({ ...form, guestEmail: e.target.value }); setErrors(er => ({ ...er, guestEmail: '' })); }}
                className={`input-field mt-1 ${errors.guestEmail ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {errors.guestEmail && <p className="text-xs text-red-500 mt-1">{errors.guestEmail}</p>}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Check-in <span className="text-red-500">*</span></span>
              <input type="date" value={form.checkIn}
                onChange={(e) => { setForm({ ...form, checkIn: e.target.value }); setErrors(er => ({ ...er, checkIn: '' })); }}
                className={`input-field mt-1 ${errors.checkIn ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {errors.checkIn && <p className="text-xs text-red-500 mt-1">{errors.checkIn}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Check-out <span className="text-red-500">*</span></span>
              <input type="date" value={form.checkOut}
                onChange={(e) => { setForm({ ...form, checkOut: e.target.value }); setErrors(er => ({ ...er, checkOut: '' })); }}
                className={`input-field mt-1 ${errors.checkOut ? 'border-red-400 focus:ring-red-400' : ''}`} />
              {errors.checkOut && <p className="text-xs text-red-500 mt-1">{errors.checkOut}</p>}
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nº Huéspedes</span>
            <input type="number" min={1} value={form.numberOfGuests}
              onChange={(e) => setForm({ ...form, numberOfGuests: parseInt(e.target.value) || 1 })}
              className="input-field mt-1" />
            {errors.guests && <p className="text-xs text-red-500 mt-1">{errors.guests}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Notas</span>
            <textarea value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field mt-1" rows={2} />
          </label>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
              {submitting ? 'Guardando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
