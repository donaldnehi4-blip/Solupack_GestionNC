import React, { useState } from 'react';
import {
  Github,
  GitBranch,
  Rocket,
  Globe,
  FileCode,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Download,
  CheckCircle2,
  X,
  Server,
  BookOpen,
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { User, NonConformite, BonDeTransfert, ClientComplaint, AuditLog, NotificationLog } from '../types';
import { triggerDownloadCompleteDatabaseZip, triggerDownloadJSON } from '../lib/databaseExporter';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  nonConformites: NonConformite[];
  transfers: BonDeTransfert[];
  complaints: ClientComplaint[];
  auditLogs: AuditLog[];
  notifications: NotificationLog[];
}

export const GITHUB_WORKFLOW_YML = `name: Déploiement GitHub Pages SOLUPACK SMQ

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout du code source
        uses: actions/checkout@v4

      - name: Configuration de l'environnement Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Installation propre des dépendances
        run: npm ci

      - name: Validation TypeScript & Linting
        run: npm run lint

      - name: Compilation de l'application de production
        run: npm run build

      - name: Copie du fichier SPA fallback 404.html
        run: |
          if [ -f public/404.html ]; then
            cp public/404.html dist/404.html
          elif [ -f dist/index.html ]; then
            cp dist/index.html dist/404.html
          fi

      - name: Configuration de GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload de l'artefact de déploiement
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Déploiement sur GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

export default function GitHubDeployModal({
  isOpen,
  onClose,
  users,
  nonConformites,
  transfers,
  complaints,
  auditLogs,
  notifications
}: GitHubDeployModalProps) {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'WORKFLOW' | 'SIMULATOR' | 'BACKUP'>('GUIDE');
  
  // Custom repo settings stored in localStorage
  const [githubUser, setGithubUser] = useState<string>(() => {
    return localStorage.getItem('solupack_github_user') || 'donaldnehi4';
  });
  const [githubRepo, setGithubRepo] = useState<string>(() => {
    return localStorage.getItem('solupack_github_repo') || 'solupack-qualite';
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleUserChange = (u: string) => {
    setGithubUser(u);
    localStorage.setItem('solupack_github_user', u);
  };

  const handleRepoChange = (r: string) => {
    setGithubRepo(r);
    localStorage.setItem('solupack_github_repo', r);
  };

  const pagesUrl = `https://${githubUser.trim() || 'username'}.github.io/${githubRepo.trim() || 'repo'}/`;
  const gitRemoteUrl = `https://github.com/${githubUser.trim() || 'username'}/${githubRepo.trim() || 'repo'}.git`;

  const gitBashScript = `# 1. Initialiser le dépôt git local (si non fait)
git init
git add .
git commit -m "feat: Déploiement initial SOLUPACK SMQ ISO 9001"

# 2. Définir la branche principale
git branch -M main

# 3. Lier à votre dépôt GitHub
git remote add origin ${gitRemoteUrl}

# 4. Pousser vers GitHub (lance le déploiement automatique via GitHub Actions)
git push -u origin main
`;

  const triggerDownloadWorkflowFile = () => {
    const blob = new Blob([GITHUB_WORKFLOW_YML], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deploy.yml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Déploiement GitHub & Intégration Continue (CI/CD)</h2>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Prêt pour GitHub Pages
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Workflow automatisé GitHub Actions, hébergement sécurisé et architecture autonome sans serveur WAMP.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'GUIDE'
                ? 'border-blue-600 text-blue-900 font-bold bg-white -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rocket className="h-4 w-4 text-blue-600" /> Guide de Déploiement (4 Étapes)
          </button>
          
          <button
            onClick={() => setActiveTab('WORKFLOW')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'WORKFLOW'
                ? 'border-blue-600 text-blue-900 font-bold bg-white -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="h-4 w-4 text-purple-600" /> Pipeline GitHub Actions (`deploy.yml`)
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'SIMULATOR'
                ? 'border-blue-600 text-blue-900 font-bold bg-white -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="h-4 w-4 text-emerald-600" /> URL & Test GitHub Pages
          </button>

          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'BACKUP'
                ? 'border-blue-600 text-blue-900 font-bold bg-white -mb-px'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="h-4 w-4 text-amber-600" /> Sauvegardes & Base de Données
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          
          {/* TAB 1: GUIDE */}
          {activeTab === 'GUIDE' && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 space-y-1">
                  <p className="font-bold">Mode Autonome Cloud & Offline-First Actif</p>
                  <p className="text-blue-800">
                    Le serveur local WAMP a été retiré au profit d'une architecture moderne : toutes vos données sont sauvegardées en temps réel dans votre navigateur (IndexedDB + LocalStorage) et l'application peut être déployée gratuitement sur GitHub Pages ou tout serveur Cloud sans aucune dépendance locale.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
                    Créer le dépôt sur GitHub
                  </div>
                  <p className="text-xs text-slate-600">
                    Rendez-vous sur <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-0.5">github.com/new <ExternalLink className="h-3 w-3 inline" /></a> et créez un dépôt nommé par exemple <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-900 font-mono text-[11px]">solupack-qualite</code>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">2</span>
                    Pousser le code avec Git
                  </div>
                  <p className="text-xs text-slate-600">
                    Dans votre terminal local (ou via l'option d'export GitHub de AI Studio), exécutez les commandes git pour envoyer vos fichiers sur la branche <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">main</code>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">3</span>
                    Activer GitHub Pages (Source: Actions)
                  </div>
                  <p className="text-xs text-slate-600">
                    Sur GitHub, ouvrez votre dépôt &gt; <strong className="text-slate-800">Settings</strong> &gt; <strong className="text-slate-800">Pages</strong>. Dans la section <em>"Build and deployment"</em>, réglez la <em>Source</em> sur <strong className="text-blue-900 bg-blue-100 px-1 py-0.5 rounded">GitHub Actions</strong>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">4</span>
                    Déploiement Automatique 🚀
                  </div>
                  <p className="text-xs text-slate-600">
                    Le fichier <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">.github/workflows/deploy.yml</code> se lance automatiquement à chaque push et met en ligne votre application sécurisée en moins de 90 secondes.
                  </p>
                </div>
              </div>

              {/* TERMINAL COMMANDS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-blue-600" /> Commandes Terminal prêtes à l'emploi :
                  </span>
                  <button
                    onClick={() => handleCopy('bash', gitBashScript)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'bash' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Copier tout le script</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                    {gitBashScript}
                  </pre>
                </div>
              </div>

              {/* AI STUDIO DIRECT EXPORT REMINDER */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-blue-600" /> Export direct depuis Google AI Studio
                  </p>
                  <p className="text-xs text-slate-500">
                    Vous pouvez aussi utiliser le menu <strong>Settings</strong> de Google AI Studio en haut à droite &gt; <strong>Export to GitHub</strong> pour synchroniser directement votre projet.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('SIMULATOR')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  Configurer mon URL <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW FILE */}
          {activeTab === 'WORKFLOW' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Fichier Workflow GitHub Actions : <code className="bg-slate-100 text-purple-700 px-1 py-0.5 rounded font-mono">.github/workflows/deploy.yml</code>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ce pipeline compile TypeScript, intègre Tailwind, génère les fichiers statiques de production et les déploie automatiquement sur GitHub Pages.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={triggerDownloadWorkflowFile}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" /> Télécharger `deploy.yml`
                  </button>

                  <button
                    onClick={() => handleCopy('workflow', GITHUB_WORKFLOW_YML)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'workflow' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copier le code YAML</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[380px]">
                {GITHUB_WORKFLOW_YML}
              </pre>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Configuration Vite optimale :</strong> La directive <code className="font-mono bg-amber-100 px-1 py-0.2 rounded font-bold">base: './'</code> et le fichier <code className="font-mono bg-amber-100 px-1 py-0.2 rounded font-bold">public/404.html</code> sont déjà en place pour garantir le bon chargement des assets sur GitHub Pages quel que soit le nom de votre sous-dossier ou domaine.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATOR & URL */}
          {activeTab === 'SIMULATOR' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" /> Identifiants de votre Dépôt GitHub
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nom d'utilisateur ou Organisation GitHub :</label>
                    <input
                      type="text"
                      value={githubUser}
                      onChange={(e) => handleUserChange(e.target.value)}
                      placeholder="donaldnehi4"
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nom du dépôt GitHub :</label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => handleRepoChange(e.target.value)}
                      placeholder="solupack-qualite"
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">URL finale de production sur GitHub Pages :</span>
                    <button
                      onClick={() => handleCopy('url', pagesUrl)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'url' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedKey === 'url' ? 'Lien copié !' : 'Copier le lien'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-emerald-50/70 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-lg font-mono text-xs font-bold truncate">
                      {pagesUrl}
                    </div>
                    <a
                      href={pagesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      Ouvrir <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* REPO URL */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <GitBranch className="h-4 w-4 text-purple-600" /> Dépôt GitHub source :
                  </span>
                  <a
                    href={`https://github.com/${githubUser}/${githubRepo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Voir sur GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs font-mono bg-white border border-slate-200 px-3 py-2 rounded text-slate-800 truncate">
                  https://github.com/{githubUser}/{githubRepo}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & DATABASE EXPORT */}
          {activeTab === 'BACKUP' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Database className="h-4 w-4 text-amber-600" /> Sauvegarde Complète & Exports Multi-Formats
                </h3>
                <p className="text-xs text-slate-500">
                  Pour sécuriser vos données lors des déploiements et sauvegarder les 6 tables de la plateforme qualité SOLUPACK :
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Download className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Package ZIP Complet Base de Données</h4>
                      <p className="text-[11px] text-slate-500">Dump SQL (.sql) + 6 tables JSON brutes + Guide d'importation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerDownloadCompleteDatabaseZip(users, nonConformites, transfers, complaints, auditLogs, notifications)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" /> Télécharger l'archive ZIP (.zip)
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white hover:border-emerald-300 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <FileCode className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Sauvegarde JSON Unique</h4>
                      <p className="text-[11px] text-slate-500">Fichier JSON complet avec métadonnées SMQ ISO 9001</p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerDownloadJSON(users, nonConformites, transfers, complaints, auditLogs, notifications)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" /> Télécharger la sauvegarde JSON (.json)
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-xs space-y-2">
                <p className="font-bold text-slate-800">Résumé des données actuelles en mémoire sécurisée :</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-700">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Non-Conformités</span>
                    <strong className="text-blue-900">{nonConformites.length} fiches</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Bons de Transfert</span>
                    <strong className="text-blue-900">{transfers.length} bons</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Réclamations Clients</span>
                    <strong className="text-blue-900">{complaints.length} réclamations</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Utilisateurs SMQ</span>
                    <strong className="text-blue-900">{users.length} comptes</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Journal d'audit</span>
                    <strong className="text-blue-900">{auditLogs.length} entrées</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Notifications Mail</span>
                    <strong className="text-blue-900">{notifications.length} mails tracés</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Architecture autonome prête pour déploiement immédiat</span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
