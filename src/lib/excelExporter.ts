import * as XLSX from 'xlsx';
import { NonConformite, BonDeTransfert, ClientComplaint, User, AuditLog, NotificationLog } from '../types';

/**
 * Format helper for action lists
 */
function formatActions(actions: NonConformite['actions']) {
  if (!actions || actions.length === 0) return 'Aucune action';
  return actions.map((a, idx) => 
    `[Action ${idx + 1}] ${a.description} | Type: ${a.type} | Resp: ${a.responsible} | Échéance: ${a.deadline} | Statut: ${a.status}` + 
    (a.efficiency ? ` | Efficacité: ${a.efficiency} (${a.efficiencyComment || ''})` : '')
  ).join('\n---\n');
}

/**
 * Format helper for 5 Whys
 */
function formatWhys(whys: string[]) {
  if (!whys || whys.length === 0) return '';
  return whys.map((w, i) => {
    const q = i === 0 ? "P1 (Pourquoi cette cause s'est-elle produite ?)" : `P${i + 1} (Pourquoi cela ?)`;
    return `${q}: ${w}`;
  }).join(' | ');
}

/**
 * Format helper for Ishikawa categories
 */
function formatIshikawaCategories(categories?: NonConformite['ishikawaCategories']) {
  if (!categories || categories.length === 0) return '';
  return categories.map(c => `[Catégorie: ${c.category}] Causes: ${c.causes || 'N/A'}${c.synthesis ? ` | Synthèse: ${c.synthesis}` : ''}`).join(' ; ');
}

/**
 * Format helper for additional ISO notes
 */
function formatNotes(notes: NonConformite['additionalNotes']) {
  if (!notes || notes.length === 0) return '';
  return notes.map(n => `[${n.date}] ${n.author} (${n.role}): ${n.text}`).join('\n');
}

/**
 * 1. Export Non-Conformités (Fiches NC) with ALL fields
 */
export function exportNCToExcel(ncs: NonConformite[], filename = `SOLUPACK_Export_Non_Conformites_${new Date().toISOString().split('T')[0]}.xlsx`) {
  const data = ncs.map(nc => {
    const durationDays = nc.ncDate
      ? (nc.closeDate
          ? Math.max(0, Math.round((new Date(nc.closeDate).getTime() - new Date(nc.ncDate).getTime()) / 86400000))
          : Math.max(0, Math.round((new Date().getTime() - new Date(nc.ncDate).getTime()) / 86400000)))
      : 0;

    return {
      'N° Fiche NC': nc.id,
      'Statut Clôture': nc.closeDate ? 'Clôturée' : 'Ouverte / En cours',
      'Date Détection': nc.ncDate,
      'Heure Détection': nc.ncTime,
      'Quart / Shift': nc.shift,
      'Équipe': nc.team,
      'Superviseur': nc.supervisor,
      'Détecteur (Nom)': nc.detectorName,
      'Détecteur (Fonction)': nc.detectorFunction,
      'Service Concerné': nc.serviceConcerned,
      'Mode de Détection': nc.detectionMethod,
      'Origine / Source NC': nc.source,
      'Actions Immédiates Prises': (nc.immediateActions || []).join(', '),
      'Type de Produit': nc.productType,
      'Code Article': nc.articleCode,
      'Libellé Article': nc.articleLabel,
      'Clients': nc.clients,
      'Machine / Ligne': nc.machine,
      'Quantité Non-Conforme (kg)': nc.quantityKg,
      'Détails Conditionnement': nc.quantityUnitDetails,
      'N° Ordre Fabrication (OF)': nc.ofNumber,
      'Section d\'Origine': nc.originSection,
      'Date de Fabrication': nc.manufacturingDate,
      'Désignation / Intitulé NC': nc.shortTitle,
      'Constat / Description Détaillée': nc.description,
      'Causes Possibles Soupçonnées': nc.possibleCauses || '',
      'Décision d\'Orientation (Traitement)': nc.decision,
      'Classement 5M (Ishikawa)': nc.cause5M,
      'Catégories & Synthèses Ishikawa': formatIshikawaCategories(nc.ishikawaCategories),
      '5 Pourquoi (Analyse)': formatWhys(nc.whys),
      'Synthèse Globale Ishikawa': nc.ishikawaAnalysis || '',
      'Lié au Risque Cartographie SMQ': nc.smqRiskAttached ? 'Oui' : 'Non',
      'Référence Risque SMQ': nc.smqRiskRef || '',
      'Nombre d\'Actions Correctives': (nc.actions || []).length,
      'Plan d\'Actions (Détails)': formatActions(nc.actions),
      'Mode de Clôture': nc.closeMethod || '',
      'Référence Clôture (FAC/FAA)': nc.closeRef || '',
      'Date de Clôture': nc.closeDate || '',
      'Durée de Traitement (Jours)': durationDays,
      'Respect Cible SLA (≤ 2 Jours)': nc.closeDate ? (durationDays <= 2 ? 'Oui (Conforme)' : 'Non (Dépassement)') : 'En cours',
      'Clôturé Par': nc.closedBy || '',
      'Traçabilité / Notes ISO 9001': formatNotes(nc.additionalNotes),
      'Nombre de Pièces Jointes': (nc.attachments || []).length,
      'Signature Détecteur': nc.signatures?.detectorSignature || '',
      'Signature Responsable': nc.signatures?.responsibleSignature || '',
      'Signature Vérificateur': nc.signatures?.verifierSignature || '',
      'Date de Saisie Système': nc.createdAt || '',
      'Dernière Mise à Jour': nc.updatedAt || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Non-Conformités');
  
  // Auto-fit column width
  autoFitColumns(worksheet, data);

  XLSX.writeFile(workbook, filename);
}

/**
 * 2. Export Bons de Transfert (BT) with ALL fields
 */
export function exportBTToExcel(bts: BonDeTransfert[], filename = `SOLUPACK_Export_Bons_Transfert_${new Date().toISOString().split('T')[0]}.xlsx`) {
  const data = bts.map(bt => ({
    'ID Système': bt.id,
    'N° Bon de Transfert (BT)': bt.btNumber,
    'Type de Transfert': bt.btType,
    'Statut du Transfert': bt.status,
    'Date Constat': bt.constatDate,
    'Heure Constat': bt.constatTime,
    'Émetteur / Agent': bt.sender,
    'N° Fiche NC Liée': bt.ncSheetNumber || '',
    'N° Bon de Retour': bt.returnSheetNumber || '',
    'N° Fiche d\'Action': bt.actionSheetNumber || '',
    'Type de Produit': bt.productType,
    'N° Ordre Fabrication (OF)': bt.ofNumber,
    'Équipe': bt.team,
    'Quantité Transférée (kg)': bt.quantityKg,
    'Objet / Motif du Transfert': bt.transferSubject,
    'Zone / Emplacement Départ': bt.packagingZone,
    'Destination / Atelier Récepteur': bt.destination,
    'Observations & Constat': bt.observation || '',
    'Date de Clôture / Validation': bt.closeDate || '',
    'Nombre de Pièces Jointes': (bt.attachments || []).length,
    'Date de Création': bt.createdAt || '',
    'Dernière Modification': bt.updatedAt || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bons de Transfert');

  autoFitColumns(worksheet, data);

  XLSX.writeFile(workbook, filename);
}

/**
 * 3. Export Réclamations Clients with ALL fields
 */
export function exportComplaintsToExcel(complaints: ClientComplaint[], filename = `SOLUPACK_Export_Reclamations_Clients_${new Date().toISOString().split('T')[0]}.xlsx`) {
  const data = complaints.map(c => ({
    'N° Réclamation Client': c.id,
    'Nom du Client': c.clientName,
    'Téléphone / Contact': c.contactPhone,
    'N° Commande / BL / Facture': c.orderNumber,
    'Date Réclamation': c.reclamationDate,
    'Canal de Réception': c.channel,
    'Coût Estimé (FCFA)': c.estimatedCostFcfa,
    'Dédommagement Accordé': c.compensationGranted,
    'Description du Litige Client': c.shortDescription,
    'N° Fiche NC Liée': c.associatedNcId || '',
    'Statut Réclamation': c.status,
    'Date Enregistrement': c.createdAt || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Réclamations Clients');

  autoFitColumns(worksheet, data);

  XLSX.writeFile(workbook, filename);
}

/**
 * 4. Export Utilisateurs with ALL fields
 */
export function exportUsersToExcel(users: User[], filename = `SOLUPACK_Export_Utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`) {
  const data = users.map(u => ({
    'ID Utilisateur': u.id,
    'Nom & Prénom': u.name,
    'Email professionnel': u.email,
    'Numéro Téléphone': u.phone || '',
    'Rôle Système': u.role,
    'Fonction / Intitulé Poste': u.function,
    'Signature / Visa': u.signature,
    'Statut Compte': u.active ? 'Actif' : 'Inactif / Suspendu'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs');

  autoFitColumns(worksheet, data);

  XLSX.writeFile(workbook, filename);
}

/**
 * 5. Export Audit / History Logs with ALL fields
 */
export function exportAuditLogsToExcel(logs: AuditLog[], filename = `SOLUPACK_Export_Journal_Audit_${new Date().toISOString().split('T')[0]}.xlsx`) {
  const data = logs.map(l => ({
    'ID Log': l.id,
    'Horodatage Exact': l.timestamp,
    'ID Utilisateur': l.userId,
    'Nom Utilisateur': l.userName,
    'Rôle Utilisateur': l.userRole,
    'Action Effectuée': l.action,
    'Module Concerné': l.module,
    'ID Cible Modifiée': l.targetId,
    'Détails de l\'Opération': l.details
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Journal d\'Audit');

  autoFitColumns(worksheet, data);

  XLSX.writeFile(workbook, filename);
}

/**
 * 5b. Export Notification Logs with ALL fields
 */
export function exportNotificationsToExcel(notifs: NotificationLog[], filename = `SOLUPACK_Export_Notifications_${new Date().toISOString().split('T')[0]}.xlsx`) {
  const data = notifs.map(n => ({
    'ID Alerte': n.id,
    'Horodatage Émission': n.timestamp,
    'Destinataire (Nom)': n.recipientName,
    'Destinataire (Email)': n.recipientEmail,
    'Sujet / Objet Email': n.subject,
    'Corps du Message / Contenu': n.body,
    'Statut Émission': n.status === 'Sent' ? 'Succès (Envoyé)' : 'En attente'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Notifications Mail');

  autoFitColumns(worksheet, data);

  XLSX.writeFile(workbook, filename);
}

/**
 * 6. GRAND EXPORT GLOBAL SOLUPACK: Multi-sheet Excel workbook containing ALL modules & ALL fields!
 */
export function exportFullDatabaseToExcel(
  ncs: NonConformite[],
  bts: BonDeTransfert[],
  complaints: ClientComplaint[],
  users: User[],
  logs: AuditLog[],
  notifications?: NotificationLog[],
  filename = `SOLUPACK_Sauvegarde_Complete_Base_Qualite_${new Date().toISOString().split('T')[0]}.xlsx`
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Non-Conformités
  const ncData = ncs.map(nc => ({
    'N° Fiche NC': nc.id,
    'Statut Clôture': nc.closeDate ? 'Clôturée' : 'Ouverte / En cours',
    'Date Détection': nc.ncDate,
    'Heure Détection': nc.ncTime,
    'Quart / Shift': nc.shift,
    'Équipe': nc.team,
    'Superviseur': nc.supervisor,
    'Détecteur (Nom)': nc.detectorName,
    'Détecteur (Fonction)': nc.detectorFunction,
    'Service Concerné': nc.serviceConcerned,
    'Mode de Détection': nc.detectionMethod,
    'Origine / Source NC': nc.source,
    'Actions Immédiates Prises': (nc.immediateActions || []).join(', '),
    'Type de Produit': nc.productType,
    'Code Article': nc.articleCode,
    'Libellé Article': nc.articleLabel,
    'Clients': nc.clients,
    'Machine / Ligne': nc.machine,
    'Quantité Non-Conforme (kg)': nc.quantityKg,
    'Détails Conditionnement': nc.quantityUnitDetails,
    'N° Ordre Fabrication (OF)': nc.ofNumber,
    'Section d\'Origine': nc.originSection,
    'Date de Fabrication': nc.manufacturingDate,
    'Désignation / Intitulé NC': nc.shortTitle,
    'Constat / Description Détaillée': nc.description,
    'Causes Possibles Soupçonnées': nc.possibleCauses || '',
    'Décision d\'Orientation (Traitement)': nc.decision,
    'Classement 5M (Ishikawa)': nc.cause5M,
    '5 Pourquoi (Analyse)': formatWhys(nc.whys),
    'Analyse Détaillée Ishikawa': nc.ishikawaAnalysis || '',
    'Lié au Risque Cartographie SMQ': nc.smqRiskAttached ? 'Oui' : 'Non',
    'Référence Risque SMQ': nc.smqRiskRef || '',
    'Nombre d\'Actions Correctives': (nc.actions || []).length,
    'Plan d\'Actions (Détails)': formatActions(nc.actions),
    'Mode de Clôture': nc.closeMethod || '',
    'Référence Clôture (FAC/FAA)': nc.closeRef || '',
    'Date de Clôture': nc.closeDate || '',
    'Clôturé Par': nc.closedBy || '',
    'Traçabilité / Notes ISO 9001': formatNotes(nc.additionalNotes),
    'Nombre de Pièces Jointes': (nc.attachments || []).length,
    'Signature Détecteur': nc.signatures?.detectorSignature || '',
    'Signature Responsable': nc.signatures?.responsibleSignature || '',
    'Signature Vérificateur': nc.signatures?.verifierSignature || '',
    'Date Saisie Système': nc.createdAt || '',
    'Dernière Mise à Jour': nc.updatedAt || ''
  }));
  const wsNC = XLSX.utils.json_to_sheet(ncData);
  autoFitColumns(wsNC, ncData);
  XLSX.utils.book_append_sheet(workbook, wsNC, 'Non-Conformités');

  // Sheet 2: Bons de Transfert
  const btData = bts.map(bt => ({
    'ID Système': bt.id,
    'N° Bon de Transfert (BT)': bt.btNumber,
    'Type de Transfert': bt.btType,
    'Statut du Transfert': bt.status,
    'Date Constat': bt.constatDate,
    'Heure Constat': bt.constatTime,
    'Émetteur / Agent': bt.sender,
    'N° Fiche NC Liée': bt.ncSheetNumber || '',
    'N° Bon de Retour': bt.returnSheetNumber || '',
    'N° Fiche d\'Action': bt.actionSheetNumber || '',
    'Type de Produit': bt.productType,
    'N° Ordre Fabrication (OF)': bt.ofNumber,
    'Équipe': bt.team,
    'Quantité Transférée (kg)': bt.quantityKg,
    'Objet / Motif du Transfert': bt.transferSubject,
    'Zone / Emplacement Départ': bt.packagingZone,
    'Destination / Atelier Récepteur': bt.destination,
    'Observations & Constat': bt.observation || '',
    'Date de Clôture / Validation': bt.closeDate || '',
    'Nombre de Pièces Jointes': (bt.attachments || []).length,
    'Date de Création': bt.createdAt || '',
    'Dernière Modification': bt.updatedAt || ''
  }));
  const wsBT = XLSX.utils.json_to_sheet(btData);
  autoFitColumns(wsBT, btData);
  XLSX.utils.book_append_sheet(workbook, wsBT, 'Bons de Transfert');

  // Sheet 3: Réclamations Clients
  const complaintData = complaints.map(c => ({
    'N° Réclamation Client': c.id,
    'Nom du Client': c.clientName,
    'Téléphone / Contact': c.contactPhone,
    'N° Commande / BL / Facture': c.orderNumber,
    'Date Réclamation': c.reclamationDate,
    'Canal de Réception': c.channel,
    'Coût Estimé (FCFA)': c.estimatedCostFcfa,
    'Dédommagement Accordé': c.compensationGranted,
    'Description du Litige Client': c.shortDescription,
    'N° Fiche NC Liée': c.associatedNcId || '',
    'Statut Réclamation': c.status,
    'Date Enregistrement': c.createdAt || ''
  }));
  const wsComplaints = XLSX.utils.json_to_sheet(complaintData);
  autoFitColumns(wsComplaints, complaintData);
  XLSX.utils.book_append_sheet(workbook, wsComplaints, 'Réclamations Clients');

  // Sheet 4: Utilisateurs
  const userData = users.map(u => ({
    'ID Utilisateur': u.id,
    'Nom & Prénom': u.name,
    'Email professionnel': u.email,
    'Numéro Téléphone': u.phone || '',
    'Rôle Système': u.role,
    'Fonction / Intitulé Poste': u.function,
    'Signature / Visa': u.signature,
    'Statut Compte': u.active ? 'Actif' : 'Inactif / Suspendu'
  }));
  const wsUsers = XLSX.utils.json_to_sheet(userData);
  autoFitColumns(wsUsers, userData);
  XLSX.utils.book_append_sheet(workbook, wsUsers, 'Utilisateurs');

  // Sheet 5: Journal d'Audit
  const logData = logs.map(l => ({
    'ID Log': l.id,
    'Horodatage Exact': l.timestamp,
    'ID Utilisateur': l.userId,
    'Nom Utilisateur': l.userName,
    'Rôle Utilisateur': l.userRole,
    'Action Effectuée': l.action,
    'Module Concerné': l.module,
    'ID Cible Modifiée': l.targetId,
    'Détails de l\'Opération': l.details
  }));
  const wsLogs = XLSX.utils.json_to_sheet(logData);
  autoFitColumns(wsLogs, logData);
  XLSX.utils.book_append_sheet(workbook, wsLogs, 'Journal d\'Audit');

  // Sheet 6: Notifications Mail (if provided)
  if (notifications && notifications.length > 0) {
    const notifData = notifications.map(n => ({
      'ID Notification': n.id,
      'Horodatage Émission': n.timestamp,
      'Destinataire (Nom)': n.recipientName,
      'Destinataire (Email)': n.recipientEmail,
      'Sujet / Objet': n.subject,
      'Contenu / Message': n.body,
      'Statut Envoi': n.status === 'Sent' ? 'Envoyé' : 'En attente'
    }));
    const wsNotifs = XLSX.utils.json_to_sheet(notifData);
    autoFitColumns(wsNotifs, notifData);
    XLSX.utils.book_append_sheet(workbook, wsNotifs, 'Notifications Mail');
  }

  XLSX.writeFile(workbook, filename);
}

/**
 * Utility to auto-fit column widths in worksheet
 */
function autoFitColumns(worksheet: XLSX.WorkSheet, data: any[]) {
  if (!data || data.length === 0) return;
  const colWidths = Object.keys(data[0]).map(key => {
    let maxLen = key.length;
    data.forEach(row => {
      const val = row[key];
      if (val !== undefined && val !== null) {
        const str = String(val);
        // Truncate multiline strings length calculation for column width
        const lineLen = str.split('\n')[0].length;
        maxLen = Math.max(maxLen, Math.min(lineLen, 50));
      }
    });
    return { wch: Math.max(maxLen + 3, 12) };
  });
  worksheet['!cols'] = colWidths;
}
