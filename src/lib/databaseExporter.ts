/**
 * SOLUPACK S.A. - EXPORTEUR BASE DE DONNEES MYSQL & JSON
 * Exporte l'ensemble des 6 tables (utilisateurs, non_conformites, bons_de_transfert,
 * reclamations_clients, journal_audit, notifications_mail)
 * et leurs enregistrements au format MySQL (.SQL), JSON et package ZIP.
 */

import JSZip from 'jszip';
import { User, NonConformite, BonDeTransfert, ClientComplaint, AuditLog, NotificationLog } from '../types';
import { generateSQLScript, triggerDownloadSQL } from './sqlExporter';

// 1. Export JSON global de sauvegarde
export function triggerDownloadJSON(
  users: User[],
  ncs: NonConformite[],
  bts: BonDeTransfert[],
  complaints: ClientComplaint[],
  auditLogs: AuditLog[],
  notifications?: NotificationLog[],
  filename: string = `SOLUPACK_Sauvegarde_JSON_${new Date().toISOString().split('T')[0]}.json`
): void {
  const completeData = {
    metadata: {
      application: "SOLUPACK S.A. - Système de Management de la Qualité (SMQ)",
      norme: "ISO 9001:2015",
      database_type: "MySQL / MariaDB / Cloud SQL",
      database_name: "solupack_quality",
      export_date: new Date().toISOString(),
      counts: {
        users: users.length,
        non_conformites: ncs.length,
        bons_de_transfert: bts.length,
        reclamations_clients: complaints.length,
        journal_audit: auditLogs.length,
        notifications: notifications?.length || 0
      }
    },
    tables: {
      utilisateurs: users,
      non_conformites: ncs,
      bons_de_transfert: bts,
      reclamations_clients: complaints,
      journal_audit: auditLogs,
      notifications_mail: notifications || []
    }
  };

  const jsonString = JSON.stringify(completeData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 2. Package ZIP Complet Base de Données (SQL + JSON + Guide)
export async function triggerDownloadCompleteDatabaseZip(
  users: User[],
  ncs: NonConformite[],
  bts: BonDeTransfert[],
  complaints: ClientComplaint[],
  auditLogs: AuditLog[],
  notifications?: NotificationLog[]
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('Solupack_quality_Base_Donnees');

  if (folder) {
    // A. Script SQL MySQL complet (DDL + INSERTS pour phpMyAdmin / Cloud SQL)
    const sqlContent = generateSQLScript(users, ncs, bts, complaints, auditLogs, notifications);
    folder.file('solupack_quality_mysql.sql', sqlContent);

    // B. Fichiers JSON individuels par table
    const jsonFolder = folder.folder('dumps_json');
    if (jsonFolder) {
      jsonFolder.file('utilisateurs.json', JSON.stringify(users, null, 2));
      jsonFolder.file('non_conformites.json', JSON.stringify(ncs, null, 2));
      jsonFolder.file('bons_de_transfert.json', JSON.stringify(bts, null, 2));
      jsonFolder.file('reclamations_clients.json', JSON.stringify(complaints, null, 2));
      jsonFolder.file('journal_audit.json', JSON.stringify(auditLogs, null, 2));
      if (notifications) {
        jsonFolder.file('notifications_mail.json', JSON.stringify(notifications, null, 2));
      }
    }

    // C. Readme descriptif
    let readme = `==============================================================================\n`;
    readme += `SOLUPACK S.A. - EXPORT COMPLET BASE DE DONNEES & SAUVEGARDE SMQ\n`;
    readme += `Base de Données : solupack_quality (Port MySQL 3306)\n`;
    readme += `Norme Qualité   : ISO 9001:2015\n`;
    readme += `==============================================================================\n\n`;
    readme += `Date d'exportation : ${new Date().toLocaleString('fr-FR')}\n\n`;
    readme += `CONTENU DU PACKAGE :\n\n`;
    readme += `1. solupack_quality_mysql.sql : Dump SQL complet (DDL Tables + Requêtes d'insertion INSERT).\n`;
    readme += `                               Compatible phpMyAdmin, MySQL Workbench, MariaDB, Cloud SQL.\n`;
    readme += `2. dumps_json/                : Sauvegardes brutes JSON structurées de chaque table.\n\n`;
    readme += `IMPORTATION DANS MYSQL / PHPMYADMIN :\n`;
    readme += `1. Ouvrez votre interface de gestion de base de données (ex: phpMyAdmin ou console MySQL).\n`;
    readme += `2. Créez la base 'solupack_quality' ou utilisez la base existante.\n`;
    readme += `3. Allez dans l'onglet 'Importer' et sélectionnez 'solupack_quality_mysql.sql'.\n`;
    readme += `4. Cliquez sur 'Exécuter' pour charger toutes les tables et données.\n`;
    folder.file('LISEZMOI_IMPORT_BDD.txt', readme);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Solupack_quality_Base_Donnees_${new Date().toISOString().split('T')[0]}.zip`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
