'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  Plus, Pencil, Trash2, Save, X, Star, Users, CreditCard,
  CheckCircle2, Sparkles, Tag, ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react';

interface LandingPlan {
  id: string;
  title: string;
  price: number;
  format: 'PRIVATE' | 'GROUP';
  sessionsCount: number;
  currency: string;
  groupNumber?: number;
  maxStudents?: number;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

const DEFAULT_PLAN: LandingPlan = {
  id: '',
  title: '',
  price: 0,
  format: 'PRIVATE',
  sessionsCount: 1,
  currency: 'EGP',
  groupNumber: undefined,
  maxStudents: undefined,
  description: '',
  features: [''],
  highlight: false,
  badge: '',
};

export function LandingPlansManager() {
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LandingPlan | null>(null);
  const [form, setForm] = useState<LandingPlan>(DEFAULT_PLAN);
  const [featuresText, setFeaturesText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminApi.getSettings,
  });

  const plans: LandingPlan[] = (settings as any)?.sessionPricing?.plans ?? [];

  const saveMutation = useMutation({
    mutationFn: (updatedPlans: LandingPlan[]) =>
      adminApi.updateSettings({ sessionPricing: { ...((settings as any)?.sessionPricing ?? {}), plans: updatedPlans } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-config'] });
      showToast('Plans updated successfully!', 'success');
      setIsModalOpen(false);
      setEditingPlan(null);
      setDeleteConfirmId(null);
    },
    onError: () => showToast('Failed to save plans.', 'error'),
  });

  const openAddModal = () => {
    const newId = `plan_${Date.now()}`;
    setForm({ ...DEFAULT_PLAN, id: newId });
    setFeaturesText('');
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: LandingPlan) => {
    setForm({ ...plan });
    setFeaturesText(plan.features.join('\n'));
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!form.title.trim()) { showToast('Plan title is required.', 'error'); return; }
    if (form.price < 0) { showToast('Price cannot be negative.', 'error'); return; }
    if (form.sessionsCount < 1) { showToast('Sessions count must be at least 1.', 'error'); return; }
    if (!form.description.trim()) { showToast('Description is required.', 'error'); return; }

    const parsedFeatures = featuresText.split('\n').map(f => f.trim()).filter(Boolean);
    if (parsedFeatures.length === 0) { showToast('At least one feature is required.', 'error'); return; }

    const finalPlan: LandingPlan = { ...form, features: parsedFeatures };

    let updatedPlans: LandingPlan[];
    if (editingPlan) {
      updatedPlans = plans.map(p => p.id === editingPlan.id ? finalPlan : p);
    } else {
      updatedPlans = [...plans, finalPlan];
    }
    saveMutation.mutate(updatedPlans);
  };

  const handleDelete = (id: string) => {
    const updatedPlans = plans.filter(p => p.id !== id);
    saveMutation.mutate(updatedPlans);
  };

  const handleToggleHighlight = (plan: LandingPlan) => {
    const updatedPlans = plans.map(p =>
      p.id === plan.id ? { ...p, highlight: !p.highlight } : p
    );
    saveMutation.mutate(updatedPlans);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Landing Page Plans</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage pricing plans shown on the public landing page</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Plan
        </button>
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
          <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No plans yet. Click &ldquo;Add Plan&rdquo; to create the first one.
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                plan.highlight
                  ? 'border-indigo-300 bg-indigo-50/60 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                plan.format === 'PRIVATE' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {plan.format === 'PRIVATE' ? <Sparkles className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 truncate">{plan.title}</span>
                  {plan.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">{plan.badge}</span>
                  )}
                  {plan.highlight && (
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">★ Featured</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{plan.currency} {plan.price.toLocaleString()}/session</span>
                  <span>·</span>
                  <span>{plan.sessionsCount} session{plan.sessionsCount !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span className={`font-medium ${
                    plan.format === 'PRIVATE' ? 'text-indigo-600' : 'text-emerald-600'
                  }`}>{plan.format === 'PRIVATE' ? '1-to-1' : 'Group'}</span>
                  {plan.maxStudents && <span>· max {plan.maxStudents} students</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggleHighlight(plan)}
                  title={plan.highlight ? 'Remove featured' : 'Mark as featured'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    plan.highlight
                      ? 'text-amber-500 hover:bg-amber-50'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  <Star className="w-4 h-4" fill={plan.highlight ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => openEditModal(plan)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {deleteConfirmId === plan.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(plan.id)}
                      disabled={saveMutation.isPending}
                      className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(plan.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-800">{editingPlan ? 'Edit Plan' : 'New Plan'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Plan Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. 1-to-1 Private Masterclass"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Format */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Format *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['PRIVATE', 'GROUP'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, format: fmt }))}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        form.format === fmt
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {fmt === 'PRIVATE' ? '🎯 Private 1-to-1' : '👥 Group Session'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Sessions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Price per Session *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{form.currency}</span>
                    <input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                      className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sessions Count *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.sessionsCount}
                    onChange={e => setForm(f => ({ ...f, sessionsCount: Number(e.target.value) }))}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="EGP">EGP (Egyptian Pound)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>

              {/* Group fields */}
              {form.format === 'GROUP' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Group Size (students)</label>
                    <input
                      type="number"
                      min={2}
                      placeholder="e.g. 7"
                      value={form.groupNumber ?? ''}
                      onChange={e => setForm(f => ({ ...f, groupNumber: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Max Students (capacity)</label>
                    <input
                      type="number"
                      min={2}
                      placeholder="e.g. 10"
                      value={form.maxStudents ?? ''}
                      onChange={e => setForm(f => ({ ...f, maxStudents: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description shown on the landing card"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Features */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Features (one per line) *</label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={e => setFeaturesText(e.target.value)}
                  placeholder={`Personalized curriculum\nDetailed session notes\nPast paper practice\nFlexible scheduling`}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Each line = one bullet point on the plan card</p>
              </div>

              {/* Badge & Highlight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Badge Label (optional)</label>
                  <input
                    type="text"
                    value={form.badge ?? ''}
                    onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                    placeholder="e.g. MOST POPULAR"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Featured / Highlight</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, highlight: !f.highlight }))}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      form.highlight
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {form.highlight ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {form.highlight ? 'Featured ON' : 'Not Featured'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                disabled={saveMutation.isPending}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saveMutation.isPending ? 'Saving...' : editingPlan ? 'Save Changes' : 'Add Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
