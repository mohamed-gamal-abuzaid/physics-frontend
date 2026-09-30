'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  Users,
  Search,
  Filter,
  Eye,
  Calendar,
  Phone,
  Mail,
  School,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Save,
  Clock,
  Video,
  Award,
  Layers,
  ArrowUpDown,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type { StudentProfile, BookingSession } from '@/lib/types';

export const YEAR_OPTIONS_LIST = [
  { value: 'Y9', label: 'Y9' },
  { value: 'Y10', label: 'Y10' },
  { value: 'Y11', label: 'Y11' },
  { value: 'Y12', label: 'Y12' },
  { value: 'ELSE', label: 'Else' },
] as const;

export const BOARD_OPTIONS_LIST = [
  { value: 'NIES', label: 'NIES' },
  { value: 'OL_CAMBRIDGE', label: 'OL Cambridge' },
  { value: 'AQA_PHYSICS', label: 'AQA Physics' },
  { value: 'OL_EDXECEL_LINEAR', label: 'OL Edexcel Linear' },
  { value: 'OL_EDXECEL_MODULAR_UNIT_1', label: 'OL Edexcel Modular Unit 1' },
  { value: 'OL_EDXECEL_MODULAR_UNIT_2', label: 'OL Edexcel Modular Unit 2' },
  { value: 'AS_CAMBRIDGE', label: 'AS Cambridge' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_1', label: 'AL Edexcel Modular Unit 1' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_2', label: 'AL Edexcel Modular Unit 2' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_3', label: 'AL Edexcel Modular Unit 3' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_4', label: 'AL Edexcel Modular Unit 4' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_5', label: 'AL Edexcel Modular Unit 5' },
  { value: 'AL_EDXECEL_MODULAR_UNIT_6', label: 'AL Edexcel Modular Unit 6' },
  { value: 'ELSE', label: 'Else' },
] as const;

function formatBoardLabel(board?: string | null): string {
  if (!board) return 'Not set';
  const found = BOARD_OPTIONS_LIST.find(
    (b) => b.value === board || b.label.toLowerCase() === board.toLowerCase()
  );
  if (found) return found.label;
  if (board === 'OL_CAMBRIDGE') return 'OL Cambridge';
  if (board === 'AQA_PHYSICS') return 'AQA Physics';
  if (board.startsWith('OL_EDXECEL_MODULAR_UNIT_')) return `OL Edexcel Modular Unit ${board.slice(-1)}`;
  if (board.startsWith('AL_EDXECEL_MODULAR_UNIT_')) return `AL Edexcel Modular Unit ${board.slice(-1)}`;
  if (board === 'OL_EDXECEL_LINEAR') return 'OL Edexcel Linear';
  if (board === 'AS_CAMBRIDGE') return 'AS Cambridge';
  if (board.toUpperCase() === 'ELSE') return 'Else';
  return board;
}

function formatYearLabel(year?: string | null): string {
  if (!year) return 'Not set';
  const upper = year.toUpperCase();
  if (upper === 'ELSE') return 'Else';
  return upper;
}

export function AdminStudentsView() {
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [boardFilter, setBoardFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected student for details modal
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'academic' | 'sessions'>('details');

  // Edit form state inside modal
  const [editYear, setEditYear] = useState<string>('');
  const [editBoard, setEditBoard] = useState<string>('');
  const [editSchoolName, setEditSchoolName] = useState<string>('');
  const [editStudentPhone, setEditStudentPhone] = useState<string>('');
  const [editParentPhone, setEditParentPhone] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  // Copy indicator
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Student Session Management state
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [selectedSessionToAdd, setSelectedSessionToAdd] = useState<number | ''>('');
  const [sessionActionError, setSessionActionError] = useState<string | null>(null);
  const [sessionToRemove, setSessionToRemove] = useState<{ id: number; topic: string } | null>(null);

  // Fetch all students
  const {
    data: students = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<StudentProfile[]>({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
  });

  // Fetch detailed student data when modal is open
  const {
    data: selectedStudentDetail,
    isLoading: loadingDetail,
  } = useQuery<StudentProfile & { sessions?: BookingSession[] }>({
    queryKey: ['admin-student', selectedStudentId],
    queryFn: () => adminApi.getStudent(selectedStudentId!),
    enabled: selectedStudentId !== null,
  });

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = student.name?.toLowerCase() || '';
      const email = student.email?.toLowerCase() || '';
      const school = student.schoolName?.toLowerCase() || '';
      const studentPhone = (student.studentPhone || student.phone || student.studentPhoneNumber || '').toLowerCase();
      const parentPhone = (student.parentPhone || student.parentPhoneNumber || '').toLowerCase();
      const q = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        school.includes(q) ||
        studentPhone.includes(q) ||
        parentPhone.includes(q);

      const studentYear = (student.year || student.academicYear || '').toUpperCase();
      const matchesYear =
        yearFilter === 'ALL' ||
        studentYear === yearFilter ||
        (yearFilter === 'ELSE' && (studentYear === 'ELSE' || studentYear === 'OTHER'));

      const studentBoard = (student.board || student.examBoard || '').toUpperCase();
      const matchesBoard =
        boardFilter === 'ALL' ||
        studentBoard === boardFilter ||
        formatBoardLabel(studentBoard) === formatBoardLabel(boardFilter);

      return matchesSearch && matchesYear && matchesBoard;
    });
  }, [students, searchTerm, yearFilter, boardFilter]);

  // Paginated students
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Open details modal
  const handleOpenStudent = (student: StudentProfile, defaultTab: 'details' | 'academic' | 'sessions' = 'details') => {
    setSelectedStudentId(student.id);
    setActiveModalTab(defaultTab);
    setEditYear(student.year || student.academicYear || 'Y11');
    setEditBoard(student.board || student.examBoard || 'OL_CAMBRIDGE');
    setEditSchoolName(student.schoolName || '');
    setEditStudentPhone(student.studentPhone || student.phone || student.studentPhoneNumber || '');
    setEditParentPhone(student.parentPhone || student.parentPhoneNumber || '');
    setEditError(null);
    setIsAddSessionOpen(false);
    setSelectedSessionToAdd('');
    setSessionActionError(null);
    setSessionToRemove(null);
  };

  // Close details modal
  const handleCloseModal = () => {
    setSelectedStudentId(null);
    setEditError(null);
    setIsAddSessionOpen(false);
    setSelectedSessionToAdd('');
    setSessionActionError(null);
    setSessionToRemove(null);
  };

  // Query available sessions for the selected student
  const {
    data: availableSessions = [],
    isLoading: loadingAvailable,
  } = useQuery<BookingSession[]>({
    queryKey: ['admin-available-sessions', selectedStudentId],
    queryFn: () => adminApi.getAvailableSessionsForStudent(selectedStudentId!),
    enabled: selectedStudentId !== null && activeModalTab === 'sessions',
  });

  // Mutation to add student to session
  const addStudentToSessionMutation = useMutation({
    mutationFn: ({ studentId, sessionId }: { studentId: number; sessionId: number }) =>
      adminApi.addStudentToSession(studentId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-student', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-available-sessions', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student-sessions'] });
      showToast('Student added to session successfully!', 'success');
      setIsAddSessionOpen(false);
      setSelectedSessionToAdd('');
      setSessionActionError(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to add student to session.';
      setSessionActionError(msg);
      showToast(msg, 'error');
    },
  });

  // Mutation to remove student from session
  const removeStudentFromSessionMutation = useMutation({
    mutationFn: ({ studentId, sessionId }: { studentId: number; sessionId: number }) =>
      adminApi.removeStudentFromSession(studentId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-student', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-available-sessions', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student-sessions'] });
      showToast('Student removed from session successfully!', 'success');
      setSessionToRemove(null);
      setSessionActionError(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to remove student from session.';
      setSessionActionError(msg);
      showToast(msg, 'error');
    },
  });

  // Mutation to update Year and Board
  const updateAcademicMutation = useMutation({
    mutationFn: ({
      id,
      year,
      board,
      schoolName,
      studentPhone,
      parentPhone,
    }: {
      id: number;
      year: string;
      board: string;
      schoolName?: string;
      studentPhone?: string;
      parentPhone?: string;
    }) =>
      adminApi.updateStudentAcademic(id, {
        year,
        board,
        schoolName,
        studentPhone,
        parentPhone,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-student', selectedStudentId] });
      showToast('Student academic settings updated successfully!', 'success');
      setEditError(null);
      // Update form values with returned data
      if (updated.year) setEditYear(updated.year);
      if (updated.board) setEditBoard(updated.board);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update academic details.';
      setEditError(msg);
      showToast(msg, 'error');
    },
  });

  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    if (!editYear) {
      setEditError('Please select a Year.');
      return;
    }
    if (!editBoard) {
      setEditError('Please select a Board.');
      return;
    }
    setEditError(null);
    updateAcademicMutation.mutate({
      id: selectedStudentId,
      year: editYear,
      board: editBoard,
      schoolName: editSchoolName,
      studentPhone: editStudentPhone,
      parentPhone: editParentPhone,
    });
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // The active student object (either detailed or from list)
  const activeStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return selectedStudentDetail || students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, selectedStudentDetail, students]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Students Management</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Directory of enrolled scholars, academic years, exam boards, and session counts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Total: {students.length} scholars</span>
          </div>
          {filteredStudents.length !== students.length && (
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              Filtered: {filteredStudents.length}
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, email, school, or phone number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <span className="text-slate-400 font-medium">Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Years</option>
              {YEAR_OPTIONS_LIST.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Board Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs max-w-xs">
            <span className="text-slate-400 font-medium shrink-0">Board:</span>
            <select
              value={boardFilter}
              onChange={(e) => {
                setBoardFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="ALL">All Boards</option>
              {BOARD_OPTIONS_LIST.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || yearFilter !== 'ALL' || boardFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setYearFilter('ALL');
                setBoardFilter('ALL');
                setCurrentPage(1);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1.5 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Students Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <p className="text-slate-800 font-semibold mb-1">Failed to load students</p>
            <p className="text-slate-500 text-xs mb-4">An error occurred while fetching the scholar directory.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
            >
              Retry
            </button>
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold text-base">No students found</p>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              {searchTerm || yearFilter !== 'ALL' || boardFilter !== 'ALL'
                ? 'Try adjusting your search query or filter criteria.'
                : 'There are currently no students registered in the platform.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium text-xs">
                  <th className="py-3.5 px-4 font-semibold">Name</th>
                  <th className="py-3.5 px-4 font-semibold">Email</th>
                  <th className="py-3.5 px-4 font-semibold">School Name</th>
                  <th className="py-3.5 px-3 font-semibold">Year</th>
                  <th className="py-3.5 px-4 font-semibold">Board</th>
                  <th className="py-3.5 px-4 font-semibold">Student Phone</th>
                  <th className="py-3.5 px-4 font-semibold">Parent Phone</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Sessions</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((student) => {
                  const studentPhone = student.studentPhone || student.phone || student.studentPhoneNumber || '—';
                  const parentPhone = student.parentPhone || student.parentPhoneNumber || '—';
                  const yearDisplay = formatYearLabel(student.year || student.academicYear);
                  const boardDisplay = formatBoardLabel(student.board || student.examBoard);
                  const sessionCount = student.sessionsCount ?? 0;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenStudent(student, 'details')}
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                              {student.name?.[0]?.toUpperCase() ?? 'S'}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              ID: #{student.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-mono text-xs">{student.email}</span>
                      </td>

                      {/* School Name */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <span className="truncate max-w-[150px] inline-block" title={student.schoolName || 'Not specified'}>
                          {student.schoolName || <span className="text-slate-400 italic">Not set</span>}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/60">
                          {yearDisplay}
                        </span>
                      </td>

                      {/* Board */}
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/50 max-w-[160px] truncate"
                          title={boardDisplay}
                        >
                          {boardDisplay}
                        </span>
                      </td>

                      {/* Student Phone */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-mono text-xs">{studentPhone}</span>
                      </td>

                      {/* Parent Phone */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-mono text-xs" title={student.parentName ? `Parent: ${student.parentName}` : undefined}>
                          {parentPhone}
                        </span>
                      </td>

                      {/* Sessions */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStudent(student, 'sessions');
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            sessionCount > 0
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title="View student sessions"
                        >
                          <Clock className="w-3 h-3" />
                          <span>{sessionCount}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenStudent(student, 'details')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 text-xs font-semibold shadow-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="hidden sm:inline">
                Showing {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Details & Academic Edit Modal */}
      {selectedStudentId !== null && activeStudent && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-6 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {activeStudent.avatar ? (
                  <img
                    src={activeStudent.avatar}
                    alt={activeStudent.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-400 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shrink-0 shadow-inner">
                    {activeStudent.name?.[0]?.toUpperCase() ?? 'S'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold truncate">{activeStudent.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {activeStudent.status || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 font-mono truncate">{activeStudent.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-6 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveModalTab('details')}
                className={`py-3 border-b-2 transition ${
                  activeModalTab === 'details'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Student Information
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('academic')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeModalTab === 'academic'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Academic & Year/Board</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('sessions')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeModalTab === 'sessions'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Sessions ({activeStudent.sessionsCount ?? activeStudent.sessions?.length ?? 0})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Tab 1: Comprehensive Information */}
              {activeModalTab === 'details' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Private Credits</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {activeStudent.remainingPrivateCredits ?? 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Group Credits</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {activeStudent.remainingGroupCredits ?? 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Attendance Rate</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1">
                        {activeStudent.attendanceRate ? `${activeStudent.attendanceRate}%` : '100%'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Total Sessions</p>
                      <p className="text-xl font-bold text-indigo-600 mt-1">
                        {activeStudent.sessionsCount ?? activeStudent.sessions?.length ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Academic Profile</span>
                      </h3>
                      <div>
                        <span className="text-[11px] text-slate-400 block">School Name</span>
                        <span className="text-sm font-semibold text-slate-800">
                          {activeStudent.schoolName || <span className="text-slate-400 italic">Not set</span>}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Year</span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                            {formatYearLabel(activeStudent.year || activeStudent.academicYear)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">Board</span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900">
                            {formatBoardLabel(activeStudent.board || activeStudent.examBoard)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Enrolled Course</span>
                        <span className="text-xs text-slate-700 font-medium">
                          {activeStudent.enrolledCourse || 'Physics Masterclass'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-3">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Contact & Family</span>
                      </h3>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Student Phone Number</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono font-semibold text-slate-800">
                            {activeStudent.studentPhone || activeStudent.phone || activeStudent.studentPhoneNumber || 'Not provided'}
                          </span>
                          {(activeStudent.studentPhone || activeStudent.phone) && (
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  activeStudent.studentPhone || activeStudent.phone || '',
                                  'studentPhone'
                                )
                              }
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy student phone"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Parent Name</span>
                        <span className="text-xs text-slate-800 font-semibold">
                          {activeStudent.parentName || <span className="text-slate-400 italic">Not set</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Parent Phone Number</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono font-semibold text-slate-800">
                            {activeStudent.parentPhone || activeStudent.parentPhoneNumber || 'Not provided'}
                          </span>
                          {(activeStudent.parentPhone || activeStudent.parentPhoneNumber) && (
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  activeStudent.parentPhone || activeStudent.parentPhoneNumber || '',
                                  'parentPhone'
                                )
                              }
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy parent phone"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meeting link if assigned */}
                  {activeStudent.meetingLink && (
                    <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Video className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-xs font-semibold text-indigo-900">Assigned Meeting Link</p>
                          <p className="text-[11px] text-indigo-600 font-mono truncate max-w-md">
                            {activeStudent.meetingLink}
                          </p>
                        </div>
                      </div>
                      <a
                        href={activeStudent.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('academic')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Edit Year & Board Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Academic Editing Form */}
              {activeModalTab === 'academic' && (
                <form onSubmit={handleSaveAcademic} className="space-y-5">
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
                    <p className="font-semibold mb-0.5">Admin Academic Control</p>
                    <p className="text-amber-800 text-[11px]">
                      Update this student&apos;s Year level and Exam Board curriculum. The change updates their profile immediately across the portal and session manager.
                    </p>
                  </div>

                  {editError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{editError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Year Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      >
                        {YEAR_OPTIONS_LIST.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Allowed: Y9, Y10, Y11, Y12, Else
                      </span>
                    </div>

                    {/* Board Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Board <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={editBoard}
                        onChange={(e) => setEditBoard(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      >
                        {BOARD_OPTIONS_LIST.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Select one of the 14 approved curriculum boards
                      </span>
                    </div>

                    {/* School Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        School Name
                      </label>
                      <input
                        type="text"
                        value={editSchoolName}
                        onChange={(e) => setEditSchoolName(e.target.value)}
                        placeholder="e.g. Cambridge International School"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    {/* Student Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editStudentPhone}
                        onChange={(e) => setEditStudentPhone(e.target.value)}
                        placeholder="e.g. +20 10 1234 5678"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    {/* Parent Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Parent Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editParentPhone}
                        onChange={(e) => setEditParentPhone(e.target.value)}
                        placeholder="e.g. +20 11 9876 5432"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('details')}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateAcademicMutation.isPending}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 disabled:opacity-50 transition"
                    >
                      {updateAcademicMutation.isPending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Sessions List & Management */}
              {activeModalTab === 'sessions' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>Assigned Sessions</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Manage which sessions this student belongs to ({activeStudent.sessions?.length || activeStudent.sessionsCount || 0} active assignments)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAddSessionOpen(!isAddSessionOpen);
                        setSessionActionError(null);
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddSessionOpen ? 'Close Assign Panel' : 'Add to Session'}</span>
                    </button>
                  </div>

                  {/* Add Student to Session Panel */}
                  {isAddSessionOpen && (
                    <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Select Available Session</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddSessionOpen(false);
                            setSessionActionError(null);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {sessionActionError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                          <span>{sessionActionError}</span>
                        </div>
                      )}

                      {loadingAvailable ? (
                        <div className="h-10 bg-white/70 animate-pulse rounded-lg" />
                      ) : availableSessions.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          No additional available sessions found to assign to this student.
                        </p>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                          <select
                            value={selectedSessionToAdd}
                            onChange={(e) => setSelectedSessionToAdd(e.target.value ? Number(e.target.value) : '')}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">-- Choose an available session --</option>
                            {availableSessions.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.topic || s.courseName || 'Physics Session'} — {new Date(s.date).toLocaleDateString()} {s.time ? `(${s.time})` : ''} [{s.sessionFormat || 'Private'}] {s.teacherName ? `• Tutor: ${s.teacherName}` : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={!selectedSessionToAdd || addStudentToSessionMutation.isPending}
                            onClick={() => {
                              if (selectedStudentId && selectedSessionToAdd) {
                                addStudentToSessionMutation.mutate({
                                  studentId: selectedStudentId,
                                  sessionId: Number(selectedSessionToAdd),
                                });
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 transition shrink-0"
                          >
                            {addStudentToSessionMutation.isPending ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Assigning...</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Student</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {loadingDetail ? (
                    <div className="space-y-2">
                      <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                      <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                    </div>
                  ) : !activeStudent.sessions || activeStudent.sessions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No sessions assigned</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        This student is currently not assigned to any sessions. Click &ldquo;Add to Session&rdquo; above to assign one.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {activeStudent.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-3.5 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900">
                                {session.topic || session.courseName || 'Physics Session'}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  session.status === 'COMPLETED'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : session.status === 'APPROVED' || (session.status as string) === 'SCHEDULED'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {session.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(session.date).toLocaleDateString()}
                              </span>
                              {session.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {session.time}
                                </span>
                              )}
                              <span className="font-medium text-slate-600">
                                {session.sessionFormat || 'Private'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-center">
                            {session.meetingLink && (
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                              >
                                <span>Join Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setSessionToRemove({
                                  id: session.id,
                                  topic: session.topic || session.courseName || 'Physics Session',
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 text-xs"
                              title="Remove student from session"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-rose-600 font-medium sm:hidden">Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Remove Confirmation Modal */}
                  {sessionToRemove && (
                    <div
                      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                      onClick={() => setSessionToRemove(null)}
                    >
                      <div
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Remove Student from Session?</h3>
                            <p className="text-xs text-slate-500">Confirm removal from session</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Are you sure you want to remove <strong className="text-slate-900">{activeStudent.name}</strong> from the session <strong className="text-slate-900">&ldquo;{sessionToRemove.topic}&rdquo;</strong>?
                        </p>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                          <p className="font-semibold text-slate-700 mb-0.5">Important:</p>
                          This will only remove the student from this session. The session itself, other enrolled students, and the student&apos;s account will not be deleted.
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSessionToRemove(null)}
                            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={removeStudentFromSessionMutation.isPending}
                            onClick={() => {
                              if (selectedStudentId && sessionToRemove) {
                                removeStudentFromSessionMutation.mutate({
                                  studentId: selectedStudentId,
                                  sessionId: sessionToRemove.id,
                                });
                              }
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                          >
                            {removeStudentFromSessionMutation.isPending ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Removing...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Confirm Removal</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
