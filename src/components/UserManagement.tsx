/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import { exportUsersToExcel } from '../lib/excelExporter';
import { 
  Plus, 
  Trash2, 
  Edit, 
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Mail, 
  Phone, 
  Shield, 
  Signature, 
  Save, 
  X,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onSaveUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export default function UserManagement({ users, currentUser, onSaveUser, onDeleteUser }: UserManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Custom modals state
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATEUR');
  const [userFunction, setUserFunction] = useState('');
  const [signature, setSignature] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);

  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.function.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm));
      
      const matchRole = selectedRole === 'ALL' || u.role === selectedRole;

      return matchSearch && matchRole;
    });
  }, [users, searchTerm, selectedRole]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('OPERATEUR');
    setUserFunction('');
    setSignature('');
    setPassword('');
    setActive(true);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role);
    setUserFunction(user.function);
    setSignature(user.signature);
    setPassword(user.password || '');
    setActive(user.active);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !userFunction.trim()) {
      alert("Tous les champs marqués d'une astérisque (*) sont requis.");
      return;
    }

    const saved: User = {
      id: editingUser?.id || `USR-${Date.now()}`,
      name,
      email,
      phone: phone || undefined,
      role,
      function: userFunction,
      signature,
      password: password || undefined,
      active
    };

    onSaveUser(saved);
    setIsFormOpen(false);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div id="module-admin-users" className="space-y-6">
      
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs gap-4">
        <div>
          <h2 className="text-blue-900 font-bold text-lg md:text-xl flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-600" />
            MODULE 5 : Administration Système & Droits d'Accès SoluPack S.A.
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Gestion sécurisée des comptes collaborateurs, habilitations qualité et registres des signatures électroniques
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => exportUsersToExcel(filteredUsers)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3.5 py-2 rounded text-xs flex items-center gap-1.5 border border-emerald-200 shadow-xs transition-all cursor-pointer"
            title="Exporter la liste des utilisateurs filtrés et leurs habilitations vers Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Exporter Excel ({filteredUsers.length})
          </button>
          <button
            id="btn-add-user"
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-2 shadow-xs transition-all shrink-0"
          >
            <Plus className="h-4 w-4" /> Ajouter un Collaborateur
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, fonction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-900 outline-none text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white font-medium"
            >
              <option value="ALL">Tous les Rôles ({users.length})</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PILOTE">PILOTE</option>
              <option value="COPILOTE">COPILOTE</option>
              <option value="OPERATEUR">OPERATEUR</option>
              <option value="DIRECTION">DIRECTION</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-semibold text-xs">
          Collaborateurs trouvés: <span className="text-blue-900 font-bold">{filteredUsers.length}</span> / {users.length}
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
            
            {/* Top section with role badge */}
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                    {u.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{u.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">{u.function}</p>
                  </div>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono uppercase ${
                  u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  u.role === 'PILOTE' ? 'bg-blue-100 text-blue-800' :
                  u.role === 'COPILOTE' ? 'bg-purple-100 text-purple-800' :
                  u.role === 'DIRECTION' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {u.role}
                </span>
              </div>

              {/* Contacts */}
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
                {u.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{u.phone}</span>
                  </div>
                )}
                
                {/* Simulated Signature */}
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 mt-2">
                  <Signature className="h-4 w-4 text-blue-900 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Visa Électronique</span>
                    <span className="font-serif italic text-blue-900 font-bold text-sm">{u.signature || 'N/A'}</span>
                  </div>
                </div>

                {/* Password display for test logs */}
                {u.password && (
                  <div className="flex items-center justify-between bg-amber-50/50 p-2 rounded border border-amber-100 mt-1">
                    <span className="text-[10px] text-amber-800 font-bold">Code de connexion :</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-amber-900 font-semibold">
                        {showPassword[u.id] ? u.password : '•••••••'}
                      </span>
                      <button 
                        onClick={() => togglePasswordVisibility(u.id)}
                        className="text-amber-800 hover:text-amber-900 focus:outline-none"
                      >
                        {showPassword[u.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom active status bar */}
            <div className="bg-slate-50 p-3 px-5 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 font-semibold">
                {u.active ? (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                    <span className="text-emerald-800">Accès Actif</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4.5 w-4.5 text-red-600" />
                    <span className="text-red-800">Accès Révoqué</span>
                  </>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="bg-white border border-slate-300 hover:bg-amber-50 hover:text-amber-700 text-slate-600 px-2.5 py-1 rounded-md transition-all font-bold text-[10px]"
                >
                  <Edit className="h-3.5 w-3.5 inline mr-1" /> Modifier
                </button>
                {u.id !== '1' && (
                  <button
                    onClick={() => {
                      if (u.id === currentUser.id) {
                        setErrorMessage("Vous ne pouvez pas supprimer ou révoquer votre propre compte actif.");
                        return;
                      }
                      setUserToDelete({ id: u.id, name: u.name });
                    }}
                    className="bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 text-slate-600 p-1 rounded-md transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* USER EDIT/CREATE MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            <div className="bg-blue-900 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-xs bg-orange-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Habilitation Qualité
                </span>
                <h3 className="text-lg font-bold mt-1">
                  {editingUser ? `Modifier le collaborateur` : "Inscrire un nouveau collaborateur"}
                </h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs text-slate-700">
              
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nom Complet *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Nehi Donald"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Adresse Email *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: donaldnehi4@gmail.com"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Téléphone de contact</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 04111503"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Habilitation / Rôle *</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 bg-white"
                  >
                    <option value="OPERATEUR">Opérateur (Saisie seule)</option>
                    <option value="COPILOTE">Co-Pilote QHSE</option>
                    <option value="PILOTE">Pilote QHSE</option>
                    <option value="DIRECTION">Direction</option>
                    <option value="ADMIN">Administrateur Système</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Fonction Métier *</label>
                  <input 
                    type="text" 
                    value={userFunction} 
                    onChange={(e) => setUserFunction(e.target.value)}
                    placeholder="Ex: Chef d'équipe Extrusion"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Visa / Initiale Signature *</label>
                  <input 
                    type="text" 
                    value={signature} 
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Ex: N. Donald"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-serif font-bold text-sm italic"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Code Secret d'accès *</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisir mot de passe"
                    className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <input 
                  type="checkbox" 
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <span className="font-bold text-slate-700">Autoriser l'accès de ce compte au SMQ ?</span>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-200 pt-4 flex justify-end gap-3 shrink-0">
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
                  <Save className="h-4 w-4 text-orange-600" /> Confirmer l'inscription
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Revoking User */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-[100] p-4 no-print animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Révocation de Collaborateur</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Voulez-vous révoquer définitivement l'accès de <b className="font-medium text-slate-900">{userToDelete.name}</b> au portail Qualité SOLUPACK ?
                </p>
                <p className="text-[10px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                  Son compte sera retiré de la base des utilisateurs actifs.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Révoquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal for Self-deleting and Access control */}
      {errorMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-[100] p-4 no-print animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mx-auto">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Gestion de Comptes</h3>
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
