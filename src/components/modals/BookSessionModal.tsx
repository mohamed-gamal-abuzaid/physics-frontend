'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { publicApi } from '@/lib/api/public.api';
import {
  X, Calendar, Clock, BookOpen, Sparkles, CheckCircle2,
  Video, MapPin, AlertTriangle, Users, RefreshCw, Loader2,
  ChevronRight
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
  const { isAuthenticated, currentRole } = useAuth();
  const queryClient = useQueryClient();

  const [sessionFormat, setSessionFormat] = useState<'PRIVATE' | 'GROUP'>('GROUP');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState('IGCSE Physics');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(TIME_SLOTS[3]);
  const [location, setLocation] = useState('ONLINE');
  const [notes, setNotes] = useState('');

  // Guest fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch available slots (only when modal is open and user is authenticated)
  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } = useQuery({
    queryKey: ['available-slots'],
    queryFn: studentApi.getAvailableSlots,
    enabled: isBookSessionOpen && isAuthenticated,
    staleTime: 30_000,
  });

  const availableGroups = slotsData?.availableGroups ?? [];
  const bookedSlots = slotsData?.bookedSlots ?? [];

  const isTimeSlotBooked = (checkDate: string, checkTime: string) => {
    return bookedSlots.some(s => s.date === checkDate && s.time === checkTime);
  };

  const studentBookingMutation = useMutation({
    mutationFn: studentApi.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      showToast('Session booked successfully! Awaiting instructor confirmation.', 'success');
      setIsBookSessionOpen(false);
      setSelectedGroupId(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || '';
      if (msg.startsWith('TIME_CONFLICT:')) {
        showToast('⏰ That time slot is already taken. Please choose a different time.', 'error');
      } else if (msg.startsWith('GROUP_CAPACITY_REACHED:')) {
        showToast('🚫 This group is now full. Please select a different session.', 'error');
        queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      } else if (msg.toLowerCase().includes('credit')) {
        showToast('💳 Insufficient credits. Please top up your account.', 'error');
        setTimeout(() => setIsTopUpOpen(true), 500);
      } else {
        showToast(msg || 'Failed to book session. Please try again.', 'error');
      }
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
      if (sessionFormat === 'GROUP') {
        if (!selectedGroupId) {
          showToast('Please select a group session to join.', 'error');
          return;
        }
        studentBookingMutation.mutate({
          existingSessionId: selectedGroupId,
          sessionFormat: 'GROUP',
        });
      } else {
        // PRIVATE
        if (!date) { showToast('Please select a date.', 'error'); return; }
        if (!time) { showToast('Please select a time slot.', 'error'); return; }
        if (isTimeSlotBooked(date, time)) {
          showToast('⏰ That time slot is already booked. Please choose a different time.', 'error');
          return;
        }
        studentBookingMutation.mutate({
          topic: topic.trim() || 'General Physics Revision',
          courseName,
          date,
          time,
          sessionFormat: 'PRIVATE',
          location,
          notes,
          durationMinutes: 60,
        });
      }
    } else {
      if (!name.trim()) { showToast('Please enter your full name.', 'error'); return; }
      if (!email.trim() || !email.includes('@')) { showToast('Please enter a valid email address.', 'error'); return; }
      if (!phone.trim()) { showToast('Please enter your contact phone number.', 'error'); return; }
      publicInquiryMutation.mutate({ name: name.trim(), email: email.trim(), phone: phone.trim(), sessionFormat, courseName });
    }
  };

  const isPending = studentBookingMutation.isPending || publicInquiryMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Book Masterclass Session</h3>
                <p className="text-xs text-indigo-200">
                  {isAuthenticated ? 'Choose a session format and slot' : 'Submit a masterclass booking inquiry'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsBookSessionOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Guest fields */}
          {!isAuthenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Omar Tarek" className="mt-1 w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="omar@example.com" className="mt-1 w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">WhatsApp / Phone</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01012345678" className="mt-1 w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          )}

          {/* Format selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Session Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setSessionFormat('GROUP'); setSelectedGroupId(null); }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  sessionFormat === 'GROUP'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sessionFormat === 'GROUP' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Group Masterclass</p>
                  <p className="text-[11px] text-slate-500">Join an existing group</p>
                </div>
              </button>
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
                  <p className="text-xs font-bold leading-tight">1-on-1 Private</p>
                  <p className="text-[11px] text-slate-500">Dedicated personal tutoring</p>
                </div>
              </button>
            </div>
          </div>

          {/* GROUP: show available group sessions */}
          {isAuthenticated && sessionFormat === 'GROUP' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">Available Group Sessions</label>
                <button type="button" onClick={() => refetchSlots()} className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  <span className="ml-2 text-xs text-slate-500">Loading available sessions...</span>
                </div>
              ) : availableGroups.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">No group sessions available</p>
                  <p className="text-xs text-slate-400 mt-1">The instructor hasn't opened any group slots yet.</p>
                  <p className="text-xs text-indigo-600 mt-2 cursor-pointer" onClick={() => setSessionFormat('PRIVATE')}>Try booking a private session →</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {availableGroups.map((group: any) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        selectedGroupId === group.id
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedGroupId === group.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">{group.topic}</span>
                          {selectedGroupId === group.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{group.courseName}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            <Calendar className="w-3 h-3" /> {group.date}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> {group.time}
                          </span>
                          <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            group.spotsLeft <= 2
                              ? 'bg-rose-100 text-rose-700'
                              : group.spotsLeft <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <Users className="w-3 h-3" />
                            {group.enrolledCount}/{group.maxStudents} • {group.spotsLeft} spot{group.spotsLeft !== 1 ? 's' : ''} left
                          </span>
                          {group.location && (
                            <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              <MapPin className="w-3 h-3" /> {group.location === 'ONLINE' ? 'Online' : group.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRIVATE: course, topic, date, time */}
          {(sessionFormat === 'PRIVATE' || !isAuthenticated) && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Curriculum</label>
                  <select value={courseName} onChange={e => setCourseName(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option>IGCSE Physics (0625)</option>
                    <option>Cambridge AS &amp; A-Level Physics (9702)</option>
                    <option>Edexcel International A-Level (IAL)</option>
                    <option>AP Physics 1 / C Mechanics</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Topic or Paper</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Electromagnetism" className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {isAuthenticated && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setDate(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Time Slot</label>
                    <div className="space-y-1">
                      {TIME_SLOTS.map((slot) => {
                        const isBooked = isTimeSlotBooked(date, slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => !isBooked && setTime(slot)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all ${
                              isBooked
                                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                                : time === slot
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-semibold ring-1 ring-indigo-500'
                                : 'border-slate-200 hover:border-indigo-300 text-slate-600'
                            }`}
                          >
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {slot}</span>
                            {isBooked && <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Taken</span>}
                            {time === slot && !isBooked && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Focus Area (Optional)</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Please focus on past paper questions from May/June 2024..." className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsBookSessionOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? 'Confirming...' : sessionFormat === 'GROUP' ? 'Join Group Session' : 'Request Private Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
