'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public.api';
import type { YearbookStudent } from '@/lib/types';
import { Award, GraduationCap, Quote, Star } from 'lucide-react';

// ─── Flip Card ───────────────────────────────────────────────────────────────

function FlipCard({ student }: { student: YearbookStudent }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="h-72 cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      aria-label={`${student.studentName} — click to flip`}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── Front face ── */}
        <div
          className="absolute inset-0 rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-3 overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Avatar */}
          <div className="flex items-center gap-3">
            {student.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.avatar}
                alt={student.studentName}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold">
                {student.studentName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">{student.studentName}</p>
              <span className="inline-block mt-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {student.cohort}
              </span>
            </div>
          </div>

          {/* Superlative badge */}
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {student.superlativeBadge}
            </span>
          </div>

          {/* Quote */}
          <div className="flex-1 flex flex-col justify-end">
            <Quote className="w-4 h-4 text-slate-300 mb-1" />
            <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-3">
              {student.quote}
            </p>
          </div>

          <p className="text-[10px] text-slate-400 text-right mt-auto">Click to reveal →</p>
        </div>

        {/* ── Back face ── */}
        <div
          className="absolute inset-0 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-950 to-indigo-800 shadow-sm p-5 flex flex-col gap-3 text-white overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-white text-sm">{student.studentName}</p>
              <p className="text-indigo-300 text-xs mt-0.5">{student.majorField}</p>
            </div>
            <GraduationCap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          </div>

          {student.admittedUniversity && (
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <p className="text-[10px] text-indigo-300 uppercase font-semibold tracking-wider mb-0.5">
                University
              </p>
              <p className="text-sm text-white font-semibold">{student.admittedUniversity}</p>
            </div>
          )}

          <p className="text-xs text-indigo-200 leading-relaxed flex-1 line-clamp-3">
            {student.mentorLetter}
          </p>

          {student.honors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {student.honors.slice(0, 3).map((h) => (
                <span
                  key={h}
                  className="flex items-center gap-1 text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full"
                >
                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                  {h}
                </span>
              ))}
            </div>
          )}

          <p className="text-[10px] text-indigo-400">Graduated: {student.graduationDate}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Hall of Fame View ────────────────────────────────────────────────────────

export function HallOfFameView() {
  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ['public-hall-of-fame'],
    queryFn: () => publicApi.getHallOfFame(),
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Award className="w-3.5 h-3.5" />
          Celebrating Excellence
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Alumni Hall of Fame</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Our most distinguished graduates — click any card to reveal their story, university
          admission, and mentor's letter.
        </p>
      </div>

      {/* State: loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* State: error */}
      {isError && (
        <div className="text-center py-20 text-slate-400">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Could not load the Hall of Fame. Please try again later.</p>
        </div>
      )}

      {/* State: empty */}
      {!isLoading && !isError && students.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No alumni entries yet — check back soon!</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <FlipCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
