'use client';

import { useEffect, useState } from 'react';
import { api, RoomType, HotelList, CreateRoomType } from '@/lib/api';
import { Plus, BedDouble, Users, DollarSign, Search, Trash2 } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<HotelList[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterHotel, setFilterHotel] = useState<number | undefined>();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api.getRoomTypes(filterHotel).then(setRooms).finally(() => setLoading(false));
  };

  const filteredRooms = rooms.filter(room => {
    if (!search) return true;
    const q = search.toLowerCase();
    return room.name.toLowerCase().includes(q) ||
      room.hotelName.toLowerCase().includes(q) ||
      room.description.toLowerCase().includes(q);
  });

  useEffect(() => {
    api.getHotels('pageSize=200').then(r => setHotels(r.items));
  }, []);

  useEffect(() => { load(); }, [filterHotel]);

  const handleCreate = async (data: CreateRoomType) => {
    await api.createRoomType(data);
    setShowForm(false);
    load();
  };

  const handleDelete = async (room: RoomType) => {
    if (!confirm(`¿Eliminar "${room.name}" de ${room.hotelName}?\n\nLas reservas activas de esta habitación serán canceladas.`)) return;
    await api.deleteRoomType(room.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Tipos de Habitación</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus size={16} /> Nuevo Tipo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, hotel o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterHotel || ''}
          onChange={(e) => setFilterHotel(e.target.value ? parseInt(e.target.value) : undefined)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Todos los hoteles</option>
          {hotels.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-5 h-40 animate-pulse" />
          ))
        ) : filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{room.hotelName}</p>
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button
                  onClick={() => handleDelete(room)}
                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar habitación"
                >
                  <Trash2 size={16} />
                </button>
                <BedDouble size={20} className="text-primary-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">{room.description}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users size={14} />
                <span>{room.capacity} pers.</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <DollarSign size={14} />
                <span>€{room.basePrice.toFixed(2)}</span>
              </div>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                room.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {room.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredRooms.length === 0 && (
        <p className="text-center text-gray-500 py-12">No se encontraron tipos de habitación</p>
      )}

      {showForm && (
        <RoomFormModal hotels={hotels} onClose={() => setShowForm(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

function RoomFormModal({
  hotels,
  onClose,
  onSubmit,
}: {
  hotels: HotelList[];
  onClose: () => void;
  onSubmit: (data: CreateRoomType) => Promise<void>;
}) {
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '', capacity: 2, basePrice: 100 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!selectedHotelId) errs.hotel = 'Debe seleccionar un hotel';
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
    if (form.capacity < 1) errs.capacity = 'La capacidad debe ser al menos 1';
    if (form.basePrice <= 0) errs.basePrice = 'El precio debe ser mayor a 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        hotelId: selectedHotelId!,
        name: form.name,
        description: form.description,
        capacity: form.capacity,
        basePrice: form.basePrice,
      });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Nuevo Tipo de Habitación</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div className="block">
            <span className="text-sm font-medium text-gray-700">Hotel <span className="text-red-500">*</span></span>
            <SearchableSelect
              options={hotels.map(h => ({ id: h.id, label: h.name, sublabel: `${h.city}, ${h.country}` }))}
              value={selectedHotelId}
              onChange={(id) => { setSelectedHotelId(id); setErrors(e => ({ ...e, hotel: '' })); }}
              placeholder="Seleccionar hotel..."
              searchPlaceholder="Buscar hotel..."
            />
            {errors.hotel && <p className="text-xs text-red-500 mt-1">{errors.hotel}</p>}
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></span>
            <input
              type="text" value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors(er => ({ ...er, name: '' })); }}
              className={`input-field mt-1 ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Descripción</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field mt-1" rows={2}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Capacidad</span>
              <input
                type="number" min={1} value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                className={`input-field mt-1 ${errors.capacity ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Precio Base (€)</span>
              <input
                type="number" min={0} step={0.01} value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })}
                className={`input-field mt-1 ${errors.basePrice ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice}</p>}
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
              {submitting ? 'Guardando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
