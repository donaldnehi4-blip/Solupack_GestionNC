/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  NonConformite, 
  Shift, 
  Team, 
  Service, 
  DetectionMethod, 
  NCSource, 
  ActionImmediate, 
  ProductType, 
  NCDecision, 
  Cause5M, 
  ActionType, 
  ActionStatus, 
  ActionEfficiency, 
  NCCloseMethod,
  User,
  ActionCorrective,
  IshikawaCategoryItem
} from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  FileCode, 
  HelpCircle, 
  Upload, 
  Paperclip,
  Check,
  Signature
} from 'lucide-react';

interface NCFormProps {
  nc?: NonConformite | null;
  users: User[];
  currentUser: User;
  onSave: (nc: NonConformite) => void;
  onClose: () => void;
}

export default function NCForm({ nc, users, currentUser, onSave, onClose }: NCFormProps) {
  // Section Identification
  const [shift, setShift] = useState<Shift>('7H-14H');
  const [team, setTeam] = useState<Team>('A');
  const [supervisor, setSupervisor] = useState('');
  const [ncDate, setNcDate] = useState(new Date().toISOString().split('T')[0]);
  const [ncTime, setNcTime] = useState('08:00');
  const [detectorName, setDetectorName] = useState(currentUser.name);
  const [detectorFunction, setDetectorFunction] = useState(currentUser.function);
  const [serviceConcerned, setServiceConcerned] = useState<Service>('Extrusion');

  // Section Origine
  const [detectionMethod, setDetectionMethod] = useState<DetectionMethod>('Autocontrôle');
  const [source, setSource] = useState<NCSource>('Produit non conforme');
  const [immediateActions, setImmediateActions] = useState<ActionImmediate[]>(['Identification de la NC']);

  // Section Type de la non-conformité
  const [productType, setProductType] = useState<ProductType>('Semi-fini');
  const [articleCode, setArticleCode] = useState('');
  const [articleLabel, setArticleLabel] = useState('');
  const [clients, setClients] = useState('');
  const [machine, setMachine] = useState('');
  const [quantityKg, setQuantityKg] = useState<number>(0);
  const [quantityUnitDetails, setQuantityUnitDetails] = useState('');
  const [ofNumber, setOfNumber] = useState('');
  const [originSection, setOriginSection] = useState<Service>('Extrusion');
  const [manufacturingDate, setManufacturingDate] = useState(new Date().toISOString().split('T')[0]);
  const [shortTitle, setShortTitle] = useState('');

  // Section Traitement et Décision
  const [description, setDescription] = useState('');
  const [possibleCauses, setPossibleCauses] = useState('');
  const [decision, setDecision] = useState<NCDecision>('Blocage');

  // Section Analyse de causes
  const PRESET_ISHIKAWA_CATEGORIES = [
    "Machine",
    "Méthode",
    "Matière première",
    "Main d'œuvre",
    "Milieu",
    "Mesure",
    "Management",
    "Maintenance"
  ];

  const [cause5M, setCause5M] = useState<Cause5M>('Machine');
  const [whys, setWhys] = useState<string[]>([
    '',
    '',
    '',
    '',
    ''
  ]);
  const [ishikawaAnalysis, setIshikawaAnalysis] = useState('');
  const [ishikawaCategories, setIshikawaCategories] = useState<IshikawaCategoryItem[]>([
    { id: 'cat-1', category: 'Machine', causes: '', synthesis: '' },
    { id: 'cat-2', category: 'Méthode', causes: '', synthesis: '' }
  ]);
  const [smqRiskAttached, setSmqRiskAttached] = useState(false);
  const [smqRiskRef, setSmqRiskRef] = useState('');

  // Section Actions Correctives
  const [actions, setActions] = useState<ActionCorrective[]>([]);
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newActionType, setNewActionType] = useState<ActionType>('Action corrective');
  const [newActionResp, setNewActionResp] = useState(users[0]?.name || '');
  const [newActionDeadline, setNewActionDeadline] = useState(new Date().toISOString().split('T')[0]);

  // Section Clôture
  const [closeMethod, setCloseMethod] = useState<NCCloseMethod>('Clôture directe');
  const [closeRef, setCloseRef] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [closedBy, setClosedBy] = useState('');

  // Signatures
  const [detectorSignature, setDetectorSignature] = useState(nc?.signatures?.detectorSignature || '');
  const [responsibleSignature, setResponsibleSignature] = useState(nc?.signatures?.responsibleSignature || '');
  const [verifierSignature, setVerifierSignature] = useState(nc?.signatures?.verifierSignature || '');

  // Attachments
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: string; url: string; date: string }[]>([]);
  const [activePreview, setActivePreview] = useState<{ name: string; url: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with existing values if editing
  useEffect(() => {
    if (nc) {
      setShift(nc.shift);
      setTeam(nc.team);
      setSupervisor(nc.supervisor);
      setNcDate(nc.ncDate);
      setNcTime(nc.ncTime);
      setDetectorName(nc.detectorName);
      setDetectorFunction(nc.detectorFunction);
      setServiceConcerned(nc.serviceConcerned);
      setDetectionMethod(nc.detectionMethod);
      setSource(nc.source);
      setImmediateActions(nc.immediateActions);
      setProductType(nc.productType);
      setArticleCode(nc.articleCode);
      setArticleLabel(nc.articleLabel);
      setClients(nc.clients);
      setMachine(nc.machine);
      setQuantityKg(nc.quantityKg);
      setQuantityUnitDetails(nc.quantityUnitDetails);
      setOfNumber(nc.ofNumber);
      setOriginSection(nc.originSection);
      setManufacturingDate(nc.manufacturingDate);
      setShortTitle(nc.shortTitle);
      setDescription(nc.description);
      setPossibleCauses(nc.possibleCauses);
      setDecision(nc.decision);
      setCause5M(nc.cause5M);
      setWhys(nc.whys && nc.whys.length === 5 ? nc.whys : ['', '', '', '', '']);
      setIshikawaAnalysis(nc.ishikawaAnalysis || '');
      if (nc.ishikawaCategories && nc.ishikawaCategories.length > 0) {
        setIshikawaCategories(nc.ishikawaCategories);
      } else {
        setIshikawaCategories([
          { id: 'cat-1', category: nc.cause5M || 'Machine', causes: nc.possibleCauses || '', synthesis: nc.ishikawaAnalysis || '' }
        ]);
      }
      setSmqRiskAttached(nc.smqRiskAttached);
      setSmqRiskRef(nc.smqRiskRef || '');
      setActions(nc.actions);
      setCloseMethod(nc.closeMethod);
      setCloseRef(nc.closeRef || '');
      setCloseDate(nc.closeDate || '');
      setClosedBy(nc.closedBy || '');
      setAttachments(nc.attachments || []);
      setDetectorSignature(nc.signatures?.detectorSignature || '');
      setResponsibleSignature(nc.signatures?.responsibleSignature || '');
      setVerifierSignature(nc.signatures?.verifierSignature || '');
    }
  }, [nc]);

  // Handle immediate action toggles
  const handleImmediateActionToggle = (action: ActionImmediate) => {
    if (immediateActions.includes(action)) {
      setImmediateActions(immediateActions.filter(a => a !== action));
    } else {
      setImmediateActions([...immediateActions, action]);
    }
  };

  // Handle Whys array change
  const handleWhyChange = (index: number, value: string) => {
    const updated = [...whys];
    updated[index] = value;
    setWhys(updated);
  };

  // Ishikawa Categories Handlers
  const handleAddIshikawaCategory = () => {
    const newCat: IshikawaCategoryItem = {
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      category: 'Matière première',
      causes: '',
      synthesis: ''
    };
    setIshikawaCategories(prev => [...prev, newCat]);
  };

  const handleUpdateIshikawaCategory = (id: string, field: keyof IshikawaCategoryItem, value: string) => {
    setIshikawaCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveIshikawaCategory = (id: string) => {
    if (ishikawaCategories.length <= 1) {
      alert("Vous devez conserver au moins une catégorie d'analyse.");
      return;
    }
    setIshikawaCategories(prev => prev.filter(c => c.id !== id));
  };

  // Handle adding corrective action to the list
  const addActionToList = () => {
    if (!newActionDesc.trim()) return;
    const newAction: ActionCorrective = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      description: newActionDesc,
      type: newActionType,
      responsible: newActionResp,
      deadline: newActionDeadline,
      status: 'Démarrer'
    };
    setActions([...actions, newAction]);
    setNewActionDesc('');
  };

  // Delete corrective action
  const deleteActionFromList = (actionId: string) => {
    setActions(actions.filter(a => a.id !== actionId));
  };

  // Update action details inside the list
  const updateActionStatus = (actionId: string, status: ActionStatus) => {
    setActions(actions.map(a => {
      if (a.id === actionId) {
        let update: Partial<ActionCorrective> = { status };
        if (status === 'Effectué') {
          update.verificationDate = new Date().toISOString().split('T')[0];
          update.verifier = currentUser.name;
          update.efficiency = 'Oui';
          update.efficiencyComment = 'Efficacité validée lors du contrôle post-action.';
        }
        return { ...a, ...update };
      }
      return a;
    }));
  };

  // Update efficiency
  const updateActionEfficiency = (actionId: string, efficiency: ActionEfficiency, comment: string) => {
    setActions(actions.map(a => {
      if (a.id === actionId) {
        return { ...a, efficiency, efficiencyComment: comment };
      }
      return a;
    }));
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
        const newAtt = {
          id: `ATT-${Date.now()}`,
          name: file.name,
          type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          url: fileUrl,
          date: new Date().toISOString().split('T')[0]
        };
        setAttachments([...attachments, newAtt]);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset file input value so same file can be uploaded again if deleted
    e.target.value = '';
  };

  // Submit main form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortTitle.trim()) {
      alert('La désignation de la NC est obligatoire.');
      return;
    }

    const savedNC: NonConformite = {
      id: nc?.id || `NC-PROD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      createdAt: nc?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      shift,
      team,
      supervisor,
      ncDate,
      ncTime,
      detectorName,
      detectorFunction,
      serviceConcerned,
      
      detectionMethod,
      source,
      immediateActions,
      
      productType,
      articleCode,
      articleLabel,
      clients,
      machine,
      quantityKg: isNaN(Number(quantityKg)) ? 0 : Number(Number(quantityKg).toFixed(2)),
      quantityUnitDetails,
      ofNumber,
      originSection,
      manufacturingDate,
      shortTitle,
      
      description,
      possibleCauses,
      decision,
      
      cause5M: (ishikawaCategories.find(c => c.causes.length > 0)?.category as Cause5M) || (ishikawaCategories[0]?.category as Cause5M) || cause5M || 'Machine',
      whys,
      ishikawaAnalysis,
      ishikawaCategories,
      smqRiskAttached,
      smqRiskRef: smqRiskAttached ? smqRiskRef : undefined,
      
      actions,
      
      closeMethod,
      closeRef: closeMethod !== 'Clôture directe' ? closeRef : undefined,
      closeDate: closeDate || undefined,
      closedBy: closeDate ? (closedBy || currentUser.name) : undefined,
      
      additionalNotes: nc?.additionalNotes || [],
      attachments,
      
      signatures: {
        detectorSignature: detectorSignature || undefined,
        responsibleSignature: responsibleSignature || undefined,
        verifierSignature: verifierSignature || undefined
      }
    };

    onSave(savedNC);
  };

  const isEditable = currentUser.role !== 'DIRECTION';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Title Bar */}
        <div className="bg-blue-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <span className="text-xs bg-orange-600 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
              Formulaire de Qualité
            </span>
            <h2 className="text-lg md:text-xl font-bold mt-1">
              {nc ? `Modifier la fiche ${nc.id}` : "Déclarer une nouvelle Non-Conformité (NC)"}
            </h2>
          </div>
          <button 
            id="btn-close-ncform"
            onClick={onClose}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* SECTION 1: IDENTIFICATION */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-blue-900 font-bold border-b border-slate-100 pb-2 text-sm md:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">1</span>
              Section Identification & Détection
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date Détection</label>
                <input 
                  type="date" 
                  value={ncDate}
                  onChange={(e) => setNcDate(e.target.value)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Heure Détection</label>
                <input 
                  type="time" 
                  value={ncTime}
                  onChange={(e) => setNcTime(e.target.value)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Quart</label>
                <select 
                  value={shift} 
                  onChange={(e) => setShift(e.target.value as Shift)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="7H-14H">7H-14H (Matin)</option>
                  <option value="14H-22H">14H-22H (Après-midi)</option>
                  <option value="22H-7H">22H-7H (Nuit)</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Équipe</label>
                <select 
                  value={team} 
                  onChange={(e) => setTeam(e.target.value as Team)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="A">Équipe A</option>
                  <option value="B">Équipe B</option>
                  <option value="C">Équipe C</option>
                  <option value="Autre">Autre / Journalier</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Surveillant Présent</label>
                <input 
                  type="text" 
                  value={supervisor} 
                  onChange={(e) => setSupervisor(e.target.value)}
                  placeholder="Nom du superviseur"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Émetteur / Détecteur *</label>
                <input 
                  type="text" 
                  value={detectorName} 
                  onChange={(e) => setDetectorName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none bg-white text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Fonction de l'Émetteur *</label>
                <input 
                  type="text" 
                  value={detectorFunction} 
                  onChange={(e) => setDetectorFunction(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none bg-white text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Service Concerné</label>
                <select 
                  value={serviceConcerned} 
                  onChange={(e) => setServiceConcerned(e.target.value as Service)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="Extrusion">Extrusion</option>
                  <option value="Soudure">Soudure</option>
                  <option value="Impression">Impression</option>
                  <option value="Lamination">Lamination</option>
                  <option value="Rebobinage">Rebobinage</option>
                  <option value="Recyclage">Recyclage</option>
                  <option value="Autres">Autres Services</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: ORIGINE ET ACTIONS A CHAUD */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-blue-900 font-bold border-b border-slate-100 pb-2 text-sm md:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">2</span>
              Origine de Détection & Actions Immédiates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Méthode de Détection</label>
                <select 
                  value={detectionMethod} 
                  onChange={(e) => setDetectionMethod(e.target.value as DetectionMethod)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="Autocontrôle">Autocontrôle</option>
                  <option value="Contrôle qualité">Contrôle qualité</option>
                  <option value="Client">Client</option>
                  <option value="Audit">Audit</option>
                  <option value="Réception">Réception</option>
                  <option value="Expédition">Expédition</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Origine de détection / Type de Risque</label>
                <select 
                  value={source} 
                  onChange={(e) => setSource(e.target.value as NCSource)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="Produit non conforme">Produit non conforme</option>
                  <option value="Retour/Réclamation client">Retour/Réclamation client</option>
                  <option value="Laboratoire">Laboratoire</option>
                  <option value="Audit interne/externe">Audit interne/externe</option>
                  <option value="Réception MP non conforme">Réception MP non conforme</option>
                  <option value="Sécurité environnement">Sécurité environnement</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-600 font-semibold mb-2">Actions à chaud (immédiates)</label>
              <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {(['Responsables informés', 'Identification de la NC', 'Isolation / Emplacement'] as ActionImmediate[]).map((act, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={immediateActions.includes(act)}
                      onChange={() => handleImmediateActionToggle(act)}
                      disabled={!isEditable}
                      className="rounded text-blue-900 focus:ring-0 cursor-pointer h-4 w-4"
                    />
                    <span>{act}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: TYPE DE LA NON-CONFORMITE */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-blue-900 font-bold border-b border-slate-100 pb-2 text-sm md:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">3</span>
              Type de Produit & Détails Matériels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Type de Produit</label>
                <div className="flex gap-3 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                  {(['Semi-fini', 'Fini', 'MP', 'Autre'] as ProductType[]).map((type, i) => (
                    <label key={i} className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input 
                        type="radio" 
                        name="product_type"
                        value={type}
                        checked={productType === type}
                        onChange={() => setProductType(type)}
                        disabled={!isEditable}
                        className="text-blue-900 focus:ring-0 cursor-pointer"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Désignation de la NC (Intitulé court)</label>
                <input 
                  type="text" 
                  value={shortTitle} 
                  onChange={(e) => setShortTitle(e.target.value)}
                  placeholder="Ex: Défaut de repérage de couleur"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Code Article</label>
                <input 
                  type="text" 
                  value={articleCode} 
                  onChange={(e) => setArticleCode(e.target.value)}
                  placeholder="Ex: EXT-PEBD-120"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Libellé Article</label>
                <input 
                  type="text" 
                  value={articleLabel} 
                  onChange={(e) => setArticleLabel(e.target.value)}
                  placeholder="Ex: Gaine PEBD contact alimentaire"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Client(s) Concerné(s)</label>
                <input 
                  type="text" 
                  value={clients} 
                  onChange={(e) => setClients(e.target.value)}
                  placeholder="Ex: CHOCO-CI / SOBICI"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Machine d'origine</label>
                <input 
                  type="text" 
                  value={machine} 
                  onChange={(e) => setMachine(e.target.value)}
                  placeholder="Ex: Extrudeuse E04"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Quantité (kg)</label>
                <input 
                  type="number" 
                  value={quantityKg || ''} 
                  onChange={(e) => setQuantityKg(parseFloat(e.target.value) || 0)}
                  placeholder="Quantité en kg"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Détails de conditionnement</label>
                <input 
                  type="text" 
                  value={quantityUnitDetails} 
                  onChange={(e) => setQuantityUnitDetails(e.target.value)}
                  placeholder="Ex: 3 bobines de 150 kg"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">N° OF (Ordre de Fabrication)</label>
                <input 
                  type="text" 
                  value={ofNumber} 
                  onChange={(e) => setOfNumber(e.target.value)}
                  placeholder="Ex: OF-2026-4819"
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Section d'origine</label>
                <select 
                  value={originSection} 
                  onChange={(e) => setOriginSection(e.target.value as Service)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="Extrusion">Extrusion</option>
                  <option value="Soudure">Soudure</option>
                  <option value="Impression">Impression</option>
                  <option value="Lamination">Lamination</option>
                  <option value="Rebobinage">Rebobinage</option>
                  <option value="Recyclage">Recyclage</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date Fabrication</label>
                <input 
                  type="date" 
                  value={manufacturingDate} 
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DESCRIPTION ET DECISION */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-blue-900 font-bold border-b border-slate-100 pb-2 text-sm md:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">4</span>
              Description du Défaut & Prise de Décision
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description Détaillée de la NC</label>
                <textarea 
                  rows={4}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrire précisément la non-conformité constatée..."
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Premières Causes Constatées (Possibles)</label>
                <textarea 
                  rows={4}
                  value={possibleCauses} 
                  onChange={(e) => setPossibleCauses(e.target.value)}
                  placeholder="Hypothèses initiales de défaillance..."
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Décision Qualité Prise</label>
                <select 
                  value={decision} 
                  onChange={(e) => setDecision(e.target.value as NCDecision)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="Blocage">Blocage temporaire (Quarantaine)</option>
                  <option value="Rebut">Rebut (Destruction totale)</option>
                  <option value="Recyclage interne">Recyclage interne (Broyage)</option>
                  <option value="Retouche">Retouche (Correction atelier)</option>
                  <option value="Dérogation">Dérogation client autorisée</option>
                  <option value="Retour fournisseur">Retour fournisseur</option>
                  <option value="Déclassement">Déclassement (Produit second choix)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 5: ANALYSE CAUSES RACINES (ISHIKAWA MULTI-CATÉGORIES & 5 POURQUOI) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-blue-900 font-bold border-b border-slate-100 pb-2 text-sm md:text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">5</span>
                Analyse des Causes Racines (Ishikawa multi-catégories & Méthodologie 5 Pourquoi)
              </div>
            </h3>

            {/* Multi-Category Ishikawa Analysis & Syntheses */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    Diagramme d'Ishikawa — Catégories & Synthèses
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Saisissez et ajoutez autant de catégories que nécessaire (Machine, Méthode, Matière, Main d'œuvre, Milieu, Mesure, Management, etc.) et renseignez leurs synthèses.
                  </span>
                </div>
                {isEditable && (
                  <button
                    type="button"
                    onClick={handleAddIshikawaCategory}
                    className="bg-blue-900 hover:bg-blue-950 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Ajouter une Catégorie / Synthèse
                  </button>
                )}
              </div>

              {/* Dynamic list of Ishikawa categories */}
              <div className="space-y-3">
                {ishikawaCategories.map((catItem, idx) => (
                  <div key={catItem.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <span className="font-mono bg-orange-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          Catégorie #{idx + 1}
                        </span>
                        <select
                          value={PRESET_ISHIKAWA_CATEGORIES.includes(catItem.category) ? catItem.category : 'Autre'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'Autre') {
                              handleUpdateIshikawaCategory(catItem.id, 'category', val);
                            }
                          }}
                          disabled={!isEditable}
                          className="border border-slate-300 rounded p-1.5 text-xs font-bold text-slate-800 bg-white focus:ring-1 focus:ring-blue-900 outline-none flex-1"
                        >
                          {PRESET_ISHIKAWA_CATEGORIES.map(preset => (
                            <option key={preset} value={preset}>{preset}</option>
                          ))}
                          <option value="Autre">Autre (Nom personnalisé...)</option>
                        </select>
                        {!PRESET_ISHIKAWA_CATEGORIES.includes(catItem.category) && (
                          <input
                            type="text"
                            value={catItem.category}
                            onChange={(e) => handleUpdateIshikawaCategory(catItem.id, 'category', e.target.value)}
                            placeholder="Saisir la catégorie..."
                            disabled={!isEditable}
                            className="border border-slate-300 rounded p-1.5 text-xs font-bold text-slate-800 bg-white focus:ring-1 focus:ring-blue-900 outline-none flex-1"
                          />
                        )}
                      </div>

                      {isEditable && ishikawaCategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIshikawaCategory(catItem.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-full transition-colors"
                          title="Supprimer cette catégorie"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-semibold mb-1 text-[11px]">
                          Causes & Facteurs Identifiés
                        </label>
                        <textarea
                          rows={2}
                          value={catItem.causes}
                          onChange={(e) => handleUpdateIshikawaCategory(catItem.id, 'causes', e.target.value)}
                          placeholder="Ex: Usure des mâchoires de scellage, absence d'alarme thermique..."
                          disabled={!isEditable}
                          className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-900 outline-none resize-none bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-semibold mb-1 text-[11px]">
                          Synthèse de cette Catégorie
                        </label>
                        <textarea
                          rows={2}
                          value={catItem.synthesis || ''}
                          onChange={(e) => handleUpdateIshikawaCategory(catItem.id, 'synthesis', e.target.value)}
                          placeholder="Ex: Cause majeure déterminante. Nécessite une opération de maintenance."
                          disabled={!isEditable}
                          className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-900 outline-none resize-none bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Global Synthesis */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-slate-700 font-bold mb-1">
                  Synthèse Globale Ishikawa (Conclusion Causalité)
                </label>
                <textarea
                  rows={2}
                  value={ishikawaAnalysis}
                  onChange={(e) => setIshikawaAnalysis(e.target.value)}
                  placeholder="Ex: L'analyse croisée Machine & Méthode confirme qu'un choc thermique non régulé combiné à une vitesse excessive a engendré la déformation."
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-900 outline-none text-xs bg-white text-slate-800"
                />
              </div>
            </div>

            {/* 5 Whys Method */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-900" />
                  Méthode des 5 Pourquoi (Enchaînement Causal Cible)
                </span>
                <span className="text-[11px] text-slate-500 font-medium font-mono">
                  ISO 9001:2015 §10.2
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {whys.map((why, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-blue-900 text-white w-5 h-5 shrink-0 rounded-full flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {idx === 0 ? "Pourquoi 1 : Pourquoi cette cause s'est-elle produite ?" : `Pourquoi ${idx + 1} : Pourquoi cela ? (sur la réponse précédente)`}
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={why}
                      onChange={(e) => handleWhyChange(idx, e.target.value)}
                      placeholder={idx === 0 ? "Pourquoi cette cause s'est-elle produite ? Saisir la cause racine immédiate..." : "Pourquoi cela ? (sur la réponse au Pourquoi " + idx + ")..."}
                      disabled={!isEditable}
                      className="w-full border border-slate-300 bg-slate-50/50 rounded-lg p-2 focus:bg-white focus:ring-1 focus:ring-blue-900 outline-none text-xs text-slate-800"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Risk SMQ link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input 
                  type="checkbox" 
                  checked={smqRiskAttached}
                  onChange={(e) => setSmqRiskAttached(e.target.checked)}
                  disabled={!isEditable}
                  className="rounded text-blue-900 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <span>Rattacher cette NC à un Risque majeur du SMQ ?</span>
              </label>

              {smqRiskAttached && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Référence du Risque (Cartographie)</label>
                  <input 
                    type="text" 
                    value={smqRiskRef}
                    onChange={(e) => setSmqRiskRef(e.target.value)}
                    placeholder="Ex: R-PROD-EXT-02"
                    disabled={!isEditable}
                    className="w-full border border-slate-300 bg-white rounded p-1.5 focus:ring-1 focus:ring-blue-900 outline-none"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6: ACTIONS CORRECTIVES (GRID & ADD SUBFORM) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-blue-900 font-bold border-b border-slate-100 pb-2 text-sm md:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">6</span>
              Actions Correctives / Préventives (ISO 9001 §10.2)
            </h3>

            {/* List of current actions */}
            <div className="space-y-3">
              {actions.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-400 text-xs border border-dashed border-slate-300">
                  Aucune action enregistrée pour le moment. Veuillez en déclarer ci-dessous.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Responsable</th>
                        <th className="p-2.5">Échéance</th>
                        <th className="p-2.5">Statut</th>
                        <th className="p-2.5">Efficacité</th>
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {actions.map((act, i) => (
                        <tr key={act.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-800">{act.description}</td>
                          <td className="p-2.5">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium font-mono">
                              {act.type}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 font-medium">{act.responsible}</td>
                          <td className="p-2.5 text-slate-600 font-mono">{act.deadline}</td>
                          <td className="p-2.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                              act.status === 'Démarrer' ? 'bg-red-100 text-red-800' :
                              act.status === 'En cours' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                act.status === 'Démarrer' ? 'bg-red-600' :
                                act.status === 'En cours' ? 'bg-amber-600' :
                                'bg-emerald-600'
                              }`}></span>
                              {act.status}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {act.status === 'Effectué' ? (
                              <div className="space-y-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  act.efficiency === 'Oui' ? 'bg-emerald-100 text-emerald-800' :
                                  act.efficiency === 'Non' ? 'bg-red-100 text-red-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  Efficace: {act.efficiency}
                                </span>
                                <p className="text-[10px] text-slate-400 max-w-[150px] truncate" title={act.efficiencyComment}>
                                  {act.efficiencyComment}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Non vérifié</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex justify-center items-center gap-1">
                              {act.status !== 'Effectué' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => updateActionStatus(act.id, 'En cours')}
                                    className="px-2 py-1 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold rounded"
                                    title="Mettre en cours"
                                  >
                                    En cours
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateActionStatus(act.id, 'Effectué')}
                                    className="px-2 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                                    title="Marquer fait"
                                  >
                                    Fait
                                  </button>
                                </>
                              ) : (
                                <div className="flex gap-1">
                                  <select 
                                    value={act.efficiency || 'Oui'}
                                    onChange={(e) => updateActionEfficiency(act.id, e.target.value as ActionEfficiency, act.efficiencyComment || '')}
                                    className="text-[10px] border border-slate-300 rounded p-1 bg-white focus:outline-none"
                                  >
                                    <option value="Oui">Efficace</option>
                                    <option value="Non">Inefficace</option>
                                    <option value="Partielle">Partielle</option>
                                  </select>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => deleteActionFromList(act.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-full transition-colors"
                                title="Supprimer l'action"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Subform to add an action */}
            {isEditable && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                <span className="font-bold text-slate-700 block flex items-center gap-1">
                  <Plus className="h-4 w-4 text-blue-900" /> Ajouter une Action Corrective ou Préventive
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6">
                    <label className="block text-slate-500 mb-1">Libellé de l'action à mener</label>
                    <input 
                      type="text"
                      value={newActionDesc}
                      onChange={(e) => setNewActionDesc(e.target.value)}
                      placeholder="Ex: Procéder à l'étalonnage et former l'équipe..."
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 mb-1">Type d'Action</label>
                    <select
                      value={newActionType}
                      onChange={(e) => setNewActionType(e.target.value as ActionType)}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                    >
                      <option value="Correction immédiate">Correction</option>
                      <option value="Action corrective">Action corrective</option>
                      <option value="Action préventive">Action préventive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 mb-1">Responsable</label>
                    <select
                      value={newActionResp}
                      onChange={(e) => setNewActionResp(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.signature})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 mb-1">Délai d'exécution</label>
                    <input 
                      type="date"
                      value={newActionDeadline}
                      onChange={(e) => setNewActionDeadline(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addActionToList}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-1.5 rounded flex items-center gap-1 text-xs"
                  >
                    <Check className="h-3.5 w-3.5" /> Enregistrer l'Action
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 7: PHOTOS & PIECES JOINTES */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-blue-900 font-bold border-b border-slate-100 pb-2 text-sm md:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">7</span>
              Photos & Pièces Jointes d'Atelier (Preuves ISO 9001)
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
              <div className="text-center sm:text-left">
                <span className="font-bold text-slate-700 block">Télécharger un justificatif qualité</span>
                <p className="text-slate-400 mt-1">Formats acceptés: PDF, JPG, PNG. Taille max: 5Mo.</p>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
                className="hidden"
                id="nc-file-upload-input"
              />
              <button
                type="button"
                onClick={triggerFileUpload}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded font-bold shadow-xs flex items-center gap-2 ml-auto"
              >
                <Upload className="h-4 w-4 text-orange-600" /> Joindre un document d'atelier
              </button>
            </div>

            {/* List of attachments */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {attachments.map(att => (
                  <div key={att.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2 relative">
                    <Paperclip className="h-4 w-4 text-blue-900 shrink-0" />
                    <button
                      type="button"
                      onClick={() => setActivePreview({ name: att.name, url: att.url, type: att.type })}
                      className="overflow-hidden text-left hover:underline focus:outline-none"
                    >
                      <p className="font-bold text-[10px] text-slate-700 truncate max-w-[120px]" title={att.name}>{att.name}</p>
                      <span className="text-[8px] text-slate-400 block font-mono">{att.date}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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

          {/* SECTION 8: CLÔTURE & SIGNATURES */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-blue-900 font-bold border-b border-slate-100 pb-2 text-sm md:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">8</span>
              Clôture de Fiche & Signatures Électroniques
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Méthode de Clôture</label>
                <select 
                  value={closeMethod} 
                  onChange={(e) => setCloseMethod(e.target.value as NCCloseMethod)}
                  disabled={!isEditable}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="Clôture directe">Clôture directe (Rapport validé)</option>
                  <option value="FAC N°">Lien vers Fiche d'Action Corrective (FAC)</option>
                  <option value="FAA N°">Lien vers Fiche d'Action d'Amélioration (FAA)</option>
                </select>
              </div>

              {closeMethod !== 'Clôture directe' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">N° de Référence de la Fiche</label>
                  <input 
                    type="text" 
                    value={closeRef} 
                    onChange={(e) => setCloseRef(e.target.value)}
                    placeholder="Ex: FAC-2026-04"
                    disabled={!isEditable}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date de Clôture Réelle</label>
                <input 
                  type="date" 
                  value={closeDate} 
                  onChange={(e) => setCloseDate(e.target.value)}
                  disabled={currentUser.role !== 'PILOTE' && currentUser.role !== 'ADMIN' && currentUser.role !== 'COPILOTE'}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-4 pt-4 border-t border-slate-100">
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-600 block">1. Détecteur (Émetteur)</span>
                <input 
                  type="text"
                  value={detectorSignature}
                  onChange={(e) => setDetectorSignature(e.target.value)}
                  placeholder="Saisir la signature..."
                  disabled={!isEditable}
                  className="w-full h-11 border border-slate-300 rounded-lg bg-white px-3 text-center font-serif italic text-blue-900 font-bold text-base outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 disabled:bg-slate-100 disabled:text-slate-500"
                />
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => setDetectorSignature(currentUser.signature)}
                    className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Signature className="h-3.5 w-3.5 text-orange-600" /> Auto-signer ({currentUser.signature})
                  </button>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-600 block">2. Responsable de Process (Analyse)</span>
                <input 
                  type="text"
                  value={responsibleSignature}
                  onChange={(e) => setResponsibleSignature(e.target.value)}
                  placeholder="Saisir la signature..."
                  disabled={!isEditable}
                  className="w-full h-11 border border-slate-300 rounded-lg bg-white px-3 text-center font-serif italic text-blue-900 font-bold text-base outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 disabled:bg-slate-100 disabled:text-slate-500"
                />
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.role === 'OPERATEUR') {
                        alert("Accès refusé: Rôle Pilote ou Co-Pilote requis pour valider l'analyse.");
                        return;
                      }
                      setResponsibleSignature(currentUser.signature);
                    }}
                    className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Signature className="h-3.5 w-3.5 text-orange-600" /> Auto-signer ({currentUser.signature})
                  </button>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-600 block">3. Pilote QHSE (Clôture)</span>
                <input 
                  type="text"
                  value={verifierSignature}
                  onChange={(e) => setVerifierSignature(e.target.value)}
                  placeholder="Saisir la signature..."
                  disabled={!isEditable}
                  className="w-full h-11 border border-slate-300 rounded-lg bg-white px-3 text-center font-serif italic text-blue-900 font-bold text-base outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 disabled:bg-slate-100 disabled:text-slate-500"
                />
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.role !== 'PILOTE' && currentUser.role !== 'ADMIN') {
                        alert("Accès refusé: Rôle Pilote ou Administrateur QHSE requis pour clore la fiche.");
                        return;
                      }
                      setVerifierSignature(currentUser.signature);
                      if (!closeDate) setCloseDate(new Date().toISOString().split('T')[0]);
                      setClosedBy(currentUser.name);
                    }}
                    className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Signature className="h-3.5 w-3.5 text-orange-600" /> Auto-signer ({currentUser.signature})
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 shrink-0">
            <button
              type="button"
              id="btn-cancel-ncform"
              onClick={onClose}
              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2 rounded-xl font-bold transition-all text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="btn-submit-ncform"
              className="bg-blue-900 hover:bg-blue-950 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md"
            >
              <Save className="h-4 w-4 text-orange-600" /> Enregistrer la Fiche NC
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
