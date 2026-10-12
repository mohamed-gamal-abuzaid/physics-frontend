'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import { X, GraduationCap, Upload, Link2, FileCheck2 } from 'lucide-react';

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

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lecture Notes');
  const [course, setCourse] = useState('Cambridge IGCSE (0625)');
  const [topic, setTopic] = useState('Thermal Physics');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      showToast('Learning material uploaded & added to library!', 'success');
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
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      showToast('Please provide a resource title and valid file/drive link.', 'error');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      category,
      course: course.trim(),
      topic: topic.trim(),
      fileFormat: fileFormat.trim().toUpperCase(),
      fileSize: fileSize.trim() || '1.0 MB',
      fileUrl: fileUrl.trim(),
      previewUrl: fileUrl.trim(),
      description: description.trim() || undefined,
      author: 'Mr. Mohammed Sayed',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Upload Learning Material</h3>
              <p className="text-xs text-indigo-200">Add notes, formula sheets, or exam solutions</p>
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
              Material Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 3 Summary: Electric Circuits & Kirchhoff Laws"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Format</label>
              <input
                type="text"
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                placeholder="e.g. PDF, MP4"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">File Size</label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="e.g. 3.2 MB"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              File Link / Cloud Storage URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/... or direct PDF download link"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Paste the Google Drive, Cloudinary, or S3 link students will view and download.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Summary (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this document cover? Any special instructions for students..."
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {createMutation.isPending ? 'Uploading...' : 'Save & Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
