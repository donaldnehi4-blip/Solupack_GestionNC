/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  NonConformite, 
  ClientComplaint, 
  BonDeTransfert 
} from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart2, 
  PieChart as PieIcon, 
  Calendar, 
  Activity, 
  Sparkles,
  Scale,
  Percent,
  Search,
  HelpCircle,
  Layers,
  Settings,
  Package,
  Users,
  Ruler,
  Thermometer,
  Lightbulb,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface DashboardProps {
  nonConformites: NonConformite[];
  complaints: ClientComplaint[];
  transfers: BonDeTransfert[];
}

export default function Dashboard({ nonConformites, complaints, transfers }: DashboardProps) {
  const [dateFilterMode, setDateFilterMode] = useState<'PRESET' | 'RANGE' | 'DMY'>('PRESET');
  const [timeRange, setTimeRange] = useState<'MOIS' | 'TRIMESTRE' | 'ANNEE' | 'TOUS'>('ANNEE');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);

  // Helper date matching function for any YYYY-MM-DD string
  const matchDateFilter = (dateStr: string) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length < 3) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);

    if (dateFilterMode === 'RANGE') {
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      return true;
    }

    if (dateFilterMode === 'DMY') {
      if (selectedYear && y !== parseInt(selectedYear, 10)) return false;
      if (selectedMonth && m !== parseInt(selectedMonth, 10)) return false;
      if (selectedDay && d !== parseInt(selectedDay, 10)) return false;
      return true;
    }

    // PRESET Mode
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    if (timeRange === 'MOIS') {
      return y === currentYear && m === currentMonth;
    } else if (timeRange === 'TRIMESTRE') {
      const currentQuarter = Math.floor((currentMonth - 1) / 3);
      const recordQuarter = Math.floor((m - 1) / 3);
      return y === currentYear && recordQuarter === currentQuarter;
    } else if (timeRange === 'ANNEE') {
      return y === currentYear;
    }
    return true; // 'TOUS'
  };

  // Filter records based on timeframe / range / DMY
  const filteredData = useMemo(() => {
    return {
      ncs: nonConformites.filter(nc => matchDateFilter(nc.ncDate)),
      complaints: complaints.filter(c => matchDateFilter(c.reclamationDate)),
      transfers: transfers.filter(bt => matchDateFilter(bt.constatDate))
    };
  }, [nonConformites, complaints, transfers, dateFilterMode, timeRange, startDate, endDate, selectedDay, selectedMonth, selectedYear]);

  // KPIs Calculations
  const stats = useMemo(() => {
    const ncs = filteredData.ncs;
    const comps = filteredData.complaints;

    const totalNCs = ncs.length;
    const closedNCs = ncs.filter(nc => !!nc.closeDate).length;
    const pendingNCs = Math.max(0, totalNCs - closedNCs);

    // Differentiate pending NCs: in progress (some actions in progress or done) vs open/to-start
    const inProgressNCs = ncs.filter(nc => !nc.closeDate && nc.actions.some(a => a.status === 'En cours' || a.status === 'Effectué')).length;
    const openNCs = Math.max(0, pendingNCs - inProgressNCs);

    // Taux de clôture dans les délais
    // An action is closed in time if there is a close date and it is before or on deadline
    const totalActions = ncs.flatMap(nc => nc.actions);
    const closedActions = totalActions.filter(a => a.status === 'Effectué');
    const closedInTimeActions = closedActions.filter(a => {
      if (!a.verificationDate) return true;
      return new Date(a.verificationDate) <= new Date(a.deadline);
    });
    const closureInTimeRate = totalActions.length > 0 
      ? Math.round((closedInTimeActions.length / totalActions.length) * 100) 
      : 100;

    // Coût de la non-qualité cumulé
    // Internal cost = quantityKg * 1500 FCFA
    const internalCost = ncs.reduce((acc, nc) => acc + ((nc.quantityKg || 0) * 1500), 0);
    // External cost = sum of complaints estimated costs
    const externalCost = comps.reduce((acc, c) => acc + (c.estimatedCostFcfa || 0), 0);
    const totalCostOfNonQuality = internalCost + externalCost;

    // Efficacité des actions correctives (%)
    const totalVerifiedActions = totalActions.filter(a => !!a.efficiency);
    const efficientActions = totalVerifiedActions.filter(a => a.efficiency === 'Oui');
    const efficiencyRate = totalVerifiedActions.length > 0
      ? Math.round((efficientActions.length / totalVerifiedActions.length) * 100)
      : 0;

    // Durée de traitement des NC (somme moyenne(date de clôture - date de détection)) en jours
    const treatedNCs = ncs.filter(nc => !!nc.closeDate);
    const totalTreatedDays = treatedNCs.reduce((acc, nc) => {
      if (!nc.ncDate || !nc.closeDate) return acc;
      const start = new Date(nc.ncDate).getTime();
      const end = new Date(nc.closeDate).getTime();
      if (isNaN(start) || isNaN(end)) return acc;
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return acc + Math.max(0, isNaN(days) ? 0 : days);
    }, 0);
    const averageTreatedDays = treatedNCs.length > 0 ? Number((totalTreatedDays / treatedNCs.length).toFixed(1)) : 0;
    const isDurationTargetMet = treatedNCs.length > 0 ? averageTreatedDays <= 2 : true;

    return {
      totalNCs,
      openNCs,
      inProgressNCs,
      closedNCs,
      closureInTimeRate,
      totalCostOfNonQuality,
      efficiencyRate,
      averageTreatedDays,
      totalTreatedDays,
      treatedNCsCount: treatedNCs.length,
      isDurationTargetMet,
      internalCost,
      externalCost
    };
  }, [filteredData]);

  // Quantité (kg) NC & Taux de Non-conformité (Mois, Trimestre, Année)
  const ncPeriodStats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    const checkPeriod = (dateStr: string, period: 'MOIS' | 'TRIMESTRE' | 'ANNEE') => {
      if (!dateStr) return false;
      const parts = dateStr.split('-');
      if (parts.length < 2) return false;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (isNaN(y) || isNaN(m)) return false;
      if (y !== currentYear) return false;
      if (period === 'ANNEE') return true;
      if (period === 'MOIS') return m === currentMonth;
      if (period === 'TRIMESTRE') return Math.floor(m / 3) === currentQuarter;
      return false;
    };

    // Filter NCs by period
    const ncsMois = nonConformites.filter(nc => checkPeriod(nc.ncDate, 'MOIS'));
    const ncsTrimestre = nonConformites.filter(nc => checkPeriod(nc.ncDate, 'TRIMESTRE'));
    const ncsAnnee = nonConformites.filter(nc => checkPeriod(nc.ncDate, 'ANNEE'));

    // Sum Quantity Kg
    const qtyNcMois = ncsMois.reduce((acc, nc) => acc + (nc.quantityKg || 0), 0);
    const qtyNcTrimestre = ncsTrimestre.reduce((acc, nc) => acc + (nc.quantityKg || 0), 0);
    const qtyNcAnnee = ncsAnnee.reduce((acc, nc) => acc + (nc.quantityKg || 0), 0);

    // Filter Transfers (Bons de Transfert) by period
    const btsMois = transfers.filter(bt => checkPeriod(bt.constatDate, 'MOIS'));
    const btsTrimestre = transfers.filter(bt => checkPeriod(bt.constatDate, 'TRIMESTRE'));
    const btsAnnee = transfers.filter(bt => checkPeriod(bt.constatDate, 'ANNEE'));

    const qtyBtMois = btsMois.reduce((acc, bt) => acc + (bt.quantityKg || 0), 0);
    const qtyBtTrimestre = btsTrimestre.reduce((acc, bt) => acc + (bt.quantityKg || 0), 0);
    const qtyBtAnnee = btsAnnee.reduce((acc, bt) => acc + (bt.quantityKg || 0), 0);

    // Total production estimate (Conforme + Non-Conforme)
    const totalProdMois = qtyBtMois + qtyNcMois;
    const totalProdTrimestre = qtyBtTrimestre + qtyNcTrimestre;
    const totalProdAnnee = qtyBtAnnee + qtyNcAnnee;

    // Taux Non-Conformité (%)
    const tauxNcMois = totalProdMois > 0 ? ((qtyNcMois / totalProdMois) * 100).toFixed(2) : '0.00';
    const tauxNcTrimestre = totalProdTrimestre > 0 ? ((qtyNcTrimestre / totalProdTrimestre) * 100).toFixed(2) : '0.00';
    const tauxNcAnnee = totalProdAnnee > 0 ? ((qtyNcAnnee / totalProdAnnee) * 100).toFixed(2) : '0.00';

    // Quantity for currently selected filter
    const selectedQtyNc = filteredData.ncs.reduce((acc, nc) => acc + (nc.quantityKg || 0), 0);

    return {
      qtyNcMois,
      qtyNcTrimestre,
      qtyNcAnnee,
      tauxNcMois,
      tauxNcTrimestre,
      tauxNcAnnee,
      selectedQtyNc
    };
  }, [nonConformites, transfers, filteredData.ncs]);

  // 1. Pareto of Causes (5M)
  const paretoData = useMemo(() => {
    const counts: Record<string, number> = {
      'Machine': 0,
      'Matière première': 0,
      'Méthode': 0,
      'Main d\'œuvre': 0,
      'Milieu': 0,
      'Mesure': 0
    };

    filteredData.ncs.forEach(nc => {
      if (counts[nc.cause5M] !== undefined) {
        counts[nc.cause5M]++;
      } else {
        counts['Méthode']++; // fallback
      }
    });

    const sorted = Object.entries(counts)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count);

    const total = sorted.reduce((acc, curr) => acc + curr.count, 0);
    let cumulative = 0;

    return sorted.map(item => {
      cumulative += item.count;
      const percentage = total > 0 ? Math.round((cumulative / total) * 100) : 0;
      return {
        ...item,
        percentage
      };
    });
  }, [filteredData.ncs]);

  // 2. Machine / Process distribution
  const machineData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.ncs.forEach(nc => {
      const process = nc.serviceConcerned;
      counts[process] = (counts[process] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData.ncs]);

  // 3. Reclamations Client Monthly Evolution (last 6 months)
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly counts
    const data = months.map((m, index) => ({
      month: m,
      index,
      count: 0,
      cost: 0
    }));

    complaints.forEach(c => {
      const d = new Date(c.reclamationDate);
      if (d.getFullYear() === currentYear) {
        const mIdx = d.getMonth();
        data[mIdx].count++;
        data[mIdx].cost += c.estimatedCostFcfa;
      }
    });

    // Return the last 6 months up to current month (July in the metadata date)
    const currentMonthIdx = 6; // July is index 6
    const startIdx = Math.max(0, currentMonthIdx - 5);
    return data.slice(startIdx, currentMonthIdx + 1);
  }, [complaints]);

  // Detailed Root Cause Analysis (Analyse approfondie des causes de non-conformité ISO 9001)
  const causeAnalysisData = useMemo(() => {
    const ncs = filteredData.ncs;
    const totalNCs = ncs.length;

    const categories5M: Record<string, { name: string; count: number; weightKg: number; icon: any; color: string; bg: string; border: string; ncs: NonConformite[] }> = {
      'Machine': { name: 'Machine / Équipement', count: 0, weightKg: 0, icon: Settings, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', ncs: [] },
      'Matière première': { name: 'Matière Première / Intrants', count: 0, weightKg: 0, icon: Package, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', ncs: [] },
      'Méthode': { name: 'Méthode / Instruction', count: 0, weightKg: 0, icon: Layers, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', ncs: [] },
      'Main d\'œuvre': { name: 'Main d\'Œuvre / Compétence', count: 0, weightKg: 0, icon: Users, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', ncs: [] },
      'Milieu': { name: 'Milieu / Environnement', count: 0, weightKg: 0, icon: Thermometer, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', ncs: [] },
      'Mesure': { name: 'Mesure / Métrologie', count: 0, weightKg: 0, icon: Ruler, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', ncs: [] }
    };

    let ncsWithWhysCount = 0;
    const decisionBreakdown: Record<string, { count: number; weightKg: number }> = {};

    ncs.forEach(nc => {
      const causeKey = nc.cause5M in categories5M ? nc.cause5M : 'Méthode';
      categories5M[causeKey].count += 1;
      categories5M[causeKey].weightKg += (nc.quantityKg || 0);
      categories5M[causeKey].ncs.push(nc);

      // Check 5 Whys completion (at least 1 why step provided)
      if (nc.whys && Array.isArray(nc.whys) && nc.whys.some(w => typeof w === 'string' && w.trim().length > 0)) {
        ncsWithWhysCount += 1;
      }

      // Decision tracking
      const dec = nc.decision || 'Non spécifié';
      if (!decisionBreakdown[dec]) decisionBreakdown[dec] = { count: 0, weightKg: 0 };
      decisionBreakdown[dec].count += 1;
      decisionBreakdown[dec].weightKg += (nc.quantityKg || 0);
    });

    const sorted5M = Object.entries(categories5M)
      .map(([key, data]) => ({ key, ...data, percentage: totalNCs > 0 ? Math.round((data.count / totalNCs) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    const dominantCause = sorted5M[0] || { key: 'Aucune', name: 'Aucune cause identifiée', count: 0, weightKg: 0, percentage: 0 };

    const whysCompletionRate = totalNCs > 0 ? Math.round((ncsWithWhysCount / totalNCs) * 100) : 0;

    const sortedDecisions = Object.entries(decisionBreakdown)
      .map(([decision, data]) => ({ decision, ...data }))
      .sort((a, b) => b.weightKg - a.weightKg);

    const dominantDecision = sortedDecisions[0] || { decision: 'Non spécifié', count: 0, weightKg: 0 };

    return {
      totalNCs,
      categories5M,
      sorted5M,
      dominantCause,
      whysCompletionRate,
      ncsWithWhysCount,
      dominantDecision,
      decisionBreakdown
    };
  }, [filteredData.ncs]);

  // Colors
  const colors = {
    primary: '#1e3a8a', // industrial blue
    accent: '#ea580c',  // safety orange
    success: '#10b981', // green
    warning: '#f59e0b', // amber
    danger: '#ef4444',  // red
    gray: '#6b7280',
    grid: [
      '#1e3a8a', // Extrusion
      '#ea580c', // Soudure
      '#3b82f6', // Impression
      '#f97316', // Lamination
      '#84cc16', // Rebobinage
      '#10b981', // Recyclage
      '#6b7280'  // Autres
    ]
  };

  const formattedCost = (cost: number) => {
    return new Intl.NumberFormat('fr-FR').format(cost) + ' FCFA';
  };

  return (
    <div id="module-dashboard" className="space-y-6">
      {/* Header Bar & Multi-Mode Date Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-900 font-bold text-lg md:text-xl">
              <Activity className="h-6 w-6 text-orange-600" id="icon-activity" />
              SOLUPACK S.A. — Tableau de Bord QHSE
            </div>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Analyse de conformité, performance corrective et satisfaction client — ISO 9001:2015 (§8.7, §9.1.2, §10.2)
            </p>
          </div>

          {/* Date Filter Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setDateFilterMode('PRESET')}
              className={`px-3 py-1.5 rounded-md transition-all ${dateFilterMode === 'PRESET' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'}`}
            >
              Périodes Rapides
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('RANGE')}
              className={`px-3 py-1.5 rounded-md transition-all ${dateFilterMode === 'RANGE' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'}`}
            >
              Entre Deux Dates
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('DMY')}
              className={`px-3 py-1.5 rounded-md transition-all ${dateFilterMode === 'DMY' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'}`}
            >
              Jour / Mois / Année
            </button>
          </div>
        </div>

        {/* Date Filter Controls based on Selected Mode */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Mode PRESET */}
          {dateFilterMode === 'PRESET' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Calendar className="h-4 w-4 text-orange-600" /> Période :
              </span>
              <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button 
                  id="btn-time-mois"
                  onClick={() => setTimeRange('MOIS')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${timeRange === 'MOIS' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'}`}
                >
                  Ce Mois
                </button>
                <button 
                  id="btn-time-trimestre"
                  onClick={() => setTimeRange('TRIMESTRE')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${timeRange === 'TRIMESTRE' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'}`}
                >
                  Ce Trimestre
                </button>
                <button 
                  id="btn-time-annee"
                  onClick={() => setTimeRange('ANNEE')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${timeRange === 'ANNEE' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'}`}
                >
                  Année {new Date().getFullYear()}
                </button>
                <button 
                  onClick={() => setTimeRange('TOUS')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${timeRange === 'TOUS' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'}`}
                >
                  Toutes les dates
                </button>
              </div>
            </div>
          )}

          {/* Mode RANGE: Entre Deux Dates */}
          {dateFilterMode === 'RANGE' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Calendar className="h-4 w-4 text-orange-600" /> Entre deux dates :
              </span>
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-semibold">Du :</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1.5 bg-white text-xs font-mono outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-semibold">Au :</label>
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
                  className="text-red-600 hover:text-red-800 font-bold text-[11px] underline ml-2"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}

          {/* Mode DMY: Jour / Mois / Année */}
          {dateFilterMode === 'DMY' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Calendar className="h-4 w-4 text-orange-600" /> Choix exact :
              </span>
              
              {/* Jour */}
              <div className="flex items-center gap-1">
                <span className="text-slate-600 font-semibold">Jour :</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1.5 bg-white text-xs outline-none focus:ring-1 focus:ring-blue-900"
                >
                  <option value="">Tous les jours</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d < 10 ? `0${d}` : d}</option>
                  ))}
                </select>
              </div>

              {/* Mois */}
              <div className="flex items-center gap-1">
                <span className="text-slate-600 font-semibold">Mois :</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1.5 bg-white text-xs outline-none focus:ring-1 focus:ring-blue-900"
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

              {/* Année */}
              <div className="flex items-center gap-1">
                <span className="text-slate-600 font-semibold">Année :</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-slate-300 rounded-lg p-1.5 bg-white text-xs outline-none focus:ring-1 focus:ring-blue-900 font-mono"
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
                  className="text-red-600 hover:text-red-800 font-bold text-[11px] underline ml-2"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}

          {/* Live Records Count Badge */}
          <div className="text-slate-500 text-[11px] font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <b>{filteredData.ncs.length}</b> NC · <b>{filteredData.complaints.length}</b> Réclamations · <b>{filteredData.transfers.length}</b> Transferts
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Cost of Non-Quality */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-red-600 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Coût de la non-qualité</p>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-2 font-mono">
                {formattedCost(stats.totalCostOfNonQuality)}
              </h3>
            </div>
            <div className="bg-red-50 p-2.5 rounded-lg text-red-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Interne: <b className="font-mono">{formattedCost(stats.internalCost)}</b></span>
            <span>Client: <b className="font-mono">{formattedCost(stats.externalCost)}</b></span>
          </div>
        </div>

        {/* NC Status Counters */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-blue-900 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Non-Conformités Totales</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1 font-mono">
                {stats.totalNCs}
              </h3>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-950">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1 text-center text-xs">
            <div className="bg-red-50 text-red-700 py-1 rounded font-medium">
              Ouvert: {stats.openNCs}
            </div>
            <div className="bg-amber-50 text-amber-700 py-1 rounded font-medium">
              En cours: {stats.inProgressNCs}
            </div>
            <div className="bg-emerald-50 text-emerald-700 py-1 rounded font-medium">
              Clos: {stats.closedNCs}
            </div>
          </div>
        </div>

        {/* Durée de Traitement des NC (Somme Moyenne avec Cible 2 jours) */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-indigo-600 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Durée Traitement NC</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-slate-800 font-mono">
                  {stats.averageTreatedDays.toFixed(1)}
                </h3>
                <span className="text-xs text-slate-500 font-semibold">jours</span>
              </div>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Résultat ciblé : <b className="text-slate-800">2 jours</b></span>
            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
              stats.isDurationTargetMet
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {stats.isDurationTargetMet ? '✓ Conforme' : '⚠️ Dépassement'}
            </span>
          </div>
        </div>

        {/* Closure Rate */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-orange-600 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Clôture dans les Délais</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1 font-mono">
                {stats.closureInTimeRate}%
              </h3>
            </div>
            <div className="bg-orange-50 p-2.5 rounded-lg text-orange-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-3">
            Objectif cible ISO 9001 : <span className="font-bold text-emerald-600">&gt; 90%</span> de fiches résolues à l'échéance.
          </p>
        </div>

        {/* Action Efficiency */}
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-emerald-600 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Efficacité des Actions</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1 font-mono">
                {stats.efficiencyRate}%
              </h3>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex justify-between text-xs text-slate-500">
            <span>Cumul durées: <b>{stats.totalTreatedDays} j</b></span>
            <span>Vérifiées: <b>{nonConformites.flatMap(nc=>nc.actions).filter(a=>!!a.efficiency).length}</b></span>
          </div>
        </div>

      </div>

      {/* Quantité NC (kg) Card */}
      <div className="bg-white p-5 rounded-xl border-l-4 border-l-purple-700 border border-slate-200 shadow-xs hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Quantité Non-Conforme (kg)</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1 font-mono">
              {new Intl.NumberFormat('fr-FR').format(ncPeriodStats.selectedQtyNc)} <span className="text-sm font-normal text-slate-500">kg</span>
            </h3>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-lg text-purple-700">
            <Scale className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs border-t border-slate-100 pt-3">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <p className="text-slate-500 text-[10px] uppercase font-semibold">Ce Mois</p>
            <p className="font-bold font-mono text-purple-900 mt-0.5 text-base">{new Intl.NumberFormat('fr-FR').format(ncPeriodStats.qtyNcMois)} kg</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <p className="text-slate-500 text-[10px] uppercase font-semibold">Ce Trimestre</p>
            <p className="font-bold font-mono text-purple-900 mt-0.5 text-base">{new Intl.NumberFormat('fr-FR').format(ncPeriodStats.qtyNcTrimestre)} kg</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <p className="text-slate-500 text-[10px] uppercase font-semibold">Cette Année</p>
            <p className="font-bold font-mono text-purple-900 mt-0.5 text-base">{new Intl.NumberFormat('fr-FR').format(ncPeriodStats.qtyNcAnnee)} kg</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. PARETO CHART OF CAUSES (5M) - taking 7 cols on lg */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-7">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-slate-800 font-bold text-sm md:text-base flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-orange-600" />
                Analyse de Pareto des Causes Racines (5M+1)
              </h4>
              <p className="text-slate-500 text-xs mt-0.5">Priorisation ISO 9001 des causes récurrentes de non-conformité</p>
            </div>
            <div className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
              Règle des 80/20
            </div>
          </div>

          {/* Handcrafted Interactive SVG Pareto Chart */}
          <div className="relative pt-4">
            {paretoData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                Aucune donnée à afficher pour cette période.
              </div>
            ) : (
              <div className="w-full">
                <svg className="w-full h-64" viewBox="0 0 500 240" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((level, i) => {
                    const y = 20 + (160 * (100 - level)) / 100;
                    return (
                      <g key={i} className="opacity-20">
                        <line x1="40" y1={y} x2="450" y2={y} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                        <text x="15" y={y + 4} fill="#64748b" className="text-[9px] font-mono" textAnchor="middle">{level}%</text>
                      </g>
                    );
                  })}

                  {/* Right Y-Axis grid for cumulative */}
                  <line x1="450" y1="20" x2="450" y2="180" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Bars & Lines */}
                  {paretoData.map((item, index) => {
                    const barWidth = 40;
                    const spacing = 65;
                    const startX = 60 + index * spacing;
                    
                    // Max frequency in counts is usually up to 10 for small demos
                    const maxCount = Math.max(...paretoData.map(p => p.count)) || 5;
                    const barHeight = (item.count / maxCount) * 140;
                    const barY = 180 - barHeight;

                    // Line coordinate for cumulative %
                    const nextX = 60 + index * spacing + barWidth / 2;
                    const nextY = 180 - (item.percentage / 100) * 160;

                    const isHovered = hoveredIndex === index && hoveredChart === 'pareto';

                    return (
                      <g key={index} 
                         onMouseEnter={() => { setHoveredIndex(index); setHoveredChart('pareto'); }}
                         onMouseLeave={() => { setHoveredIndex(null); setHoveredChart(null); }}
                         className="cursor-pointer"
                      >
                        {/* Bar */}
                        <rect 
                          x={startX} 
                          y={barY} 
                          width={barWidth} 
                          height={barHeight} 
                          fill={isHovered ? '#ea580c' : '#1e3a8a'} 
                          rx="3"
                          className="transition-colors duration-200"
                        />
                        {/* Count text inside/above bar */}
                        <text 
                          x={startX + barWidth / 2} 
                          y={barY - 5} 
                          fill={isHovered ? '#ea580c' : '#1e3a8a'} 
                          className="text-[10px] font-bold"
                          textAnchor="middle"
                        >
                          {item.count}
                        </text>
                      </g>
                    );
                  })}

                  {/* Cumulative % Line */}
                  <path
                    d={paretoData.map((item, index) => {
                      const spacing = 65;
                      const x = 60 + index * spacing + 20; // middle of the bar
                      const y = 180 - (item.percentage / 100) * 160;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Cumulative Dots */}
                  {paretoData.map((item, index) => {
                    const spacing = 65;
                    const x = 60 + index * spacing + 20;
                    const y = 180 - (item.percentage / 100) * 160;
                    return (
                      <circle 
                        key={index} 
                        cx={x} 
                        cy={y} 
                        r={hoveredIndex === index && hoveredChart === 'pareto' ? '6' : '4'} 
                        fill="#ea580c" 
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                    );
                  })}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between px-[45px] text-[10px] font-semibold text-slate-600 mt-2">
                  {paretoData.map((item, index) => (
                    <div 
                      key={index} 
                      className={`text-center transition-all ${hoveredIndex === index && hoveredChart === 'pareto' ? 'text-orange-600 font-bold scale-105' : ''}`}
                      style={{ width: '65px' }}
                    >
                      <span className="block truncate max-w-[65px]" title={item.cause}>{item.cause}</span>
                      <span className="text-[9px] font-mono text-slate-400 font-normal">{item.percentage}% cum.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. REPARTITION BY PROCESS / MACHINE (Donut Chart) - taking 5 cols on lg */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <h4 className="text-slate-800 font-bold text-sm md:text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-blue-900" />
              Répartition par Procédé / Atelier
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">Fréquence des non-conformités par atelier de plasturgie</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-4">
            {machineData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                Aucune NC enregistrée.
              </div>
            ) : (
              <>
                {/* SVG Donut */}
                <div className="relative w-36 h-36">
                  <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform -rotate-90">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
                    
                    {(() => {
                      let accumulatedPercentage = 0;
                      const totalNCs = machineData.reduce((acc, curr) => acc + curr.value, 0);

                      return machineData.map((item, index) => {
                        const percent = totalNCs > 0 ? (item.value / totalNCs) * 100 : 0;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = 100 - accumulatedPercentage;
                        accumulatedPercentage += percent;

                        const isHovered = hoveredIndex === index && hoveredChart === 'donut';

                        return (
                          <circle
                            key={index}
                            cx="21"
                            cy="21"
                            r="15.915"
                            fill="transparent"
                            stroke={colors.grid[index % colors.grid.length]}
                            strokeWidth={isHovered ? "5.5" : "4.5"}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-200 cursor-pointer"
                            onMouseEnter={() => { setHoveredIndex(index); setHoveredChart('donut'); }}
                            onMouseLeave={() => { setHoveredIndex(null); setHoveredChart(null); }}
                          />
                        );
                      });
                    })()}
                  </svg>
                  {/* Donut Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-none">
                    <span className="text-2xl font-extrabold text-blue-950 font-mono">
                      {machineData.reduce((acc, c) => acc + c.value, 0)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">NC Prod</span>
                  </div>
                </div>

                {/* Legends */}
                <div className="space-y-1.5 text-xs">
                  {machineData.map((item, index) => {
                    const total = machineData.reduce((acc, curr) => acc + curr.value, 0);
                    const percent = Math.round((item.value / total) * 100);
                    const isHovered = hoveredIndex === index && hoveredChart === 'donut';
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-2 p-1 px-2 rounded-md transition-all ${isHovered ? 'bg-slate-100 scale-105 font-bold text-blue-900' : 'text-slate-600'}`}
                        onMouseEnter={() => { setHoveredIndex(index); setHoveredChart('donut'); }}
                        onMouseLeave={() => { setHoveredIndex(null); setHoveredChart(null); }}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors.grid[index % colors.grid.length] }}></span>
                        <span className="truncate max-w-[100px]" title={item.name}>{item.name}</span>
                        <span className="font-mono text-slate-400 font-medium ml-auto">({item.value})</span>
                        <span className="font-mono font-bold text-slate-700 ml-1">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* SECTION DÉDIÉE : ANALYSE APPROFONDIE DES CAUSES DE NON-CONFORMITÉ (ISHIKAWA 5M & 5 POURQUOI) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base md:text-lg">
              <Search className="h-5 w-5 text-orange-600" />
              Analyse Approfondie des Causes de Non-Conformité (Causes Racines 5M & 5 Pourquoi)
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Méthodologie ISO 9001:2015 (§10.2) — Identification des facteurs d'influence et prévention des récurrences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-bold border border-orange-200 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" /> 5-Whys: {causeAnalysisData.whysCompletionRate}% d'analyses documentées
            </span>
          </div>
        </div>

        {/* Top Cause Insights Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Dominant 5M Cause Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Facteur Dominant (Cause Racine N°1)</span>
              <ShieldAlert className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-800">{causeAnalysisData.dominantCause.name}</span>
              <span className="text-sm font-bold text-orange-600 font-mono">({causeAnalysisData.dominantCause.percentage}%)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <b>{causeAnalysisData.dominantCause.count} fiche(s) NC</b> et <b>{new Intl.NumberFormat('fr-FR').format(causeAnalysisData.dominantCause.weightKg)} kg</b> impactés attribués à ce facteur.
            </p>
          </div>

          {/* 5-Whys Method Execution Rate */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Taux d'Analyse par les 5 Pourquoi</span>
              <Lightbulb className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800 font-mono">{causeAnalysisData.whysCompletionRate}%</span>
              <span className="text-xs text-slate-500">({causeAnalysisData.ncsWithWhysCount} / {causeAnalysisData.totalNCs} fiches)</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${causeAnalysisData.whysCompletionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Impact Decision Factor */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Décision Post-Analyse Majoritaire</span>
              <Scale className="h-4 w-4 text-blue-900" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-blue-950">{causeAnalysisData.dominantDecision.decision}</span>
              <span className="text-xs font-mono font-bold text-slate-600">({new Intl.NumberFormat('fr-FR').format(causeAnalysisData.dominantDecision.weightKg)} kg)</span>
            </div>
            <p className="text-xs text-slate-600">
              Traitement prioritaire appliqué sur <b>{causeAnalysisData.dominantDecision.count}</b> événement(s) de non-conformité.
            </p>
          </div>
        </div>

        {/* 6 Categories of 5M Grid Cards */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-slate-600" /> Répartition et Analyse selon les 6M du Diagramme d'Ishikawa :
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {causeAnalysisData.sorted5M.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border ${item.border} ${item.bg} transition-all hover:shadow-xs space-y-2.5`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 bg-white rounded-lg shadow-2xs ${item.color}`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono pt-1">
                    <span className="text-slate-600">Fiches NC: <b className="text-slate-900">{item.count}</b></span>
                    <span className="text-slate-600">Quantité: <b className="text-slate-900">{new Intl.NumberFormat('fr-FR').format(item.weightKg)} kg</b></span>
                  </div>

                  {/* Top specific cause example snippet */}
                  {item.ncs.length > 0 && item.ncs[0].possibleCauses && (
                    <div className="bg-white/80 p-2 rounded-lg text-[11px] text-slate-600 border border-slate-200/60 space-y-1">
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider">Cause fréquente observée :</span>
                      <p className="line-clamp-2 italic text-slate-600 font-sans">
                        "{item.ncs[0].possibleCauses}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed 5-Whys Cause Tracking Table for recent Non-Conformities */}
        <div className="pt-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-orange-600" /> Registre d'Analyse des Causes Racines par la Méthode des 5 Pourquoi :
          </h5>
          
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">N° Fiche NC</th>
                  <th className="p-3">Désignation NC</th>
                  <th className="p-3">Catégorie 5M</th>
                  <th className="p-3">Cause Racine (Dernier Pourquoi)</th>
                  <th className="p-3">Décision Prise</th>
                  <th className="p-3">Statut Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredData.ncs.slice(0, 5).map((nc, idx) => {
                  const lastWhy = nc.whys && nc.whys.filter(w => typeof w === 'string' && w.trim().length > 0).pop();
                  const rootCauseText = lastWhy || nc.possibleCauses || 'Analyse en cours...';
                  const hasActions = nc.actions && nc.actions.length > 0;
                  const allDone = hasActions && nc.actions.every(a => a.status === 'Effectué');

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-900 whitespace-nowrap">{nc.id}</td>
                      <td className="p-3 font-semibold text-slate-800 max-w-[200px] truncate" title={nc.shortTitle}>
                        {nc.shortTitle}
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                          {nc.cause5M || 'Méthode'}
                        </span>
                      </td>
                      <td className="p-3 max-w-[280px]">
                        <p className="line-clamp-2 text-slate-700 italic text-[11px]">
                          "{rootCauseText}"
                        </p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-blue-50 text-blue-900 font-semibold px-2 py-0.5 rounded text-[11px] border border-blue-100">
                          {nc.decision || 'En cours'}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {allDone ? (
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            CLOS / SOLVÉ
                          </span>
                        ) : hasActions ? (
                          <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            ACTION EN COURS
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded">
                            À PLANIFIER
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredData.ncs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Aucune donnée de non-conformité disponible pour cette période.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Secondary Dashboard Row: Trends & Customer Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3. MONTHLY CUSTOMER COMPLAINTS TREND (Line Chart) - 8 cols */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-slate-800 font-bold text-sm md:text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Évolution Mensuelle des Réclamations Clients
              </h4>
              <p className="text-slate-500 text-xs mt-0.5">Tendances des réclamations client et volume de litiges</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-600 inline-block"></span> Réclamations</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-900 inline-block"></span> Coût estimé (x100k FCFA)</span>
            </div>
          </div>

          <div className="pt-2">
            <svg className="w-full h-56" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map((level, i) => {
                const y = 20 + (140 * (4 - level)) / 4;
                return (
                  <g key={i} className="opacity-15">
                    <line x1="30" y1={y} x2="480" y2={y} stroke="#94a3b8" strokeWidth="1" />
                    <text x="15" y={y + 4} fill="#64748b" className="text-[9px] font-mono" textAnchor="middle">{level}</text>
                  </g>
                );
              })}

              {/* Draw bars for costs */}
              {monthlyTrends.map((item, index) => {
                const spacing = 70;
                const barWidth = 14;
                const startX = 50 + index * spacing;
                
                // Scale cost: max cost usually in millions
                // Max is around 3,000,000, let's normalize by 1,000,000
                const costNormalized = item.cost / 750000; // 750,000 FCFA per unit step
                const barHeight = Math.min(130, (costNormalized / 4) * 140);
                const barY = 160 - barHeight;

                const isHovered = hoveredIndex === index && hoveredChart === 'trend_cost';

                return (
                  <rect
                    key={`cost-${index}`}
                    x={startX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={isHovered ? '#1e3a8a' : '#1e3a8a90'}
                    rx="2"
                    onMouseEnter={() => { setHoveredIndex(index); setHoveredChart('trend_cost'); }}
                    onMouseLeave={() => { setHoveredIndex(null); setHoveredChart(null); }}
                    className="cursor-pointer transition-colors duration-200"
                  />
                );
              })}

              {/* Draw line for count */}
              <path
                d={monthlyTrends.map((item, index) => {
                  const spacing = 70;
                  const x = 50 + index * spacing + 25; // center
                  const y = 160 - (item.count / 4) * 140;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#ea580c"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Draw dots for count */}
              {monthlyTrends.map((item, index) => {
                const spacing = 70;
                const x = 50 + index * spacing + 25;
                const y = 160 - (item.count / 4) * 140;

                const isHovered = hoveredIndex === index && hoveredChart === 'trend_count';

                return (
                  <circle
                    key={`count-${index}`}
                    cx={x}
                    cy={y}
                    r={isHovered ? '6' : '4'}
                    fill="#ea580c"
                    stroke="#ffffff"
                    strokeWidth="2"
                    onMouseEnter={() => { setHoveredIndex(index); setHoveredChart('trend_count'); }}
                    onMouseLeave={() => { setHoveredIndex(null); setHoveredChart(null); }}
                    className="cursor-pointer transition-all duration-200"
                  />
                );
              })}
            </svg>

            {/* X Axis labels */}
            <div className="flex justify-between px-[40px] text-xs font-semibold text-slate-500 mt-2">
              {monthlyTrends.map((item, index) => (
                <div key={index} className="text-center w-[70px]">
                  <span>{item.month}</span>
                  <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                    {item.count} récl. / {Math.round(item.cost / 1000) / 1000}M FCFA
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. ACTIONS PRIORITY BOX - 4 cols */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <h4 className="text-slate-800 font-bold text-sm md:text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-600" />
              Priorités Actions ISO 9001
            </h4>
            <p className="text-slate-500 text-xs mt-0.5">Actions urgentes arrivant à échéance</p>
          </div>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[175px]">
            {nonConformites.flatMap(nc => nc.actions.map(a => ({ ...a, ncId: nc.id, ncTitle: nc.shortTitle })))
              .filter(a => a.status !== 'Effectué')
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .slice(0, 3)
              .map((action, idx) => {
                const isOverdue = new Date(action.deadline).getTime() < new Date().getTime();
                return (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-blue-900/30 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded font-mono shrink-0">
                        {action.ncId}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 font-mono ${isOverdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                        {isOverdue ? 'EN RETARD' : 'À MENER'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold mt-1 line-clamp-1">{action.description}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                      <span>Resp: <b className="text-slate-600">{action.responsible}</b></span>
                      <span>Échéance: <b className={`${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>{action.deadline}</b></span>
                    </div>
                  </div>
                );
              })}
            {nonConformites.flatMap(nc => nc.actions).filter(a => a.status !== 'Effectué').length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs py-10">
                Aucune action corrective en attente. Félicitations !
              </div>
            )}
          </div>

          {/* Foot note */}
          <div className="text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-4 text-slate-500">
            Conformité §10.2 : L'organisation doit évaluer le besoin d'actions pour éliminer les causes de la non-conformité.
          </div>
        </div>

      </div>
    </div>
  );
}
