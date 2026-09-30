'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { studentApi } from '@/lib/api/student.api';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import {
  Video, Copy, Check, ExternalLink, Edit2, Save,
  X, Search, ShieldCheck, Sparkles, AlertCircle
} from 'lucide-react';
import type { StudentProfile } from '@/lib/types';

export function MeetingLinksView() {
  const { currentRole } = useAuth();
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const isAdmin = currentRole === 'admin';
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Admin query
  const { data: students = [], isLoading: loadingStudents } = useQuery<StudentProfile[]>({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
    enabled: isAdmin,
  });

  // Student query
  const { data: profile, isLoading: loadingProfile } = useQuery<StudentProfile>({
    queryKey: ['student-profile'],
    queryFn: studentApi.getProfile,
    enabled: !isAdmin,
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, link }: { id: number; link: string }) =>
      adminApi.assignScholar(id, { meetingLink: link }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      showToast('Meeting link saved successfully!', 'success');
      setEditingStudentId(null);
    },
    onError: () => showToast('Failed to save meeting link.', 'error'),
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.cohort && s.cohort.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {isAdmin ? 'Lecture Links Directory' : 'My Dedicated Lecture Room'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isAdmin
            ? 'Manage permanent Google Meet and Zoom classroom links for each enrolled scholar'
            : 'Access your 1-on-1 private tutoring and group masterclass interactive video room'}
        </p>
      </div>

      {isAdmin ? (
        /* ADMIN DIRECTORY */
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholar or cohort..."
              className="w-full text-xs px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Scholar</th>
                  <th className="py-3.5 px-4">Cohort</th>
                  <th className="py-3.5 px-4">Classroom Video Link</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const isEditing = editingStudentId === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400">{s.email}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {s.cohort || 'General'}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="url"
                              value={linkInput}
                              onChange={(e) => setLinkInput(e.target.value)}
                              placeholder="https://meet.google.com/..."
                              className="w-full text-xs p-1.5 border border-indigo-300 rounded-lg focus:outline-none bg-white"
                            />
                            <button
                              onClick={() => updateLinkMutation.mutate({ id: s.id, link: linkInput })}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : s.meetingLink ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-600 truncate max-w-[220px]">
                              {s.meetingLink}
                            </span>
                            <button
                              onClick={() => handleCopy(s.meetingLink!, `link-${s.id}`)}
                              className="text-slate-400 hover:text-slate-700"
                            >
                              {copiedId === `link-${s.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No link assigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.meetingLink && (
                            <a
                              href={s.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-slate-200"
                              title="Open Room"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEditingStudentId(s.id);
                              setLinkInput(s.meetingLink || 'https://meet.google.com/');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
                            title="Edit Link"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* STUDENT VIEW */
        <div className="max-w-xl mx-auto space-y-6 pt-4">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl text-center border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <Video className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl font-bold text-white mb-1">Interactive Classroom Room</h2>
            <p className="text-xs text-indigo-200 max-w-sm mx-auto mb-6">
              Connect directly with Mr. Mohammed Sayed. Please join 2 minutes prior to your scheduled lesson.
            </p>

            {profile?.meetingLink ? (
              <div className="space-y-4">
                <div className="p-3 bg-white/10 rounded-xl border border-white/20 flex items-center justify-between text-xs font-mono">
                  <span className="truncate max-w-[280px] text-indigo-200">{profile.meetingLink}</span>
                  <button
                    onClick={() => handleCopy(profile.meetingLink!, 'my-link')}
                    className="flex items-center gap-1 px-3 py-1 bg-white text-indigo-950 font-bold rounded-lg hover:bg-indigo-50"
                  >
                    {copiedId === 'my-link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'my-link' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <a
                  href={profile.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Video className="w-4 h-4" /> Enter Live Lecture Room
                </a>
              </div>
            ) : (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-indigo-200">
                Your permanent meeting room link is currently being configured by your instructor. It will appear here once assigned.
              </div>
            )}
          </div>

          {/* Quick tips */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 text-xs text-slate-600">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Masterclass Preparation Tips
            </h3>
            <ul className="space-y-2 list-disc list-inside text-slate-600 leading-relaxed">
              <li>Ensure your stylus / tablet is connected for digital whiteboard derivation work.</li>
              <li>Have your scientific calculator, Formula Sheet, and past papers ready.</li>
              <li>A quiet room with high-speed internet provides the optimal physics learning experience.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
