'use client';

import React, { useState } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { compressImage } from '@/lib/imageCompressor';

export function SubmitHomeworkModal() {
  const {
    isSubmitHwOpen,
    setIsSubmitHwOpen,
    activeAssignmentForSubmit,
    setActiveAssignmentForSubmit,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');

  const submitMutation = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: number; data: any }) =>
      studentApi.submitAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      showToast('Homework submitted successfully for grading!', 'success');
      setIsSubmitHwOpen(false);
      setActiveAssignmentForSubmit(null);
      setFileName('');
      setFileUrl('');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to submit homework.', 'error');
    },
  });

  if (!isSubmitHwOpen || !activeAssignmentForSubmit) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImage(file, 1200, 1200, 0.7);
          setFileUrl(compressed);
          return;
        } catch {
          // fallback to raw read
        }
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName && !fileUrl) {
      showToast('Please select a file or enter file details', 'error');
      return;
    }
    submitMutation.mutate({
      assignmentId: activeAssignmentForSubmit.id,
      data: {
        fileName: fileName || `${activeAssignmentForSubmit.title}-Solution.pdf`,
        fileUrl: fileUrl || undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Submit Homework Worksheet</h3>
              <p className="text-xs text-indigo-200 truncate max-w-xs">{activeAssignmentForSubmit.title}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSubmitHwOpen(false);
              setActiveAssignmentForSubmit(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Course & Module:</span>
              <span className="font-semibold text-slate-800">{activeAssignmentForSubmit.course} · {activeAssignmentForSubmit.module}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Due Date:</span>
              <span className="font-semibold text-rose-600">{activeAssignmentForSubmit.dueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Total Maximum Points:</span>
              <span className="font-semibold text-indigo-600">{activeAssignmentForSubmit.totalPoints} Marks</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Attach Solution File (PDF, DOCX, Images)</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-5 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">{fileName}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Click or Drag & Drop Solution File</p>
                  <p className="text-[11px] text-slate-400">PDF worksheets or scan pages up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Or Paste File URL / Drive Link (Optional)</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsSubmitHwOpen(false);
                setActiveAssignmentForSubmit(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Upload & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
