'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useUI } from '@/contexts/UIContext';
import {
  GraduationCap, BookOpen, Plus, Edit2, Trash2, CheckCircle2,
  AlertCircle, Save, X, Layers, Sparkles, BookMarked, Tag
} from 'lucide-react';
import type { EducationalStage, SubjectCourse, AdminSettings } from '@/lib/types';

const DEFAULT_STAGES: EducationalStage[] = [
  { id: 'y10', name: 'Year 10 (IGCSE Foundations)', code: 'Y10', description: 'Introductory IGCSE physics concepts, measurement, and kinematics' },
  { id: 'y11', name: 'Year 11 (IGCSE / O-Level)', code: 'Y11', description: 'Complete IGCSE syllabus, Paper 4 structured, and Paper 6 ATP lab skills' },
  { id: 'y12', name: 'Year 12 (AS-Level)', code: 'Y12', description: 'Advanced Subsidiary physics curriculum and analytical mechanics' },
  { id: 'y13', name: 'Year 13 (A2-Level)', code: 'Y13', description: 'Advanced Level, electromagnetism, quantum, and university entrance' },
];

const DEFAULT_SUBJECTS: SubjectCourse[] = [
  { id: 'cambridge-0625', name: 'Cambridge IGCSE Physics (0625)', board: 'Cambridge', stage: 'Year 10 / Year 11', code: '0625', description: 'Core & Extended Physics curriculum for Cambridge IGCSE' },
  { id: 'cambridge-9702-as', name: 'Cambridge AS-Level Physics (9702)', board: 'Cambridge', stage: 'Year 12', code: '9702 AS', description: 'Mechanics, Superposition, Waves, Electricity, Particle Physics' },
  { id: 'cambridge-9702-a2', name: 'Cambridge A2-Level Physics (9702)', board: 'Cambridge', stage: 'Year 13', code: '9702 A2', description: 'Circular Motion, Gravitation, Oscillations, Thermal, Capacitance, Fields, Quantum' },
  { id: 'edexcel-4ph1', name: 'Edexcel International IGCSE Physics (4PH1)', board: 'Edexcel', stage: 'Year 10 / Year 11', code: '4PH1', description: 'Edexcel International IGCSE modular and linear specifications' },
  { id: 'edexcel-wph11-12', name: 'Edexcel International A-Level Physics (WPH11/12)', board: 'Edexcel', stage: 'Year 12 / Year 13', code: 'IAL Physics', description: 'Edexcel International A-Level Units 1 to 6' },
  { id: 'oxford-9630', name: 'Oxford AQA International A-Level Physics (9630)', board: 'Oxford AQA', stage: 'Year 12 / Year 13', code: '9630', description: 'Oxford AQA International Modular Physics syllabus' },
];

export function AcademicCatalogManager() {
  const { showToast } = useUI();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'stages' | 'subjects'>('stages');

  // Stages local state
  const [stages, setStages] = useState<EducationalStage[]>(DEFAULT_STAGES);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageForm, setStageForm] = useState<{ name: string; code: string; description: string }>({
    name: '',
    code: '',
    description: '',
  });

  // Subjects local state
  const [subjects, setSubjects] = useState<SubjectCourse[]>(DEFAULT_SUBJECTS);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState<{
    name: string;
    board: string;
    stage: string;
    code: string;
    description: string;
  }>({
    name: '',
    board: 'Cambridge',
    stage: 'Year 10 / Year 11',
    code: '',
    description: '',
  });

  // Query settings from backend
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminApi.getSettings,
  });

  useEffect(() => {
    if (settings) {
      if (Array.isArray(settings.stagesOptions) && settings.stagesOptions.length > 0) {
        setStages(settings.stagesOptions);
      }
      if (Array.isArray(settings.curriculaOptions) && settings.curriculaOptions.length > 0) {
        // Normalize curriculaOptions to SubjectCourse array
        const normalized: SubjectCourse[] = settings.curriculaOptions.map((item, idx) => {
          if (typeof item === 'string') {
            return {
              id: `subj-${idx}-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: item,
              board: item.includes('Edexcel') ? 'Edexcel' : item.includes('AQA') ? 'Oxford AQA' : 'Cambridge',
              stage: 'All Stages',
              code: '',
              description: `Standard curriculum for ${item}`,
            };
          }
          return item;
        });
        setSubjects(normalized);
      }
    }
  }, [settings]);

  // Mutation to persist settings
  const saveMutation = useMutation({
    mutationFn: (payload: Partial<AdminSettings>) => adminApi.updateSettings(payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-config'] });
      showToast('Academic catalog successfully updated and published!', 'success');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to update academic catalog.', 'error');
    },
  });

  // Stage Handlers
  const handleOpenAddStage = () => {
    setEditingStageId(null);
    setStageForm({ name: '', code: '', description: '' });
    setIsStageModalOpen(true);
  };

  const handleOpenEditStage = (stage: EducationalStage) => {
    setEditingStageId(stage.id);
    setStageForm({
      name: stage.name,
      code: stage.code,
      description: stage.description || '',
    });
    setIsStageModalOpen(true);
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageForm.name.trim()) {
      showToast('Please enter the educational stage name (e.g. Year 10 / IGCSE).', 'error');
      return;
    }
    if (!stageForm.code.trim()) {
      showToast('Please enter a short code for this stage (e.g. Y10, Y11, AS).', 'error');
      return;
    }

    let updatedList: EducationalStage[];
    if (editingStageId) {
      updatedList = stages.map((s) =>
        s.id === editingStageId
          ? { ...s, name: stageForm.name.trim(), code: stageForm.code.trim(), description: stageForm.description.trim() }
          : s
      );
    } else {
      const newStage: EducationalStage = {
        id: `stage-${Date.now()}`,
        name: stageForm.name.trim(),
        code: stageForm.code.trim(),
        description: stageForm.description.trim(),
        isActive: true,
      };
      updatedList = [...stages, newStage];
    }

    setStages(updatedList);
    setIsStageModalOpen(false);
    saveMutation.mutate({ stagesOptions: updatedList });
  };

  const handleDeleteStage = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the stage "${name}"?`)) return;
    const updated = stages.filter((s) => s.id !== id);
    setStages(updated);
    saveMutation.mutate({ stagesOptions: updated });
  };

  // Subject Handlers
  const handleOpenAddSubject = () => {
    setEditingSubjectId(null);
    setSubjectForm({
      name: '',
      board: 'Cambridge',
      stage: stages.length > 0 ? stages[0].name : 'Year 10 / Year 11',
      code: '',
      description: '',
    });
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj: SubjectCourse) => {
    setEditingSubjectId(subj.id);
    setSubjectForm({
      name: subj.name,
      board: subj.board || 'Cambridge',
      stage: subj.stage || (stages.length > 0 ? stages[0].name : 'All Stages'),
      code: subj.code || '',
      description: subj.description || '',
    });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      showToast('Please enter the subject / course name (e.g. Cambridge A-Level Physics).', 'error');
      return;
    }
    if (!subjectForm.board.trim()) {
      showToast('Please select the exam board curriculum.', 'error');
      return;
    }

    let updatedList: SubjectCourse[];
    if (editingSubjectId) {
      updatedList = subjects.map((s) =>
        s.id === editingSubjectId
          ? {
              ...s,
              name: subjectForm.name.trim(),
              board: subjectForm.board.trim(),
              stage: subjectForm.stage.trim(),
              code: subjectForm.code.trim(),
              description: subjectForm.description.trim(),
            }
          : s
      );
    } else {
      const newSubject: SubjectCourse = {
        id: `subj-${Date.now()}`,
        name: subjectForm.name.trim(),
        board: subjectForm.board.trim(),
        stage: subjectForm.stage.trim(),
        code: subjectForm.code.trim(),
        description: subjectForm.description.trim(),
        isActive: true,
      };
      updatedList = [...subjects, newSubject];
    }

    setSubjects(updatedList);
    setIsSubjectModalOpen(false);
    saveMutation.mutate({ curriculaOptions: updatedList });
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the subject "${name}"?`)) return;
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    saveMutation.mutate({ curriculaOptions: updated });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with Dual Sub-Tabs */}
      <div className="bg-slate-900 text-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Academic Offerings & Catalog
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  المراحل والمواد
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage all educational stages and subjects taught at the Academy
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('stages')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'stages'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>المراحل التعليمية ({stages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'subjects'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>المواد والمناهج ({subjects.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-6">
        {/* TAB 1: EDUCATIONAL STAGES */}
        {activeTab === 'stages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Educational Stages & Academic Years (المراحل الدراسية)
                </h3>
                <p className="text-xs text-slate-500">
                  Configure the grade levels and academic tiers available for student enrollment
                </p>
              </div>
              <button
                onClick={handleOpenAddStage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مرحلة تعليمية جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200">
                        {stage.code}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{stage.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditStage(stage)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Edit Stage"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStage(stage.id, stage.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Stage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {stage.description && (
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                      {stage.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {stages.length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No educational stages configured yet. Click above to add your first stage.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBJECTS & CURRICULA */}
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Subjects & Courses Catalog (المواد والمناهج الدراسية)
                </h3>
                <p className="text-xs text-slate-500">
                  Curricula and courses taught across Cambridge, Edexcel, and Oxford AQA
                </p>
              </div>
              <button
                onClick={handleOpenAddSubject}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مادة / منهج جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {subjects.map((subj) => {
                const boardColor =
                  subj.board === 'Cambridge'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : subj.board === 'Edexcel'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : subj.board === 'Oxford AQA'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={subj.id}
                    className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 font-bold text-[11px] rounded-md border ${boardColor}`}>
                          {subj.board}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditSubject(subj)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subj.id, subj.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm mt-2">{subj.name}</h4>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {subj.code && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                            Code: {subj.code}
                          </span>
                        )}
                        {subj.stage && (
                          <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                            {subj.stage}
                          </span>
                        )}
                      </div>

                      {subj.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {subj.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {subjects.length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No subjects configured yet. Click above to add your first subject or curriculum.
              </div>
            )}
          </div>
        )}
      </div>

      {/* STAGE MODAL */}
      {isStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  {editingStageId ? 'تعديل المرحلة التعليمية' : 'إضافة مرحلة تعليمية جديدة'}
                </h3>
              </div>
              <button
                onClick={() => setIsStageModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم المرحلة الدراسية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={stageForm.name}
                  onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                  placeholder="e.g. Year 10 (IGCSE Foundations) or Grade 11"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الرمز المختصر للمرحلة (Stage Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={stageForm.code}
                  onChange={(e) => setStageForm({ ...stageForm, code: e.target.value })}
                  placeholder="e.g. Y10, Y11, AS, A2, G9"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوصف / تفاصيل المرحلة
                </label>
                <textarea
                  rows={2}
                  value={stageForm.description}
                  onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                  placeholder="نبذة عن المنهج والمستوى الدراسي للمرحلة..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ المرحلة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  {editingSubjectId ? 'تعديل المادة / المنهج' : 'إضافة مادة / منهج جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم المادة / المنهج الدراسي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Cambridge IGCSE Physics (0625) or A-Level Mechanics"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الجهة / البورد التعليمي <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subjectForm.board}
                    onChange={(e) => setSubjectForm({ ...subjectForm, board: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Cambridge">Cambridge</option>
                    <option value="Edexcel">Edexcel</option>
                    <option value="Oxford AQA">Oxford AQA</option>
                    <option value="NIES">NIES</option>
                    <option value="Other">Other / National</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    المرحلة التعليمية المرتبطة
                  </label>
                  <select
                    value={subjectForm.stage}
                    onChange={(e) => setSubjectForm({ ...subjectForm, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {stages.map((stg) => (
                      <option key={stg.id} value={stg.name}>
                        {stg.name}
                      </option>
                    ))}
                    <option value="All Stages">All Stages</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  كود المنهج (Syllabus Code)
                </label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  placeholder="e.g. 0625, 9702, 4PH1, 9630"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوصف والمواضيع المغطاة
                </label>
                <textarea
                  rows={2}
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="تفاصيل الوحدات والمواضيع الأساسية للمنهج..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ المادة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
