'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  MessageSquare, CheckCircle2, XCircle, Trash2, Edit2,
  Save, X, Star, Filter, Sparkles, AlertCircle
} from 'lucide-react';
import type { Review } from '@/lib/types';

export function AdminReviewsManager() {
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'approved' | 'rejected'>('ALL');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['admin-reviews'],
    queryFn: adminApi.getReviews,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Review> }) =>
      adminApi.moderateReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
      showToast(`Review marked as ${variables.data.status || 'updated'}!`, 'success');
      setEditingReviewId(null);
    },
    onError: () => showToast('Failed to update review status.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
      showToast('Review removed.', 'info');
    },
    onError: () => showToast('Failed to delete review.', 'error'),
  });

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Student Reviews & Testimonials Manager</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Moderate scholar testimonials before publishing them to the public landing page showcase
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {(['ALL', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
              statusFilter === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Reviews' : `${tab} (${reviews.filter((r) => r.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredReviews.map((rev) => {
            const isEditing = editingReviewId === rev.id;
            return (
              <div key={rev.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rev.name}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {rev.cohort}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          rev.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Submitted: {new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => moderateMutation.mutate({ id: rev.id, data: { status: 'approved' } })}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}

                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => moderateMutation.mutate({ id: rev.id, data: { status: 'rejected' } })}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingReviewId(rev.id);
                        setEditedContent(rev.content);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200"
                      title="Edit Text"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Permanently delete this testimonial?')) {
                          deleteMutation.mutate(rev.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={3}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-indigo-300 focus:outline-none bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          moderateMutation.mutate({
                            id: rev.id,
                            data: { content: editedContent },
                          })
                        }
                        className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed italic">
                    &ldquo;{rev.content}&rdquo;
                  </p>
                )}
              </div>
            );
          })}

          {filteredReviews.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No reviews found under the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
