'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { studentApi } from '@/lib/api/student.api';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import {
  GraduationCap, FileText, UploadCloud, CheckCircle2, Clock, Search,
  Download, Eye, Star, Award, Filter, Plus, FileCheck2, BookOpen,
  Calendar, User, Users, ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';
import type { HomeworkAssignment, HomeworkSubmission, ResourceItem, BookingSession } from '@/lib/types';

export function AcademicHubView() {
  const { currentRole } = useAuth();
  const {
    setIsSubmitHwOpen,
    setActiveAssignmentForSubmit,
    setIsGradingOpen,
    setActiveSubmissionForGrade,
    setIsResourcePreviewOpen,
    setActiveResource,
    setIsSessionNotesOpen,
    setActiveSessionForNotes,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const isAdmin = currentRole === 'admin';
  const [activeSubTab, setActiveSubTab] = useState<'assignments' | 'session_notes' | 'grading' | 'resources'>('assignments');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceCategory, setResourceCategory] = useState('ALL');

  // Queries
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery<HomeworkAssignment[]>({
    queryKey: isAdmin ? ['admin-assignments'] : ['student-assignments'],
    queryFn: isAdmin ? adminApi.getAssignments : studentApi.getAssignments,
  });

  const { data: submissions = [] } = useQuery<HomeworkSubmission[]>({
    queryKey: isAdmin ? ['admin-submissions'] : ['student-submissions'],
    queryFn: isAdmin ? adminApi.getSubmissions : studentApi.getSubmissions,
  });

  const { data: sessions = [] } = useQuery<BookingSession[]>({
    queryKey: isAdmin ? ['admin-sessions'] : ['student-sessions'],
    queryFn: isAdmin ? adminApi.getSessions : studentApi.getSessions,
  });

  const { data: resources = [] } = useQuery<ResourceItem[]>({
    queryKey: ['resources'],
    queryFn: () => studentApi.getResources(),
  });

  const downloadMutation = useMutation({
    mutationFn: (id: number) => studentApi.downloadResource(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      showToast('Downloading learning resource...', 'success');
      if (data?.fileUrl) window.open(data.fileUrl, '_blank');
    },
    onError: () => showToast('Failed to download file.', 'error'),
  });

  const completedSessionsWithNotes = sessions.filter(
    (s) => s.status === 'COMPLETED' || (s.sessionNotes && s.sessionNotes.summaryNotes)
  );

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      res.topic.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      res.course.toLowerCase().includes(resourceSearch.toLowerCase());
    const matchesCat = resourceCategory === 'ALL' || res.category === resourceCategory;
    return matchesSearch && matchesCat;
  });

  const RESOURCE_CATEGORIES = [
    'ALL',
    'Lecture Notes',
    'Formula Sheet',
    'Lab Manual',
    'Exam Solutions',
    'Video Masterclass',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Academic Hub & Learning Portal</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Homework assignments, digital lecture notes, gradebook evaluations, and formula sheets
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'assignments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Homework Worksheets ({assignments.length})
        </button>

        <button
          onClick={() => setActiveSubTab('session_notes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'session_notes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Masterclass Notes ({completedSessionsWithNotes.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('grading')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'grading'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" /> Evaluation Desk ({submissions.length})
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('resources')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'resources'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Resource Library ({resources.length})
        </button>
      </div>

      {/* SUBTAB 1: ASSIGNMENTS */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => {
              const studentSubmission = submissions.find((sub) => sub.assignmentId === assignment.id);
              const isSubmitted = !!studentSubmission;

              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {assignment.course}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {assignment.totalPoints} Marks
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-1">{assignment.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{assignment.description}</p>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Module:</span>
                        <span className="font-semibold text-slate-800">{assignment.module}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Due Date:</span>
                        <span className="font-semibold text-rose-600">{assignment.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {isSubmitted ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submitted {studentSubmission.score ? `(${studentSubmission.score}%)` : '· Pending Grade'}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveAssignmentForSubmit(assignment);
                          setIsSubmitHwOpen(true);
                        }}
                        className="w-full py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <UploadCloud className="w-4 h-4" /> Submit Solution
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {assignments.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No active homework worksheets</p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SESSION NOTES */}
      {activeSubTab === 'session_notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedSessionsWithNotes.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Masterclass Notes
                  </span>
                  <span className="text-[11px] text-slate-400 ml-auto">{session.date}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1">{session.topic}</h3>
                <p className="text-xs text-indigo-600 font-medium mb-3">{session.courseName}</p>

                <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 mb-3">
                  {session.sessionNotes?.summaryNotes || session.notes || 'Digital whiteboard lecture notes available.'}
                </p>

                {session.sessionNotes?.keyConcepts && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {session.sessionNotes.keyConcepts.slice(0, 3).map((c, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveSessionForNotes(session);
                  setIsSessionNotesOpen(true);
                }}
                className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Read Full Notes & Whiteboard
              </button>
            </div>
          ))}

          {completedSessionsWithNotes.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No session notes recorded yet</p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: GRADING (ADMIN ONLY) */}
      {isAdmin && activeSubTab === 'grading' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Student Homework Submissions</h3>
            <span className="text-xs text-slate-500 font-medium">{submissions.length} Total Submissions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{sub.assignmentTitle}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'GRADED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scholar: <strong className="text-slate-700">{sub.studentName}</strong> · Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                  {sub.score && (
                    <p className="text-xs text-indigo-600 font-bold mt-1">
                      Awarded: {sub.score}% (Grade {sub.letterGrade})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveSubmissionForGrade(sub);
                      setIsGradingOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" /> {sub.status === 'GRADED' ? 'Edit Evaluation' : 'Grade Submission'}
                  </button>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs">
                No submissions waiting for evaluation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: RESOURCE LIBRARY */}
      {activeSubTab === 'resources' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                placeholder="Search formula sheets, past papers, notes..."
                className="w-full text-xs px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {RESOURCE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setResourceCategory(cat)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                    resourceCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {res.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{res.fileSize} · {res.fileFormat}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mb-1">{res.title}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mb-2">{res.course} · {res.topic}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{res.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveResource(res);
                      setIsResourcePreviewOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    disabled={downloadMutation.isPending}
                    onClick={() => downloadMutation.mutate(res.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No resources found matching your filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
