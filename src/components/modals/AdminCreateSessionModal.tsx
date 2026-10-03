'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  X, Calendar, Users, Sparkles, Save,
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '04:00 PM - 05:00 PM',
  '06:00 PM - 07:00 PM',
  '08:00 PM - 09:00 PM',
];

export function AdminCreateSessionModal() {
  const { isAdminCreateSessionOpen, setIsAdminCreateSessionOpen, showToast } = useUI();
  const queryClient = useQueryClient();

  const [sessionFormat, setSessionFormat] = useState<'PRIVATE' | 'GROUP'>('GROUP');
  const [courseName, setCourseName] = useState('IGCSE Physics (0625)');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState(TIME_SLOTS[3]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [location, setLocation] = useState('ONLINE');
  const [meetingLink, setMeetingLink] = useState('');
  const [maxStudents, setMaxStudents] = useState(10);
  const [studentId, setStudentId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: students } = useQuery({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
    enabled: isAdminCreateSessionOpen && sessionFormat === 'PRIVATE',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      showToast('Session created successfully!', 'success');
      setIsAdminCreateSessionOpen(false);
      setTopic('');
      setMeetingLink('');
      setNotes('');
      setStudentId('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create session.';
      if (msg.startsWith('TIME_CONFLICT:')) {
        showToast('⏰ Time conflict: you already have a session at that date & time.', 'error');
      } else {
        showToast(msg, 'error');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) { showToast('Please enter a topic.', 'error'); return; }
    if (!date) { showToast('Please select a date.', 'error'); return; }
    if (sessionFormat === 'GROUP' && maxStudents < 2) {
      showToast('Max students must be at least 2 for group sessions.', 'error'); return;
    }
    if (sessionFormat === 'PRIVATE' && !studentId) {
      showToast('Please select a student for a private session.', 'error'); return;
    }

    createMutation.mutate({
      courseName,
      topic: topic.trim(),
      sessionFormat,
      date,
      time,
      durationMinutes,
      location,
      ...(meetingLink && { meetingLink }),
      ...(sessionFormat === 'GROUP' && { maxStudents }),
      ...(sessionFormat === 'PRIVATE' && studentId && { studentId: Number(studentId) }),
      ...(notes && { notes }),
      status: 'SCHEDULED',
    });
  };

  if (!isAdminCreateSessionOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={() => setIsAdminCreateSessionOpen(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Create Session Slot</h3>
                <p className="text-xs text-indigo-200">Add a new available session to your schedule</p>
              </div>
            </div>
            <button
              onClick={() => setIsAdminCreateSessionOpen(false)}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-600/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Format */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Session Format</label>
            <div className="grid grid-cols-2 gap-3">
              {(['GROUP', 'PRIVATE'] as const).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSessionFormat(fmt)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    sessionFormat === fmt
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    sessionFormat === fmt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {fmt === 'GROUP' ? <Users className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{fmt === 'GROUP' ? 'Group Masterclass' : 'Private 1-to-1'}</p>
                    <p className="text-[11px] text-slate-500">{fmt === 'GROUP' ? 'Multiple students' : 'One student only'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Course & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Course</label>
              <select
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option>IGCSE Physics (0625)</option>
                <option>Cambridge AS &amp; A-Level Physics (9702)</option>
                <option>Edexcel IAL Physics</option>
                <option>AP Physics</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Topic *</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Electromagnetism"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Date *</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Time Slot *</label>
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Duration & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Duration (minutes)</label>
              <input
                type="number"
                min={30}
                max={180}
                step={15}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="ONLINE">🌐 Online (Zoom/Meet)</option>
                <option value="LAB_ROOM_A">🔬 Lab Room A</option>
                <option value="QUANTUM_HALL_B">⚛️ Quantum Hall B</option>
              </select>
            </div>
          </div>

          {/* Group capacity */}
          {sessionFormat === 'GROUP' && (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Max Students (Group Capacity)</label>
              <input
                type="number"
                min={2}
                max={50}
                value={maxStudents}
                onChange={e => setMaxStudents(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Students won't be able to join once capacity is reached</p>
            </div>
          )}

          {/* Student selector for private */}
          {sessionFormat === 'PRIVATE' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assign Student *</label>
              <select
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Select student --</option>
                {(students ?? []).map((s: any) => (
                  <option key={s.id} value={s.userId ?? s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Meeting link */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Meeting Link (optional)</label>
            <input
              type="url"
              value={meetingLink}
              onChange={e => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional info..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdminCreateSessionOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {createMutation.isPending ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
