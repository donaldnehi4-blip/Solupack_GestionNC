/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ClientComplaint, ComplaintChannel, NonConformite, User } from '../types';
import { exportComplaintsToExcel } from '../lib/excelExporter';
import { 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet,
  Edit, 
  Trash2, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Users, 
  FileText, 
  X, 
  Save, 
  HelpCircle,
  Link,
  Gift,
  ShieldAlert
} from 'lucide-react';

interface ClientListProps {
  complaints: ClientComplaint[];
  nonConformites: NonConformite[];
  users: User[];
  currentUser: User;
  onSave: (complaint: ClientComplaint) => void;
  onDelete: (id: string) => void;
}

export default function ClientList({ complaints, nonConformites, users, currentUser, onSave, onDelete }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('TOUS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TOUS');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<ClientComplaint | null>(null);

  // Custom modals state
  const [compToDelete, setCompToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [reclamationDate, setReclamationDate] = useState(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState<ComplaintChannel>('Email');
  const [estimatedCostFcfa, setEstimatedCostFcfa] = useState<number>(0);
  const [compensationGranted, setCompensationGranted] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [associatedNcId, setAssociatedNcId] = useState('');
  const [status, setStatus] = useState<'Ouvert' | 'En cours' | 'Clôturé'>('Ouvert');

  // Search & Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = 
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.associatedNcId && c.associatedNcId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesChannel = selectedChannel === 'TOUS' || c.channel === selectedChannel;
      const matchesStatus = selectedStatus === 'TOUS' || c.status === selectedStatus;

      return matchesSearch && matchesChannel && matchesStatus;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [complaints, searchTerm, selectedChannel, selectedStatus]);

  // Open creation modal
  const handleOpenCreate = () => {
    setEditingComplaint(null);
    setClientName('');
    setContactPhone('');
    setOrderNumber('');
    setReclamationDate(new Date().toISOString().split('T')[0]);
    setChannel('Email');
    setEstimatedCostFcfa(0);
    setCompensationGranted('');
    setShortDescription('');
    setAssociatedNcId('');
    setStatus('Ouvert');
    setIsFormOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (c: ClientComplaint) => {
    setEditingComplaint(c);
    setClientName(c.clientName);
    setContactPhone(c.contactPhone);
    setOrderNumber(c.orderNumber);
    setReclamationDate(c.reclamationDate);
    setChannel(c.channel);
    setEstimatedCostFcfa(c.estimatedCostFcfa);
    setCompensationGranted(c.compensationGranted);
    setShortDescription(c.shortDescription);
    setAssociatedNcId(c.associatedNcId || '');
    setStatus(c.status || 'Ouvert');
    setIsFormOpen(true);
  };

  // Submit form
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !shortDescription.trim()) {
      alert("Le nom du client et la description sont obligatoires.");
      return;
    }

    const saved: ClientComplaint = {
      id: editingComplaint?.id || `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      clientName,
      contactPhone,
      orderNumber,
      reclamationDate,
      channel,
      estimatedCostFcfa: isNaN(Number(estimatedCostFcfa)) ? 0 : Math.max(0, Number(estimatedCostFcfa)),
      compensationGranted,
      shortDescription,
      associatedNcId: associatedNcId || undefined,
      status,
      createdAt: editingComplaint?.createdAt || new Date().toISOString()
    };

    onSave(saved);
    setIsFormOpen(false);
  };

  const formattedFcfa = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  return (
    <div id="module-client-complaints" className="space-y-6">
      
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs gap-4">
        <div>
          <h2 className="text-blue-900 font-bold text-lg md:text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            MODULE 4 : Gestion des Réclamations Clients (§9.1.2)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Enregistrement des insatisfactions, quantification financière des litiges et suivi des plans d'indemnisations
          </p>
        </div>

        <button
          id="btn-add-complaint"
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-2 shadow-xs transition-all shrink-0"
        >
          <Plus className="h-4 w-4" /> Enregistrer une Réclamation Client
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher (Client, Commande, NC...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 outline-none text-xs"
            />
          </div>

          {/* Canal */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs"
          >
            <option value="TOUS">Canal de Réception : TOUS</option>
            <option value="Email">Email</option>
            <option value="Téléphone">Téléphone</option>
            <option value="Visite">Visite d'usine</option>
            <option value="Audit client">Audit client</option>
          </select>

          {/* Statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs"
          >
            <option value="TOUS">Statut : TOUS</option>
            <option value="Ouvert">Ouvert</option>
            <option value="En cours">En cours</option>
            <option value="Clôturé">Clôturé</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold shrink-0">
          <button
            onClick={() => exportComplaintsToExcel(filteredComplaints)}
            className="text-blue-900 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
            title="Exporter la liste des réclamations clients vers Excel avec tous les champs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Exporter Excel
          </button>
          <span>Total Litiges Estimé: <span className="text-red-600 font-bold font-mono text-sm">{formattedFcfa(filteredComplaints.reduce((acc, c)=>acc + c.estimatedCostFcfa, 0))}</span></span>
        </div>
      </div>

      {/* Table List of complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredComplaints.map(comp => (
          <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            
            {/* Card Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-150 flex justify-between items-start">
              <div>
                <span className="font-mono text-slate-400 text-[10px] block font-bold">{comp.id}</span>
                <h3 className="font-black text-blue-950 text-base mt-0.5">{comp.clientName}</h3>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">Commandé/BL: <b>{comp.orderNumber || 'N/A'}</b></span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                comp.status === 'Ouvert' ? 'bg-red-100 text-red-800' :
                comp.status === 'En cours' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {comp.status}
              </span>
            </div>

            {/* Card Content */}
            <div className="p-5 space-y-4 flex-1 text-xs text-slate-600">
              
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px]">Description de l'anomalie :</span>
                <p className="text-slate-700 font-semibold line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  "{comp.shortDescription}"
                </p>
              </div>

              {/* Financial metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider">Coût évalué</span>
                  <span className="text-red-600 font-bold font-mono text-xs">{formattedFcfa(comp.estimatedCostFcfa)}</span>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-emerald-950">
                  <span className="text-emerald-700 font-semibold block text-[9px] uppercase tracking-wider">Canal d'alerte</span>
                  <span className="font-bold font-mono text-xs flex items-center gap-1 mt-0.5">
                    {comp.channel === 'Email' ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                    {comp.channel}
                  </span>
                </div>
              </div>

              {/* Compensation */}
              {comp.compensationGranted && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 flex gap-2 items-start">
                  <Gift className="h-4.5 w-4.5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[10px] block text-slate-500 uppercase tracking-wide">Compensation Accordée</span>
                    <span className="text-[11px] font-semibold text-slate-800">{comp.compensationGranted}</span>
                  </div>
                </div>
              )}

              {/* Cross connection to NC */}
              {comp.associatedNcId && (
                <div className="text-[10px] bg-blue-50 border border-blue-100 p-2 rounded-lg text-blue-900 flex items-center gap-1 font-mono font-bold">
                  <Link className="h-3.5 w-3.5 text-orange-600" />
                  Rattaché à la fiche interne: {comp.associatedNcId}
                </div>
              )}

            </div>

            {/* Card Actions */}
            <div className="bg-slate-50 p-3 border-t border-slate-150 flex justify-between items-center text-xs text-slate-400">
              <span>📅 Reçu le {comp.reclamationDate}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleOpenEdit(comp)}
                  className="bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 text-slate-600 px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
                >
                  <Edit className="h-3.5 w-3.5 inline mr-1" /> Modifier
                </button>
                <button
                  onClick={() => {
                    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PILOTE') {
                      setErrorMessage("La suppression des réclamations est restreinte aux Administrateurs et Pilotes QHSE.");
                      return;
                    }
                    setCompToDelete(comp.id);
                  }}
                  className="bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {filteredComplaints.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-400 italic text-xs">
            Aucune réclamation client enregistrée.
          </div>
        )}
      </div>

      {/* EDITING / CREATING MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            <div className="bg-blue-900 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-xs bg-orange-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Réclamation Client
                </span>
                <h3 className="text-lg font-bold mt-1">
                  {editingComplaint ? `Modifier la fiche ${editingComplaint.id}` : "Enregistrer un Nouveau Litige Client"}
                </h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Nom du Client</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: CHOCO-CI"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Contact Téléphonique Client</label>
                  <input 
                    type="text" 
                    value={contactPhone} 
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Ex: +225 07070707"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">N° Commande / BL</label>
                  <input 
                    type="text" 
                    value={orderNumber} 
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Ex: CMD-2026-9902"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Date Réception</label>
                  <input 
                    type="date" 
                    value={reclamationDate} 
                    onChange={(e) => setReclamationDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Canal de Réception</label>
                  <select 
                    value={channel} 
                    onChange={(e) => setChannel(e.target.value as ComplaintChannel)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white"
                  >
                    <option value="Email">Email</option>
                    <option value="Téléphone">Téléphone</option>
                    <option value="Visite">Visite</option>
                    <option value="Audit client">Audit client</option>
                  </select>
                </div>
              </div>

              {/* Row 3 - Financial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Coût Estimé du Litige (FCFA)</label>
                  <input 
                    type="number" 
                    value={estimatedCostFcfa || ''} 
                    onChange={(e) => setEstimatedCostFcfa(parseInt(e.target.value) || 0)}
                    placeholder="Coût direct et compensations en FCFA"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Fiche NC Interne rattachée (Optionnel)</label>
                  <select 
                    value={associatedNcId} 
                    onChange={(e) => setAssociatedNcId(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white font-mono"
                  >
                    <option value="">-- Aucun rattachement --</option>
                    {nonConformites.map(nc => (
                      <option key={nc.id} value={nc.id}>{nc.id} - {nc.shortTitle}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4 */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Anomalie signalée par le client (Description détaillée)</label>
                <textarea 
                  rows={3} 
                  value={shortDescription} 
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Inscrire textuellement l'objet du mécontentement du client ou de l'auditeur..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none resize-none"
                  required
                />
              </div>

              {/* Row 5 */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Compensation commercial ou technique accordée</label>
                <input 
                  type="text" 
                  value={compensationGranted} 
                  onChange={(e) => setCompensationGranted(e.target.value)}
                  placeholder="Ex: Remplacement complet sous quinzaine, émission d'un avoir..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-semibold text-emerald-800"
                />
              </div>

              {/* Row 6 */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Statut du dossier</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white font-bold"
                >
                  <option value="Ouvert">Ouvert (À analyser)</option>
                  <option value="En cours">En cours (Planification en cours)</option>
                  <option value="Clôturé">Clôturé (Geste commercial validé & dossier archivé)</option>
                </select>
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
                  <Save className="h-4 w-4 text-orange-600" /> Enregistrer la réclamation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting Complaint */}
      {compToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-[100] p-4 no-print animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Suppression de Réclamation</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Confirmez-vous la suppression définitive de cette réclamation client ?
                </p>
                <p className="text-[10px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                  Cette action est définitive et effacera l'historique associé.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompToDelete(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(compToDelete);
                  setCompToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Confirmer
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
