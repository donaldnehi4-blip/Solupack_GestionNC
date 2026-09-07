/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  NonConformite, 
  BonDeTransfert, 
  ClientComplaint, 
  User, 
  AuditLog, 
  NotificationLog, 
  UserRole 
} from './types';
import { 
  initDB, 
  populateInitialData, 
  dbNC, 
  dbBT, 
  dbClients, 
  dbUsers, 
  dbAudit, 
  dbNotifs,
  INITIAL_USERS,
  INITIAL_NC_RECORDS,
  INITIAL_BT_RECORDS,
  INITIAL_CLIENT_RECORDS,
  safeStorage
} from './lib/db';
import { exportFullDatabaseToExcel } from './lib/excelExporter';

// Components
import Dashboard from './components/Dashboard';
import NCList from './components/NCList';
import NCForm from './components/NCForm';
import BTList from './components/BTList';
import ClientList from './components/ClientList';
import UserManagement from './components/UserManagement';
import HistoryLog from './components/HistoryLog';
import Login from './components/Login';
import SolupackLogo from './components/SolupackLogo';
import GitHubDeployModal from './components/GitHubDeployModal';

// Icons
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Warehouse, 
  Users, 
  Lock, 
  FileSpreadsheet, 
  FileText, 
  Menu, 
  X, 
  RefreshCw, 
  UserCircle,
  HelpCircle,
  Globe,
  Award,
  ChevronRight,
  BookOpen,
  LogOut,
  Database,
  Github
} from 'lucide-react';

type TabId = 'DASHBOARD' | 'NC_LIST' | 'NC_FORM' | 'BT_LIST' | 'CLIENT_LIST' | 'USERS' | 'HISTORY';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('DASHBOARD');

  // Core domain states
  const [nonConformites, setNonConformites] = useState<NonConformite[]>([]);
  const [transfers, setTransfers] = useState<BonDeTransfert[]>([]);
  const [complaints, setComplaints] = useState<ClientComplaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Authenticated state - Default to logged in as Nehi Donald (ADMIN)
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [editingNC, setEditingNC] = useState<NonConformite | null>(null);

  // Mobile menu responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  // Real-time synchronization listeners for multi-tab and local persistence
  useEffect(() => {
    if (!dbReady) return;

    // Listener for local or cross-tab real-time data changes (add/delete/update)
    const handleDataChange = () => {
      refreshAllData();
    };

    window.addEventListener('solupack_data_changed', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('solupack_realtime_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SOLUPACK_DATA_CHANGED') {
          refreshAllData();
        }
      };
    }

    return () => {
      window.removeEventListener('solupack_data_changed', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
      if (bc) bc.close();
    };
  }, [dbReady]);

  // Initialize and load everything safely
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        await initDB();
        
        // Fetch all stores
        const allNC = await dbNC.getAll();
        const allBT = await dbBT.getAll();
        const allClients = await dbClients.getAll();
        const allUsers = await dbUsers.getAll();
        const allLogs = await dbAudit.getAll();
        const allNotifs = await dbNotifs.getAll();

        if (!isMounted) return;

        setNonConformites(allNC.length > 0 ? allNC : INITIAL_NC_RECORDS);
        setTransfers(allBT.length > 0 ? allBT : INITIAL_BT_RECORDS);
        setComplaints(allClients.length > 0 ? allClients : INITIAL_CLIENT_RECORDS);
        
        const resolvedUsers = allUsers.length > 0 ? allUsers : INITIAL_USERS;
        setUsers(resolvedUsers);
        setAuditLogs(allLogs);
        setNotifications(allNotifs);

        // Check if there is an explicit logout saved or another user
        const savedUserId = safeStorage.getItem('solupack_user_id');
        const savedLoggedIn = safeStorage.getItem('solupack_logged_in');

        if (savedLoggedIn === 'false') {
          setIsLoggedIn(false);
        } else if (savedUserId) {
          const matchedUser = resolvedUsers.find(u => u.id === savedUserId);
          if (matchedUser) {
            setCurrentUser(matchedUser);
            setIsLoggedIn(true);
          } else {
            const adminUser = resolvedUsers.find(u => u.role === 'ADMIN') || resolvedUsers[0];
            if (adminUser) setCurrentUser(adminUser);
            setIsLoggedIn(true);
          }
        } else {
          // Default: Open immediately with Nehi Donald (ADMIN)
          const adminUser = resolvedUsers.find(u => u.role === 'ADMIN') || resolvedUsers[0];
          if (adminUser) setCurrentUser(adminUser);
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error("Data loading fallback applied:", e);
        if (isMounted) {
          setNonConformites(INITIAL_NC_RECORDS);
          setTransfers(INITIAL_BT_RECORDS);
          setComplaints(INITIAL_CLIENT_RECORDS);
          setUsers(INITIAL_USERS);
          setCurrentUser(INITIAL_USERS[0]);
          setIsLoggedIn(true);
        }
      } finally {
        if (isMounted) {
          setDbReady(true);
        }
      }
    }

    loadData();

    // Failsafe timer: guarantee that dbReady is set within 800ms
    const failsafe = setTimeout(() => {
      if (isMounted) {
        setDbReady(true);
      }
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(failsafe);
    };
  }, []);

  // Reload lists function
  const refreshAllData = async () => {
    try {
      const allNC = await dbNC.getAll();
      const allBT = await dbBT.getAll();
      const allClients = await dbClients.getAll();
      const allUsers = await dbUsers.getAll();
      const allLogs = await dbAudit.getAll();
      const allNotifs = await dbNotifs.getAll();

      setNonConformites(allNC.length > 0 ? allNC : INITIAL_NC_RECORDS);
      setTransfers(allBT.length > 0 ? allBT : INITIAL_BT_RECORDS);
      setComplaints(allClients.length > 0 ? allClients : INITIAL_CLIENT_RECORDS);
      setUsers(allUsers.length > 0 ? allUsers : INITIAL_USERS);
      setAuditLogs(allLogs);
      setNotifications(allNotifs);
    } catch (e) {
      console.error("Failed to refresh lists from IndexedDB", e);
    }
  };

  // Change simulated user on the fly (helps testing RBAC permissions easily)
  const handleUserSwitch = async (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      await dbAudit.log(
        found.id,
        found.name,
        found.role,
        'AUTH',
        'AUTH',
        found.id,
        `Connexion/Simulateur: Acteur SMQ basculé vers ${found.name} (${found.function})`
      );
      // If switched user is not Admin and we are on Users tab, fallback to Dashboard
      if (found.role !== 'ADMIN' && activeTab === 'USERS') {
        setActiveTab('DASHBOARD');
      }
      refreshAllData();
    }
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    safeStorage.setItem('solupack_user_id', user.id);
    safeStorage.setItem('solupack_logged_in', 'true');

    await dbAudit.log(
      user.id,
      user.name,
      user.role,
      'AUTH',
      'AUTH',
      user.id,
      `Connexion: ${user.name} (${user.function}) s'est connecté au SMQ`
    );
    refreshAllData();
  };

  const handleLogout = async () => {
    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'AUTH',
      'AUTH',
      currentUser.id,
      `Déconnexion: ${currentUser.name} s'est déconnecté`
    );
    safeStorage.removeItem('solupack_user_id');
    safeStorage.setItem('solupack_logged_in', 'false');
    setIsLoggedIn(false);
    refreshAllData();
  };

  // ==========================================
  // HANDLERS FOR MODULE 2: NON-CONFORMITIES
  // ==========================================
  const handleSaveNC = async (nc: NonConformite) => {
    const isNew = !nonConformites.some(item => item.id === nc.id);
    await dbNC.save(nc);
    
    // Log audit event
    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      isNew ? 'CREATE' : 'UPDATE',
      'NC',
      nc.id,
      isNew 
        ? `Déclaration de la Non-Conformité Interne: "${nc.shortTitle}" par ${currentUser.name}`
        : `Mise à jour / Signature de la Non-Conformité: "${nc.shortTitle}"`
    );

    // Trigger Simulated Email if it's new
    if (isNew) {
      // Find QHSE Pilote
      const qhsePilote = users.find(u => u.role === 'PILOTE') || INITIAL_USERS[1];
      const subject = `⚠️ [SOLUPACK SMQ] Nouvelle Non-Conformité émise : ${nc.id}`;
      const body = `Bonjour ${qhsePilote.name},\n\nUne nouvelle non-conformité vient d'être déclarée par ${nc.detectorName} (${nc.detectorFunction}) au service Extrusion / Impression.\n\nFiche Référence : ${nc.id}\nDésignation : ${nc.shortTitle}\nMachine impliquée : ${nc.machine || 'N/A'}\nQuantité isolée : ${nc.quantityKg} kg\n\nMerci d'analyser les causes (5M / 5 Pourquoi) et de planifier les actions sous 48h.\n\nCordialement,\nLe Système SMQ SOLUPACK S.A.`;
      
      await dbNotifs.triggerNotification(qhsePilote.email, qhsePilote.name, subject, body);
    }

    setEditingNC(null);
    setActiveTab('NC_LIST');
    refreshAllData();
  };

  const handleDeleteNC = async (id: string) => {
    await dbNC.delete(id);
    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE',
      'NC',
      id,
      `Suppression irréversible de la Non-Conformité ${id}`
    );
    refreshAllData();
  };

  const handleAddNoteToNC = async (ncId: string, noteText: string) => {
    const nc = nonConformites.find(n => n.id === ncId);
    if (!nc) return;

    const updatedNote = {
      id: `NOTE-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.function,
      date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5),
      text: noteText
    };

    const updatedNC: NonConformite = {
      ...nc,
      additionalNotes: [...nc.additionalNotes, updatedNote],
      updatedAt: new Date().toISOString()
    };

    await dbNC.save(updatedNC);
    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'UPDATE',
      'NC',
      ncId,
      `Ajout d'une note de traçabilité inaltérable : "${noteText.substring(0, 50)}..."`
    );
    refreshAllData();
  };

  // ==========================================
  // HANDLERS FOR MODULE 3: BONS DE TRANSFERT
  // ==========================================
  const handleSaveBT = async (bt: BonDeTransfert) => {
    const isNew = !transfers.some(item => item.id === bt.id);
    await dbBT.save(bt);

    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      isNew ? 'CREATE' : 'UPDATE',
      'BT',
      bt.btNumber,
      isNew 
        ? `Génération du Bon de Transfert Interne ${bt.btNumber} vers ${bt.destination}`
        : `Mise à jour du Bon de Transfert ${bt.btNumber} (Statut: ${bt.status})`
    );

    // Trigger Notification if closed/Effectué
    if (bt.status === 'Effectué') {
      const qhsePilote = users.find(u => u.role === 'PILOTE') || INITIAL_USERS[1];
      const subject = `✅ [MOUVEMENT DE MATIÈRE] Bon de Transfert Réalisé : ${bt.btNumber}`;
      const body = `Bonjour,\n\nNous vous informons de la réalisation physique du transfert de matériel :\n\nBon Réf : ${bt.btNumber}\nObjet : ${bt.transferSubject}\nZone de départ : ${bt.packagingZone}\nZone de destination (Ségrégation) : ${bt.destination}\nPoids transféré : ${bt.quantityKg} kg\n\nLe matériel a été étiqueté et consigné selon l'ISO 9001 §8.7.\n\nCordialement,\nService Logistique Interne SOLUPACK S.A.`;
      
      await dbNotifs.triggerNotification(qhsePilote.email, qhsePilote.name, subject, body);
    }

    refreshAllData();
  };

  const handleDeleteBT = async (id: string) => {
    await dbBT.delete(id);
    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE',
      'BT',
      id,
      `Suppression du Bon de Transfert Interne (Réf: ${id})`
    );
    refreshAllData();
  };

  // ==========================================
  // HANDLERS FOR MODULE 4: CLIENT COMPLAINTS
  // ==========================================
  const handleSaveComplaint = async (c: ClientComplaint) => {
    const isNew = !complaints.some(item => item.id === c.id);
    await dbClients.save(c);

    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      isNew ? 'CREATE' : 'UPDATE',
      'CLIENT',
      c.id,
      isNew
        ? `Réclamation Client Déclarée : Client "${c.clientName}", Litige: ${c.estimatedCostFcfa} FCFA`
        : `Mise à jour Réclamation Client ${c.id} (Statut: ${c.status})`
    );

    // Simulated email warning on high dispute cost (> 1,500,000 FCFA)
    if (isNew && c.estimatedCostFcfa > 1500000) {
      const execDirector = users.find(u => u.role === 'DIRECTION') || INITIAL_USERS[5];
      const subject = `🚨 [ALERTE FINANCIÈRE LITIGE] Réclamation Client Majeure - ${c.clientName}`;
      const body = `IMPORTANT - DIRECTION GÉNÉRALE,\n\nUne réclamation client à coût financier majeur vient d'être enregistrée :\n\nClient : ${c.clientName}\nFiche Réf : ${c.id}\nCommande/BL : ${c.orderNumber || 'N/A'}\nCoût Estimé du Litige : ${new Intl.NumberFormat('fr-FR').format(c.estimatedCostFcfa)} FCFA\n\nDescription : ${c.shortDescription}\nCompensation accordée proposée : ${c.compensationGranted || 'Non définie'}\n\nL'enjeu nécessite une attention prioritaire de la direction.\n\nLe Service QHSE SOLUPACK S.A.`;
      
      await dbNotifs.triggerNotification(execDirector.email, execDirector.name, subject, body);
    }

    refreshAllData();
  };

  const handleDeleteComplaint = async (id: string) => {
    await dbClients.delete(id);
    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE',
      'CLIENT',
      id,
      `Suppression définitive de la réclamation client Réf: ${id}`
    );
    refreshAllData();
  };

  // ==========================================
  // HANDLERS FOR MODULE 5: ADMIN / USERS
  // ==========================================
  const handleSaveUser = async (user: User) => {
    const isNew = !users.some(item => item.id === user.id);
    await dbUsers.save(user);

    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'UPDATE',
      'USER',
      user.name,
      isNew
        ? `Inscription du collaborateur: ${user.name} (${user.function}) au rôle ${user.role}`
        : `Mise à jour des droits d'accès / signature de ${user.name}`
    );

    refreshAllData();
  };

  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    await dbUsers.delete(id);
    await dbAudit.log(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE',
      'USER',
      user.name,
      `Révocation des accès de sécurité pour ${user.name} (${user.email})`
    );
    refreshAllData();
  };

  if (!dbReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white gap-4 font-sans">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
        <span className="font-bold text-sm tracking-wider">CHARGEMENT DU SMQ SOLUPACK S.A. ...</span>
        <span className="text-[10px] text-slate-400 font-mono">Pré-population de 15 enregistrements de démonstration ISO 9001:2015 en cours...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* 1. LEFT SIDEBAR NAVIGATION (TECHNICAL DARK) */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between border-r border-slate-800 transform transition-transform duration-300 md:translate-x-0 md:relative ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Top Header Logo */}
        <div className="p-4 border-b border-slate-800 flex flex-col gap-2 justify-stretch">
          <div className="flex items-center justify-between">
            <div className="w-full h-14 overflow-hidden flex items-center justify-center bg-[#1E293B] rounded-xl border border-slate-800">
              <SolupackLogo className="h-full w-full" variant="white" />
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white ml-2 shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-1 text-center md:text-left">
            <p className="text-orange-500 text-[9px] uppercase tracking-widest font-bold">Système Management Qualité</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-xs font-semibold">
          
          <button
            id="tab-dashboard"
            onClick={() => { setActiveTab('DASHBOARD'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left ${activeTab === 'DASHBOARD' ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Tableau de Bord</span>
          </button>

          <button
            id="tab-nc-list"
            onClick={() => { setActiveTab('NC_LIST'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left ${activeTab === 'NC_LIST' || activeTab === 'NC_FORM' ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">NC Production</span>
          </button>

          <button
            id="tab-bt-list"
            onClick={() => { setActiveTab('BT_LIST'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left ${activeTab === 'BT_LIST' ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Warehouse className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Bons de Transfert</span>
          </button>

          <button
            id="tab-client-list"
            onClick={() => { setActiveTab('CLIENT_LIST'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left ${activeTab === 'CLIENT_LIST' ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Gestion Clients</span>
          </button>

          {/* Module 5: Admin / Users - SECURED: Only visible to ADMIN role */}
          {currentUser.role === 'ADMIN' && (
            <button
              id="tab-users"
              onClick={() => { setActiveTab('USERS'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left ${activeTab === 'USERS' ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Lock className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Utilisateurs</span>
            </button>
          )}

          <div className="border-t border-slate-800 my-4 pt-4"></div>

          <button
            id="tab-history"
            onClick={() => { setActiveTab('HISTORY'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left ${activeTab === 'HISTORY' ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Journal & Mails</span>
          </button>

          <button
            id="btn-github-deploy"
            onClick={() => { setShowGitHubModal(true); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <Github className="h-4 w-4 shrink-0 text-purple-400" />
            <span className="text-sm font-medium">Déploiement GitHub</span>
          </button>

        </nav>

        {/* LOGGED IN USER & LOGOUT SECTION */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-xs shrink-0 uppercase">
              {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-white font-semibold truncate">{currentUser.name}</p>
              <p className="text-[10px] text-orange-500 font-bold tracking-wider truncate uppercase">{currentUser.role}</p>
              <p className="text-[9px] text-slate-400 truncate">{currentUser.function}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full bg-[#1E293B] hover:bg-red-950/40 hover:text-red-400 border border-slate-800 hover:border-red-900/30 text-slate-300 py-2 px-3 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="h-3.5 w-3.5" /> Se déconnecter
          </button>
        </div>

      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 py-2.5 px-4 md:px-6 shrink-0 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 z-10 shadow-xs">
          {/* Left section: Logo & Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 focus:outline-none hover:text-blue-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Integrated Solupack Logo */}
            <div className="h-10 w-32 md:w-36 shrink-0 bg-white p-0.5 rounded border border-slate-200 flex items-center justify-center">
              <SolupackLogo className="h-full w-full" variant="light" />
            </div>

            <div className="hidden sm:flex flex-col justify-center border-l border-slate-200 pl-3">
              <h1 className="font-black text-blue-950 text-xs md:text-sm uppercase tracking-tight flex items-center gap-1.5">
                SOLUPACK S.A. — PLASTURGIE ALIMENTAIRE & INDUSTRIELLE
              </h1>
            </div>
          </div>

          {/* Right section: EXACT ISO METADATA HEADER BLOCK & GLOBAL EXCEL EXPORT */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* GitHub CI/CD Deployment Badge Button */}
            <button
              id="btn-header-github"
              onClick={() => setShowGitHubModal(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold cursor-pointer transition-all shadow-2xs"
              title="Centre de Déploiement GitHub & Pipeline CI/CD"
            >
              <Github className="h-3.5 w-3.5 text-purple-700" />
              <span className="font-mono text-[11px] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                GitHub Pages : Prêt
              </span>
            </button>

            <button
              onClick={() => exportFullDatabaseToExcel(nonConformites, transfers, complaints, users, auditLogs, notifications)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              title="Exporter l'intégralité des 6 tables de la base de données SOLUPACK dans un classeur Excel multi-onglets (.XLSX)"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-100" /> Export BDD Excel (.XLSX)
            </button>

            <div className="hidden lg:block bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-right font-mono text-[11px] text-slate-800 space-y-0.5 shadow-2xs leading-tight">
              <div className="font-bold text-blue-950">code : FOR-PM2-34</div>
              <div>Date de création: 05/01/2022</div>
              <div>Date de révision: 06/07/2026</div>
              <div>Version: 01</div>
            </div>

            {/* Quick manual refresh button */}
            <button 
              onClick={refreshAllData}
              className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Actualiser les données locales"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
          
          {activeTab === 'DASHBOARD' && (
            <Dashboard 
              nonConformites={nonConformites} 
              complaints={complaints} 
              transfers={transfers}
            />
          )}

          {activeTab === 'NC_LIST' && (
            <NCList 
              nonConformites={nonConformites}
              users={users}
              currentUser={currentUser}
              onEdit={(nc) => {
                setEditingNC(nc);
                setActiveTab('NC_FORM');
              }}
              onDelete={handleDeleteNC}
              onAddNote={handleAddNoteToNC}
              onOpenCreateForm={() => {
                setEditingNC(null);
                setActiveTab('NC_FORM');
              }}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'NC_FORM' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center bg-white p-4 rounded-t-xl border border-slate-200 border-b-0">
                <span className="text-xs font-bold font-mono text-slate-400">
                  RÉF : {editingNC ? editingNC.id : "NOUVEL ÉCART EN ATELIER"}
                </span>
                <button
                  onClick={() => {
                    setEditingNC(null);
                    setActiveTab('NC_LIST');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Annuler la saisie (Retour)
                </button>
              </div>
              <NCForm 
                nc={editingNC || undefined}
                users={users}
                currentUser={currentUser}
                onSave={handleSaveNC}
                onClose={() => {
                  setEditingNC(null);
                  setActiveTab('NC_LIST');
                }}
              />
            </div>
          )}

          {activeTab === 'BT_LIST' && (
            <BTList 
              transfers={transfers}
              users={users}
              currentUser={currentUser}
              onSave={handleSaveBT}
              onDelete={handleDeleteBT}
            />
          )}

          {activeTab === 'CLIENT_LIST' && (
            <ClientList 
              complaints={complaints}
              nonConformites={nonConformites}
              users={users}
              currentUser={currentUser}
              onSave={handleSaveComplaint}
              onDelete={handleDeleteComplaint}
            />
          )}

          {activeTab === 'USERS' && currentUser.role === 'ADMIN' && (
            <UserManagement 
              users={users}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'HISTORY' && (
            <HistoryLog 
              logs={auditLogs}
              notifications={notifications}
            />
          )}

        </main>

        {/* Global Footer Credit */}
        <footer className="bg-white border-t border-slate-200 h-10 px-6 flex justify-between items-center text-[10px] text-slate-400 font-medium shrink-0">
          <span>&copy; {new Date().getFullYear()} SOLUPACK S.A. - Tous droits réservés.</span>
          <span className="font-mono text-blue-600 font-bold">Plateforme Qualité ISO 9001:2015 v1.0.0</span>
        </footer>

        {/* GITHUB DEPLOYMENT MODAL */}
        <GitHubDeployModal
          isOpen={showGitHubModal}
          onClose={() => setShowGitHubModal(false)}
          users={users}
          nonConformites={nonConformites}
          transfers={transfers}
          complaints={complaints}
          auditLogs={auditLogs}
          notifications={notifications}
        />

      </div>

    </div>
  );
}
