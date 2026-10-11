'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  Tag, Plus, Edit2, Trash2, CheckCircle2,
  AlertCircle, Save, X, Percent, DollarSign, Calendar, Users, GraduationCap, User
} from 'lucide-react';
import type { Discount, CreateDiscountPayload, StudentProfile } from '@/lib/types';

const LEVEL_PRESETS = [
  'Year 9',
  'Year 10',
  'Year 11 (IGCSE)',
  'Year 12 (AS-Level)',
  'Year 13 (A2-Level)',
  'College / University',
];

export function DiscountsManager() {
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [scopeFilter, setScopeFilter] = useState<'ALL_SCOPES' | 'ALL' | 'LEVEL' | 'STUDENT'>('ALL_SCOPES');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Discount | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [form, setForm] = useState<CreateDiscountPayload>({
    code: '',
    title: '',
    description: '',
    scope: 'ALL',
    targetLevel: '',
    targetStudentId: undefined,
    discountType: 'PERCENTAGE',
    value: 10,
    minSessionsCount: 1,
    maxUsageCount: undefined,
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  // Query discounts
  const {
    data: discounts = [],
    isLoading,
  } = useQuery<Discount[]>({
    queryKey: ['admin-discounts'],
    queryFn: () => adminApi.getDiscounts(),
  });

  // Query students for the student-specific dropdown
  const { data: students = [] } = useQuery<StudentProfile[]>({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDiscountPayload) => adminApi.createDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing'] });
      showToast('Discount promo created successfully!', 'success');
      handleCloseModal();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to create discount.', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateDiscountPayload> }) =>
      adminApi.updateDiscount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing'] });
      showToast('Discount updated successfully!', 'success');
      handleCloseModal();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to update discount.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing'] });
      showToast('Discount deleted successfully!', 'success');
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to delete discount.', 'error');
    },
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      code: '',
      title: '',
      description: '',
      scope: 'ALL',
      targetLevel: '',
      targetStudentId: undefined,
      discountType: 'PERCENTAGE',
      value: 10,
      minSessionsCount: 1,
      maxUsageCount: undefined,
      validFrom: '',
      validUntil: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Discount) => {
    setEditingItem(item);
    setForm({
      code: item.code,
      title: item.title,
      description: item.description || '',
      scope: item.scope,
      targetLevel: item.targetLevel || '',
      targetStudentId: item.targetStudentId || undefined,
      discountType: item.discountType,
      value: Number(item.value),
      minSessionsCount: item.minSessionsCount || 1,
      maxUsageCount: item.maxUsageCount || undefined,
      validFrom: item.validFrom ? item.validFrom.split('T')[0] : '',
      validUntil: item.validUntil ? item.validUntil.split('T')[0] : '',
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
    if (!form.code.trim() || !form.title.trim() || form.value <= 0) {
      showToast('Please provide a coupon code, title, and valid positive discount value.', 'error');
      return;
    }
    if (form.scope === 'LEVEL' && !form.targetLevel?.trim()) {
      showToast('Please specify target level for level-based discount.', 'error');
      return;
    }
    if (form.scope === 'STUDENT' && !form.targetStudentId) {
      showToast('Please select target student for student-specific discount.', 'error');
      return;
    }

    const payload: CreateDiscountPayload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredDiscounts = discounts.filter((d) => {
    if (scopeFilter === 'ALL_SCOPES') return true;
    return d.scope === scopeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Action / Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          {(
            [
              { id: 'ALL_SCOPES', label: 'All Discounts' },
              { id: 'ALL', label: 'All Students' },
              { id: 'LEVEL', label: 'By Level' },
              { id: 'STUDENT', label: 'By Student' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setScopeFilter(t.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                scopeFilter === t.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Discount / Promo</span>
        </button>
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading discount promotions...</div>
      ) : filteredDiscounts.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No discounts found</p>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional codes or discounts targeting all students, a specific level, or a single student.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Discount</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Title &amp; Note</th>
                <th className="py-3 px-4">Target Scope</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Usage &amp; Min</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDiscounts.map((item) => {
                const isStudent = item.scope === 'STUDENT';
                const isLevel = item.scope === 'LEVEL';
                const targetStudent = isStudent
                  ? students.find((s) => s.userId === item.targetStudentId || s.id === item.targetStudentId)
                  : null;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md text-xs">
                        {item.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.scope === 'ALL' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px]">
                          <Users className="w-3 h-3" />
                          <span>All Students</span>
                        </span>
                      )}
                      {isLevel && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                          <GraduationCap className="w-3 h-3" />
                          <span>Level: {item.targetLevel}</span>
                        </span>
                      )}
                      {isStudent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                          <User className="w-3 h-3" />
                          <span>
                            {targetStudent ? targetStudent.name : `Student #${item.targetStudentId}`}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      {item.discountType === 'PERCENTAGE' ? (
                        <span className="text-emerald-600">{Number(item.value)}% OFF</span>
                      ) : (
                        <span className="text-emerald-600">-{Number(item.value).toLocaleString()} EGP</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>
                        {item.currentUsageCount || 0}
                        {item.maxUsageCount ? ` / ${item.maxUsageCount}` : ' uses'}
                      </div>
                      {item.minSessionsCount && item.minSessionsCount > 1 && (
                        <div className="text-[10px] text-slate-400">Min: {item.minSessionsCount} sessions</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {item.validUntil ? (
                        <span>Until {new Date(item.validUntil).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-slate-400">No expiration</span>
                      )}
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
                          title="Edit Discount"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Discount"
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

      {/* Modal: Create or Edit Discount */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Edit Discount / Promo' : 'Create New Discount / Promo'}
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
              {/* Scope Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount Target Scope</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'ALL', label: 'All Students' },
                      { id: 'LEVEL', label: 'By Level' },
                      { id: 'STUDENT', label: 'Specific Student' },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm({ ...form, scope: s.id })}
                      className={`py-2 px-2 text-center rounded-xl border font-bold transition-all ${
                        form.scope === s.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope specific inputs */}
              {form.scope === 'LEVEL' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Academic Level</label>
                  <input
                    type="text"
                    required
                    list="discount-level-presets"
                    value={form.targetLevel || ''}
                    onChange={(e) => setForm({ ...form, targetLevel: e.target.value })}
                    placeholder="e.g. Year 11 (IGCSE)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                  <datalist id="discount-level-presets">
                    {LEVEL_PRESETS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Will apply automatically to students whose enrolled year/level matches this string.
                  </p>
                </div>
              )}

              {form.scope === 'STUDENT' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                  <select
                    required
                    value={form.targetStudentId || ''}
                    onChange={(e) =>
                      setForm({ ...form, targetStudentId: parseInt(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="">-- Choose student --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.userId || st.id}>
                        {st.name} ({st.email}) - {st.year || 'No level'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Code & Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. EARLYBIRD20"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Promo Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. 20% Spring Term Discount"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FIXED">Fixed Amount (EGP Off)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Value {form.discountType === 'PERCENTAGE' ? '(%)' : '(EGP)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={form.discountType === 'PERCENTAGE' ? 100 : 100000}
                    required
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              {/* Min Sessions & Max Usage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Sessions Required</label>
                  <input
                    type="number"
                    min={1}
                    value={form.minSessionsCount || 1}
                    onChange={(e) =>
                      setForm({ ...form, minSessionsCount: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Redemptions (Optional)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxUsageCount || ''}
                    onChange={(e) =>
                      setForm({ ...form, maxUsageCount: parseInt(e.target.value) || undefined })
                    }
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valid From (Optional)</label>
                  <input
                    type="date"
                    value={form.validFrom || ''}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valid Until (Optional)</label>
                  <input
                    type="date"
                    value={form.validUntil || ''}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Note (Optional)</label>
                <textarea
                  rows={2}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Notes for why this discount was granted..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="discount-active"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="discount-active" className="font-semibold text-slate-700 cursor-pointer">
                  Promo code is active and redeemable by students
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
                  {editingItem ? 'Save Changes' : 'Create Discount'}
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
            <h4 className="font-bold text-slate-900 text-base mb-2">Delete Discount Promo?</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Are you sure you want to delete this discount? Students will no longer be able to redeem this code. Past payments remain archived.
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
