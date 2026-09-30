'use client';

import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { X, Download, FileText, Calendar, User, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export function ResourcePreviewModal() {
  const {
    isResourcePreviewOpen,
    setIsResourcePreviewOpen,
    activeResource,
    setActiveResource,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const downloadMutation = useMutation({
    mutationFn: (id: number) => studentApi.downloadResource(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      showToast('Download initiated!', 'success');
      if (data?.fileUrl) {
        window.open(data.fileUrl, '_blank');
      }
    },
    onError: () => {
      showToast('Failed to start download.', 'error');
    },
  });

  if (!isResourcePreviewOpen || !activeResource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeResource.category}
              </span>
              <h3 className="font-bold text-base text-white mt-1 leading-tight">{activeResource.title}</h3>
            </div>
          </div>
          <button
            onClick={() => {
              setIsResourcePreviewOpen(false);
              setActiveResource(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Format</span>
              <span className="font-bold text-slate-800">{activeResource.fileFormat}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Size</span>
              <span className="font-bold text-slate-800">{activeResource.fileSize}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Downloads</span>
              <span className="font-bold text-indigo-600">{activeResource.downloadCount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Author</span>
              <span className="font-bold text-slate-800 truncate block">{activeResource.author}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-1">Description & Key Syllabus Topics</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              {activeResource.description || 'Comprehensive notes and past exam analysis curated by Mr. Mohammed Sayed.'}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Course: <strong className="text-slate-700">{activeResource.course}</strong></span>
            <span>Uploaded: <strong className="text-slate-700">{activeResource.uploadDate}</strong></span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsResourcePreviewOpen(false);
                setActiveResource(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="button"
              disabled={downloadMutation.isPending}
              onClick={() => downloadMutation.mutate(activeResource.id)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              {downloadMutation.isPending ? 'Downloading...' : 'Download Resource File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
