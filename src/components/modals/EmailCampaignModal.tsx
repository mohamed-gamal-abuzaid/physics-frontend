'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { X, Mail, Send, Sparkles, Users } from 'lucide-react';

const AUDIENCES = [
  'All Students',
  'All Parents',
  'Trial Leads',
  'Everyone',
];

export function EmailCampaignModal() {
  const { isEmailCampaignOpen, setIsEmailCampaignOpen, showToast } = useUI();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [targetAudience, setTargetAudience] = useState<any>('All Students');
  const [body, setBody] = useState('');
  const [sendImmediately, setSendImmediately] = useState(true);

  const campaignMutation = useMutation({
    mutationFn: async () => {
      const created = await adminApi.createCampaign({
        title,
        subject,
        targetAudience,
        previewSnippet: body.slice(0, 100),
      });
      if (sendImmediately && created?.id) {
        await adminApi.sendCampaign(created.id);
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-outbox'] });
      showToast(sendImmediately ? 'Email campaign dispatched to scholars!' : 'Campaign saved as draft.', 'success');
      setIsEmailCampaignOpen(false);
      setTitle('');
      setSubject('');
      setBody('');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to dispatch campaign.', 'error');
    },
  });

  if (!isEmailCampaignOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    campaignMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Broadcast Email Campaign</h3>
              <p className="text-xs text-slate-400">Dispatch announcements, exam tips, or schedule notices</p>
            </div>
          </div>
          <button
            onClick={() => setIsEmailCampaignOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Campaign Internal Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. May/June 2025 Crash Course Announcement"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Subject Line</label>
            <input
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. 📢 Important Update: AS-Level Mechanics Workshop Schedule"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Body Content</label>
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Dear Scholars and Guardians,&#10;&#10;We are pleased to announce our intensive revision program..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={sendImmediately}
              onChange={(e) => setSendImmediately(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700">Dispatch outbox emails immediately</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEmailCampaignOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={campaignMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {campaignMutation.isPending ? 'Processing...' : sendImmediately ? 'Send Broadcast' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
