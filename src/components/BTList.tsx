/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { exportToPDF } from '../lib/pdfUtils';
import { exportBTToExcel } from '../lib/excelExporter';
import SolupackLogo from './SolupackLogo';
import { 
  BonDeTransfert, 
  BTType, 
  ProductType, 
  Team, 
  BTZone, 
  BTDestination,
  User 
} from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Eye, 
  X, 
  Save, 
  Paperclip, 
  ArrowUpDown, 
  Warehouse,
  FileText,
  Printer,
  ShieldAlert,
  Download
} from 'lucide-react';

interface BTListProps {
  transfers: BonDeTransfert[];
  users: User[];
  currentUser: User;
  onSave: (bt: BonDeTransfert) => void;
  onDelete: (id: string) => void;
}

export default function BTList({ transfers, users, currentUser, onSave, onDelete }: BTListProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('TOUS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TOUS');
  
  // Date filter states
  const [dateMode, setDateMode] = useState<'RANGE' | 'DMY' | 'ALL'>('RANGE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBT, setEditingBT] = useState<BonDeTransfert | null>(null);
  
  // Form fields
  const [btNumber, setBtNumber] = useState('');
  const [btType, setBtType] = useState<BTType>('Produit non conforme');
  const [constatDate, setConstatDate] = useState(new Date().toISOString().split('T')[0]);
  const [constatTime, setConstatTime] = useState('08:00');
  const [sender, setSender] = useState(currentUser.name);
  const [ncSheetNumber, setNcSheetNumber] = useState('');
  const [returnSheetNumber, setReturnSheetNumber] = useState('');
  const [actionSheetNumber, setActionSheetNumber] = useState('');
  const [productType, setProductType] = useState<ProductType>('Semi-fini');
  const [ofNumber, setOfNumber] = useState('');
  const [team, setTeam] = useState<Team>('A');
  const [quantityKg, setQuantityKg] = useState<number>(0);
  const [transferSubject, setTransferSubject] = useState('');
  const [packagingZone, setPackagingZone] = useState<BTZone>('Atelier de production');
  const [destination, setDestination] = useState<BTDestination>('Zone d’isolation non conforme');
  const [observation, setObservation] = useState('');
  const [status, setStatus] = useState<'Brouillon' | 'En attente' | 'Effectué'>('En attente');
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: string; url: string }[]>([]);
  const [activePreview, setActivePreview] = useState<{ name: string; url: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detailed view state
  const [viewingBT, setViewingBT] = useState<BonDeTransfert | null>(null);

  // Custom modals state
  const [btToDelete, setBtToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filtered data
  const filteredBTs = useMemo(() => {
    return transfers.filter(bt => {
      const matchesSearch = 
        bt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bt.btNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bt.ofNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bt.transferSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bt.sender.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'TOUS' || bt.btType === selectedType;
      const matchesStatus = selectedStatus === 'TOUS' || bt.status === selectedStatus;

      // Date filter check
      let matchesDate = true;
      if (bt.constatDate) {
        if (dateMode === 'RANGE') {
          if (startDate && bt.constatDate < startDate) matchesDate = false;
          if (endDate && bt.constatDate > endDate) matchesDate = false;
        } else if (dateMode === 'DMY') {
          const parts = bt.constatDate.split('-');
          if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (selectedYear && y !== parseInt(selectedYear, 10)) matchesDate = false;
            if (selectedMonth && m !== parseInt(selectedMonth, 10)) matchesDate = false;
            if (selectedDay && d !== parseInt(selectedDay, 10)) matchesDate = false;
          }
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [transfers, searchTerm, selectedType, selectedStatus, dateMode, startDate, endDate, selectedDay, selectedMonth, selectedYear]);

  // Open Form to create new BT
  const handleOpenCreate = () => {
    setEditingBT(null);
    setBtNumber(`BT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    setBtType('Produit non conforme');
    setConstatDate(new Date().toISOString().split('T')[0]);
    setConstatTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
    setSender(currentUser.name);
    setNcSheetNumber('');
    setReturnSheetNumber('');
    setActionSheetNumber('');
    setProductType('Semi-fini');
    setOfNumber('');
    setTeam('A');
    setQuantityKg(0);
    setTransferSubject('');
    setPackagingZone('Atelier de production');
    setDestination('Zone d’isolation non conforme');
    setObservation('');
    setStatus('En attente');
    setAttachments([]);
    setIsFormOpen(true);
  };

  // Open Form to edit existing BT
  const handleOpenEdit = (bt: BonDeTransfert) => {
    setEditingBT(bt);
    setBtNumber(bt.btNumber);
    setBtType(bt.btType);
    setConstatDate(bt.constatDate);
    setConstatTime(bt.constatTime);
    setSender(bt.sender);
    setNcSheetNumber(bt.ncSheetNumber || '');
    setReturnSheetNumber(bt.returnSheetNumber || '');
    setActionSheetNumber(bt.actionSheetNumber || '');
    setProductType(bt.productType);
    setOfNumber(bt.ofNumber);
    setTeam(bt.team);
    setQuantityKg(bt.quantityKg);
    setTransferSubject(bt.transferSubject);
    setPackagingZone(bt.packagingZone);
    setDestination(bt.destination);
    setObservation(bt.observation);
    setStatus(bt.status);
    setAttachments(bt.attachments || []);
    setIsFormOpen(true);
  };

  // Save BT Form
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSubject.trim()) {
      alert("L'objet du transfert est obligatoire.");
      return;
    }

    // Automatically calculate closeDate if status is marked "Effectué"
    const closeDateCalc = status === 'Effectué' ? new Date().toISOString().split('T')[0] : undefined;

    const savedBT: BonDeTransfert = {
      id: editingBT?.id || `BT-REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      btNumber,
      btType,
      constatDate,
      constatTime,
      sender,
      closeDate: closeDateCalc,
      ncSheetNumber: ncSheetNumber || undefined,
      returnSheetNumber: returnSheetNumber || undefined,
      actionSheetNumber: actionSheetNumber || undefined,
      productType,
      ofNumber,
      team,
      quantityKg: isNaN(Number(quantityKg)) ? 0 : Number(Number(quantityKg).toFixed(2)),
      transferSubject,
      packagingZone,
      destination,
      observation,
      status,
      attachments,
      createdAt: editingBT?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(savedBT);
    setIsFormOpen(false);
  };

  // Real File Upload
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 5Mo).");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const fileUrl = event.target.result as string;
        setAttachments([...attachments, {
          id: `BT-ATT-${Date.now()}`,
          name: file.name,
          type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          url: fileUrl
        }]);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  // Export to Excel with ALL fields
  const handleExportCSV = () => {
    exportBTToExcel(filteredBTs);
  };

  return (
    <div id="module-bt-transfert" className="space-y-6">
      
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs gap-4">
        <div>
          <h2 className="text-blue-900 font-bold text-lg md:text-xl flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-orange-600" />
            MODULE 3 : Bon de Transfert Interne (Quarantaine & Flux Rebut)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Traçabilité physique des transferts internes de produits isolés, défectueux ou retours vers la zone d'exclusion
          </p>
        </div>

        <button
          id="btn-add-bt"
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-2 shadow-xs transition-all shrink-0"
        >
          <Plus className="h-4 w-4" /> Émettre un Bon de Transfert
        </button>
      </div>

      {/* Filters Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un bon (N° BT, OF, Objet...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 outline-none text-xs"
              />
            </div>

            {/* Type BT */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs"
            >
              <option value="TOUS">Type de BT : TOUS</option>
              <option value="Retour non conforme">Retour non conforme</option>
              <option value="Produit non conforme">Produit non conforme</option>
              <option value="Matière première">Matière première</option>
              <option value="Equipement de mesure">Equipement de mesure</option>
              <option value="Autres">Autres</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs"
            >
              <option value="TOUS">Statut : TOUS</option>
              <option value="Brouillon">Brouillon</option>
              <option value="En attente">En attente</option>
              <option value="Effectué">Effectué (Clos)</option>
            </select>

            {/* Date Mode Selector */}
            <select
              value={dateMode}
              onChange={(e) => setDateMode(e.target.value as any)}
              className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs font-semibold text-blue-900"
            >
              <option value="RANGE">Filtre Date : Entre deux dates</option>
              <option value="DMY">Filtre Date : Jour / Mois / Année</option>
              <option value="ALL">Filtre Date : Toutes les dates</option>
            </select>
          </div>

          {/* Counter and export */}
          <div className="flex gap-4 items-center shrink-0 text-xs text-slate-500">
            <span><b>{filteredBTs.length}</b> bons de transferts trouvés.</span>
            <button
              onClick={handleExportCSV}
              className="text-blue-900 font-semibold hover:underline flex items-center gap-1"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Exporter Excel (CSV)
            </button>
          </div>
        </div>

        {/* Detailed Date Filter Inputs */}
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

          {dateMode === 'ALL' && (
            <span className="text-slate-500 font-semibold">Toutes les dates affichées (aucun filtre temporel restrictif).</span>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 border-b border-slate-200">N° BT / Type</th>
                <th className="px-4 py-3 border-b border-slate-200">Constat / Émetteur</th>
                <th className="px-4 py-3 border-b border-slate-200">N° OF & Liens Qualité</th>
                <th className="px-4 py-3 border-b border-slate-200">Flux Physique (De &gt; Vers)</th>
                <th className="px-4 py-3 border-b border-slate-200">Quantité (kg)</th>
                <th className="px-4 py-3 border-b border-slate-200">Statut</th>
                <th className="px-4 py-3 border-b border-slate-200 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBTs.map((bt) => (
                <tr key={bt.id} className="hover:bg-slate-50 transition-colors">
                  
                  <td className="p-4">
                    <span className="font-bold text-slate-800 block text-sm font-mono">{bt.btNumber}</span>
                    <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded text-[10px] font-semibold mt-1 inline-block">
                      {bt.btType}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="text-slate-400 block font-mono text-[10px]">📅 {bt.constatDate} à {bt.constatTime}</span>
                    <p className="font-bold text-slate-700 mt-1 line-clamp-1 max-w-[200px]" title={bt.transferSubject}>
                      {bt.transferSubject}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-1">Par: {bt.sender}</span>
                  </td>

                  <td className="p-4 font-mono">
                    <span className="block font-bold text-slate-600">OF: {bt.ofNumber || 'N/A'}</span>
                    {bt.ncSheetNumber && (
                      <span className="text-[10px] text-red-600 block mt-1 font-semibold">
                        ⚠️ NC Liée: {bt.ncSheetNumber}
                      </span>
                    )}
                    {bt.returnSheetNumber && (
                      <span className="text-[10px] text-blue-900 block mt-1">
                        📦 Bon Retour: {bt.returnSheetNumber}
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[10px]">
                      <span className="bg-slate-100 p-1.5 rounded">{bt.packagingZone}</span>
                      <ArrowRight className="h-3 w-3 text-orange-600" />
                      <span className="bg-orange-50 text-orange-800 p-1.5 rounded">{bt.destination}</span>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-700 text-sm">
                    {bt.quantityKg > 0 ? `${bt.quantityKg.toFixed(2)} kg` : 'N/A'}
                    <span className="text-[10px] text-slate-400 font-normal block mt-1">Équipe: {bt.team}</span>
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                      bt.status === 'Brouillon' ? 'bg-slate-100 text-slate-600' :
                      bt.status === 'En attente' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        bt.status === 'Brouillon' ? 'bg-slate-400' :
                        bt.status === 'En attente' ? 'bg-amber-600' :
                        'bg-emerald-600'
                      }`}></span>
                      {bt.status}
                    </span>
                    {bt.closeDate && (
                      <span className="text-[9px] text-slate-400 block mt-1 font-mono">Clos le {bt.closeDate}</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                      <button
                        onClick={() => setViewingBT(bt)}
                        className="bg-slate-100 hover:bg-blue-50 hover:text-blue-900 p-2 rounded-lg transition-colors"
                        title="Voir la fiche détaillée"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(bt)}
                        className="bg-slate-100 hover:bg-amber-50 hover:text-amber-700 p-2 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PILOTE') {
                            setErrorMessage("Rôle d'Administrateur ou Pilote QHSE requis pour supprimer un bon de transfert.");
                            return;
                          }
                          setBtToDelete(bt.id);
                        }}
                        className="bg-slate-100 hover:bg-red-50 hover:text-red-700 p-2 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
              
              {filteredBTs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-10 text-slate-400 italic">
                    Aucun bon de transfert enregistré ou correspondant aux critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VIEW DETAILED BT */}
      {viewingBT && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex justify-center items-center z-50 p-3 md:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="bg-blue-950 text-white px-5 py-4 flex justify-between items-center shrink-0 no-print border-b border-blue-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg text-white">
                  <Warehouse className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                      Fiche Officielle
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                      viewingBT.status === 'Effectué' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      viewingBT.status === 'En attente' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {viewingBT.status}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-white mt-0.5">
                    Bon de Transfert Interne : <span className="font-mono text-orange-400">{viewingBT.btNumber || viewingBT.id}</span>
                  </h3>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  title="Imprimer directement le document"
                >
                  <Printer className="h-3.5 w-3.5" /> 
                  <span className="hidden sm:inline">Imprimer</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportToPDF("printable-bt-sheet", `SOLUPACK_Bon_Transfert_${viewingBT.btNumber || viewingBT.id}.pdf`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  title="Télécharger la fiche en PDF haute définition"
                >
                  <Download className="h-3.5 w-3.5" /> 
                  <span className="hidden sm:inline">Télécharger PDF</span>
                </button>
                <button 
                  onClick={() => setViewingBT(null)} 
                  className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full cursor-pointer transition-all ml-1"
                  title="Fermer l'aperçu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Scroll Area */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-slate-100">
              {/* Document Sheet Paper (A4 Style) */}
              <div 
                id="printable-bt-sheet"
                className="bg-white p-5 md:p-7 rounded-xl border-2 border-blue-950 shadow-xl space-y-4 text-xs text-slate-800 print-area max-w-3xl mx-auto"
              >
                {/* 1. Official Corporate Header */}
                <div className="grid grid-cols-12 border-b-2 border-blue-950 pb-3 items-center gap-3">
                  <div className="col-span-4 text-left flex flex-col justify-center items-start">
                    <div className="w-full h-14 flex items-center justify-start bg-white rounded overflow-hidden">
                      <SolupackLogo className="h-full w-auto max-w-[160px]" variant="light" />
                    </div>
                    <span className="text-[8px] text-slate-500 font-semibold block mt-1">
                      Zone Industrielle Yopougon, Abidjan
                    </span>
                    <span className="text-[8px] text-slate-400 block font-mono">
                      Tél: +225 27 23 51 52 00
                    </span>
                  </div>

                  <div className="col-span-5 text-center border-l border-r border-slate-300 px-2 py-1">
                    <h1 className="text-xs md:text-sm font-black text-blue-950 uppercase leading-snug tracking-tight">
                      BON DE TRANSFERT INTERNE DE MATIÈRE
                    </h1>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                      Traçabilité & Ségrégation Physique
                    </p>
                    <div className="mt-1.5 flex items-center justify-center gap-1.5">
                      <span className="bg-blue-950 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded shadow-xs">
                        N° {viewingBT.btNumber || viewingBT.id}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 text-right text-[9px] space-y-0.5 text-slate-800 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="font-bold text-blue-950">Code : FOR-LOG-02</div>
                    <div>Création : 05/01/2022</div>
                    <div>Révision : 06/07/2026</div>
                    <div>Version : 01</div>
                    <div className={`text-[8.5px] font-bold border-t border-slate-200 pt-0.5 mt-0.5 ${
                      viewingBT.status === 'Effectué' ? 'text-emerald-700' :
                      viewingBT.status === 'En attente' ? 'text-amber-700' : 'text-slate-600'
                    }`}>
                      Statut : {viewingBT.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* 2. Section I : Identification du Transfert & Émetteur */}
                <div className="space-y-1.5 print-section">
                  <h2 className="bg-blue-950 text-white font-bold text-[11px] px-2.5 py-1 uppercase rounded tracking-wider flex items-center justify-between">
                    <span>I. Identification & Émission du Transfert</span>
                    <span className="text-[9px] font-normal text-blue-200 font-mono">ISO 9001 §8.7</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                    <div>
                      <b className="text-slate-500 block text-[10px]">Date & Heure Constat :</b>
                      <span className="font-bold text-slate-800">{viewingBT.constatDate} à {viewingBT.constatTime}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block text-[10px]">Émetteur / Opérateur :</b>
                      <span className="font-semibold text-slate-800">{viewingBT.sender}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block text-[10px]">Équipe de Quart :</b>
                      <span className="font-bold text-blue-950">Équipe {viewingBT.team}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block text-[10px]">Type de Transfert :</b>
                      <span className="font-bold text-orange-800">{viewingBT.btType}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Section II : Flux Physique & Traçabilité des Zones */}
                <div className="space-y-1.5 print-section">
                  <h2 className="bg-blue-950 text-white font-bold text-[11px] px-2.5 py-1 uppercase rounded tracking-wider">
                    II. Flux Physique & Traçabilité des Zones
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* Zone Departure */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Zone d'Origine / Départ
                        </span>
                        <div className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
                          {viewingBT.packagingZone}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-2 block font-mono">Emplacement initial du produit</span>
                    </div>

                    {/* Zone Arrival */}
                    <div className="bg-orange-50/80 p-3 rounded-lg border border-orange-200 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-orange-800 block mb-1">
                          Zone de Destination / Arrivée (Ségrégation)
                        </span>
                        <div className="text-sm font-black text-orange-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-600 inline-block"></span>
                          {viewingBT.destination}
                        </div>
                      </div>
                      <span className="text-[9px] text-orange-700/80 mt-2 block font-mono">Zone cible d'isolement / traitement</span>
                    </div>
                  </div>

                  {/* Objet du Transfert */}
                  <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                    <b className="text-blue-900 block text-[10px] uppercase tracking-wider mb-0.5">
                      Objet Détaillé du Transfert :
                    </b>
                    <p className="text-slate-900 font-bold text-xs leading-relaxed">
                      {viewingBT.transferSubject}
                    </p>
                  </div>
                </div>

                {/* 4. Section III : Données Produit & Liaisons Qualité */}
                <div className="space-y-1.5 print-section">
                  <h2 className="bg-blue-950 text-white font-bold text-[11px] px-2.5 py-1 uppercase rounded tracking-wider">
                    III. Caractéristiques Matière & Liaisons Qualité
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                    <div>
                      <b className="text-slate-500 block text-[10px]">Type de Produit :</b>
                      <span className="font-bold text-slate-800">{viewingBT.productType}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block text-[10px]">N° Ordre de Fab. (OF) :</b>
                      <span className="font-mono font-bold text-blue-950">{viewingBT.ofNumber || 'N/A'}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 flex flex-col justify-center">
                      <b className="text-slate-500 block text-[10px]">Poids Transféré :</b>
                      <span className="font-mono font-black text-slate-900 text-sm text-orange-600">
                        {viewingBT.quantityKg > 0 ? `${viewingBT.quantityKg.toFixed(2)} kg` : 'Non renseigné'}
                      </span>
                    </div>
                    <div>
                      <b className="text-slate-500 block text-[10px]">N° Fiche NC Liée :</b>
                      {viewingBT.ncSheetNumber ? (
                        <span className="text-red-700 font-bold font-mono bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px] inline-block">
                          ⚠️ {viewingBT.ncSheetNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">Aucune liaison</span>
                      )}
                    </div>
                    <div>
                      <b className="text-slate-500 block text-[10px]">N° Bon de Retour :</b>
                      <span className="font-mono font-semibold text-slate-700">{viewingBT.returnSheetNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <b className="text-slate-500 block text-[10px]">N° Fiche d'Action :</b>
                      <span className="font-mono font-semibold text-slate-700">{viewingBT.actionSheetNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Section IV : Constat Technique & Observations */}
                {viewingBT.observation && (
                  <div className="space-y-1.5 print-section">
                    <h2 className="bg-blue-950 text-white font-bold text-[11px] px-2.5 py-1 uppercase rounded tracking-wider">
                      IV. Constat Technique & Observations Logistiques
                    </h2>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-800 italic leading-relaxed whitespace-pre-wrap">
                      {viewingBT.observation}
                    </div>
                  </div>
                )}

                {/* 6. Section V : Pièces Jointes & Photos */}
                {viewingBT.attachments && viewingBT.attachments.length > 0 && (
                  <div className="space-y-1.5 print-section">
                    <h2 className="bg-blue-950 text-white font-bold text-[11px] px-2.5 py-1 uppercase rounded tracking-wider">
                      V. Justificatifs & Photos du Produit ({viewingBT.attachments.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {viewingBT.attachments.map(att => (
                        <div key={att.id} className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
                          {att.type?.includes('pdf') || att.name.endsWith('.pdf') ? (
                            <div className="w-full h-24 flex flex-col items-center justify-center p-2 text-center bg-red-50 text-red-800">
                              <FileText className="h-7 w-7 text-red-600 mb-1" />
                              <span className="text-[8px] font-bold truncate w-full" title={att.name}>{att.name}</span>
                              <a href={att.url} download={att.name} className="text-[8px] underline text-blue-600 font-bold mt-1 block">Télécharger</a>
                            </div>
                          ) : (
                            <div 
                              className="cursor-pointer h-24 relative overflow-hidden" 
                              onClick={() => setActivePreview({ name: att.name, url: att.url, type: att.type || 'image/jpeg' })}
                              title="Cliquer pour agrandir"
                            >
                              <img src={att.url} alt={att.name} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye className="h-5 w-5" />
                              </div>
                              <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-1.5 py-0.5 text-[8px] truncate font-mono">
                                {att.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Section VI : Visas & Signatures Réglementaires (ISO 9001 §8.7) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 print-section avoid-page-break">
                  <h2 className="bg-blue-950 text-white font-bold text-[11px] px-2.5 py-1 uppercase rounded tracking-wider">
                    VI. Visas & Signatures Réglementaires (ISO 9001 §8.7)
                  </h2>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {/* Visa 1: Émetteur */}
                    <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between h-28">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">1. Visa Émetteur (Opérateur)</span>
                        <span className="font-semibold text-slate-800 text-[10px] block mt-0.5">{viewingBT.sender}</span>
                      </div>
                      <div className="border-t border-dashed border-slate-300 pt-1">
                        <span className="text-[8px] text-slate-400 italic block">Signature & Date</span>
                        <span className="font-mono text-[9px] font-bold text-slate-600">{viewingBT.constatDate}</span>
                      </div>
                    </div>

                    {/* Visa 2: Réceptionnaire */}
                    <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between h-28">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">2. Visa Réceptionnaire (Zone Cible)</span>
                        <span className="font-semibold text-slate-800 text-[10px] block mt-0.5">{viewingBT.destination}</span>
                      </div>
                      <div className="border-t border-dashed border-slate-300 pt-1">
                        <span className="text-[8px] text-slate-400 italic block">Signature Réception</span>
                        <span className="font-mono text-[9px] font-bold text-slate-600">
                          {viewingBT.closeDate || 'En attente réception'}
                        </span>
                      </div>
                    </div>

                    {/* Visa 3: Contrôle Qualité / QHSE */}
                    <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between h-28">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">3. Visa Contrôle Qualité / QHSE</span>
                        <span className="font-semibold text-slate-800 text-[10px] block mt-0.5">Direction QHSE Solupack</span>
                      </div>
                      <div className="border-t border-dashed border-slate-300 pt-1">
                        <span className="text-[8px] text-slate-400 italic block">Validation & Clôture</span>
                        {viewingBT.status === 'Effectué' ? (
                          <span className="text-[9px] font-bold text-emerald-700 block">
                            ✅ Validé {viewingBT.closeDate ? `le ${viewingBT.closeDate}` : ''}
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-600 italic block">En cours de traitement</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[8px] text-slate-400 text-center italic mt-2">
                    Document officiel de traçabilité interne SOLUPACK S.A. — Tout produit isolé ou transféré doit porter une étiquette physique d'identification visible (ISO 9001 §8.7).
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-between items-center shrink-0 no-print">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="font-mono font-bold text-slate-700">Réf : {viewingBT.btNumber || viewingBT.id}</span>
                <span>•</span>
                <span>{viewingBT.constatDate}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => exportToPDF("printable-bt-sheet", `SOLUPACK_Bon_Transfert_${viewingBT.btNumber || viewingBT.id}.pdf`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Exporter PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewingBT(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREATION / EDIT FORM BT */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
            
            <div className="bg-blue-900 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-xs bg-orange-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Émission de Transfert
                </span>
                <h3 className="text-lg font-bold mt-1">
                  {editingBT ? `Modifier le Bon de Transfert ${editingBT.id}` : "Créer un Bon de Transfert Interne"}
                </h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">N° Bon (BT)</label>
                  <input 
                    type="text" 
                    value={btNumber} 
                    onChange={(e) => setBtNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Type de Transfert</label>
                  <select 
                    value={btType} 
                    onChange={(e) => setBtType(e.target.value as BTType)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white"
                  >
                    <option value="Retour non conforme">Retour non conforme</option>
                    <option value="Produit non conforme">Produit non conforme</option>
                    <option value="Matière première">Matière première</option>
                    <option value="Equipement de mesure">Equipement de mesure</option>
                    <option value="Autres">Autres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Émetteur *</label>
                  <input 
                    type="text" 
                    value={sender} 
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none bg-white font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Date de Constat</label>
                  <input 
                    type="date" 
                    value={constatDate} 
                    onChange={(e) => setConstatDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Heure de Constat</label>
                  <input 
                    type="time" 
                    value={constatTime} 
                    onChange={(e) => setConstatTime(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Équipe</label>
                  <select 
                    value={team} 
                    onChange={(e) => setTeam(e.target.value as Team)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white"
                  >
                    <option value="A">Équipe A</option>
                    <option value="B">Équipe B</option>
                    <option value="C">Équipe C</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Row 3 - Linkages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Lien Fiche NC N°</label>
                  <input 
                    type="text" 
                    value={ncSheetNumber} 
                    onChange={(e) => setNcSheetNumber(e.target.value)}
                    placeholder="Ex: NC-PROD-2026-0002"
                    className="w-full border border-slate-300 bg-white rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Lien Bon de Retour N°</label>
                  <input 
                    type="text" 
                    value={returnSheetNumber} 
                    onChange={(e) => setReturnSheetNumber(e.target.value)}
                    placeholder="Ex: BR-2026-904"
                    className="w-full border border-slate-300 bg-white rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Lien Fiche d'Action N°</label>
                  <input 
                    type="text" 
                    value={actionSheetNumber} 
                    onChange={(e) => setActionSheetNumber(e.target.value)}
                    placeholder="Ex: ACT-NC02-01"
                    className="w-full border border-slate-300 bg-white rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                  />
                </div>
              </div>

              {/* Row 4 - Product detail */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Type de Produit</label>
                  <div className="flex gap-2.5 mt-2.5 bg-slate-50 p-2 rounded border border-slate-200">
                    {(['Semi-fini', 'Fini', 'MP', 'Autre'] as ProductType[]).map((p, i) => (
                      <label key={i} className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name="form_prod_type" 
                          checked={productType === p}
                          onChange={() => setProductType(p)}
                          className="text-blue-900 cursor-pointer h-3.5 w-3.5"
                        />
                        <span>{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">N° Ordre Fabrication (OF)</label>
                  <input 
                    type="text" 
                    value={ofNumber} 
                    onChange={(e) => setOfNumber(e.target.value)}
                    placeholder="OF-2026-XXXX"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Quantité (Kg) — 2 décimales</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={quantityKg || ''} 
                    onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                    placeholder="Poids net en kg"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 5 - Subject */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Objet du Transfert (Libellé)</label>
                <input 
                  type="text" 
                  value={transferSubject} 
                  onChange={(e) => setTransferSubject(e.target.value)}
                  placeholder="Ex: Transfert de bobines décolées vers zone isolation"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-bold text-slate-800"
                  required
                />
              </div>

              {/* Row 6 - Flows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Zone de Conditionnement (Départ)</label>
                  <select 
                    value={packagingZone} 
                    onChange={(e) => setPackagingZone(e.target.value as BTZone)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white"
                  >
                    <option value="Atelier de production">Atelier de production</option>
                    <option value="Zone d’isolation">Zone d’isolation</option>
                    <option value="Stock produit fini">Stock produit fini</option>
                    <option value="Stock matière première">Stock matière première</option>
                    <option value="Laboratoire">Laboratoire</option>
                    <option value="Autre">Autre Zone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Destination de Ségrégation (Arrivée)</label>
                  <select 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value as BTDestination)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white font-semibold text-orange-800"
                  >
                    <option value="Zone d’isolation non conforme">Zone d’isolation non conforme (Quarantaine)</option>
                    <option value="Atelier de recyclage">Atelier de recyclage (Broyage)</option>
                    <option value="Atelier de production">Atelier de production (Retouche)</option>
                    <option value="Stock produit fini">Stock produit fini</option>
                    <option value="Stock matière première">Stock matière première</option>
                    <option value="Retour au fournisseur">Retour au fournisseur</option>
                    <option value="Opération en externe">Opération en externe</option>
                    <option value="Zone déchets usine">Zone déchets usine</option>
                  </select>
                </div>
              </div>

              {/* Row 7 - Observation */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Constats physiques / Observations (Zone de texte enrichie)</label>
                <textarea 
                  rows={3} 
                  value={observation} 
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Inscrire les remarques physiques observées lors de l'isolation (état de la palette, présence d'étiquettes de non-conformité rouge...)"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none resize-none"
                />
              </div>

              {/* Row 8 - Attachments */}
              <div className="space-y-2">
                <label className="block text-slate-500 font-semibold mb-1">Photos / Preuves Jointes</label>
                <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400">Ajouter des photos du matériel défectueux :</span>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,application/pdf"
                    className="hidden"
                    id="bt-file-upload-input"
                  />
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded font-bold shadow-xs flex items-center gap-1 ml-auto"
                  >
                    <Paperclip className="h-4.5 w-4.5" /> Joindre une photo d'atelier
                  </button>
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {attachments.map(att => (
                      <div key={att.id} className="relative rounded bg-slate-100 p-1 border border-slate-200 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => setActivePreview({ name: att.name, url: att.url, type: att.type || 'image/jpeg' })}
                          className="truncate text-left font-mono text-[9px] text-blue-900 hover:underline flex-1"
                        >
                          {att.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                          className="bg-red-600 text-white p-0.5 rounded-full absolute -top-1 -right-1 z-10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 9 - Status */}
              <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Statut d'Exécution</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white font-bold"
                  >
                    <option value="Brouillon">Brouillon</option>
                    <option value="En attente">En attente (Saisie validée)</option>
                    <option value="Effectué">Effectué (Physiquement réalisé)</option>
                  </select>
                </div>
                {status === 'Effectué' && (
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-center font-bold font-mono">
                    ✅ La date de clôture sera calculée et archivée aujourd'hui.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-200 pt-5 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2 rounded-xl font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-950 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-xs shadow"
                >
                  <Save className="h-4 w-4 text-orange-600" /> Enregistrer le Bon de Transfert
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ATTACHMENT PREVIEW MODAL */}
      {activePreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-3xl w-full flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <span className="font-bold text-xs truncate max-w-lg">{activePreview.name}</span>
              <button 
                type="button"
                onClick={() => setActivePreview(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto flex justify-center items-center bg-slate-100">
              {activePreview.type?.includes('pdf') || activePreview.name.endsWith('.pdf') ? (
                <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
                  <FileText className="h-16 w-16 text-red-600 animate-bounce" />
                  <p className="text-slate-700 font-bold text-sm">Fichier Document PDF : {activePreview.name}</p>
                  <a 
                    href={activePreview.url} 
                    download={activePreview.name}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs shadow flex items-center gap-2"
                  >
                    Télécharger et ouvrir le PDF
                  </a>
                </div>
              ) : (
                <img 
                  src={activePreview.url} 
                  alt={activePreview.name} 
                  className="max-w-full max-h-[50vh] object-contain rounded border border-slate-200 shadow-md" 
                />
              )}
            </div>
            <div className="bg-slate-50 p-3 flex justify-end border-t border-slate-200">
              <button 
                type="button"
                onClick={() => setActivePreview(null)} 
                className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting BT */}
      {btToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-[100] p-4 no-print animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Suppression Bon de Transfert</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Confirmez-vous la suppression définitive et irréversible de ce bon de transfert ?
                </p>
                <p className="text-[10px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                  Cette action est définitive et enregistrée dans le journal d'audit de l'usine.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBtToDelete(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(btToDelete);
                  setBtToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal for Access Restrictions */}
      {errorMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-[100] p-4 no-print animate-fade-in">
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
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-lg transition-all cursor-pointer"
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
