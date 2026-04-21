'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, HotelList, PagedResult, CreateHotel } from '@/lib/api';
import { Plus, Search, Star, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export default function HotelsPage() {
  const [result, setResult] = useState<PagedResult<HotelList> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', '15');
    if (search) params.set('search', search);
    api.getHotels(params.toString()).then(setResult).finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: CreateHotel) => {
    await api.createHotel(data);
    setShowForm(false);
    load();
  };

  const handleDelete = async (hotel: HotelList) => {
    if (!confirm(`¿Eliminar "${hotel.name}"?\n\nTodas sus habitaciones serán eliminadas y las reservas activas serán canceladas.`)) return;
    await api.deleteHotel(hotel.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Hoteles</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus size={16} /> Nuevo Hotel
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ciudad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">País</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estrellas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Habitaciones</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : result?.items.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{hotel.name}</td>
                  <td className="px-4 py-3 text-gray-600">{hotel.city}</td>
                  <td className="px-4 py-3 text-gray-600">{hotel.country}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[...Array(hotel.stars)].map((_, i) => (
                        <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{hotel.roomTypeCount} tipos</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hotel.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {hotel.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(hotel)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar hotel"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {result.totalCount} hoteles en total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm">
                Página {result.page} de {result.totalPages}
              </span>
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

      {/* Create Modal */}
      {showForm && (
        <HotelFormModal onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

function HotelFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateHotel) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateHotel>({
    name: '', address: '', city: '', country: '', stars: 3, phone: '', email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!form.city.trim()) errs.city = 'La ciudad es obligatoria';
    if (!form.country.trim()) errs.country = 'El país es obligatorio';
    if (form.phone && !/^\+?[\d\s\-()]{7,20}$/.test(form.phone)) {
      errs.phone = 'Formato inválido. Ej: +34 912 345 678';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Formato de email inválido. Ej: hotel@ejemplo.com';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Nuevo Hotel</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <Field label="Nombre" required error={errors.name}>
            <input
              type="text" value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors(er => ({ ...er, name: '' })); }}
              className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
          </Field>
          <Field label="Dirección">
            <input
              type="text" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input-field"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ciudad" required error={errors.city}>
              <input
                type="text" value={form.city}
                onChange={(e) => { setForm({ ...form, city: e.target.value }); setErrors(er => ({ ...er, city: '' })); }}
                className={`input-field ${errors.city ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </Field>
            <Field label="País" required error={errors.country}>
              <input
                type="text" value={form.country}
                onChange={(e) => { setForm({ ...form, country: e.target.value }); setErrors(er => ({ ...er, country: '' })); }}
                className={`input-field ${errors.country ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </Field>
          </div>
          <Field label="Estrellas">
            <select
              value={form.stars}
              onChange={(e) => setForm({ ...form, stars: parseInt(e.target.value) })}
              className="input-field"
            >
              {[1, 2, 3, 4, 5].map(s => (
                <option key={s} value={s}>{'★'.repeat(s)}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Teléfono" error={errors.phone}>
              <input
                type="tel" value={form.phone}
                placeholder="+34 912 345 678"
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d\s\-+()]/g, '');
                  setForm({ ...form, phone: val });
                  setErrors(er => ({ ...er, phone: '' }));
                }}
                className={`input-field ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                type="email" value={form.email}
                placeholder="hotel@ejemplo.com"
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors(er => ({ ...er, email: '' })); }}
                className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </Field>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Crear Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </label>
  );
}
