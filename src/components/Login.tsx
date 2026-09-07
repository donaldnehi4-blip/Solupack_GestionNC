/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ShieldAlert, KeyRound, CheckCircle2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import SolupackLogo from './SolupackLogo';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export default function Login({ users, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Find user in database
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      setError("Adresse email inconnue. Veuillez vérifier votre saisie.");
      return;
    }

    if (!user.active) {
      setError("Ce compte collaborateur a été révoqué par la direction QHSE.");
      return;
    }

    if (user.password !== password) {
      setError("Mot de passe incorrect. Veuillez réessayer.");
      return;
    }

    // Success
    onLoginSuccess(user);
  };

  const handleQuickLogin = (demoUser: User) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password || '');
    setError('');
    // Directly log in on selection
    onLoginSuccess(demoUser);
  };

  const handleDirectAdminAccess = () => {
    const adminUser = users.find(u => u.role === 'ADMIN') || users[0];
    if (adminUser) {
      onLoginSuccess(adminUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center p-4 relative font-sans text-slate-100 overflow-y-auto">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6 my-8">
        {/* Logo & Corporate Branding */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-48 h-16 flex items-center justify-center bg-[#1E293B] rounded-xl border border-slate-800 p-2 shadow-xl">
            <SolupackLogo className="h-full w-full" variant="white" />
          </div>
          <div>
            <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              Système de Management de la Qualité (SMQ)
            </p>
            <p className="text-slate-400 text-xs mt-1">Plasturgie Alimentaire & Industrielle (ISO 9001:2015)</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-6">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-orange-500" />
              Accès Collaborateur Sécurisé
            </h2>
            <p className="text-slate-400 text-[11px]">
              Veuillez saisir vos identifiants pour accéder aux fiches de Non-Conformité d'usine.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-lg text-xs flex items-start gap-2.5 leading-relaxed">
              <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Direct Access Banner */}
          <button
            type="button"
            onClick={handleDirectAdminAccess}
            className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Accéder directement (Session Administrateur)</span>
          </button>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">Adresse Email Professionnelle *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: qhse@solupack.com"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">Mot de passe / Code Secret *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisir votre mot de passe"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg text-sm tracking-wide uppercase flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 text-white" /> Se Connecter au Système
            </button>
          </form>

          {/* Quick Login for Demo / Pre-configured Accounts */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="h-3.5 w-3.5 text-orange-400" />
                Comptes de test pré-configurés
              </span>
              {showDemoAccounts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDemoAccounts && (
              <div className="mt-3 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {users.slice(0, 6).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all text-[11px] group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-orange-400 flex items-center gap-1.5">
                        {u.name}
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                          {u.role}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] truncate max-w-[220px]">{u.email}</div>
                    </div>
                    <span className="text-xs text-orange-400 opacity-70 group-hover:opacity-100 font-mono">
                      Choisir →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ISO 9001:2015 Technical Clauses Footer */}
        <div className="text-center text-[10px] text-slate-500 font-mono space-y-1">
          <p>ISO 9001:2015 §8.7 — Maîtrise des éléments de sortie non conformes</p>
          <p>ISO 9001:2015 §10.2 — Actions correctives & Traçabilité</p>
          <p className="text-[8px] text-slate-600 mt-2">Zone Industrielle Yopougon, Abidjan, Côte d'Ivoire</p>
        </div>
      </div>
    </div>
  );
}
