'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  X,
  FileText,
  Calendar,
  Users,
  AlertCircle,
  Upload,
  FileUp,
  Trash2,
  CheckCircle2,
  Bell,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { YEAR_OPTIONS, type StudentProfile } from '@/lib/types';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAssignmentModal({ isOpen, onClose }: CreateAssignmentModalProps) {
  const { showToast } = useUI();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('IGCSE Physics (0625)');
  const [module, setModule] = useState('Mechanics & Kinematics');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);

  // Target scope: ALL | LEVEL | GROUP | STUDENT
  const [targetScope, setTargetScope] = useState<'ALL' | 'LEVEL' | 'GROUP' | 'STUDENT'>('ALL');
  const [targetLevel, setTargetLevel] = useState('Y10');
  const [targetCohort, setTargetCohort] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');

  // Upload from PC state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    fileUrl: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch students for target assignment dropdown
  const { data: students = [] } = useQuery<StudentProfile[]>({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
    enabled: isOpen,
  });

  // Extract unique cohorts from students list for easy suggestion
  const existingCohorts = Array.from(
    new Set(students.map((s) => s.cohort).filter(Boolean) as string[])
  );

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      showToast('Assignment worksheet created & students notified!', 'success');
      handleReset();
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to create assignment.', 'error');
    },
  });

  const [externalLink, setExternalLink] = useState('');

  const handleReset = () => {
    setTitle('');
    setCourse('IGCSE Physics (0625)');
    setModule('Mechanics & Kinematics');
    setDescription('');
    setDueDate('');
    setTotalPoints(100);
    setTargetScope('ALL');
    setTargetLevel('Y10');
    setTargetCohort('');
    setSelectedStudentId('');
    setUploadedFile(null);
    setExternalLink('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('File exceeds 3 MB serverless limit for direct upload. For larger files, please paste a Google Drive link below.', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      setUploadedFile({
        name: file.name,
        size: formattedSize,
        type: file.type || 'application/octet-stream',
        fileUrl: base64,
      });
      setIsUploading(false);
      showToast(`Worksheet "${file.name}" loaded from PC.`, 'success');
    };
    reader.onerror = () => {
      setIsUploading(false);
      showToast('Failed to read file from your PC.', 'error');
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an assignment title.', 'error');
      return;
    }
    if (targetScope === 'STUDENT' && !selectedStudentId) {
      showToast('Please choose a specific student to assign.', 'error');
      return;
    }
    if (targetScope === 'GROUP' && !targetCohort.trim()) {
      showToast('Please specify a cohort or group name.', 'error');
      return;
    }

    const finalAttachments = uploadedFile
      ? [uploadedFile]
      : externalLink.trim()
        ? [{ name: 'Worksheet Link', size: 'Cloud Link', type: 'link', fileUrl: externalLink.trim() }]
        : undefined;

    const payload: any = {
      title: title.trim(),
      course: course.trim(),
      module: module.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      totalPoints: Number(totalPoints) || 100,
      targetScope,
      targetLevel: targetScope === 'LEVEL' ? targetLevel : undefined,
      targetCohort: targetScope === 'GROUP' ? targetCohort.trim() : undefined,
      studentId: targetScope === 'STUDENT' ? Number(selectedStudentId) : undefined,
      assignedStudentIds: targetScope === 'STUDENT' && selectedStudentId ? [Number(selectedStudentId)] : undefined,
      attachments: finalAttachments,
    };

    createMutation.mutate(payload);
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
              <h3 className="font-bold text-base text-white">Create & Assign Homework Task</h3>
              <p className="text-xs text-indigo-200">Upload worksheets from PC & notify targeted students</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
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

          {/* PC File Upload Section */}
          <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 transition-colors">
            <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-indigo-950">
                <FileUp className="w-4 h-4 text-indigo-600" />
                Upload Task Worksheet from PC (PDF / Word / Image)
              </span>
              <span className="text-[10px] text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full font-semibold">
                Direct Upload
              </span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadedFile ? (
              <div className="flex items-center justify-between p-3 bg-white border border-indigo-200 rounded-xl shadow-xs mt-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-xs truncate">{uploadedFile.name}</p>
                    <p className="text-[10px] text-slate-500">{uploadedFile.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full mt-2 py-3 px-4 border border-dashed border-indigo-300 rounded-xl bg-white hover:bg-indigo-50/60 transition flex items-center justify-center gap-2 text-indigo-700 font-semibold cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Reading file...' : 'Choose File from Computer (PDF, DOCX, PNG)'}
              </button>
            )}
            <p className="text-[10px] text-slate-500 mt-1.5">
              Targeted students will be able to download this worksheet directly and upload their completed solution.
            </p>

            <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 shrink-0 font-medium">Or paste link (for large files &gt; 3MB):</span>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Scope Selection: ALL | LEVEL | GROUP | STUDENT */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Assign To</span>
              <span className="text-[11px] font-normal text-slate-500 flex items-center gap-1">
                <Bell className="w-3 h-3 text-amber-500" />
                Auto-sends student notification
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => setTargetScope('ALL')}
                className={`py-2 px-2 text-center rounded-xl border font-bold transition-all ${
                  targetScope === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Students
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('LEVEL')}
                className={`py-2 px-2 text-center rounded-xl border font-bold transition-all ${
                  targetScope === 'LEVEL'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                By Level
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('GROUP')}
                className={`py-2 px-2 text-center rounded-xl border font-bold transition-all ${
                  targetScope === 'GROUP'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                By Group
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('STUDENT')}
                className={`py-2 px-2 text-center rounded-xl border font-bold transition-all ${
                  targetScope === 'STUDENT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                One Student
              </button>
            </div>

            {/* Scope Inputs */}
            {targetScope === 'LEVEL' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in">
                <label className="block font-semibold text-slate-700">Select Academic Level / Year:</label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {YEAR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} (Year {opt.label})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  All students registered in {targetLevel} will receive this worksheet & notification.
                </p>
              </div>
            )}

            {targetScope === 'GROUP' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in">
                <label className="block font-semibold text-slate-700">Group / Cohort Name:</label>
                <input
                  type="text"
                  required
                  value={targetCohort}
                  onChange={(e) => setTargetCohort(e.target.value)}
                  placeholder="e.g. Cohort Alpha, Group B, Friday Batch"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
                {existingCohorts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] text-slate-500 py-0.5">Quick select:</span>
                    {existingCohorts.slice(0, 4).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTargetCohort(c)}
                        className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 font-medium transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {targetScope === 'STUDENT' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in">
                <label className="block font-semibold text-slate-700">Select Specific Student:</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="">-- Choose student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.userId || st.id}>
                      {st.name} ({st.email}) - {st.year || 'General'}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
            <label className="block font-bold text-slate-700 mb-1">Instructions / Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Please solve all questions and show full working steps including SI units."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
              disabled={createMutation.isPending || isUploading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              {createMutation.isPending ? 'Publishing & Notifying...' : 'Publish Task & Notify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
