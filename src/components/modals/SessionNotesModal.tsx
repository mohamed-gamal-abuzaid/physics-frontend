'use client';

import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { X, BookOpen, Calendar, Clock, User, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export function SessionNotesModal() {
  const { isSessionNotesOpen, setIsSessionNotesOpen, activeSessionForNotes, setActiveSessionForNotes } = useUI();

  if (!isSessionNotesOpen || !activeSessionForNotes) return null;

  const notes = activeSessionForNotes.sessionNotes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Lecture Notes & Whiteboard</h3>
              <p className="text-xs text-slate-400">{activeSessionForNotes.topic}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSessionNotesOpen(false);
              setActiveSessionForNotes(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Instructor</span>
              <span className="font-bold text-slate-800">{activeSessionForNotes.teacherName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Session Date</span>
              <span className="font-bold text-slate-800">{activeSessionForNotes.date} at {activeSessionForNotes.time}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">
              {notes?.title || activeSessionForNotes.topic}
            </h4>
            <div className="text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
              {notes?.summaryNotes || activeSessionForNotes.notes || 'No extensive notes recorded for this lesson.'}
            </div>
          </div>

          {notes?.keyConcepts && notes.keyConcepts.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Core Concepts Mastered</span>
              <div className="flex flex-wrap gap-1.5">
                {notes.keyConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeSessionForNotes.assignedHomeworkTitle && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block">Assigned Homework:</span>
                <span>{activeSessionForNotes.assignedHomeworkTitle}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsSessionNotesOpen(false);
                setActiveSessionForNotes(null);
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white"
            >
              Done Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
