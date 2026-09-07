/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLog, NotificationLog } from '../types';
import { exportAuditLogsToExcel, exportNotificationsToExcel } from '../lib/excelExporter';
import { 
  FileText, 
  Mail, 
  Clock, 
  User, 
  ShieldCheck, 
  Bell, 
  AlertTriangle, 
  Send,
  RefreshCw,
  Search,
  FileSpreadsheet
} from 'lucide-react';

interface HistoryLogProps {
  logs: AuditLog[];
  notifications: NotificationLog[];
  onClearLogs?: () => void;
}

export default function HistoryLog({ logs, notifications, onClearLogs }: HistoryLogProps) {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'NOTIFS'>('AUDIT');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.targetId.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const filteredNotifs = notifications.filter(n => 
    n.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    n.recipientEmail.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div id="module-history-notifs" className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-blue-900 font-bold text-lg md:text-xl flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-orange-600" />
            Traçabilité ISO 9001 & Notifications Automatiques
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Visualisation des traces inaltérables de l'audit d'exploitation et du simulateur d'envoi d'emails d'alerte aux pilotes
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => { setActiveTab('AUDIT'); setSearch(''); }}
            className={`px-4 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${activeTab === 'AUDIT' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'}`}
          >
            <FileText className="h-4 w-4" /> Journal d'Audit (§7.5)
          </button>
          <button
            onClick={() => { setActiveTab('NOTIFS'); setSearch(''); }}
            className={`px-4 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${activeTab === 'NOTIFS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'}`}
          >
            <Mail className="h-4 w-4" /> Notifications Mail Émises
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex gap-4 items-center justify-between text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'AUDIT' ? "Filtrer le journal d'audit..." : "Filtrer les emails envoyés..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 outline-none text-xs"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (activeTab === 'AUDIT') {
                exportAuditLogsToExcel(filteredLogs);
              } else {
                exportNotificationsToExcel(filteredNotifs);
              }
            }}
            className="text-blue-900 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-all shrink-0"
            title={activeTab === 'AUDIT' ? "Exporter les traces d'audit filtrées vers Excel" : "Exporter les notifications d'alertes filtrées vers Excel"}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Exporter Excel ({activeTab === 'AUDIT' ? filteredLogs.length : filteredNotifs.length})
          </button>
          <span className="text-slate-400 font-medium">
            {activeTab === 'AUDIT' ? `Traces d'audit: ${filteredLogs.length}` : `Alertes mails: ${filteredNotifs.length}`}
          </span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* TAB 1: AUDIT TRAIL LOGS */}
        {activeTab === 'AUDIT' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wide">
                  <th className="p-4">Horodatage (UTC)</th>
                  <th className="p-4">Collaborateur</th>
                  <th className="p-4">Rôle</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Module / Fiche N°</th>
                  <th className="p-4">Détails de modification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-400 font-semibold">
                      {new Date(l.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-4 font-bold text-blue-950 font-sans">
                      {l.userName}
                    </td>
                    <td className="p-4 font-sans font-semibold">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        {l.userRole}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                        l.action === 'CREATE' ? 'bg-blue-100 text-blue-800' :
                        l.action === 'UPDATE' ? 'bg-amber-100 text-amber-800' :
                        l.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-700">{l.module} :</span>
                      <b className="text-orange-600 ml-1 font-bold">{l.targetId}</b>
                    </td>
                    <td className="p-4 text-slate-600 font-sans leading-normal max-w-sm" title={l.details}>
                      {l.details}
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-slate-400 italic font-sans">
                      Aucune trace d'audit enregistrée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: SIMULATED EMAIL NOTIFICATIONS */}
        {activeTab === 'NOTIFS' && (
          <div className="p-6 space-y-4">
            
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3 text-xs text-orange-950">
              <Bell className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <b className="block font-bold">Fonctionnement du Système d'Alertes SoluPack</b>
                <p className="mt-1 text-orange-800">
                  L'application intègre un moteur de notification en tâche de fond. Des courriels automatiques sont simulés et tracés ci-dessous aux moments clés :
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-orange-800 font-medium">
                  <li><b>Ouverture :</b> Mail au pilote concerné (ex: Kemo Ange) dès déclaration d'un écart.</li>
                  <li><b>Avertissement 3j :</b> Alerte de rappel de mise en œuvre 3 jours avant l'échéance.</li>
                  <li><b>Alerte Retard :</b> Relance critique rouge automatique dès qu'une action dépasse son délai.</li>
                </ul>
              </div>
            </div>

            {/* List of simulated emails sent */}
            <div className="space-y-4">
              {filteredNotifs.map(n => (
                <div key={n.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                  
                  {/* Mail Header */}
                  <div className="bg-slate-100 p-3 px-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4.5 w-4.5 text-blue-900" />
                      <span className="font-semibold text-slate-500">De : <b className="text-slate-700">SOLUPACK Quality Engine &lt;qhse-system@solupack.com&gt;</b></span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      ⏱️ {new Date(n.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>

                  {/* Mail metadata */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <p className="text-slate-500 font-semibold">Destinataire : <b className="text-blue-950">{n.recipientName}</b> &lt;<span className="text-blue-900 underline font-mono">{n.recipientEmail}</span>&gt;</p>
                      <p className="text-slate-800 font-bold text-sm">Sujet : {n.subject}</p>
                    </div>

                    {/* Mail Body box */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 font-sans text-slate-600 leading-relaxed text-[11px] whitespace-pre-line relative">
                      <Send className="absolute bottom-2.5 right-2.5 h-4 w-4 text-emerald-600 opacity-60" />
                      {n.body}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Status: SIMULÉ ET ARCHIVÉ EN BASE (IndexedDB)
                    </div>
                  </div>

                </div>
              ))}

              {filteredNotifs.length === 0 && (
                <div className="text-center p-12 text-slate-400 italic">
                  Aucun courriel envoyé pour le moment.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
