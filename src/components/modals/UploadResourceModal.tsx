'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  X,
  GraduationCap,
  Upload,
  Link2,
  FileCheck2,
  FileUp,
  Trash2,
  CheckCircle2,
  Bell,
  Users,
} from 'lucide-react';
import { YEAR_OPTIONS, type StudentProfile } from '@/lib/types';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Lecture Notes',
  'Formula Sheet',
  'Lab Manual',
  'Exam Solutions',
  'Video Masterclass',
  'Past Papers',
];

export function UploadResourceModal({ isOpen, onClose }: UploadResourceModalProps) {
  const { showToast } = useUI();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lecture Notes');
  const [course, setCourse] = useState('Cambridge IGCSE (0625)');
  const [topic, setTopic] = useState('Thermal Physics');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');

  // Mode: 'PC_UPLOAD' vs 'LINK'
  const [uploadMode, setUploadMode] = useState<'PC_UPLOAD' | 'LINK'>('PC_UPLOAD');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    format: string;
    dataUrl: string;
  } | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);

  // Target scope: ALL | LEVEL | GROUP | STUDENT
  const [targetScope, setTargetScope] = useState<'ALL' | 'LEVEL' | 'GROUP' | 'STUDENT'>('ALL');
  const [targetLevel, setTargetLevel] = useState('Y10');
  const [targetCohort, setTargetCohort] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');

  // Fetch students for target selection
  const { data: students = [] } = useQuery<StudentProfile[]>({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
    enabled: isOpen,
  });

  const existingCohorts = Array.from(
    new Set(students.map((s) => s.cohort).filter(Boolean) as string[])
  );

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['student-resources'] });
      showToast('Learning material uploaded & students notified!', 'success');
      handleReset();
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to upload resource.', 'error');
    },
  });

  const handleReset = () => {
    setTitle('');
    setCategory('Lecture Notes');
    setCourse('Cambridge IGCSE (0625)');
    setTopic('Thermal Physics');
    setFileFormat('PDF');
    setFileSize('2.4 MB');
    setFileUrl('');
    setDescription('');
    setUploadedFile(null);
    setUploadMode('PC_UPLOAD');
    setTargetScope('ALL');
    setTargetLevel('Y10');
    setTargetCohort('');
    setSelectedStudentId('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('File exceeds 3 MB serverless direct upload limit. Switched to Cloud Link tab to paste a Google Drive or Cloud link.', 'info');
      setUploadMode('LINK');
      return;
    }

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';

      setUploadedFile({
        name: file.name,
        size: formattedSize,
        format: ext,
        dataUrl: base64,
      });

      // Auto-fill format and size
      setFileFormat(ext);
      setFileSize(formattedSize);
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(cleanName);
      }
      setIsReadingFile(false);
      showToast(`Selected "${file.name}" from your PC.`, 'success');
    };
    reader.onerror = () => {
      setIsReadingFile(false);
      showToast('Failed to read file from your computer.', 'error');
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalUrl = uploadMode === 'PC_UPLOAD' ? uploadedFile?.dataUrl : fileUrl.trim();

    if (!title.trim()) {
      showToast('Please provide a title for the material.', 'error');
      return;
    }
    if (!finalUrl) {
      showToast(
        uploadMode === 'PC_UPLOAD'
          ? 'Please select a file from your computer.'
          : 'Please enter a valid file/drive link.',
        'error'
      );
      return;
    }

    if (targetScope === 'STUDENT' && !selectedStudentId) {
      showToast('Please select a student to target.', 'error');
      return;
    }
    if (targetScope === 'GROUP' && !targetCohort.trim()) {
      showToast('Please enter a group or cohort name.', 'error');
      return;
    }

    const payload: any = {
      title: title.trim(),
      category,
      course: course.trim(),
      topic: topic.trim(),
      fileFormat: ((uploadMode === 'PC_UPLOAD' ? uploadedFile?.format : fileFormat) || 'PDF').trim().toUpperCase(),
      fileSize: ((uploadMode === 'PC_UPLOAD' ? uploadedFile?.size : fileSize) || '1.0 MB').trim(),
      fileUrl: finalUrl,
      previewUrl: finalUrl,
      description: description.trim() || undefined,
      author: 'Mr. Mohammed Sayed',
      targetScope,
      targetLevel: targetScope === 'LEVEL' ? targetLevel : undefined,
      targetCohort: targetScope === 'GROUP' ? targetCohort.trim() : undefined,
      targetStudentId: targetScope === 'STUDENT' ? Number(selectedStudentId) : undefined,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Upload Learning Material</h3>
              <p className="text-xs text-emerald-200">Upload notes, formula sheets, or exam solutions & notify</p>
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
              Material Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 3 Summary: Electric Circuits & Kirchhoff Laws"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          {/* Upload Method Toggle: PC vs External URL */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">File Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUploadMode('PC_UPLOAD')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  uploadMode === 'PC_UPLOAD'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileUp className="w-4 h-4" />
                Upload from PC
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('LINK')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  uploadMode === 'LINK'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Link2 className="w-4 h-4" />
                Cloud Link / Drive
              </button>
            </div>

            {uploadMode === 'PC_UPLOAD' ? (
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="flex items-center justify-between p-3 bg-white border border-emerald-200 rounded-xl shadow-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-800 text-xs truncate">{uploadedFile.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {uploadedFile.size} • {uploadedFile.format}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
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
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isReadingFile}
                    className="w-full py-3 px-4 border border-dashed border-emerald-300 rounded-xl bg-white hover:bg-emerald-50/60 transition flex items-center justify-center gap-2 text-emerald-700 font-semibold cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    {isReadingFile ? 'Reading file...' : 'Select File from PC (PDF, Word, Slides, Image)'}
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or direct download URL"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            )}
          </div>

          {/* Target Audience Scope: ALL | LEVEL | GROUP | STUDENT */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Notify & Share With</span>
              <span className="text-[11px] font-normal text-slate-500 flex items-center gap-1">
                <Bell className="w-3 h-3 text-emerald-600" />
                Dispatches notification to students
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => setTargetScope('ALL')}
                className={`py-2 px-2 text-center rounded-xl border font-bold transition-all ${
                  targetScope === 'ALL'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                One Student
              </button>
            </div>

            {targetScope === 'LEVEL' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in">
                <label className="block font-semibold text-slate-700">Select Academic Level / Year:</label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {YEAR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} (Year {opt.label})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  All students enrolled in {targetLevel} will receive this material & notification.
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
                  placeholder="e.g. Cohort Alpha, Group B, Sunday Class"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
                {existingCohorts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] text-slate-500 py-0.5">Quick select:</span>
                    {existingCohorts.slice(0, 4).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTargetCohort(c)}
                        className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 font-medium transition"
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
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
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
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course / Specification</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Cambridge 0625"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Electricity"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Format</label>
              <input
                type="text"
                value={uploadMode === 'PC_UPLOAD' && uploadedFile ? uploadedFile.format : fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                placeholder="e.g. PDF, MP4"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">File Size</label>
              <input
                type="text"
                value={uploadMode === 'PC_UPLOAD' && uploadedFile ? uploadedFile.size : fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="e.g. 3.2 MB"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Summary (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this document cover? Any special tips for students..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
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
              disabled={createMutation.isPending || isReadingFile}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              {createMutation.isPending ? 'Publishing & Notifying...' : 'Save Material & Notify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
