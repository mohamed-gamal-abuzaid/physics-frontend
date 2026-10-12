'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import { X, FileText, Calendar, Users, AlertCircle, Plus } from 'lucide-react';
import type { StudentProfile } from '@/lib/types';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAssignmentModal({ isOpen, onClose }: CreateAssignmentModalProps) {
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('IGCSE Physics (0625)');
  const [module, setModule] = useState('Mechanics & Kinematics');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [assignmentScope, setAssignmentScope] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');

  // Fetch students for target assignment dropdown
  const { data: students = [] } = useQuery<StudentProfile[]>({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      showToast('Assignment worksheet created & published successfully!', 'success');
      handleReset();
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to create assignment.', 'error');
    },
  });

  const handleReset = () => {
    setTitle('');
    setCourse('IGCSE Physics (0625)');
    setModule('Mechanics & Kinematics');
    setDescription('');
    setDueDate('');
    setTotalPoints(100);
    setAssignmentScope('ALL');
    setSelectedStudentId('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an assignment title.', 'error');
      return;
    }
    if (assignmentScope === 'SPECIFIC' && !selectedStudentId) {
      showToast('Please choose a specific student to assign.', 'error');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      course: course.trim(),
      module: module.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      totalPoints: Number(totalPoints) || 100,
      studentId: assignmentScope === 'SPECIFIC' ? Number(selectedStudentId) : undefined,
      assignedStudentIds: assignmentScope === 'SPECIFIC' ? [Number(selectedStudentId)] : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create Homework Task</h3>
              <p className="text-xs text-indigo-200">Publish a new worksheet for students</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Worksheet Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Worksheet 04: Newton's Laws & Friction"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course / Specification</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Cambridge IGCSE Physics"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Module / Unit</label>
              <input
                type="text"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                placeholder="e.g. Kinematics"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Points / Marks</label>
              <input
                type="number"
                min={1}
                max={500}
                value={totalPoints}
                onChange={(e) => setTotalPoints(parseInt(e.target.value) || 100)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assignment Target</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAssignmentScope('ALL')}
                className={`py-2 px-3 text-center rounded-xl border font-bold transition-all ${
                  assignmentScope === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Enrolled Students
              </button>
              <button
                type="button"
                onClick={() => setAssignmentScope('SPECIFIC')}
                className={`py-2 px-3 text-center rounded-xl border font-bold transition-all ${
                  assignmentScope === 'SPECIFIC'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Specific Student
              </button>
            </div>

            {assignmentScope === 'SPECIFIC' && (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="">-- Choose target student --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.userId || st.id}>
                    {st.name} ({st.email}) - {st.year || 'Student'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Instructions / Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Please solve all 6 questions and show full working steps including SI units."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {createMutation.isPending ? 'Publishing...' : 'Create & Publish Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
