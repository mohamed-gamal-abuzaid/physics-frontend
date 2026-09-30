'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { X, Headphones, Send, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Academic Question',
  'Billing & Package',
  'Schedule Change',
  'Technical Issue',
];

const PRIORITIES = [
  { id: 'LOW', label: 'Low', color: 'text-slate-600 bg-slate-100' },
  { id: 'MEDIUM', label: 'Medium', color: 'text-indigo-600 bg-indigo-50' },
  { id: 'HIGH', label: 'High', color: 'text-amber-600 bg-amber-50' },
  { id: 'URGENT', label: 'Urgent', color: 'text-rose-600 bg-rose-50' },
];

export function NewTicketModal() {
  const { isNewTicketOpen, setIsNewTicketOpen, showToast } = useUI();
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');

  const ticketMutation = useMutation({
    mutationFn: studentApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      showToast('Support inquiry ticket submitted! We will respond promptly.', 'success');
      setIsNewTicketOpen(false);
      setSubject('');
      setMessage('');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to open ticket.', 'error');
    },
  });

  if (!isNewTicketOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ticketMutation.mutate({
      subject,
      category,
      priority,
      message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Open Support Ticket</h3>
              <p className="text-xs text-slate-400">Direct inquiry to Mr. Mohammed Sayed & Academic Support</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewTicketOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
            <input
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Question regarding electromagnetic induction homework..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Inquiry Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide all details, question references, or relevant dates..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewTicketOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={ticketMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {ticketMutation.isPending ? 'Sending...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
