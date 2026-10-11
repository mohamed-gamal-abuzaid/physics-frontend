'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  Layers, Plus, Edit2, Trash2, CheckCircle2,
  AlertCircle, Save, X, DollarSign, Calendar
} from 'lucide-react';
import type { LevelSessionPricing, CreateLevelPricingPayload } from '@/lib/types';

const LEVEL_PRESETS = [
  { levelName: 'Year 9', stageCode: 'Y9' },
  { levelName: 'Year 10', stageCode: 'Y10' },
  { levelName: 'Year 11 (IGCSE)', stageCode: 'Y11' },
  { levelName: 'Year 12 (AS-Level)', stageCode: 'Y12' },
  { levelName: 'Year 13 (A2-Level)', stageCode: 'Y13' },
  { levelName: 'College / University', stageCode: 'ELSE' },
];

export function LevelPricingManager() {
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [selectedFormat, setSelectedFormat] = useState<'ALL' | 'PRIVATE' | 'GROUP'>('ALL');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LevelSessionPricing | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [form, setForm] = useState<CreateLevelPricingPayload>({
    levelName: 'Year 11 (IGCSE)',
    stageCode: 'Y11',
    sessionFormat: 'PRIVATE',
    sessionsCount: 1,
    title: '',
    price: 600,
    currency: 'EGP',
    description: '',
    isActive: true,
  });

  const {
    data: pricingList = [],
    isLoading,
    isError,
  } = useQuery<LevelSessionPricing[]>({
    queryKey: ['admin-level-pricing'],
    queryFn: () => adminApi.getLevelPricingList(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateLevelPricingPayload) => adminApi.createLevelPricing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-level-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing'] });
      showToast('Pricing rule created successfully!', 'success');
      handleCloseModal();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to create pricing rule.', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateLevelPricingPayload> }) =>
      adminApi.updateLevelPricing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-level-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing'] });
      showToast('Pricing rule updated successfully!', 'success');
      handleCloseModal();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to update pricing rule.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteLevelPricing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-level-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing'] });
      showToast('Pricing rule deleted successfully!', 'success');
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to delete pricing rule.', 'error');
    },
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      levelName: 'Year 11 (IGCSE)',
      stageCode: 'Y11',
      sessionFormat: 'PRIVATE',
      sessionsCount: 1,
      title: '1 Private Session - Year 11',
      price: 600,
      currency: 'EGP',
      description: 'Standard 1-to-1 session pricing',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: LevelSessionPricing) => {
    setEditingItem(item);
    setForm({
      levelName: item.levelName,
      stageCode: item.stageCode || '',
      sessionFormat: item.sessionFormat,
      sessionsCount: item.sessionsCount,
      title: item.title,
      price: Number(item.price),
      currency: item.currency || 'EGP',
      description: item.description || '',
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.levelName.trim() || form.price <= 0 || form.sessionsCount <= 0) {
      showToast('Please provide a valid title, level, price, and sessions count.', 'error');
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredPricing = pricingList.filter((item) => {
    const matchesFormat = selectedFormat === 'ALL' || item.sessionFormat === selectedFormat;
    const matchesLevel =
      selectedLevelFilter === 'ALL' ||
      item.levelName.toLowerCase().includes(selectedLevelFilter.toLowerCase()) ||
      (item.stageCode && item.stageCode.toLowerCase() === selectedLevelFilter.toLowerCase());
    return matchesFormat && matchesLevel;
  });

  // Unique levels from list for quick filtering
  const availableLevels = Array.from(new Set(pricingList.map((p) => p.levelName)));

  return (
    <div className="space-y-6">
      {/* Action / Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {(['ALL', 'PRIVATE', 'GROUP'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedFormat === fmt
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt === 'ALL' ? 'All Formats' : fmt === 'PRIVATE' ? 'Private 1-to-1' : 'Group'}
              </button>
            ))}
          </div>

          {/* Level Filter Dropdown */}
          <select
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Levels</option>
            {LEVEL_PRESETS.map((p) => (
              <option key={p.stageCode} value={p.levelName}>
                {p.levelName}
              </option>
            ))}
            {availableLevels.map(
              (lvl) =>
                !LEVEL_PRESETS.some((p) => p.levelName === lvl) && (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                )
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Level Price</span>
        </button>
      </div>

      {/* Pricing Table / Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading level session pricing...</div>
      ) : filteredPricing.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No session pricing rules found</p>
          <p className="text-xs text-slate-400 mt-1">
            Create pricing tiers for each academic level (Year 9, 10, 11, AS, A2) for 1 session or multi-session packages.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Rule</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Level &amp; Stage</th>
                <th className="py-3 px-4">Package Title</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Sessions</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Per Session</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPricing.map((item) => {
                const perSession = Math.round(Number(item.price) / (item.sessionsCount || 1));

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{item.levelName}</span>
                        {item.stageCode && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                            {item.stageCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <div>{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                          item.sessionFormat === 'PRIVATE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.sessionFormat === 'PRIVATE' ? '1-to-1' : 'Group'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {item.sessionsCount} {item.sessionsCount === 1 ? 'session' : 'sessions'}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      {Number(item.price).toLocaleString()} {item.currency}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-semibold">
                      ~{perSession.toLocaleString()} {item.currency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Pricing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Pricing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create or Edit Level Pricing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Level Session Pricing' : 'Add New Level Session Pricing'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* Level & Stage Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Level</label>
                  <input
                    type="text"
                    required
                    list="level-presets"
                    value={form.levelName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const preset = LEVEL_PRESETS.find((p) => p.levelName === val);
                      setForm({
                        ...form,
                        levelName: val,
                        stageCode: preset ? preset.stageCode : form.stageCode,
                      });
                    }}
                    placeholder="e.g. Year 11 (IGCSE)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                  <datalist id="level-presets">
                    {LEVEL_PRESETS.map((p) => (
                      <option key={p.stageCode} value={p.levelName} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stage Code (Optional)</label>
                  <input
                    type="text"
                    value={form.stageCode || ''}
                    onChange={(e) => setForm({ ...form, stageCode: e.target.value })}
                    placeholder="e.g. Y11, Y12"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 1 Private Session or 8-Session Master Pack"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Format & Sessions Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Format</label>
                  <select
                    value={form.sessionFormat}
                    onChange={(e) =>
                      setForm({ ...form, sessionFormat: e.target.value as 'PRIVATE' | 'GROUP' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="PRIVATE">Private (1-to-1)</option>
                    <option value="GROUP">Group</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sessions Count</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={form.sessionsCount}
                    onChange={(e) => setForm({ ...form, sessionsCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Package Price</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    value={form.currency || 'EGP'}
                    onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Notes or perks included in this tier..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pricing-active"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="pricing-active" className="font-semibold text-slate-700 cursor-pointer">
                  Rule is active and available for student checkout
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 font-semibold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {editingItem ? 'Save Changes' : 'Create Price Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-base mb-2">Delete Pricing Tier?</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Are you sure you want to delete this level pricing rule? Students will no longer be able to select this option. Existing payment records remain unaffected.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
