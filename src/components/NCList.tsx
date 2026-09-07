/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { NonConformite, User, Service, NCDecision } from '../types';
import { exportToPDF } from '../lib/pdfUtils';
import { exportNCToExcel } from '../lib/excelExporter';
import SolupackLogo from './SolupackLogo';
import { seedDemoNCs } from '../lib/db';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  Eye, 
  Paperclip,
  ChevronDown,
  CornerDownRight,
  ShieldAlert,
  Download,
  X,
  Sparkles
} from 'lucide-react';

interface NCListProps {
  nonConformites: NonConformite[];
  users: User[];
  currentUser: User;
  onEdit: (nc: NonConformite) => void;
  onDelete: (id: string) => void;
  onAddNote: (ncId: string, noteText: string) => void;
  onOpenCreateForm: () => void;
  onRefresh?: () => void;
}

export default function NCList({ 
  nonConformites, 
  users, 
  currentUser, 
  onEdit, 
  onDelete, 
  onAddNote, 
  onOpenCreateForm,
  onRefresh
}: NCListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('TOUS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TOUS');
  const [selectedDecision, setSelectedDecision] = useState<string>('TOUS');
  
  // Date filter states
  const [dateMode, setDateMode] = useState<'RANGE' | 'DMY' | 'SINGLE'>('RANGE');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Active note state
  const [noteNCId, setNoteNCId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Active print preview NC
  const [printNC, setPrintNC] = useState<NonConformite | null>(null);

  // Custom modals state
  const [ncToDelete, setNcToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search and filter logic
  const filteredNCs = useMemo(() => {
    return nonConformites.filter(nc => {
      const matchesSearch = 
        nc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.shortTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.articleLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.ofNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nc.clients && nc.clients.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesService = selectedService === 'TOUS' || nc.serviceConcerned === selectedService;
      
      const isClosed = !!nc.closeDate;
      const hasDémarrer = nc.actions.length === 0 || nc.actions.some(a => a.status === 'Démarrer');
      const hasEnCours = !isClosed && nc.actions.some(a => a.status === 'En cours' || a.status === 'Effectué');
      
      let computedStatus = 'Démarrer';
      if (isClosed) {
        computedStatus = 'Effectué';
      } else if (hasEnCours && !hasDémarrer) {
        computedStatus = 'En cours';
      } else {
        computedStatus = 'Démarrer';
      }

      let matchesStatus = true;
      if (selectedStatus === 'NON_CLOTURE') {
        matchesStatus = !isClosed;
      } else if (selectedStatus !== 'TOUS') {
        matchesStatus = computedStatus === selectedStatus;
      }

      const matchesDecision = selectedDecision === 'TOUS' || nc.decision === selectedDecision;
      
      // Date filter check
      let matchesDate = true;
      if (nc.ncDate) {
        if (dateMode === 'RANGE') {
          if (startDate && nc.ncDate < startDate) matchesDate = false;
          if (endDate && nc.ncDate > endDate) matchesDate = false;
        } else if (dateMode === 'DMY') {
          const parts = nc.ncDate.split('-');
          if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (selectedYear && y !== parseInt(selectedYear, 10)) matchesDate = false;
            if (selectedMonth && m !== parseInt(selectedMonth, 10)) matchesDate = false;
            if (selectedDay && d !== parseInt(selectedDay, 10)) matchesDate = false;
          }
        } else if (dateMode === 'SINGLE') {
          if (selectedDate && nc.ncDate !== selectedDate) matchesDate = false;
        }
      }

      return matchesSearch && matchesService && matchesStatus && matchesDecision && matchesDate;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [nonConformites, searchTerm, selectedService, selectedStatus, selectedDecision, dateMode, selectedDate, startDate, endDate, selectedDay, selectedMonth, selectedYear]);

  // Processing time metrics for NCs (Durée de traitement en jours)
  const processingTimeStats = useMemo(() => {
    // Helper function to calculate duration for an NC in days safely
    const calculateDurationDays = (nc: NonConformite) => {
      if (!nc.ncDate) return 0;
      const start = new Date(nc.ncDate).getTime();
      const end = nc.closeDate ? new Date(nc.closeDate).getTime() : new Date().getTime();
      if (isNaN(start) || isNaN(end)) return 0;
      const diffMs = end - start;
      const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return isNaN(days) ? 0 : Math.max(0, days);
    };

    const closedNCs = filteredNCs.filter(nc => !!nc.closeDate);
    const totalClosedDays = closedNCs.reduce((acc, nc) => acc + calculateDurationDays(nc), 0);
    const averageClosedDays = closedNCs.length > 0 ? Number((totalClosedDays / closedNCs.length).toFixed(1)) : 0;
    const targetDays = 2; // Résultat ciblé: 2 jours
    const isTargetMet = closedNCs.length > 0 ? averageClosedDays <= targetDays : true;

    return {
      calculateDurationDays,
      closedNCsCount: closedNCs.length,
      totalClosedDays,
      averageClosedDays,
      targetDays,
      isTargetMet
    };
  }, [filteredNCs]);

  // Export filtered list to Excel with ALL fields
  const handleExportExcel = () => {
    exportNCToExcel(filteredNCs);
  };

  // Render NC status Badge
  const renderStatusBadge = (nc: NonConformite) => {
    const isClosed = !!nc.closeDate;
    const hasDémarrer = nc.actions.length === 0 || nc.actions.some(a => a.status === 'Démarrer');
    const hasEnCours = !isClosed && nc.actions.some(a => a.status === 'En cours' || a.status === 'Effectué');

    if (isClosed) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold font-mono px-2.5 py-0.5 rounded-full shadow-xs border border-emerald-200">
          <CheckCircle className="h-3 w-3 text-emerald-600" /> Clôturée
        </span>
      );
    } else if (hasEnCours && !hasDémarrer) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold font-mono px-2.5 py-0.5 rounded-full shadow-xs border border-amber-200">
          <Clock className="h-3 w-3 text-amber-600" /> En cours 🟠
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold font-mono px-2.5 py-0.5 rounded-full shadow-xs border border-red-200">
          <AlertTriangle className="h-3 w-3 text-red-600" /> À démarrer 🔴
        </span>
      );
    }
  };

  // Add additive note for tracebility
  const handleSaveNote = (ncId: string) => {
    if (!newNoteText.trim()) return;
    onAddNote(ncId, newNoteText);
    setNewNoteText('');
    setNoteNCId(null);
  };

  // Launch Print Dialog for official document
  const triggerPrintDoc = () => {
    window.print();
  };

  const handleDownloadPDF = async (ncId: string) => {
    await exportToPDF("printable-solupack-sheet", `SOLUPACK_Fiche_NC_${ncId}.pdf`);
  };

  return (
    <div id="module-nc-prod" className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs gap-4">
        <div>
          <h2 className="text-blue-900 font-bold text-lg md:text-xl flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-600" />
            MODULE 2 : Non-Conformités Internes de Production (NC Prod)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Déclaration, traçabilité et pilotage des dérives d'ateliers en conformité avec l'ISO 9001:2015 (§8.7 & §10.2)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-seed-nc"
            type="button"
            onClick={async () => {
              await seedDemoNCs();
              if (onRefresh) onRefresh();
              else window.dispatchEvent(new CustomEvent('solupack_data_changed'));
            }}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-2 rounded text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0"
            title="Injecter / actualiser les exemples de NC de production (notamment les cas non clôturés)"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Charger exemples démo
          </button>
          
          <button
            id="btn-add-nc"
            onClick={onOpenCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-2 shadow-xs transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> Déclarer une NC (Prod)
          </button>
        </div>
      </div>

      {/* KPI Banner: Durée de Traitement des NC (Somme Moyenne avec Cible 2 jours) */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-blue-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-blue-200 uppercase">
            <Clock className="h-4.5 w-4.5 text-orange-400" />
            Indicateur Qualité : Durée de Traitement des NC
          </div>
          <p className="text-xs text-slate-300">
            Formule : Somme Moyenne (Date de Clôture − Date de Détection) en jours · SLA Cible ISO 9001
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Somme Moyenne */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 uppercase font-semibold block">Somme Moyenne</span>
            <span className="text-2xl font-black font-mono text-white">
              {processingTimeStats.averageClosedDays.toFixed(1)} <span className="text-xs font-normal text-blue-200">jours</span>
            </span>
          </div>

          {/* Somme Cumulée */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 uppercase font-semibold block">Somme Cumulée</span>
            <span className="text-lg font-bold font-mono text-white">
              {processingTimeStats.totalClosedDays} <span className="text-xs font-normal text-blue-200">j ({processingTimeStats.closedNCsCount} NCs clos)</span>
            </span>
          </div>

          {/* Résultat Ciblé: 2 Jours */}
          <div className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 shadow-xs ${
            processingTimeStats.isTargetMet 
              ? 'bg-emerald-500/20 border-emerald-400/80 text-emerald-200' 
              : 'bg-red-500/20 border-red-400/80 text-red-200'
          }`}>
            {processingTimeStats.isTargetMet ? (
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-mono opacity-80">Résultat Ciblé</span>
              <span className="text-xs font-extrabold">
                Cible : 2 jours {processingTimeStats.isTargetMet ? '✓ (Conforme)' : '⚠️ (Dépassement)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multicriteria Search & Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
            <Filter className="h-4 w-4 text-orange-600" /> Filtres et Recherche Multicritères
          </div>
          {/* Quick status tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedStatus('TOUS')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                selectedStatus === 'TOUS' 
                  ? 'bg-blue-900 text-white shadow-xs font-bold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes ({nonConformites.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('NON_CLOTURE')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                selectedStatus === 'NON_CLOTURE' 
                  ? 'bg-amber-600 text-white shadow-xs font-bold' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="h-3 w-3" /> Non clôturées ({nonConformites.filter(n => !n.closeDate).length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('Effectué')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                selectedStatus === 'Effectué' 
                  ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle className="h-3 w-3" /> Clôturées ({nonConformites.filter(n => !!n.closeDate).length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher (N° NC, Article, OF, Client...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>

          {/* Service concerned */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs"
          >
            <option value="TOUS">Service Concerné : TOUS</option>
            <option value="Extrusion">Extrusion</option>
            <option value="Soudure">Soudure</option>
            <option value="Impression">Impression</option>
            <option value="Lamination">Lamination</option>
            <option value="Rebobinage">Rebobinage</option>
            <option value="Recyclage">Recyclage</option>
            <option value="Autres">Autres</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs font-semibold"
          >
            <option value="TOUS">Statut Fiche : TOUS</option>
            <option value="NON_CLOTURE">⏳ Non clôturées (En cours)</option>
            <option value="Démarrer">Statut : Démarrée 🔴</option>
            <option value="En cours">Statut : En cours 🟠</option>
            <option value="Effectué">Statut : Clôturée 🟢</option>
          </select>

          {/* Quality Decision */}
          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value)}
            className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs"
          >
            <option value="TOUS">Décision Qualité : TOUTES</option>
            <option value="Blocage">Blocage temporaire</option>
            <option value="Rebut">Rebut (Destruction)</option>
            <option value="Recyclage interne">Recyclage interne</option>
            <option value="Retouche">Retouche</option>
            <option value="Dérogation">Dérogation client</option>
            <option value="Retour fournisseur">Retour fournisseur</option>
            <option value="Déclassement">Déclassement</option>
          </select>

          {/* Date Filter Mode Selection */}
          <select
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value as any)}
            className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs font-semibold text-blue-900"
          >
            <option value="RANGE">Filtre Date : Entre deux dates</option>
            <option value="DMY">Filtre Date : Jour / Mois / Année</option>
            <option value="SINGLE">Filtre Date : Date unique</option>
          </select>
        </div>

        {/* Date Filter Detailed Inputs */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
          {dateMode === 'RANGE' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-700">Entre deux dates :</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Du :</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1.5 bg-white text-xs font-mono outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Au :</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1.5 bg-white text-xs font-mono outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-red-600 hover:text-red-800 font-bold text-[11px] underline"
                >
                  Effacer dates
                </button>
              )}
            </div>
          )}

          {dateMode === 'DMY' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-700">Choix par Jour / Mois / Année :</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Jour :</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1 bg-white text-xs outline-none"
                >
                  <option value="">Tous les jours</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d < 10 ? `0${d}` : d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Mois :</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1 bg-white text-xs outline-none"
                >
                  <option value="">Tous les mois</option>
                  <option value="1">01 - Janvier</option>
                  <option value="2">02 - Février</option>
                  <option value="3">03 - Mars</option>
                  <option value="4">04 - Avril</option>
                  <option value="5">05 - Mai</option>
                  <option value="6">06 - Juin</option>
                  <option value="7">07 - Juillet</option>
                  <option value="8">08 - Août</option>
                  <option value="9">09 - Septembre</option>
                  <option value="10">10 - Octobre</option>
                  <option value="11">11 - Novembre</option>
                  <option value="12">12 - Décembre</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Année :</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1 bg-white text-xs font-mono outline-none"
                >
                  <option value="">Toutes les années</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              {(selectedDay || selectedMonth || selectedYear) && (
                <button
                  type="button"
                  onClick={() => { setSelectedDay(''); setSelectedMonth(''); setSelectedYear(''); }}
                  className="text-red-600 hover:text-red-800 font-bold text-[11px] underline"
                >
                  Effacer
                </button>
              )}
            </div>
          )}

          {dateMode === 'SINGLE' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Saisir une date :</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded-lg p-1.5 bg-white text-xs font-mono outline-none"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-red-600 hover:text-red-800 font-bold text-[11px] underline"
                >
                  Effacer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Counter & Clear Button */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
          <span><b>{filteredNCs.length}</b> non-conformités trouvées sur <b>{nonConformites.length}</b> déclarées.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedService('TOUS');
                setSelectedStatus('TOUS');
                setSelectedDecision('TOUS');
                setSelectedDate('');
              }}
              className="text-orange-600 font-semibold hover:underline"
            >
              Réinitialiser les filtres
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleExportExcel}
              className="text-blue-900 font-semibold hover:underline flex items-center gap-1"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Exporter Excel
            </button>
          </div>
        </div>
      </div>

      {/* NC Data Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 border-b border-slate-200">ID / Date</th>
                <th className="px-4 py-3 border-b border-slate-200">Section & OF</th>
                <th className="px-4 py-3 border-b border-slate-200">Désignation / Article</th>
                <th className="px-4 py-3 border-b border-slate-200">Quantité (kg)</th>
                <th className="px-4 py-3 border-b border-slate-200">Décision</th>
                <th className="px-4 py-3 border-b border-slate-200">Statut</th>
                <th className="px-4 py-3 border-b border-slate-200">Durée / Délai</th>
                <th className="px-4 py-3 border-b border-slate-200 text-center">Factions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredNCs.map((nc) => (
                <React.Fragment key={nc.id}>
                  {/* Primary Row */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 align-top">
                      <span className="font-bold text-blue-900 font-mono text-sm block">
                        {nc.id}
                      </span>
                      <span className="text-slate-400 block mt-1 font-mono text-[10px]">
                        📅 {nc.ncDate} {nc.ncTime}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                        Quart: {nc.shift} | Éq: {nc.team}
                      </span>
                    </td>

                    <td className="p-4 align-top">
                      <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md text-[10px] font-bold block w-fit">
                        {nc.serviceConcerned}
                      </span>
                      <span className="text-slate-600 mt-2 block font-mono font-semibold">
                        OF: {nc.ofNumber || 'N/A'}
                      </span>
                      <span className="text-slate-400 mt-1 block text-[10px]">
                        Superv: {nc.supervisor || 'Aucun'}
                      </span>
                    </td>

                    <td className="p-4 align-top max-w-xs">
                      <p className="font-bold text-slate-800 text-sm hover:text-blue-900 transition-colors">
                        {nc.shortTitle}
                      </p>
                      <p className="text-slate-500 mt-1 italic text-[11px] line-clamp-1">
                        Code: {nc.articleCode} - {nc.articleLabel}
                      </p>
                      {nc.clients && (
                        <p className="text-orange-600 font-medium text-[10px] mt-1.5 flex items-center gap-1">
                          👤 Client: {nc.clients}
                        </p>
                      )}
                    </td>

                    <td className="p-4 align-top font-mono font-bold text-slate-700 text-sm">
                      {nc.quantityKg} kg
                      {nc.quantityUnitDetails && (
                        <span className="text-[10px] text-slate-400 font-normal block mt-1">
                          {nc.quantityUnitDetails}
                        </span>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-2 py-1 rounded text-[10px]">
                        {nc.decision}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-2">
                        Cause: {nc.cause5M}
                      </span>
                    </td>

                    <td className="p-4 align-top">
                      {renderStatusBadge(nc)}
                      
                      {/* Show active verifier if closed */}
                      {nc.closeDate && (
                        <span className="text-[10px] text-slate-500 block mt-1.5 font-semibold">
                          Clos le {nc.closeDate}
                        </span>
                      )}
                    </td>

                    {/* Durée de Traitement (Date Clôture - Date Détection) */}
                    <td className="p-4 align-top">
                      {nc.closeDate ? (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            processingTimeStats.calculateDurationDays(nc) <= 2
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {processingTimeStats.calculateDurationDays(nc) <= 2 ? (
                              <CheckCircle className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                            )}
                            {processingTimeStats.calculateDurationDays(nc)} j {processingTimeStats.calculateDurationDays(nc) <= 2 ? '(≤ 2j)' : '(> 2j)'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Clôturé le {nc.closeDate}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 font-mono font-semibold px-2 py-0.5 rounded text-[11px]">
                            <Clock className="h-3 w-3 text-amber-600" />
                            En cours ({processingTimeStats.calculateDurationDays(nc)} j)
                          </span>
                          <span className="text-[10px] text-slate-400 block italic">
                            Depuis le {nc.ncDate}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="p-4 align-top text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`btn-view-${nc.id}`}
                          onClick={() => setPrintNC(nc)}
                          className="bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-600 p-2 rounded-lg transition-all"
                          title="Fiche Officielle & Impression"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          id={`btn-edit-${nc.id}`}
                          onClick={() => onEdit(nc)}
                          className="bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 p-2 rounded-lg transition-all"
                          title="Modifier la fiche"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          id={`btn-delete-${nc.id}`}
                          onClick={() => {
                            if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PILOTE') {
                              setErrorMessage("Rôle d'Administrateur ou Pilote QHSE requis pour supprimer une fiche de non-conformité.");
                              return;
                            }
                            setNcToDelete(nc.id);
                          }}
                          className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 p-2 rounded-lg transition-all"
                          title="Supprimer la fiche (Admin/Pilote)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setNoteNCId(noteNCId === nc.id ? null : nc.id)}
                          className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 p-2 rounded-lg transition-all relative"
                          title="Ajouter une note de traçabilité (§7.5)"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {nc.additionalNotes.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-900 text-white rounded-full w-4.5 h-4.5 text-[9px] font-bold flex items-center justify-center scale-90">
                              {nc.additionalNotes.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Additive Notes Sub-Tray (ISO 9001 Immutability Guard) */}
                  {noteNCId === nc.id && (
                    <tr className="bg-slate-50 border-t border-slate-100">
                      <td colSpan={7} className="p-4">
                        <div className="max-w-2xl bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3 ml-12">
                          <span className="font-bold text-slate-700 text-xs block">
                            Traçabilité ISO 9001:2015 (§7.5) — Notes d'historique (Inaltérables)
                          </span>
                          
                          {/* List of notes */}
                          {nc.additionalNotes.length > 0 ? (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {nc.additionalNotes.map(n => (
                                <div key={n.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                                  <div className="flex justify-between font-bold text-slate-700 mb-1 text-[10px]">
                                    <span>{n.author} ({n.role})</span>
                                    <span>{n.date}</span>
                                  </div>
                                  <p>{n.text}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs italic">Aucune note additionnelle sur cette fiche.</p>
                          )}

                          {/* Saisie de note */}
                          <div className="flex gap-2 text-xs pt-2">
                            <input 
                              type="text" 
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              placeholder="Ajouter une note d'observation obligatoire ou un commentaire ineffaçable..."
                              className="flex-1 border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                            />
                            <button
                              onClick={() => handleSaveNote(nc.id)}
                              className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-1.5 rounded-lg text-xs shrink-0"
                            >
                              Valider l'ajout
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {filteredNCs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-10 text-slate-400 italic">
                    Aucune fiche ne correspond à vos critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICIAL QUALITY SHEET POPUP PREVIEW & PRINT MODEL */}
      {printNC && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
            
            {/* Action Bar */}
            <div className="bg-blue-950 text-white p-4 flex justify-between items-center shrink-0 no-print">
              <span className="font-bold flex items-center gap-2 text-xs md:text-sm">
                <Printer className="h-4 w-4 text-orange-600" />
                SOLUPACK S.A. — Visualisation & Export de Fiche Officielle
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={triggerPrintDoc}
                  className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimer (Papier)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(printNC.id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Télécharger PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPrintNC(null)}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-full transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Outer Scroll Wrapper */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
              {/* Printable Content Element - Unconstrained for complete PDF capture */}
              <div className="bg-white p-5 md:p-6 rounded-xl border-2 border-blue-900 shadow-xl space-y-3 text-xs text-slate-800 print-area max-w-4xl mx-auto" id="printable-solupack-sheet">
                
                {/* Solupack Corporate Header Grid */}
                <div className="grid grid-cols-12 border-b-2 border-blue-900 pb-3 items-center gap-2">
                  <div className="col-span-4 text-left flex flex-col justify-center items-stretch pr-2">
                    <div className="w-full h-14 flex items-center justify-center bg-white rounded border border-slate-100 overflow-hidden p-1">
                      <SolupackLogo className="h-full w-full" variant="light" />
                    </div>
                    <span className="text-[8px] text-slate-500 block mt-1 text-center md:text-left font-semibold">Zone Industrielle Yopougon, Abidjan</span>
                  </div>
                  <div className="col-span-4 text-center border-l border-r border-slate-300 py-1 px-1">
                    <h1 className="text-sm md:text-base font-black text-blue-950 uppercase leading-snug">Fiche d'Écart & Non-Conformité</h1>
                    <span className="bg-blue-900 text-white text-xs font-mono font-bold px-3 py-0.5 rounded mt-1.5 inline-block">
                      {printNC.id}
                    </span>
                  </div>
                  <div className="col-span-4 text-right text-[10px] space-y-0.5 text-slate-800 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="font-bold text-blue-950">code : FOR-PM2-34</div>
                    <div>Date de création: 05/01/2022</div>
                    <div>Date de révision: 06/07/2026</div>
                    <div>Version: 01</div>
                    <div className="text-[9px] text-blue-900 font-bold border-t border-slate-200 pt-0.5 mt-0.5">
                      Statut: {printNC.closeDate ? 'CLÔTURÉ' : 'EN COURS DE TRAITEMENT'}
                    </div>
                  </div>
                </div>

                {/* Section 1: Identification */}
                <div className="space-y-1.5 print-section">
                  <h2 className="bg-blue-900 text-white font-bold text-xs p-1 uppercase rounded tracking-wider">
                    I. Identification de l'Écart & Détection
                  </h2>
                  <div className="grid grid-cols-4 gap-3 text-[11px] p-1 text-slate-700">
                    <div>
                      <b className="text-slate-500 block">Date & Heure :</b>
                      <span>{printNC.ncDate} à {printNC.ncTime}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Quart / Équipe :</b>
                      <span>Quart {printNC.shift} | Équipe {printNC.team}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Superviseur :</b>
                      <span>{printNC.supervisor || 'Non renseigné'}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Atelier Concerné :</b>
                      <span>{printNC.serviceConcerned}</span>
                    </div>

                    <div>
                      <b className="text-slate-500 block">Émetteur / Détecteur :</b>
                      <span>{printNC.detectorName} ({printNC.detectorFunction})</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Méthode de Détection :</b>
                      <span>{printNC.detectionMethod}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Source d'origine :</b>
                      <span>{printNC.source}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Actions d'urgence :</b>
                      <span className="text-[10px] block">{printNC.immediateActions.join(', ') || 'Aucune'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Type de NC & Produit */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 print-section">
                  <h2 className="bg-blue-900 text-white font-bold text-xs p-1 uppercase rounded tracking-wider">
                    II. Détail du Produit & Désignation de l'Écart
                  </h2>
                  <div className="grid grid-cols-4 gap-3 text-[11px] p-1 text-slate-700">
                    <div className="col-span-2">
                      <b className="text-slate-500 block">Désignation de la NC :</b>
                      <span className="font-bold text-xs text-blue-950">{printNC.shortTitle}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Code & Libellé Article :</b>
                      <span>{printNC.articleCode} - {printNC.articleLabel}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">N° OF (Ordre Fab) :</b>
                      <span className="font-mono">{printNC.ofNumber || 'N/A'}</span>
                    </div>

                    <div>
                      <b className="text-slate-500 block">Type de produit :</b>
                      <span>{printNC.productType}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Quantité Refusée :</b>
                      <span className="font-mono font-bold text-red-600">{printNC.quantityKg} kg ({printNC.quantityUnitDetails || 'Aucune bobine spécifiée'})</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Machine de production :</b>
                      <span>{printNC.machine || 'N/A'}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block">Clients concernés :</b>
                      <span>{printNC.clients || 'Usage Interne'}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Description et décision */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 print-section">
                  <h2 className="bg-blue-900 text-white font-bold text-xs p-1 uppercase rounded tracking-wider">
                    III. Constat & Prise de Décision Qualité
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-[11px] p-1 text-slate-700">
                    <div>
                      <b className="text-slate-500 block mb-1">Description Détaillée du Constat :</b>
                      <p className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] leading-relaxed italic">{printNC.description}</p>
                    </div>
                    <div>
                      <b className="text-slate-500 block mb-1">Causes possibles soupçonnées :</b>
                      <p className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] leading-relaxed italic">{printNC.possibleCauses || 'Aucune hypothèse saisie'}</p>
                    </div>
                    <div className="col-span-2">
                      <b className="text-slate-500 block">Décision d'orientation immédiate (Traitement) :</b>
                      <span className="font-bold text-slate-800 bg-orange-100 border border-orange-200 px-2.5 py-0.5 rounded inline-block mt-0.5 text-[11px]">
                        👉 {printNC.decision}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Causes racines 5M & 5 Whys */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 print-section">
                  <h2 className="bg-blue-900 text-white font-bold text-xs p-1 uppercase rounded tracking-wider">
                    IV. Analyse Causes Racines (Clause ISO 9001 §10.2)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] p-1 text-slate-700">
                    <div>
                      <b className="text-slate-600 block mb-1">Catégories & Synthèses Ishikawa :</b>
                      {printNC.ishikawaCategories && printNC.ishikawaCategories.length > 0 ? (
                        <div className="space-y-1.5">
                          {printNC.ishikawaCategories.map((cat, idx) => (
                            <div key={idx} className="bg-slate-50 p-1.5 rounded border border-slate-200 text-[10px]">
                              <span className="font-bold text-blue-900 block">{cat.category}</span>
                              {cat.causes && <p className="text-slate-700"><b>Causes :</b> {cat.causes}</p>}
                              {cat.synthesis && <p className="text-slate-600 italic"><b>Synthèse :</b> {cat.synthesis}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="font-bold text-blue-900">{printNC.cause5M}</span>
                      )}

                      {printNC.ishikawaAnalysis && (
                        <div className="mt-1.5 bg-amber-50 p-1.5 rounded border border-amber-200 text-[10px]">
                          <b className="text-amber-900 block">Synthèse Globale :</b>
                          <p className="text-slate-700">{printNC.ishikawaAnalysis}</p>
                        </div>
                      )}

                      {printNC.smqRiskAttached && (
                        <p className="text-[10px] font-bold text-red-600 mt-1">
                          ⚠️ Lié au Risque Cartographie SMQ: {printNC.smqRiskRef}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <b className="text-slate-600 block mb-1">Enchaînement logique des 5 Pourquoi :</b>
                      <div className="space-y-1.5 bg-slate-50 p-2 rounded border border-slate-200 text-[10px]">
                        {printNC.whys.map((why, idx) => (
                          <div key={idx} className="flex gap-2 items-start bg-white p-1.5 rounded border border-slate-100">
                            <span className="font-mono bg-blue-900 text-white font-bold px-1.5 py-0.5 rounded text-[8px] shrink-0">
                              P{idx + 1}
                            </span>
                            <div className="flex-1">
                              <span className="font-bold text-slate-700 text-[9px] block">
                                {idx === 0 ? "Pourquoi 1 : Pourquoi cette cause s'est-elle produite ?" : `Pourquoi ${idx + 1} : Pourquoi cela ? (sur la réponse précédente)`}
                              </span>
                              <span className="italic text-slate-800">{why || '—'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Plan d'actions correctives */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 print-section">
                  <h2 className="bg-blue-900 text-white font-bold text-xs p-1 uppercase rounded tracking-wider">
                    V. Plan d'Actions Correctives et d'Efficacité
                  </h2>
                  <table className="w-full text-left border-collapse text-[10px] border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="p-1 border border-slate-300">Action Corrective / Préventive</th>
                        <th className="p-1 border border-slate-300">Type</th>
                        <th className="p-1 border border-slate-300">Responsable</th>
                        <th className="p-1 border border-slate-300">Délai Échéance</th>
                        <th className="p-1 border border-slate-300">Statut</th>
                        <th className="p-1 border border-slate-300">Efficacité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {printNC.actions.map((act) => (
                        <tr key={act.id}>
                          <td className="p-1 border border-slate-300 font-medium">{act.description}</td>
                          <td className="p-1 border border-slate-300">{act.type}</td>
                          <td className="p-1 border border-slate-300">{act.responsible}</td>
                          <td className="p-1 border border-slate-300 font-mono">{act.deadline}</td>
                          <td className="p-1 border border-slate-300 font-bold">{act.status}</td>
                          <td className="p-1 border border-slate-300 italic">{act.efficiency ? `Oui (${act.efficiencyComment})` : 'Non vérifiée'}</td>
                        </tr>
                      ))}
                      {printNC.actions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-1.5 text-center text-slate-400 italic">Aucune action planifiée</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Section 6: Notes de modifications (Audit Trail) */}
                {printNC.additionalNotes.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 print-section">
                    <h2 className="bg-blue-900 text-white font-bold text-xs p-1 uppercase rounded tracking-wider">
                      VI. Notes de Suivi Inaltérables (§7.5)
                    </h2>
                    <div className="space-y-1">
                      {printNC.additionalNotes.map(note => (
                        <div key={note.id} className="p-1 bg-slate-50 rounded border border-slate-200 text-[10px]">
                          <span className="font-bold text-slate-700">{note.author} ({note.role}) - {note.date} :</span>
                          <span className="italic ml-1 text-slate-600">{note.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatures Blocks - Never split on print page break */}
                <div className="grid grid-cols-3 gap-3 border-t-2 border-blue-900 pt-3 mt-3 avoid-page-break print-section">
                  <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <b className="text-[9px] text-slate-500 uppercase block mb-1">I. Émetteur / Détecteur</b>
                    <span className="font-serif italic text-blue-900 font-bold text-sm block my-1">{printNC.signatures.detectorSignature || '................................'}</span>
                    <p className="text-[8px] text-slate-400">Signature & Nom</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <b className="text-[9px] text-slate-500 uppercase block mb-1">II. Co-Pilote / Responsable</b>
                    <span className="font-serif italic text-blue-900 font-bold text-sm block my-1">{printNC.signatures.responsibleSignature || '................................'}</span>
                    <p className="text-[8px] text-slate-400">Validation Technique</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <b className="text-[9px] text-slate-500 uppercase block mb-1">III. Direction / Pilote QHSE</b>
                    <span className="font-serif italic text-blue-900 font-bold text-sm block my-1">{printNC.signatures.verifierSignature || '................................'}</span>
                    <p className="text-[8px] text-slate-400">Archivage & Clôture SMQ</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Close */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end no-print shrink-0">
              <button
                onClick={() => setPrintNC(null)}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-6 py-2 rounded-xl text-xs shadow"
              >
                Fermer l'aperçu
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting NC */}
      {ncToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-[100] p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Suppression Irréversible</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Confirmez-vous la suppression définitive et irréversible de la fiche de non-conformité <b className="font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">{ncToDelete}</b> ?
                </p>
                <p className="text-[10px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                  Cette action est définitive et enregistrée dans le journal d'audit SMQ (§10.2).
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNcToDelete(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(ncToDelete);
                  setNcToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal for Access Restrictions */}
      {errorMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-[100] p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Contrôle d'Accès Qualité</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-lg transition-all"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
