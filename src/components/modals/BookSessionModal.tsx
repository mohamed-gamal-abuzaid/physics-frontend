'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { publicApi } from '@/lib/api/public.api';
import {
  X, Calendar, Clock, BookOpen, Sparkles, CheckCircle2,
  Video, MapPin, AlertTriangle
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '04:00 PM - 05:00 PM',
  '06:00 PM - 07:00 PM',
  '08:00 PM - 09:00 PM',
];

export function BookSessionModal() {
  const { isBookSessionOpen, setIsBookSessionOpen, showToast, setIsTopUpOpen } = useUI();
  const { isAuthenticated, currentRole, user } = useAuth();
  const queryClient = useQueryClient();

  const [sessionFormat, setSessionFormat] = useState<'PRIVATE' | 'GROUP'>('PRIVATE');
  const [courseName, setCourseName] = useState('IGCSE Physics');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(TIME_SLOTS[2]);
  const [location, setLocation] = useState('ONLINE');
  const [notes, setNotes] = useState('');

  // Guest inquiry fields if not authenticated
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const studentBookingMutation = useMutation({
    mutationFn: studentApi.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      showToast('Session booked successfully! Awaiting instructor confirmation.', 'success');
      setIsBookSessionOpen(false);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to book session. Check your credit balance.', 'error');
    },
  });

  const publicInquiryMutation = useMutation({
    mutationFn: publicApi.bookSessionInquiry,
    onSuccess: () => {
      showToast('Booking inquiry submitted! Our team will contact you shortly.', 'success');
      setIsBookSessionOpen(false);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to submit inquiry.', 'error');
    },
  });

  if (!isBookSessionOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      if (!date) {
        showToast('Please select a date for your session.', 'error');
        return;
      }
      if (!time) {
        showToast('Please select a preferred time slot.', 'error');
        return;
      }
      studentBookingMutation.mutate({
        topic: topic.trim() || 'General Physics Revision',
        courseName,
        date,
        time,
        sessionFormat,
        location,
        notes,
        durationMinutes: 60,
      });
    } else {
      if (!name.trim()) {
        showToast('Please enter your full name.', 'error');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        showToast('Please enter a valid email address (e.g. name@example.com).', 'error');
        return;
      }
      if (!phone.trim()) {
        showToast('Please enter your contact phone number.', 'error');
        return;
      }
      publicInquiryMutation.mutate({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        sessionFormat,
        courseName,
      });
    }
  };

  const isPending = studentBookingMutation.isPending || publicInquiryMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Book Masterclass Session</h3>
                <p className="text-xs text-indigo-200">
                  {isAuthenticated ? 'Reserve a slot with Mr. Mohammed Sayed' : 'Submit a masterclass booking inquiry'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBookSessionOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isAuthenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 mb-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Omar Tarek"
                  className="mt-1 w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="omar@example.com"
                  className="mt-1 w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">WhatsApp / Phone</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="mt-1 w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Format selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Session Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSessionFormat('PRIVATE')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  sessionFormat === 'PRIVATE'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sessionFormat === 'PRIVATE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">1-on-1 Private Session</p>
                  <p className="text-[11px] text-slate-500">Dedicated personal tutoring</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSessionFormat('GROUP')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  sessionFormat === 'GROUP'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sessionFormat === 'GROUP' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Group Masterclass</p>
                  <p className="text-[11px] text-slate-500">Collaborative problem solving</p>
                </div>
              </button>
            </div>
          </div>

          {/* Course & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Curriculum</label>
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="IGCSE Physics (0625)">IGCSE Physics (0625 / 0972)</option>
                <option value="Cambridge AS & A-Level Physics (9702)">Cambridge AS & A-Level Physics (9702)</option>
                <option value="Edexcel International A-Level (IAL)">Edexcel International A-Level (IAL)</option>
                <option value="AP Physics 1 / C Mechanics">AP Physics 1 / C Mechanics</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Specific Topic or Paper</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Electromagnetism & Lenz's Law"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Time Slot</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Specific Questions or Focus Area (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please focus on past paper questions from May/June 2024 paper 42..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookSessionOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
