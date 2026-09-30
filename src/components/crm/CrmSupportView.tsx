'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { studentApi } from '@/lib/api/student.api';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import {
  Users, Clock, Headphones, Mail, Search, Plus, Settings,
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, ChevronRight,
  Sparkles, Key, MessageCircle, Eye, Filter, ArrowRight,
  UserCheck, UserX, UserPlus, Send, Video, ExternalLink
} from 'lucide-react';
import type { StudentProfile, SupportTicket, OutboxEmail } from '@/lib/types';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { AssignAccountModal } from '@/components/modals/AssignAccountModal';
import { AccountCredentialsModal } from '@/components/modals/AccountCredentialsModal';

export function CrmSupportView() {
  const { currentRole } = useAuth();
  const {
    setIsNewTicketOpen,
    setIsEmailCampaignOpen,
    setIsManualCreditOpen,
    setSelectedStudentForCredit,
    showToast,
  } = useUI();
  const queryClient = useQueryClient();

  const isAdmin = currentRole === 'admin';
  const [activeCrmTab, setActiveCrmTab] = useState<'accounts' | 'waiting' | 'tickets' | 'outbox'>(
    isAdmin ? 'accounts' : 'tickets'
  );

  // CRM Modals local state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<StudentProfile | null>(null);
  const [credentialStudent, setCredentialStudent] = useState<StudentProfile | null>(null);

  // Ticket reply local state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchScholar, setSearchScholar] = useState('');

  // Queries
  const { data: students = [], isLoading: loadingStudents } = useQuery<StudentProfile[]>({
    queryKey: ['admin-crm-students'],
    queryFn: adminApi.getCrmStudents,
    enabled: isAdmin,
  });

  const { data: waitingStudents = [] } = useQuery<StudentProfile[]>({
    queryKey: ['admin-crm-waiting'],
    queryFn: adminApi.getWaitingStudents,
    enabled: isAdmin,
  });

  const { data: tickets = [] } = useQuery<SupportTicket[]>({
    queryKey: isAdmin ? ['admin-tickets'] : ['student-tickets'],
    queryFn: isAdmin ? adminApi.getTickets : studentApi.getTickets,
  });

  const { data: outbox = [] } = useQuery<OutboxEmail[]>({
    queryKey: ['admin-outbox'],
    queryFn: adminApi.getOutbox,
    enabled: isAdmin,
  });

  // Mutations
  const activateMutation = useMutation({
    mutationFn: (id: number) => adminApi.updateStudentStatus(id, 'ACTIVE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crm-waiting'] });
      queryClient.invalidateQueries({ queryKey: ['admin-crm-students'] });
      showToast('Scholar activated and enrolled successfully!', 'success');
    },
    onError: () => showToast('Failed to activate scholar.', 'error'),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      isAdmin ? adminApi.replyTicket(id, text) : studentApi.addTicketMessage(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: isAdmin ? ['admin-tickets'] : ['student-tickets'] });
      showToast('Reply added to ticket thread!', 'success');
      setReplyMessage('');
    },
    onError: () => showToast('Failed to send reply.', 'error'),
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateTicket(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      showToast('Ticket status updated!', 'success');
    },
    onError: () => showToast('Failed to update ticket status.', 'error'),
  });

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchScholar.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchScholar.toLowerCase())) ||
      (s.cohort && s.cohort.toLowerCase().includes(searchScholar.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAdmin ? 'CRM Scholar Directory & Support Desk' : 'Helpdesk & Academic Support'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin ? 'Manage scholar profiles, activation queues, credentials, and broadcast communications' : 'Open inquiries, report schedule adjustments, and message academic staff'}
          </p>
        </div>

        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Enroll Scholar
              </button>
              <button
                onClick={() => setIsEmailCampaignOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-xs flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" /> Broadcast
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Open Support Ticket
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {isAdmin && (
          <button
            onClick={() => setActiveCrmTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeCrmTab === 'accounts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> Scholar Accounts ({students.length})
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveCrmTab('waiting')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeCrmTab === 'waiting'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" /> Activation Queue ({waitingStudents.length})
          </button>
        )}

        <button
          onClick={() => setActiveCrmTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeCrmTab === 'tickets'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Headphones className="w-4 h-4" /> Support Tickets ({tickets.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveCrmTab('outbox')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeCrmTab === 'outbox'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-4 h-4" /> Dispatched Outbox ({outbox.length})
          </button>
        )}
      </div>

      {/* SUBTAB 1: ACCOUNTS (ADMIN ONLY) */}
      {isAdmin && activeCrmTab === 'accounts' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchScholar}
              onChange={(e) => setSearchScholar(e.target.value)}
              placeholder="Search scholar by name, email, or cohort..."
              className="w-full text-xs px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {s.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{s.name}</h3>
                      <p className="text-xs text-slate-500 truncate">{s.email}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cohort:</span>
                      <span className="font-semibold text-slate-800">{s.cohort || 'General 2025'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Curriculum:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[140px]">{s.enrolledCourse || 'IGCSE Physics'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Credit Balance:</span>
                      <span className="font-bold text-indigo-700">
                        {s.remainingPrivateCredits} 1-to-1 / {s.remainingGroupCredits} Group
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setAssigningStudent(s)}
                    className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 text-center"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => setCredentialStudent(s)}
                    className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 text-center"
                  >
                    Credentials
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudentForCredit(s.id);
                      setIsManualCreditOpen(true);
                    }}
                    className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-center"
                  >
                    + Credits
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No scholars match the search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: WAITING QUEUE (ADMIN ONLY) */}
      {isAdmin && activeCrmTab === 'waiting' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Scholars Awaiting Account Activation</h3>
            <span className="text-xs text-slate-500 font-medium">{waitingStudents.length} In Queue</span>
          </div>

          <div className="divide-y divide-slate-100">
            {waitingStudents.map((ws) => (
              <div key={ws.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{ws.name}</h4>
                  <p className="text-xs text-slate-500">
                    {ws.email} · Phone: {ws.phone || 'N/A'} · Grade: {ws.gradeLevel}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={activateMutation.isPending}
                    onClick={() => activateMutation.mutate(ws.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Activate Scholar
                  </button>
                </div>
              </div>
            ))}

            {waitingStudents.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs">
                No new students waiting for activation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: TICKETS */}
      {activeCrmTab === 'tickets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ticket List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                Inquiry Threads ({tickets.length})
              </div>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTicket?.id === t.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{t.subject}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'RESOLVED' || t.status === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t.category} · Priority: <strong className="text-slate-700">{t.priority}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">From: {t.studentName}</p>
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No support inquiries filed.
                </div>
              )}
            </div>

            {/* Ticket Conversation Detail */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between min-h-[380px]">
              {selectedTicket ? (
                <>
                  <div>
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{selectedTicket.subject}</h3>
                        <p className="text-xs text-slate-500">
                          {selectedTicket.category} · Scholar: {selectedTicket.studentName}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              updateTicketStatusMutation.mutate({
                                id: selectedTicket.id,
                                status: 'RESOLVED',
                              })
                            }
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Messages stream */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 text-xs">
                      {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                        selectedTicket.messages.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 rounded-xl ${
                              m.role === 'admin'
                                ? 'bg-indigo-50/80 border border-indigo-100 text-indigo-950 ml-4'
                                : 'bg-slate-50 border border-slate-100 text-slate-800 mr-4'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                              <span>{m.sender} ({m.role})</span>
                              <span>{m.timestamp}</span>
                            </div>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">No message replies recorded yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Reply Input */}
                  <div className="pt-3 border-t border-slate-100 mt-4 flex gap-2">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type a response to this inquiry..."
                      className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      disabled={replyMutation.isPending || !replyMessage.trim()}
                      onClick={() =>
                        replyMutation.mutate({
                          id: selectedTicket.id,
                          text: replyMessage,
                        })
                      }
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs py-16">
                  <MessageCircle className="w-10 h-10 mb-2 text-slate-300" />
                  Select a support thread on the left to read and respond
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: OUTBOX (ADMIN ONLY) */}
      {isAdmin && activeCrmTab === 'outbox' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Dispatched At</th>
                <th className="py-3.5 px-4">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outbox.map((mail) => (
                <tr key={mail.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{mail.recipientEmail}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{mail.subject}</td>
                  <td className="py-3.5 px-4 text-slate-400">{new Date(mail.sentAt).toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {mail.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {outbox.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No emails recorded in system outbox.
            </div>
          )}
        </div>
      )}

      {/* CRM Modals */}
      <AddAccountModal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} />
      <AssignAccountModal student={assigningStudent} onClose={() => setAssigningStudent(null)} />
      <AccountCredentialsModal student={credentialStudent} onClose={() => setCredentialStudent(null)} />
    </div>
  );
}
