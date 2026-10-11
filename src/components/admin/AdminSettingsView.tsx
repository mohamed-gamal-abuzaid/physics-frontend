'use client';

import { useState } from 'react';
import { AcademicCatalogManager } from './AcademicCatalogManager';
import { LevelPricingManager } from './LevelPricingManager';
import { DiscountsManager } from './DiscountsManager';
import { GraduationCap, DollarSign, Tag, Layers } from 'lucide-react';

export function AdminSettingsView() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'discounts' | 'catalog'>('pricing');

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Academic &amp; Financial Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure level-based session pricing, promotional discount coupons, and the academic curricula catalog.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Level Session Pricing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('discounts')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'discounts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Discounts &amp; Promos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Academic Catalog</span>
        </button>
      </div>

      {/* Level Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Level-Based Session Pricing</h3>
              <p className="text-xs text-slate-500">
                Set distinct rates for 1 session or multi-session packages for each academic stage (Year 9, 10, 11, AS, A2).
              </p>
            </div>
          </div>
          <LevelPricingManager />
        </div>
      )}

      {/* Discounts Tab */}
      {activeTab === 'discounts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Promo Codes &amp; Student Discounts</h3>
              <p className="text-xs text-slate-500">
                Grant percentage or fixed discounts to all students, a specific academic level, or an individual student.
              </p>
            </div>
          </div>
          <DiscountsManager />
        </div>
      )}

      {/* Academic Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Academic Catalog &amp; Curricula</h3>
              <p className="text-xs text-slate-500">
                Manage educational stages, exam boards (Cambridge, Edexcel, Oxford AQA), and course subjects.
              </p>
            </div>
          </div>
          <AcademicCatalogManager />
        </div>
      )}
    </div>
  );
}
