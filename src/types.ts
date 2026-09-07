/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'PILOTE' | 'COPILOTE' | 'OPERATEUR' | 'DIRECTION';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  function: string;
  signature: string;
  password?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type Shift = '7H-14H' | '14H-22H' | '22H-7H' | 'Autre';
export type Team = 'A' | 'B' | 'C' | 'Autre';
export type Service = 'Extrusion' | 'Soudure' | 'Impression' | 'Lamination' | 'Rebobinage' | 'Recyclage' | 'Autres';
export type DetectionMethod = 'Autocontrôle' | 'Contrôle qualité' | 'Client' | 'Audit' | 'Réception' | 'Expédition';
export type NCSource = 'Produit non conforme' | 'Retour/Réclamation client' | 'Laboratoire' | 'Audit interne/externe' | 'Réception MP non conforme' | 'Sécurité environnement';
export type ActionImmediate = 'Responsables informés' | 'Identification de la NC' | 'Isolation / Emplacement';
export type ProductType = 'Semi-fini' | 'Fini' | 'MP' | 'Encre' | 'Colorant' | 'Autre';
export type NCDecision = 'Rebut' | 'Recyclage interne' | 'Retouche' | 'Dérogation' | 'Blocage' | 'Retour fournisseur' | 'Déclassement';
export type Cause5M = 'Matière première' | 'Machine' | 'Méthode' | 'Main d\'œuvre' | 'Milieu' | 'Mesure';
export type ActionType = 'Correction immédiate' | 'Action corrective' | 'Action préventive';
export type ActionStatus = 'Démarrer' | 'En cours' | 'Effectué';
export type ActionEfficiency = 'Oui' | 'Non' | 'Partielle';
export type NCCloseMethod = 'Clôture directe' | 'FAC N°' | 'FAA N°';

export interface IshikawaCategoryItem {
  id: string;
  category: string; // e.g. 'Matière première', 'Machine', 'Méthode', 'Main d'œuvre', 'Milieu', 'Mesure', 'Management', 'Maintenance', etc.
  causes: string;    // Causes or factors identified for this category
  synthesis?: string; // Specific synthesis for this category
}

export interface ActionCorrective {
  id: string;
  description: string;
  type: ActionType;
  responsible: string; // User ID or Name
  deadline: string;
  status: ActionStatus;
  verificationDate?: string;
  verifier?: string; // User ID or Name
  efficiency?: ActionEfficiency;
  efficiencyComment?: string;
}

export interface NonConformite {
  id: string; // NC-PROD-YYYY-XXXX
  createdAt: string;
  updatedAt: string;
  
  // Section IDENTIFICATION
  shift: Shift;
  team: Team;
  supervisor: string;
  ncDate: string;
  ncTime: string;
  detectorName: string;
  detectorFunction: string;
  serviceConcerned: Service;
  
  // Section ORIGINE
  detectionMethod: DetectionMethod;
  source: NCSource;
  immediateActions: ActionImmediate[];
  
  // Section TYPE DE LA NON-CONFORMITÉ
  productType: ProductType;
  articleCode: string;
  articleLabel: string;
  clients: string;
  machine: string;
  quantityKg: number;
  quantityUnitDetails: string; // bobines, sachets, etc.
  ofNumber: string;
  originSection: Service;
  manufacturingDate: string;
  shortTitle: string; // Désignation de la NC
  
  // Section TRAITEMENT ET DECISION
  description: string;
  possibleCauses: string;
  decision: NCDecision;
  
  // Section ANALYSE DE CAUSES
  cause5M: Cause5M;
  whys: string[]; // 5 whys (Array of 5 strings)
  ishikawaAnalysis?: string;
  ishikawaCategories?: IshikawaCategoryItem[];
  smqRiskAttached: boolean;
  smqRiskRef?: string;
  
  // Section ACTIONS CORRECTIVES
  actions: ActionCorrective[];
  
  // Section CLÔTURE
  closeMethod: NCCloseMethod;
  closeRef?: string; // FAC N° or FAA N° value
  closeDate?: string;
  closedBy?: string; // Signature / Nom
  
  // Notes Additionnelles (Traçabilité ISO 9001 - Données immuables)
  additionalNotes: {
    id: string;
    author: string;
    role: string;
    date: string;
    text: string;
  }[];

  // Pièces Jointes / Photos
  attachments: {
    id: string;
    name: string;
    type: string;
    url: string;
    date: string;
  }[];

  // Signatures électroniques
  signatures: {
    detectorSignature?: string;
    responsibleSignature?: string;
    verifierSignature?: string;
  };
}

// MODULE 3: BON DE TRANSFERT INTERNE
export type BTType = 'Retour non conforme' | 'Produit non conforme' | 'Matière première' | 'Equipement de mesure' | 'Autres';
export type BTZone = 'Atelier de production' | 'Zone d’isolation' | 'Stock produit fini' | 'Stock matière première' | 'Laboratoire' | 'Autre';
export type BTDestination = 'Atelier de recyclage' | 'Atelier de production' | 'Stock produit fini' | 'Stock matière première' | 'Zone d’isolation non conforme' | 'Retour au fournisseur' | 'Opération en externe' | 'Zone déchets usine';

export interface BonDeTransfert {
  id: string; // BT-AAAA-XXXX
  btNumber: string; // Custom input N° BT
  btType: BTType;
  constatDate: string;
  constatTime: string;
  sender: string;
  closeDate?: string; // Calculée automatiquement quand statut = Effectué + vérification faite
  ncSheetNumber?: string; // Fiche de NC N°
  returnSheetNumber?: string; // Bon de retour N°
  actionSheetNumber?: string; // Fiche d'action N°
  productType: ProductType;
  ofNumber: string;
  team: Team;
  quantityKg: number;
  transferSubject: string; // Objet de transfert
  packagingZone: BTZone;
  destination: BTDestination;
  observation: string; // Constat text format
  status: 'Brouillon' | 'En attente' | 'Effectué';
  attachments: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// MODULE 4: CLIENT COMPLAINT
export type ComplaintChannel = 'Email' | 'Téléphone' | 'Visite' | 'Audit client';

export interface ClientComplaint {
  id: string; // REC-AAAA-XXXX
  clientName: string;
  contactPhone: string;
  orderNumber: string; // N° de commande / BL
  reclamationDate: string;
  channel: ComplaintChannel;
  estimatedCostFcfa: number;
  compensationGranted: string; // avoir, remplacement, geste commercial
  shortDescription: string;
  associatedNcId?: string; // Lien avec une NC Prod
  status: 'Ouvert' | 'En cours' | 'Clôturé';
  createdAt: string;
}

// AUDIT TRAIL / JOURNAL DES MODIFICATIONS
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string; // 'CREATE', 'UPDATE', 'DELETE', 'ADD_NOTE', 'SIGN'
  module: 'NC' | 'BT' | 'CLIENT' | 'USER' | 'AUTH';
  targetId: string; // ID of the NC, BT, Client or User
  details: string;
}

// SIMULATED EMAIL NOTIFICATIONS
export interface NotificationLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  status: 'Sent' | 'Pending';
}
