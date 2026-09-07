# SOLUPACK S.A. — Plateforme SMQ & Gestion des Non-Conformités (ISO 9001:2015)

![CI/CD Déploiement](https://github.com/donaldnehi4/solupack-qualite/actions/workflows/deploy.yml/badge.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Norme](https://img.shields.io/badge/ISO%209001%3A2015-Conforme-green.svg)
![Licence](https://img.shields.io/badge/licence-Propri%C3%A9taire%20SOLUPACK%20S.A.-orange.svg)

Application web professionnelle de Système de Management de la Qualité (SMQ) pour **SOLUPACK S.A.** (Leader de la plasturgie et de l'emballage souple : Extrusion, Impression flexographique, Lamination, Soudure et Rebobinage).

---

## 🚀 Déploiement Automatisé sur GitHub Pages (CI/CD)

Le projet intègre un pipeline complet **GitHub Actions** (`.github/workflows/deploy.yml`) permettant un déploiement continu à chaque `git push`.

### 1. Activer GitHub Pages sur votre dépôt :
1. Sur GitHub, rendez-vous dans votre dépôt > **Settings** > **Pages**.
2. Dans la section **Build and deployment** :
   - **Source** : Sélectionnez **GitHub Actions**.
3. Poussez votre code sur la branche `main` :
   ```bash
   git add .
   git commit -m "feat: Déploiement initial SOLUPACK SMQ"
   git push origin main
   ```
4. Votre application est immédiatement accessible à l'adresse :
   ```
   https://<votre-compte-github>.github.io/<nom-du-depot>/
   ```

---

## 🛠️ Stack Technique

- **Frontend :** React 19, TypeScript, Vite 6, Tailwind CSS v4.
- **Composants & Icônes :** Lucide React, Motion (Framer Motion).
- **Rapports & Exports :** SheetJS (`xlsx`), jsPDF, html2canvas, JSZip.
- **Stockage de Données :** Architecture Offline-First autonome (IndexedDB `SoluPackQualityDB` + LocalStorage) avec export MySQL DDL/DML et JSON.
- **CI/CD :** GitHub Actions (`.github/workflows/deploy.yml`).

---

## 💻 Démarrage Local en Développement

### Prérequis
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation et Lancement
```bash
# 1. Cloner le dépôt
git clone https://github.com/donaldnehi4/solupack-qualite.git
cd solupack-qualite

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement local (Port 3000)
npm run dev

# 4. Compiler pour la production
npm run build
```

---

## 📦 Sauvegardes & Base de Données

Toutes les données (Non-conformités internes, Bons de transfert, Réclamations clients, Journal d'audit et Comptes utilisateurs) sont exportables à tout moment depuis l'interface :
- **Export Excel complet multi-onglets** (`.xlsx`)
- **Package SQL MySQL / MariaDB** (`solupack_quality_mysql.sql`) compatible phpMyAdmin et Cloud SQL
- **Sauvegarde JSON structurée** (`.json`)

---

## 🏢 Contact & Droits

**SOLUPACK S.A.** — Système de Management de la Qualité  
Zone Industrielle de Vridi / Yopougon, Abidjan, Côte d'Ivoire.  
Conforme aux exigences de la norme **ISO 9001:2015**.
