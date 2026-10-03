'use client';
import { AcademicCatalogManager } from './AcademicCatalogManager';
import { LandingPlansManager } from './LandingPlansManager';
import { GraduationCap, CreditCard } from 'lucide-react';

export function AdminSettingsView() {
  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Admin Settings</h2>
        <p className="text-sm text-slate-500">Manage academic catalog and pricing plans</p>
      </div>

      {/* Academic Catalog */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-800">Academic Catalog</h3>
        </div>
        <AcademicCatalogManager />
      </div>

      {/* Landing Plans */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-800">Landing Page Pricing Plans</h3>
        </div>
        <LandingPlansManager />
      </div>
    </div>
  );
}
