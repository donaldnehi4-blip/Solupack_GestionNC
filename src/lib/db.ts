/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  NonConformite, 
  BonDeTransfert, 
  ClientComplaint, 
  User, 
  AuditLog, 
  NotificationLog 
} from '../types';

const DB_NAME = 'SoluPackQualityDB';
const DB_VERSION = 1;

const STORES = {
  NC: 'non_conformites',
  BT: 'bons_de_transfert',
  CLIENTS: 'reclamations_clients',
  USERS: 'utilisateurs',
  AUDIT: 'journal_audit',
  NOTIFS: 'notifications'
};

// Default system users as defined in the request
export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Nehi Donald',
    email: 'donaldnehi4@gmail.com',
    phone: '04111503',
    role: 'ADMIN',
    function: 'Administrateur Système',
    signature: 'N. Donald',
    password: '04111503', // Login is phone or custom
    active: true
  },
  {
    id: '2',
    name: 'Kemo Ange',
    email: 'qhse@solupack.com',
    phone: '+225 07070707',
    role: 'PILOTE',
    function: 'Pilote QHSE',
    signature: 'K. Ange',
    password: 'kem*2022',
    active: true
  },
  {
    id: '3',
    name: 'Cherif Moriba',
    email: 'cherif@solupack.com',
    phone: '+225 08080808',
    role: 'COPILOTE',
    function: 'Co-Pilote QHSE',
    signature: 'M. Cherif',
    password: 'cher@2026',
    active: true
  },
  {
    id: '4',
    name: 'Kouamé Amoin Kadhidjat',
    email: 'khadi@solupack.com',
    phone: '+225 09090909',
    role: 'COPILOTE',
    function: 'Co-Pilote Adjoint',
    signature: 'K. Khadidjat',
    password: 'kha@2026',
    active: true
  },
  {
    id: '5',
    name: 'Soro Gnakolo',
    email: 'soro@solupack.com',
    phone: '+225 01010101',
    role: 'OPERATEUR',
    function: 'Chef d\'équipe Extrusion',
    signature: 'G. Soro',
    password: 'op*2026',
    active: true
  },
  {
    id: '6',
    name: 'Koffi Blaise',
    email: 'koffi@solupack.com',
    phone: '+225 02020202',
    role: 'DIRECTION',
    function: 'Directeur d\'Exploitation',
    signature: 'B. Koffi',
    password: 'dir*2026',
    active: true
  }
];

// 15 Demo Records (8 NC, 4 BT, 3 Complaints)
export const INITIAL_NC_RECORDS: NonConformite[] = [
  {
    id: 'NC-PROD-2026-0001',
    createdAt: '2026-06-15T08:30:00Z',
    updatedAt: '2026-06-16T11:45:00Z',
    shift: '7H-14H',
    team: 'A',
    supervisor: 'Soro Gnakolo',
    ncDate: '2026-06-15',
    ncTime: '09:15',
    detectorName: 'Kemo Ange',
    detectorFunction: 'Pilote QHSE',
    serviceConcerned: 'Extrusion',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Responsables informés', 'Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Semi-fini',
    articleCode: 'EXT-PEBD-120',
    articleLabel: 'Gaine PEBD Transparente 120µm contact alimentaire',
    clients: 'SUPER-PROD S.A.',
    machine: 'Extrudeuse Bi-couche E04',
    quantityKg: 450,
    quantityUnitDetails: '3 bobines mères de 150 kg',
    ofNumber: 'OF-2026-4819',
    originSection: 'Extrusion',
    manufacturingDate: '2026-06-15',
    shortTitle: 'Surépaisseur et écart de micronage hors tolérance',
    description: 'Lors du contrôle de routine au tirage, constat d\'une surépaisseur significative allant jusqu\'à 145µm au lieu des 120µm nominaux (tolérance +/- 5%). Le défaut est cyclique et provient d\'un problème de régulation thermique sur la filière d\'extrusion.',
    possibleCauses: 'Blocage partiel de la résistance de chauffe n°3 sur l\'extrudeuse entraînant un écoulement hétérogène de la matière fondue.',
    decision: 'Retouche',
    cause5M: 'Machine',
    whys: [
      'Pourquoi le micronage est hors tolérance ? Car l\'épaisseur de la gaine PEBD est irrégulière.',
      'Pourquoi l\'épaisseur est irrégulière ? Car l\'écoulement de la résine de polyéthylène fondue est instable à la sortie de la filière.',
      'Pourquoi l\'écoulement est instable ? Car la température de la filière n\'est pas homogène.',
      'Pourquoi la température n\'est pas homogène ? Car la résistance électrique n°3 de la filière a grillé.',
      'Pourquoi la résistance a grillé ? Manque de maintenance préventive sur les armoires thermiques.'
    ],
    ishikawaAnalysis: 'Machine: Résistance de chauffe défaillante. Méthode: Absence d\'indicateur de température d\'alerte sur le tableau opérateur.',
    smqRiskAttached: true,
    smqRiskRef: 'R-PROD-EXT-02 (Variabilité d\'épaisseur gaine)',
    actions: [
      {
        id: 'ACT-NC01-01',
        description: 'Changement de la résistance thermique défectueuse n°3 et étalonnage des sondes PT100',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-06-16',
        status: 'Effectué',
        verificationDate: '2026-06-16',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Mesures de micronage après redémarrage conformes (120µm +/- 3%).'
      },
      {
        id: 'ACT-NC01-02',
        description: 'Mettre en place un plan d\'autocontrôle renforcé toutes les heures au lieu de toutes les 4 heures sur cette machine pour les 5 prochains OF',
        type: 'Action corrective',
        responsible: 'Soro Gnakolo',
        deadline: '2026-06-25',
        status: 'Effectué',
        verificationDate: '2026-06-28',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Fiches de contrôle correctement remplies, aucune dérive constatée.'
      }
    ],
    closeMethod: 'Clôture directe',
    closeDate: '2026-06-28',
    closedBy: 'Kemo Ange',
    additionalNotes: [
      {
        id: 'NOTE-1',
        author: 'Kemo Ange',
        role: 'Pilote QHSE',
        date: '2026-06-16',
        text: 'Les bobines incriminées ont été identifiées par des étiquettes rouges de non-conformité et placées dans la zone d\'isolation Nord.'
      }
    ],
    attachments: [
      {
        id: 'ATT-1',
        name: 'defaut_micronage_E04.jpg',
        type: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80',
        date: '2026-06-15'
      }
    ],
    signatures: {
      detectorSignature: 'K. Ange',
      responsibleSignature: 'M. Cherif',
      verifierSignature: 'K. Ange'
    }
  },
  {
    id: 'NC-PROD-2026-0002',
    createdAt: '2026-06-18T10:15:00Z',
    updatedAt: '2026-06-20T16:00:00Z',
    shift: '14H-22H',
    team: 'B',
    supervisor: 'Cherif Moriba',
    ncDate: '2026-06-18',
    ncTime: '15:30',
    detectorName: 'Cherif Moriba',
    detectorFunction: 'Co-Pilote QHSE',
    serviceConcerned: 'Impression',
    detectionMethod: 'Contrôle qualité',
    source: 'Produit non conforme',
    immediateActions: ['Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Fini',
    articleCode: 'IMP-PETPE-04',
    articleLabel: 'Film imprimé 8 couleurs lait en poudre 500g',
    clients: 'SOBICI',
    machine: 'Presse Flexographique FL02',
    quantityKg: 800,
    quantityUnitDetails: '4 bobines imprimées',
    ofNumber: 'OF-2026-5120',
    originSection: 'Impression',
    manufacturingDate: '2026-06-17',
    shortTitle: 'Défaut majeur d\'adhérence d\'encre - Traitement Corona inefficace',
    description: 'Test Scotch négatif sur la 4ème couleur (Blanc de soutien et Bleu marine). L\'encre s\'arrache complètement au retrait du ruban adhésif normalisé. Le test d\'énergie de surface révèle une tension superficielle de 32 dynes/cm au lieu de 38 dynes/cm minimum requis pour l\'ancrage des encres solvants.',
    possibleCauses: 'Le rouleau de traitement Corona en extrusion n\'a pas délivré la puissance nécessaire, ou le film a subi une migration de cire glissante réduisant l\'adhésion.',
    decision: 'Rebut',
    cause5M: 'Matière première',
    whys: [
      'Pourquoi l\'encre s\'arrache ? Car la tension superficielle du film PE support est trop basse (32 dynes).',
      'Pourquoi la tension superficielle est trop basse ? Car le traitement Corona appliqué lors de l\'extrusion est insuffisant ou a vieilli.',
      'Pourquoi le traitement Corona est insuffisant ? Car l\'électrode de traitement de l\'extrudeuse était encrassée de cire.',
      'Pourquoi l\'électrode était encrassée ? Utilisation d\'un lot de résine PE contenant un taux d\'agent glissant trop élevé.',
      'Pourquoi ce lot a été utilisé ? Fiche technique fournisseur mal validée à la réception.'
    ],
    ishikawaAnalysis: 'Matière Première: Excès d\'agent glissant (Slip agent). Machine: Encrassement de la station de traitement Corona.',
    smqRiskAttached: true,
    smqRiskRef: 'R-PROC-IMP-05 (Arrachement encre emballage)',
    actions: [
      {
        id: 'ACT-NC02-01',
        description: 'Mise au rebut totale des 4 bobines et recyclage du polyéthylène après lavage si possible',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-06-19',
        status: 'Effectué',
        verificationDate: '2026-06-20',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Destruction physique et transfert au broyeur validés par le bon n° BT-2026-0001.'
      }
    ],
    closeMethod: 'Clôture directe',
    closeDate: '2026-06-20',
    closedBy: 'Kemo Ange',
    additionalNotes: [],
    attachments: [
      {
        id: 'ATT-2',
        name: 'test_scotch_rate.jpg',
        type: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80',
        date: '2026-06-18'
      }
    ],
    signatures: {
      detectorSignature: 'M. Cherif',
      responsibleSignature: 'M. Cherif',
      verifierSignature: 'K. Ange'
    }
  },
  {
    id: 'NC-PROD-2026-0003',
    createdAt: '2026-06-24T14:20:00Z',
    updatedAt: '2026-06-29T10:00:00Z',
    shift: '22H-7H',
    team: 'C',
    supervisor: 'Kouamé Amoin Kadhidjat',
    ncDate: '2026-06-24',
    ncTime: '23:45',
    detectorName: 'Kouamé Amoin Kadhidjat',
    detectorFunction: 'Co-Pilote Adjoint',
    serviceConcerned: 'Lamination',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Responsables informés', 'Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Semi-fini',
    articleCode: 'LAM-PETPE-80',
    articleLabel: 'Complexe laminé PET transparent 12µm / PE blanc 60µm',
    clients: 'CHOCO-CI',
    machine: 'Lamineuse Sans Solvant L01',
    quantityKg: 520,
    quantityUnitDetails: '2 bobines complexées',
    ofNumber: 'OF-2026-5310',
    originSection: 'Lamination',
    manufacturingDate: '2026-06-24',
    shortTitle: 'Défaut de délamination / Force d\'adhérence faible',
    description: 'Après 24h de réticulation en chambre chaude, le test de pelage manuel montre une séparation extrêmement facile des deux films (PET et PE). La force d\'adhérence mesurée au dynamomètre est de 0.5 N/15mm (Spécification: > 1.8 N/15mm pour usage emballage lourd). Présence de micro-bulles de colle non polymérisée.',
    possibleCauses: 'Mauvais dosage du ratio de colle polyuréthane bicomposante (excès d\'hydroxyle ou manque d\'isocyanate) ou température de la chambre chaude trop basse.',
    decision: 'Rebut',
    cause5M: 'Méthode',
    whys: [
      'Pourquoi les films se séparent-ils ? Car la colle n\'a pas durci de manière adéquate.',
      'Pourquoi la colle n\'a pas durci ? Car le ratio de mélange du système adhésif bi-composant était incorrect.',
      'Pourquoi le ratio était incorrect ? Car la pompe de dosage d\'isocyanate a subi une baisse de pression momentanée non détectée.',
      'Pourquoi la baisse n\'a pas été détectée ? Car l\'alarme sonore de la lamineuse était désactivée par l\'opérateur.',
      'Pourquoi l\'opérateur l\'a désactivée ? Volume sonore jugé trop fort en équipe de nuit.'
    ],
    ishikawaAnalysis: 'Méthode: Ratio de mélange défaillant. Milieu: Environnement bruyant poussant à la désactivation des alarmes.',
    smqRiskAttached: true,
    smqRiskRef: 'R-PROC-LAM-03 (Défaut de dosage adhésif)',
    actions: [
      {
        id: 'ACT-NC03-01',
        description: 'Réparation et ré-étalonnage du débitmètre de la pompe doseuse de colle',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-06-25',
        status: 'Effectué',
        verificationDate: '2026-06-26',
        verifier: 'Kouamé Amoin Kadhidjat',
        efficiency: 'Oui',
        efficiencyComment: 'Test de débit conforme sur 10 cycles d\'essais.'
      },
      {
        id: 'ACT-NC03-02',
        description: 'Vérification et interdiction logicielle de désactiver les alarmes de process critiques sur toutes les machines de lamination',
        type: 'Action corrective',
        responsible: 'Nehi Donald',
        deadline: '2026-06-28',
        status: 'Effectué',
        verificationDate: '2026-06-29',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Système verrouillé par mot de passe administrateur désormais.'
      }
    ],
    closeMethod: 'Clôture directe',
    closeDate: '2026-06-29',
    closedBy: 'Kemo Ange',
    additionalNotes: [],
    attachments: [],
    signatures: {
      detectorSignature: 'K. Khadidjat',
      responsibleSignature: 'M. Cherif',
      verifierSignature: 'K. Ange'
    }
  },
  {
    id: 'NC-PROD-2026-0004',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-02T14:30:00Z',
    shift: '7H-14H',
    team: 'A',
    supervisor: 'Soro Gnakolo',
    ncDate: '2026-07-01',
    ncTime: '10:30',
    detectorName: 'Kemo Ange',
    detectorFunction: 'Pilote QHSE',
    serviceConcerned: 'Soudure',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Responsables informés', 'Identification de la NC'],
    productType: 'Fini',
    articleCode: 'SOU-SAC-25K',
    articleLabel: 'Sacs à riz 25kg PEBD soudés à soufflets',
    clients: 'PROMA-ALIMENT',
    machine: 'Soudeuse Haute Cadence S05',
    quantityKg: 180,
    quantityUnitDetails: '1500 sacs individuels',
    ofNumber: 'OF-2026-5501',
    originSection: 'Soudure',
    manufacturingDate: '2026-07-01',
    shortTitle: 'Soudure de fond fragile et décalée',
    description: 'Lors de l\'essai d\'étanchéité sous pression d\'air et test de chute de 1.5m, la soudure inférieure de fond éclate systématiquement. La température des barres de soudure a chuté à 160°C au lieu des 185°C spécifiés.',
    possibleCauses: 'Résistance de la mâchoire de soudure inférieure en fin de vie ou encrassée par des résidus de plastique brûlé.',
    decision: 'Recyclage interne',
    cause5M: 'Machine',
    whys: [
      'Pourquoi les sacs éclatent ? Car la soudure de fond est fragile.',
      'Pourquoi la soudure est fragile ? Car la fusion des lèvres du PEBD n\'a pas été complète.',
      'Pourquoi la fusion n\'a pas été complète ? Car la température de la mâchoire de soudure était trop basse (160°C).',
      'Pourquoi la température était basse ? Car une des cartouches chauffantes est grillée.',
      'Pourquoi est-elle grillée ? Usure normale de la pièce non remplacée préventivement.'
    ],
    ishikawaAnalysis: 'Machine: Cartouche chauffante grillée sur la mâchoire. Milieu: Résidus de polymère collés isolant la chaleur.',
    smqRiskAttached: false,
    actions: [
      {
        id: 'ACT-NC04-01',
        description: 'Changement des cartouches chauffantes et nettoyage de la mâchoire à la brosse laiton',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-07-02',
        status: 'En cours'
      }
    ],
    closeMethod: 'Clôture directe',
    additionalNotes: [],
    attachments: [],
    signatures: {
      detectorSignature: 'K. Ange'
    }
  },
  {
    id: 'NC-PROD-2026-0005',
    createdAt: '2026-07-03T11:00:00Z',
    updatedAt: '2026-07-05T10:00:00Z',
    shift: '14H-22H',
    team: 'B',
    supervisor: 'Soro Gnakolo',
    ncDate: '2026-07-03',
    ncTime: '16:45',
    detectorName: 'Kemo Ange',
    detectorFunction: 'Pilote QHSE',
    serviceConcerned: 'Extrusion',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Responsables informés', 'Isolation / Emplacement'],
    productType: 'Semi-fini',
    articleCode: 'EXT-PET-RET',
    articleLabel: 'Film PET thermo-rétractable 45µm',
    clients: 'SOBICI',
    machine: 'Extrudeuse Soufflage E01',
    quantityKg: 600,
    quantityUnitDetails: '4 bobines mères de 150 kg',
    ofNumber: 'OF-2026-5620',
    originSection: 'Extrusion',
    manufacturingDate: '2026-07-03',
    shortTitle: 'Gels et infondus - Pollution matière',
    description: 'Observation visuelle de petits grains durs transparents (gels) très denses sur le film, provoquant de nombreuses micro-perforations à la rétraction. Ces points durs mesurent entre 0.5 et 1.5 mm.',
    possibleCauses: 'Pollution ou présence de polymère à haut poids moléculaire mal fondu dû à un nettoyage insuffisant du fourreau ou à l\'utilisation d\'un broyé pollué.',
    decision: 'Recyclage interne',
    cause5M: 'Matière première',
    whys: [
      'Pourquoi le film a des micro-perforations ? Car il y a des grains durs appelés gels.',
      'Pourquoi il y a des gels ? Car des débris de plastique carbonisé se détachent du fourreau de l\'extrudeuse.',
      'Pourquoi le plastique s\'est carbonisé ? Car la matière est restée trop longtemps à haute température.',
      'Pourquoi est-elle restée trop longtemps ? Car l\'extrudeuse est restée en chauffe sans tourner pendant l\'arrêt technique du weekend.',
      'Pourquoi est-elle restée en chauffe ? Procédure d\'arrêt non respectée par l\'équipe du vendredi soir.'
    ],
    ishikawaAnalysis: 'Matière Première: Pollution possible du broyé réintroduit. Méthode: Non-respect de la procédure d\'arrêt de l\'extrudeuse.',
    smqRiskAttached: true,
    smqRiskRef: 'R-PROD-EXT-05 (Pollution de matière)',
    actions: [
      {
        id: 'ACT-NC05-01',
        description: 'Purge complète de la vis d\'extrusion avec une matière de purge spécifique (Purging compound)',
        type: 'Correction immédiate',
        responsible: 'Soro Gnakolo',
        deadline: '2026-07-04',
        status: 'Effectué',
        verificationDate: '2026-07-04',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'La gaine de purge est ressortie parfaitement propre.'
      },
      {
        id: 'ACT-NC05-02',
        description: 'Sensibilisation de l\'ensemble des équipes de production sur la procédure stricte de mise en veille thermique lors des arrêts machine',
        type: 'Action corrective',
        responsible: 'Kemo Ange',
        deadline: '2026-07-15',
        status: 'En cours'
      }
    ],
    closeMethod: 'Clôture directe',
    additionalNotes: [],
    attachments: [],
    signatures: {
      detectorSignature: 'K. Ange',
      responsibleSignature: 'G. Soro'
    }
  },
  {
    id: 'NC-PROD-2026-0006',
    createdAt: '2026-07-04T08:00:00Z',
    updatedAt: '2026-07-06T12:00:00Z',
    shift: '7H-14H',
    team: 'C',
    supervisor: 'Kouamé Amoin Kadhidjat',
    ncDate: '2026-07-04',
    ncTime: '08:30',
    detectorName: 'Kouamé Amoin Kadhidjat',
    detectorFunction: 'Co-Pilote Adjoint',
    serviceConcerned: 'Impression',
    detectionMethod: 'Contrôle qualité',
    source: 'Produit non conforme',
    immediateActions: ['Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Fini',
    articleCode: 'IMP-PE-EAU',
    articleLabel: 'Film gaine PE pour sachet d\'eau minérale 500ml',
    clients: 'PROMA-ALIMENT',
    machine: 'Presse Héliogravure H01',
    quantityKg: 320,
    quantityUnitDetails: '2 bobines imprimées',
    ofNumber: 'OF-2026-5712',
    originSection: 'Impression',
    manufacturingDate: '2026-07-04',
    shortTitle: 'Défaut de repérage de couleur (Décalage de registre)',
    description: 'Décalage du texte bleu de plus de 2 mm par rapport au logo rouge. Le code-barres n\'est plus lisible au scanner de contrôle. Le défaut s\'est produit suite à un glissement de la cellule de repérage optique sur son support métallique.',
    possibleCauses: 'La vis de serrage de la cellule de détection optique du repérage était desserrée à cause des vibrations mécaniques de la presse.',
    decision: 'Recyclage interne',
    cause5M: 'Machine',
    whys: [
      'Pourquoi le code-barres n\'est pas lisible ? Car le texte bleu empiète sur les barres noires (décalage).',
      'Pourquoi le bleu est décalé ? Car le système de repérage automatique n\'a pas compensé les dérives de bande.',
      'Pourquoi le repérage n\'a pas fonctionné ? Car la cellule photoélectrique n\'a pas détecté le repère imprimé.',
      'Pourquoi elle n\'a pas détecté ? Car la cellule s\'est décalée physiquement de 5 mm de son axe.',
      'Pourquoi s\'est-elle décalée ? Vis de serrage desserrée par les vibrations continues.'
    ],
    ishikawaAnalysis: 'Machine: Vis de cellule desserrée par vibrations. Méthode: Absence de point de contrôle serrage mécanique lors du calage.',
    smqRiskAttached: false,
    actions: [
      {
        id: 'ACT-NC06-01',
        description: 'Repositionnement, blocage de la vis de la cellule optique et calage du registre',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-07-04',
        status: 'Effectué',
        verificationDate: '2026-07-04',
        verifier: 'Kouamé Amoin Kadhidjat',
        efficiency: 'Oui',
        efficiencyComment: 'Calage automatique stabilisé, code-barres lisible à 100% sur 20 échantillons.'
      }
    ],
    closeMethod: 'Clôture directe',
    closeDate: '2026-07-06',
    closedBy: 'Kouamé Amoin Kadhidjat',
    additionalNotes: [],
    attachments: [],
    signatures: {
      detectorSignature: 'K. Khadidjat',
      responsibleSignature: 'M. Cherif',
      verifierSignature: 'K. Khadidjat'
    }
  },
  {
    id: 'NC-PROD-2026-0007',
    createdAt: '2026-07-06T15:00:00Z',
    updatedAt: '2026-07-06T15:00:00Z',
    shift: '14H-22H',
    team: 'A',
    supervisor: 'Soro Gnakolo',
    ncDate: '2026-07-06',
    ncTime: '15:15',
    detectorName: 'Cherif Moriba',
    detectorFunction: 'Co-Pilote QHSE',
    serviceConcerned: 'Rebobinage',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Identification de la NC'],
    productType: 'Fini',
    articleCode: 'REB-FILM-100',
    articleLabel: 'Film étirable transparent 23µm usage industriel',
    clients: 'SUPER-PROD S.A.',
    machine: 'Rebobineuse R03',
    quantityKg: 300,
    quantityUnitDetails: '12 bobines de 25 kg',
    ofNumber: 'OF-2026-5800',
    originSection: 'Rebobinage',
    manufacturingDate: '2026-07-06',
    shortTitle: 'Tension d\'enroulement insuffisante - Bobine télescopique',
    description: 'Lors du conditionnement final, les bobines s\'affaissent latéralement sous leur propre poids et forment un cône (phénomène télescopique). Impossible de les charger sur les arbres expansibles des banderoleuses automatiques des clients.',
    possibleCauses: 'Défaut du capteur de tension d\'enroulement (cellule de charge défectueuse) ou mauvaise saisie du profil de tension décroissante sur l\'automate.',
    decision: 'Retouche',
    cause5M: 'Mesure',
    whys: [
      'Pourquoi les bobines sont télescopiques ? Car l\'enroulement est trop lâche.',
      'Pourquoi l\'enroulement est trop lâche ? Car la tension de rebobinage a fortement diminué au cours du diamètre.',
      'Pourquoi elle a diminué ? Car le capteur de tension transmettait un signal erroné de sur-tension.',
      'Pourquoi le signal était erroné ? Car l\'arbre du rouleau de détection était grippé empêchant la libre rotation.',
      'Pourquoi l\'arbre était grippé ? Encrassement par de la poussière d\'encre et manque d\'huile de lubrification.'
    ],
    ishikawaAnalysis: 'Mesure: Roulement de rouleau de mesure grippé. Main d\'œuvre: Lubrification négligée lors du nettoyage hebdomadaire.',
    smqRiskAttached: false,
    actions: [
      {
        id: 'ACT-NC07-01',
        description: 'Démontage, nettoyage et remplacement du roulement à billes du rouleau de mesure',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-07-08',
        status: 'Démarrer'
      }
    ],
    closeMethod: 'Clôture directe',
    additionalNotes: [],
    attachments: [],
    signatures: {
      detectorSignature: 'M. Cherif'
    }
  },
  {
    id: 'NC-PROD-2026-0008',
    createdAt: '2026-07-08T10:00:00Z',
    updatedAt: '2026-07-09T14:00:00Z',
    shift: '7H-14H',
    team: 'B',
    supervisor: 'Soro Gnakolo',
    ncDate: '2026-07-08',
    ncTime: '11:00',
    detectorName: 'Kemo Ange',
    detectorFunction: 'Pilote QHSE',
    serviceConcerned: 'Recyclage',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Identification de la NC', 'Isolation / Emplacement'],
    productType: 'MP',
    articleCode: 'REC-PE-GRAN',
    articleLabel: 'Granulés de PEBD recyclés gris',
    clients: 'Usage Interne',
    machine: 'Ligne de Recyclage RC01',
    quantityKg: 1200,
    quantityUnitDetails: '1 Big Bag de 1,2 tonne',
    ofNumber: 'OF-2026-REC-04',
    originSection: 'Recyclage',
    manufacturingDate: '2026-07-08',
    shortTitle: 'Impuretés noires et odeur de brûlé dans les granulés',
    description: 'Le lot présente de nombreux points noirs de plastique carbonisé de taille > 2 mm. Une forte odeur de brûlé se dégage du Big Bag. Le filtre à grille de l\'extrudeuse de recyclage s\'est déchiré sous la pression.',
    possibleCauses: 'Le changeur de filtre hydraulique n\'a pas été activé malgré l\'alerte de haute pression d\'extrusion, ce qui a provoqué la rupture de la maille du filtre.',
    decision: 'Rebut',
    cause5M: 'Machine',
    whys: [
      'Pourquoi il y a des points noirs ? Car des débris de plastique calciné ont passé le filtre.',
      'Pourquoi ils ont passé le filtre ? Car la grille métallique du filtre s\'est déchirée.',
      'Pourquoi la grille s\'est déchirée ? Car la pression de la matière fondue a dépassé 250 bars.',
      'Pourquoi la pression a dépassé 250 bars ? Car le filtre était saturé d\'impuretés et n\'a pas été changé.',
      'Pourquoi le filtre n\'a pas été changé ? Le signal sonore d\'alerte de contre-pression était en panne.'
    ],
    ishikawaAnalysis: 'Machine: Grille de filtre rompue, capteur d\'alerte sonore en panne. Matière: Taux d\'impuretés élevé dans les déchets de départ.',
    smqRiskAttached: false,
    actions: [
      {
        id: 'ACT-NC08-01',
        description: 'Changement de la grille de filtration par une maille de 120 mesh d\'origine et réparation de la sirène d\'alarme',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-07-09',
        status: 'Effectué',
        verificationDate: '2026-07-09',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Système d\'alarme testé et de nouveau opérationnel à 95 dB.'
      }
    ],
    closeMethod: 'Clôture directe',
    closeDate: '2026-07-09',
    closedBy: 'Kemo Ange',
    additionalNotes: [],
    attachments: [],
    signatures: {
      detectorSignature: 'K. Ange',
      responsibleSignature: 'M. Cherif',
      verifierSignature: 'K. Ange'
    }
  },
  {
    id: 'NC-PROD-2026-0009',
    createdAt: '2026-08-28T08:30:00Z',
    updatedAt: '2026-08-30T14:15:00Z',
    shift: '7H-14H',
    team: 'A',
    supervisor: 'Soro Gnakolo',
    ncDate: '2026-08-28',
    ncTime: '08:45',
    detectorName: 'Soro Gnakolo',
    detectorFunction: 'Chef d\'équipe Extrusion',
    serviceConcerned: 'Extrusion',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Responsables informés', 'Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Semi-fini',
    articleCode: 'EXT-PEBD-RET80',
    articleLabel: 'Gaine PEBD thermo-rétractable 80µm laize 1200mm',
    clients: 'BRASIVOIRE S.A.',
    machine: 'Extrudeuse 3 couches E02',
    quantityKg: 720,
    quantityUnitDetails: '6 bobines mères de 120 kg',
    ofNumber: 'OF-2026-6410',
    originSection: 'Extrusion',
    manufacturingDate: '2026-08-28',
    shortTitle: 'Plis longitudinaux et variations d\'épaisseur sur gaine PEBD',
    description: 'Présence de plis longitudinaux continus sur la tranche de la gaine et écarts d\'épaisseur mesurés entre 68µm et 94µm pour une consigne nominale de 80µm (+/- 5%). L\'asymétrie du flux d\'air de refroidissement crée un balancement de la bulle d\'extrusion au niveau du panier de guidage.',
    possibleCauses: 'Déformation et encrassement partiel de l\'anneau d\'air de soufflage à double lèvre, combinés à un dépôt de paraffine sur les rouleaux tireurs.',
    decision: 'Blocage',
    cause5M: 'Machine',
    whys: [
      'Pourquoi la gaine présente-t-elle des plis ? Car la bulle d\'extrusion subit un tirage asymétrique.',
      'Pourquoi le tirage est-il asymétrique ? Car le refroidissement circonférentiel de la matière fondue est hétérogène.',
      'Pourquoi le refroidissement est-il hétérogène ? Car l\'anneau d\'air de soufflage est partiellement obstrué par des dépôts de cire.',
      'Pourquoi des dépôts se sont formés ? Utilisation d\'un lot de PEBD avec auxiliaires de glissement volatils sans nettoyage préventif.',
      'Pourquoi l\'anneau n\'a pas été nettoyé ? Fiche de maintenance hebdomadaire non renseignée.'
    ],
    ishikawaAnalysis: 'Machine: Anneau d\'air de soufflage encrassé et lèvre inférieure désaxée. Milieu: Courants d\'air ambiants perturbant la bulle.',
    smqRiskAttached: true,
    smqRiskRef: 'R-PROD-EXT-04 (Stabilité thermique et géométrie bulle)',
    actions: [
      {
        id: 'ACT-NC09-01',
        description: 'Démontage, décalaminage complet aux ultrasons de l\'anneau d\'air et réalignement au comparateur',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-08-30',
        status: 'Effectué',
        verificationDate: '2026-08-30',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Nettoyage validé, flux d\'air redevenu laminaire sur toute la circonférence.'
      },
      {
        id: 'ACT-NC09-02',
        description: 'Réglage micrométrique de la concentricité de la filière et essai sous caméra thermique FLIR',
        type: 'Action corrective',
        responsible: 'Cherif Moriba',
        deadline: '2026-09-05',
        status: 'En cours'
      },
      {
        id: 'ACT-NC09-03',
        description: 'Décision du comité qualité sur le déblocage conditionnel ou recyclage des 720 kg isolés',
        type: 'Action corrective',
        responsible: 'Kemo Ange',
        deadline: '2026-09-06',
        status: 'En cours'
      }
    ],
    closeMethod: 'Clôture directe',
    additionalNotes: [
      {
        id: 'NOTE-NC09-1',
        author: 'Soro Gnakolo',
        role: 'Chef d\'équipe Extrusion',
        date: '2026-08-28 09:30',
        text: 'Les 6 bobines ont été étiquetées en JAUNE "LOT BLOQUE - EN ATTENTE DECISION QUALITE" et stockées dans l\'allée F du magasin MP/Semi-fini.'
      }
    ],
    attachments: [],
    signatures: {
      detectorSignature: 'G. Soro',
      responsibleSignature: 'M. Cherif'
    }
  },
  {
    id: 'NC-PROD-2026-0010',
    createdAt: '2026-09-01T14:15:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
    shift: '14H-22H',
    team: 'B',
    supervisor: 'Cherif Moriba',
    ncDate: '2026-09-01',
    ncTime: '14:40',
    detectorName: 'Cherif Moriba',
    detectorFunction: 'Co-Pilote QHSE',
    serviceConcerned: 'Impression',
    detectionMethod: 'Contrôle qualité',
    source: 'Produit non conforme',
    immediateActions: ['Responsables informés', 'Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Fini',
    articleCode: 'IMP-BOPP-CHP',
    articleLabel: 'Film BOPP imprimé 6 couleurs pour emballage chips 150g',
    clients: 'UNILEVER-CI',
    machine: 'Presse Flexographique FL01',
    quantityKg: 540,
    quantityUnitDetails: '3 bobines imprimées de 180 kg',
    ofNumber: 'OF-2026-6580',
    originSection: 'Impression',
    manufacturingDate: '2026-09-01',
    shortTitle: 'Dérive colorimétrique ΔE > 4.5 sur aplat rouge et bavure de racle',
    description: 'Contrôle spectrophotométrique révélant un écart colorimétrique ΔE = 4.8 par rapport au standard Pantone 485C (tolérance client ΔE ≤ 2.0). Apparition périodique de légères traînées d\'encre (bavures de raclage) dans la zone de lecture du code-barres EAN13.',
    possibleCauses: 'Évaporation rapide des solvants acétate d\'éthyle due à la chaleur atelier (34°C), entraînant une sur-viscosité de l\'encre et une usure prématurée de la lame de racle en acier au carbone.',
    decision: 'Retouche',
    cause5M: 'Matière première',
    whys: [
      'Pourquoi le ΔE dépasse-t-il la tolérance ? Car l\'épaisseur du film d\'encre rouge déposé est trop dense.',
      'Pourquoi la couche d\'encre est-elle trop dense ? Car la viscosité de l\'encre solvantée est montée à 29 secondes Coupe Ford n°4 au lieu de 22 secondes.',
      'Pourquoi la viscosité a-t-elle augmenté ? Car les solvants légers s\'évaporent prématurément dans l\'encrier ouvert.',
      'Pourquoi l\'évaporation est-elle si rapide ? Température ambiante de l\'atelier élevée sans régulation hygrométrique.',
      'Pourquoi le viscosimètre automatique n\'a pas corrigé ? Pompe d\'injection de solvant retardateur désamorcée.'
    ],
    ishikawaAnalysis: 'Matière: Viscosité d\'encre hors spécification. Milieu: Température élevée atelier impression (34°C). Machine: Racleuse émoussée.',
    smqRiskAttached: true,
    smqRiskRef: 'R-PROC-IMP-02 (Dérive colorimétrique client packaging)',
    actions: [
      {
        id: 'ACT-NC10-01',
        description: 'Changement immédiat de la lame de racle et réajustement viscosimétrique à 21-22s avec mélange acétate/éthoxypropanol',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-09-01',
        status: 'Effectué',
        verificationDate: '2026-09-01',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Nouveau tirage après réglage conforme (ΔE = 1.2, aucun filet de racle).'
      },
      {
        id: 'ACT-NC10-02',
        description: 'Validation par le client ou le service commercial d\'une dérogation colorimétrique pour les 3 bobines imprimées ou recyclage',
        type: 'Action corrective',
        responsible: 'Kemo Ange',
        deadline: '2026-09-04',
        status: 'En cours'
      },
      {
        id: 'ACT-NC10-03',
        description: 'Installation d\'un couvercle anti-évaporation hermétique et contrôle d\'étalonnage du viscosimètre en ligne',
        type: 'Action préventive',
        responsible: 'Cherif Moriba',
        deadline: '2026-09-08',
        status: 'Démarrer'
      }
    ],
    closeMethod: 'Clôture directe',
    additionalNotes: [
      {
        id: 'NOTE-NC10-1',
        author: 'Cherif Moriba',
        role: 'Co-Pilote QHSE',
        date: '2026-09-01 16:30',
        text: 'Échantillons spectrophotométriques conservés et transmis au laboratoire qualité pour tirage d\'un BAT comparatif.'
      }
    ],
    attachments: [],
    signatures: {
      detectorSignature: 'M. Cherif',
      responsibleSignature: 'M. Cherif'
    }
  },
  {
    id: 'NC-PROD-2026-0011',
    createdAt: '2026-08-25T23:20:00Z',
    updatedAt: '2026-08-27T09:00:00Z',
    shift: '22H-7H',
    team: 'C',
    supervisor: 'Kouamé Amoin Kadhidjat',
    ncDate: '2026-08-25',
    ncTime: '23:35',
    detectorName: 'Kouamé Amoin Kadhidjat',
    detectorFunction: 'Co-Pilote Adjoint',
    serviceConcerned: 'Lamination',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Responsables informés', 'Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Semi-fini',
    articleCode: 'LAM-PETMET-97',
    articleLabel: 'Complexe barrière PET 12µm / Alumétallisé 15µm / PE 70µm',
    clients: 'SIPRA S.A.',
    machine: 'Lamineuse Sans Solvant L02',
    quantityKg: 880,
    quantityUnitDetails: '4 bobines mères de 220 kg',
    ofNumber: 'OF-2026-6350',
    originSection: 'Lamination',
    manufacturingDate: '2026-08-25',
    shortTitle: 'Phénomène de tunnelisation et bullage sur complexe barrière 3 couches',
    description: 'Observation de rides longitudinales fines sous forme de tunnels de délamination entre la couche aluminium métallisée et la couche PE lors du débobinage pour test d\'étanchéité. Présence d\'inclusions d\'air et de micro-bulles d\'adhésif.',
    possibleCauses: 'Tension différentielle excessive appliquée entre le film PET rigide et le film PE souple à l\'entrée de la calandre de contrecollage, associée à une température du rouleau presseur insuffisante (38°C au lieu de 50°C).',
    decision: 'Dérogation',
    cause5M: 'Méthode',
    whys: [
      'Pourquoi y a-t-il des tunnels entre les films ? Car les deux films ne se rétractent pas avec la même tension.',
      'Pourquoi la tension est-elle différente ? Car la consigne de tension du frein de débobinage PE était trop forte.',
      'Pourquoi la consigne était trop forte ? Fiche de réglage machine standard utilisée au lieu de la fiche spécifique pour complexe métallisé.',
      'Pourquoi la mauvaise fiche a été utilisée ? Manque de mise à disposition des nouvelles fiches de réglage au poste opérateur.',
      'Pourquoi les fiches n\'étaient pas au poste ? Retard de déploiement documentaire suite à la modification de recette produit.'
    ],
    ishikawaAnalysis: 'Méthode: Fiche de réglage machine inadaptée. Machine: Température de calandre insuffisante. Main d\'œuvre: Non vérification des tensions relatives.',
    smqRiskAttached: true,
    smqRiskRef: 'R-PROC-LAM-04 (Délamination emballage barrière sous vide)',
    actions: [
      {
        id: 'ACT-NC11-01',
        description: 'Prélèvement d\'éprouvettes et réalisation des tests d\'étanchéité et de résistance de pelage à 72h au dynamomètre',
        type: 'Correction immédiate',
        responsible: 'Kouamé Amoin Kadhidjat',
        deadline: '2026-08-28',
        status: 'Effectué',
        verificationDate: '2026-08-29',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Résultats pelage: 1.6 N/15mm (acceptable sous dérogation technique validée par la Direction).'
      },
      {
        id: 'ACT-NC11-02',
        description: 'Essais industriels de thermoscellage sur machine cliente SIPRA pour confirmer l\'absence de fuite en condition réelle',
        type: 'Action corrective',
        responsible: 'Kemo Ange',
        deadline: '2026-09-06',
        status: 'En cours'
      },
      {
        id: 'ACT-NC11-03',
        description: 'Mise à jour et plastification des fiches de réglage tension/température à chaque poste de lamination',
        type: 'Action préventive',
        responsible: 'Soro Gnakolo',
        deadline: '2026-09-08',
        status: 'Démarrer'
      }
    ],
    closeMethod: 'Clôture directe',
    additionalNotes: [
      {
        id: 'NOTE-NC11-1',
        author: 'Kouamé Amoin Kadhidjat',
        role: 'Co-Pilote Adjoint',
        date: '2026-08-26 08:00',
        text: 'Les 4 bobines sont consignées en zone Lamination. Décision dérogation en attente de validation commerciale.'
      }
    ],
    attachments: [],
    signatures: {
      detectorSignature: 'K. Khadidjat',
      responsibleSignature: 'M. Cherif'
    }
  },
  {
    id: 'NC-PROD-2026-0012',
    createdAt: '2026-09-02T10:45:00Z',
    updatedAt: '2026-09-02T15:30:00Z',
    shift: '7H-14H',
    team: 'A',
    supervisor: 'Soro Gnakolo',
    ncDate: '2026-09-02',
    ncTime: '11:00',
    detectorName: 'Kemo Ange',
    detectorFunction: 'Pilote QHSE',
    serviceConcerned: 'Soudure',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Responsables informés', 'Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Fini',
    articleCode: 'SOU-BRET-BIO50',
    articleLabel: 'Sacs bretelles biosourcés biodégradables 50µm 35x50cm',
    clients: 'CARREFOUR-CI',
    machine: 'Soudeuse Haute Cadence S03',
    quantityKg: 310,
    quantityUnitDetails: '44 cartons de 500 sacs (22 000 sacs)',
    ofNumber: 'OF-2026-6630',
    originSection: 'Soudure',
    manufacturingDate: '2026-09-02',
    shortTitle: 'Micro-fuites au soufflet de fond et perforation des poignées renforcées',
    description: 'Lors du test de résistance à la charge statique (12 kg pendant 10 minutes) et test d\'étanchéité sous vide d\'eau (-150 mbar), rupture systématique des soudures latérales au niveau des soufflets de fond. La découpeuse de poignées génère une amorce de déchirure sur 1 sac sur 4.',
    possibleCauses: 'Température de soudure excessive (195°C au lieu de 165°C pour matière biodégradable PLA/PBAT sensible thermiquement) et couteau de découpe de poignées émoussé.',
    decision: 'Rebut',
    cause5M: 'Main d\'œuvre',
    whys: [
      'Pourquoi la soudure se déchire-t-elle ? Car la matière plastique biodégradable a été brûlée et fragilisée.',
      'Pourquoi a-t-elle été brûlée ? Car la température des barres chauffantes a été réglée comme pour du PEBD standard (195°C).',
      'Pourquoi a-t-elle été mal réglée ? Car l\'opérateur intérimaire ne connaissait pas la sensibilité thermique du biopolymère.',
      'Pourquoi l\'intérimaire n\'a pas été briefé ? Accueil au poste effectué à la hâte en début de quart.',
      'Pourquoi à la hâte ? Absence imprévue de l\'opérateur titulaire sans tuteur désigné.'
    ],
    ishikawaAnalysis: 'Main d\'œuvre: Opérateur non habilité sur bioplastiques. Méthode: Consigne de température non affichée sur pupitre S03. Machine: Lame de poinçonnage usée.',
    smqRiskAttached: true,
    smqRiskRef: 'R-PROD-SOU-02 (Rupture sacs grande distribution)',
    actions: [
      {
        id: 'ACT-NC12-01',
        description: 'Blocage et étiquetage rouge des 44 cartons non conformes, transfert vers la zone de broyage pour compost/recyclage',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-09-03',
        status: 'En cours'
      },
      {
        id: 'ACT-NC12-02',
        description: 'Changement de la lame de poinçonnage poignées et verrouillage de la température à 165°C sur l\'automate Omron',
        type: 'Correction immédiate',
        responsible: 'Soro Gnakolo',
        deadline: '2026-09-03',
        status: 'Effectué',
        verificationDate: '2026-09-03',
        verifier: 'Kemo Ange',
        efficiency: 'Oui',
        efficiencyComment: 'Soudure et découpe poignées impeccables après paramétrage.'
      },
      {
        id: 'ACT-NC12-03',
        description: 'Formation et habilitation obligatoire de tous les conducteurs de ligne soudure sur le cahier des charges bioplastiques',
        type: 'Action préventive',
        responsible: 'Kemo Ange',
        deadline: '2026-09-10',
        status: 'Démarrer'
      }
    ],
    closeMethod: 'Clôture directe',
    additionalNotes: [
      {
        id: 'NOTE-NC12-1',
        author: 'Kemo Ange',
        role: 'Pilote QHSE',
        date: '2026-09-02 12:15',
        text: 'Bon de Transfert émis pour acheminement des 310 kg au parc de recyclage sélectif bioplastiques.'
      }
    ],
    attachments: [],
    signatures: {
      detectorSignature: 'K. Ange',
      responsibleSignature: 'G. Soro'
    }
  },
  {
    id: 'NC-PROD-2026-0013',
    createdAt: '2026-08-31T16:30:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    shift: '14H-22H',
    team: 'B',
    supervisor: 'Soro Gnakolo',
    ncDate: '2026-08-31',
    ncTime: '16:50',
    detectorName: 'Soro Gnakolo',
    detectorFunction: 'Chef d\'équipe Extrusion/Rebobinage',
    serviceConcerned: 'Rebobinage',
    detectionMethod: 'Autocontrôle',
    source: 'Produit non conforme',
    immediateActions: ['Identification de la NC', 'Isolation / Emplacement'],
    productType: 'Fini',
    articleCode: 'REB-PEBD-180',
    articleLabel: 'Bobines refendues PEBD 35µm laize 180mm ensacheuse automatique',
    clients: 'PHOENIX-PACK',
    machine: 'Refendeuse-Rebobineuse R02',
    quantityKg: 420,
    quantityUnitDetails: '28 bobinettes de 15 kg',
    ofNumber: 'OF-2026-6510',
    originSection: 'Rebobinage',
    manufacturingDate: '2026-08-31',
    shortTitle: 'Tranche ondulée, bavures de coupe et étirement latéral sur bobines fentes',
    description: 'Les tranches latérales des bobines présentent un aspect étagé (ondulation > 3 mm) avec de nombreuses barbes et bavures de cisaillement de film plastique. Risque majeur de blocage ou déchirement sur les machines de conditionnement haute cadence du client.',
    possibleCauses: 'Couteaux circulaires rotatifs émoussés présentant des micro-ébréchures suite à un contact accidentel avec une bague de mandrin métallique.',
    decision: 'Retouche',
    cause5M: 'Machine',
    whys: [
      'Pourquoi la tranche est-elle étagée et bavée ? Car les couteaux de coupe écrasent le film au lieu de le trancher net.',
      'Pourquoi ils écrasent le film ? Car les lames circulaires de refente ont perdu leur fil tranchant.',
      'Pourquoi ont-elles perdu leur fil ? Les couteaux ont heurté les butées de serrage en acier lors du calage de la laize.',
      'Pourquoi ont-ils heurté les butées ? Le chariot porte-couteaux a été déplacé manuellement sans desserrer le frein pneumatique.',
      'Pourquoi le frein n\'a pas été desserré ? Procédure de calage mécanique de la laize non respectée.'
    ],
    ishikawaAnalysis: 'Machine: Couteaux circulaires ébréchés. Méthode: Mauvaise procédure de déplacement des couteaux de refente.',
    smqRiskAttached: false,
    actions: [
      {
        id: 'ACT-NC13-01',
        description: 'Remplacement immédiat du train complet de 8 couteaux circulaires par un jeu neuf affûté',
        type: 'Correction immédiate',
        responsible: 'Cherif Moriba',
        deadline: '2026-09-01',
        status: 'Effectué',
        verificationDate: '2026-09-01',
        verifier: 'Soro Gnakolo',
        efficiency: 'Oui',
        efficiencyComment: 'Coupe nette et brillante constatée sur les bobines suivantes.'
      },
      {
        id: 'ACT-NC13-02',
        description: 'Reprise et refente des 28 bobines incriminées sur rebobineuse d\'inspection avec rognage des lisières (retouche)',
        type: 'Correction immédiate',
        responsible: 'Soro Gnakolo',
        deadline: '2026-09-04',
        status: 'En cours'
      },
      {
        id: 'ACT-NC13-03',
        description: 'Installation d\'une butée de sécurité mécanique empêchant le contact couteau-mandrin acier',
        type: 'Action préventive',
        responsible: 'Cherif Moriba',
        deadline: '2026-09-09',
        status: 'Démarrer'
      }
    ],
    closeMethod: 'Clôture directe',
    additionalNotes: [
      {
        id: 'NOTE-NC13-1',
        author: 'Soro Gnakolo',
        role: 'Chef d\'équipe',
        date: '2026-08-31 17:30',
        text: 'Les bobines sont en attente de passage sur la rebobineuse R01 pour rognage des 5 mm de rive endommagée.'
      }
    ],
    attachments: [],
    signatures: {
      detectorSignature: 'G. Soro',
      responsibleSignature: 'M. Cherif'
    }
  }
];

export const INITIAL_BT_RECORDS: BonDeTransfert[] = [
  {
    id: 'BT-2026-0001',
    btNumber: 'BT-2026-0001',
    btType: 'Retour non conforme',
    constatDate: '2026-06-19',
    constatTime: '11:00',
    sender: 'Cherif Moriba',
    closeDate: '2026-06-19',
    ncSheetNumber: 'NC-PROD-2026-0002',
    returnSheetNumber: 'BR-2026-904',
    actionSheetNumber: 'ACT-NC02-01',
    productType: 'Fini',
    ofNumber: 'OF-2026-5120',
    team: 'B',
    quantityKg: 800,
    transferSubject: 'Transfert de 4 bobines PE rejetées pour défaut d\'adhérence d\'encre vers l\'atelier de broyage / recyclage.',
    packagingZone: 'Zone d’isolation',
    destination: 'Atelier de recyclage',
    observation: 'Le lot de bobines rejeté suite au test d\'adhérence a été pesé à 800 kg nets et transféré pour découpe de bande imprimée et recyclage immédiat de la matière PE neutre non imprimée.',
    status: 'Effectué',
    attachments: [],
    createdAt: '2026-06-19T11:00:00Z',
    updatedAt: '2026-06-19T11:30:00Z'
  },
  {
    id: 'BT-2026-0002',
    btNumber: 'BT-2026-0002',
    btType: 'Produit non conforme',
    constatDate: '2026-06-25',
    constatTime: '08:30',
    sender: 'Kouamé Amoin Kadhidjat',
    closeDate: '2026-06-25',
    ncSheetNumber: 'NC-PROD-2026-0003',
    returnSheetNumber: '',
    actionSheetNumber: 'ACT-NC03-01',
    productType: 'Semi-fini',
    ofNumber: 'OF-2026-5310',
    team: 'C',
    quantityKg: 520,
    transferSubject: 'Mise en quarantaine de 2 bobines complexées décolées (délamination)',
    packagingZone: 'Atelier de production',
    destination: 'Zone d’isolation non conforme',
    observation: 'Les deux bobines mères complexées du lot non conforme CHOCO-CI ont été banderolées sous film rouge "NON CONFORME" et transportées dans le box d\'isolation en attente de la décision finale du comité QHSE.',
    status: 'Effectué',
    attachments: [],
    createdAt: '2026-06-25T08:30:00Z',
    updatedAt: '2026-06-25T09:00:00Z'
  },
  {
    id: 'BT-2026-0003',
    btNumber: 'BT-2026-0003',
    btType: 'Matière première',
    constatDate: '2026-07-05',
    constatTime: '14:20',
    sender: 'Soro Gnakolo',
    closeDate: undefined,
    ncSheetNumber: 'NC-PROD-2026-0008',
    returnSheetNumber: 'BR-2026-112',
    actionSheetNumber: '',
    productType: 'MP',
    ofNumber: 'OF-2026-REC-04',
    team: 'B',
    quantityKg: 1200,
    transferSubject: 'Retour fournisseur d\'un lot de résine polyéthylène basse densité pollué',
    packagingZone: 'Stock matière première',
    destination: 'Retour au fournisseur',
    observation: 'Lot de 1.2 tonnes de granulés PEBD sous big bag d\'origine présentant des impuretés dures noires. Refus d\'introduction en production suite à rupture de filtres successifs. Prêt pour enlèvement par le transporteur du fournisseur.',
    status: 'En attente',
    attachments: [],
    createdAt: '2026-07-05T14:20:00Z',
    updatedAt: '2026-07-05T14:20:00Z'
  },
  {
    id: 'BT-2026-0004',
    btNumber: 'BT-2026-0004',
    btType: 'Equipement de mesure',
    constatDate: '2026-07-07',
    constatTime: '09:00',
    sender: 'Kemo Ange',
    closeDate: '2026-07-07',
    ncSheetNumber: '',
    returnSheetNumber: '',
    actionSheetNumber: '',
    productType: 'Autre',
    ofNumber: 'N/A',
    team: 'A',
    quantityKg: 0,
    transferSubject: 'Envoi des micromètres Mitutoyo de l\'Atelier d\'extrusion pour étalonnage',
    packagingZone: 'Atelier de production',
    destination: 'Zone d’isolation non conforme',
    observation: 'Les 3 micromètres à tambour digitaux de l\'extrusion (repères MC-01, MC-02 et MC-03) ont été récoltés pour leur étalonnage métrologique annuel au laboratoire interne avant envoi pour certification.',
    status: 'Effectué',
    attachments: [],
    createdAt: '2026-07-07T09:00:00Z',
    updatedAt: '2026-07-07T09:30:00Z'
  }
];

export const INITIAL_CLIENT_RECORDS: ClientComplaint[] = [
  {
    id: 'REC-2026-0001',
    clientName: 'CHOCO-CI',
    contactPhone: '+225 01223344',
    orderNumber: 'CMD-2026-9902 / BL-1481',
    reclamationDate: '2026-06-25',
    channel: 'Email',
    estimatedCostFcfa: 2400000,
    compensationGranted: 'Remplacement immédiat des bobines par ré-extrusion',
    shortDescription: 'Odeur résiduelle de solvant (acétate d\'éthyle) trop prononcée sur les bobines de PET complexé pour emballage de chocolat. Risque de contamination organoleptique du produit fini.',
    associatedNcId: 'NC-PROD-2026-0003',
    status: 'En cours',
    createdAt: '2026-06-25T14:00:00Z'
  },
  {
    id: 'REC-2026-0002',
    clientName: 'PROMA-ALIMENT',
    contactPhone: '+225 05445566',
    orderNumber: 'CMD-2026-8812 / BL-1320',
    reclamationDate: '2026-07-02',
    channel: 'Téléphone',
    estimatedCostFcfa: 900000,
    compensationGranted: 'Avoir commercial de 900 000 FCFA accordé',
    shortDescription: 'Rupture répétitive des soudures inférieures de fond sur les sachets de lait en poudre lors du remplissage vertical automatique chez le client. Pertes de produit importantes signalées.',
    associatedNcId: 'NC-PROD-2026-0004',
    status: 'Ouvert',
    createdAt: '2026-07-02T10:00:00Z'
  },
  {
    id: 'REC-2026-0003',
    clientName: 'SOBICI',
    contactPhone: '+225 07889900',
    orderNumber: 'CMD-2026-7711 / BL-1215',
    reclamationDate: '2026-06-20',
    channel: 'Visite',
    estimatedCostFcfa: 600000,
    compensationGranted: 'Geste commercial (remise de 10% sur la prochaine commande)',
    shortDescription: 'Teinte bleue Pantone trop foncée par rapport au standard approuvé sur les étiquettes de bouteilles de jus de fruits.',
    associatedNcId: 'NC-PROD-2026-0002',
    status: 'Clôturé',
    createdAt: '2026-06-20T11:00:00Z'
  }
];

// Safe storage abstraction (prevents DOMException in restricted/sandboxed iframes)
const memoryStorage = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage access blocked in iframe or private mode
    }
    return memoryStorage.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Storage access blocked
    }
    memoryStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage access blocked
    }
    memoryStorage.delete(key);
  }
};

// IndexedDB Persistence Layer (DB_Store)
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB non supporté'));
        return;
      }
      const timer = setTimeout(() => {
        reject(new Error('IndexedDB timeout'));
      }, 1000);

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          Object.values(STORES).forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        } catch (upgradeErr) {
          console.warn('IDB upgrade error:', upgradeErr);
        }
      };

      request.onsuccess = (event) => {
        clearTimeout(timer);
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        clearTimeout(timer);
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onblocked = () => {
        clearTimeout(timer);
        reject(new Error('IndexedDB version upgrade blocked'));
      };
    } catch (err) {
      reject(err);
    }
  });
}

async function getAllFromIDB<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return [];
  }
}

async function putInIDB<T extends { id?: string }>(storeName: string, item: T): Promise<void> {
  try {
    if (!item || typeof item !== 'object') return;
    if (!item.id) {
      item.id = `IDB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(`IDB put error (${storeName}):`, e);
  }
}

async function putBulkInIDB<T extends { id?: string }>(storeName: string, items: T[]): Promise<void> {
  try {
    if (!items || items.length === 0) return;
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      items.forEach(item => {
        if (item && typeof item === 'object') {
          if (!item.id) item.id = `IDB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          store.put(item);
        }
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (e) {
    console.error(`IDB bulk put error (${storeName}):`, e);
  }
}

async function deleteFromIDB(storeName: string, key: string): Promise<void> {
  try {
    if (!key) return;
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(`IDB delete error (${storeName}):`, e);
  }
}

function getLocalCache<T>(key: string, defaultVal: T[]): T[] {
  try {
    const raw = safeStorage.getItem(`solupack_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }
  return defaultVal;
}

function notifyDataChange(key: string) {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('solupack_data_changed', { detail: { key } }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('solupack_realtime_sync');
        bc.postMessage({ type: 'SOLUPACK_DATA_CHANGED', key, timestamp: Date.now() });
        bc.close();
      }
    }
  } catch (e) {
    // Ignore broadcast errors
  }
}

function setLocalCache<T>(key: string, data: T[]): void {
  try {
    safeStorage.setItem(`solupack_cache_${key}`, JSON.stringify(data));
    notifyDataChange(key);
  } catch (e) {
    // ignore
  }
}

export async function initDB(): Promise<boolean> {
  try {
    await populateInitialData();
    // Non-blocking IDB setup
    openIDB().then(() => {
      // IDB ready
    }).catch(err => {
      console.warn('IndexedDB unavailable, running on safe cache:', err);
    });
    return true;
  } catch (e) {
    console.warn('initDB fallback:', e);
    return true;
  }
}

export async function populateInitialData(db?: any): Promise<void> {
  try {
    // 1. Ensure local cache has initial demo data
    const currentUsers = getLocalCache<User>('utilisateurs', INITIAL_USERS);
    if (!currentUsers || currentUsers.length === 0) {
      setLocalCache('utilisateurs', INITIAL_USERS);
    }

    const currentNCs = getLocalCache<NonConformite>('non_conformites', INITIAL_NC_RECORDS);
    if (!currentNCs || currentNCs.length === 0) {
      setLocalCache('non_conformites', INITIAL_NC_RECORDS);
    }

    const currentBTs = getLocalCache<BonDeTransfert>('bons_de_transfert', INITIAL_BT_RECORDS);
    if (!currentBTs || currentBTs.length === 0) {
      setLocalCache('bons_de_transfert', INITIAL_BT_RECORDS);
    }

    const currentClients = getLocalCache<ClientComplaint>('reclamations_clients', INITIAL_CLIENT_RECORDS);
    if (!currentClients || currentClients.length === 0) {
      setLocalCache('reclamations_clients', INITIAL_CLIENT_RECORDS);
    }

    // 2. Try to sync to IndexedDB in background (non-blocking)
    getAllFromIDB<User>(STORES.USERS).then(async (users) => {
      if (!users || users.length === 0) {
        await putBulkInIDB(STORES.USERS, INITIAL_USERS);
      }
    }).catch(() => {});

    getAllFromIDB<NonConformite>(STORES.NC).then(async (ncs) => {
      if (!ncs || ncs.length === 0) {
        await putBulkInIDB(STORES.NC, INITIAL_NC_RECORDS);
      }
    }).catch(() => {});

    getAllFromIDB<BonDeTransfert>(STORES.BT).then(async (bts) => {
      if (!bts || bts.length === 0) {
        await putBulkInIDB(STORES.BT, INITIAL_BT_RECORDS);
      }
    }).catch(() => {});

    getAllFromIDB<ClientComplaint>(STORES.CLIENTS).then(async (clients) => {
      if (!clients || clients.length === 0) {
        await putBulkInIDB(STORES.CLIENTS, INITIAL_CLIENT_RECORDS);
      }
    }).catch(() => {});
  } catch (e) {
    console.warn('populateInitialData fallback:', e);
  }
}

/**
 * Force-inserts or updates all initial demo NCs into IndexedDB and LocalStorage
 */
export async function seedDemoNCs(): Promise<NonConformite[]> {
  try {
    const existing = await getAllRecords<NonConformite>(STORES.NC);
    const existingMap = new Map(existing.map(item => [item.id, item]));
    
    // Add any demo records that are not yet in existing
    for (const demoNC of INITIAL_NC_RECORDS) {
      if (!existingMap.has(demoNC.id)) {
        existingMap.set(demoNC.id, demoNC);
        await putInIDB(STORES.NC, demoNC);
      }
    }
    
    const updated = Array.from(existingMap.values());
    setLocalCache('non_conformites', updated);
    return updated;
  } catch (err) {
    console.error('Erreur seedDemoNCs:', err);
    return INITIAL_NC_RECORDS;
  }
}

export async function getAllRecords<T>(storeName: string): Promise<T[]> {
  let defaults: any[] = [];
  if (storeName === STORES.NC) defaults = INITIAL_NC_RECORDS;
  else if (storeName === STORES.BT) defaults = INITIAL_BT_RECORDS;
  else if (storeName === STORES.CLIENTS) defaults = INITIAL_CLIENT_RECORDS;
  else if (storeName === STORES.USERS) defaults = INITIAL_USERS;

  const localData = getLocalCache<T>(storeName, defaults as T[]);

  // Asynchronously synchronize with IndexedDB cache if populated
  getAllFromIDB<T>(storeName).then(idbData => {
    if (idbData && idbData.length > 0) {
      setLocalCache(storeName, idbData);
    }
  }).catch(() => {});

  return localData;
}

export async function saveRecord<T extends { id?: string }>(storeName: string, record: T): Promise<void> {
  if (!record) return;
  if (!record.id) {
    (record as any).id = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  let defaults: any[] = [];
  if (storeName === STORES.NC) defaults = INITIAL_NC_RECORDS;
  else if (storeName === STORES.BT) defaults = INITIAL_BT_RECORDS;
  else if (storeName === STORES.CLIENTS) defaults = INITIAL_CLIENT_RECORDS;
  else if (storeName === STORES.USERS) defaults = INITIAL_USERS;

  // 1. Instant local update & real-time notification
  const current = getLocalCache<T>(storeName, defaults as T[]);
  const recordId = record.id;
  const index = recordId ? current.findIndex(item => item.id === recordId) : -1;
  let updated: T[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = record;
  } else {
    updated = [record, ...current];
  }
  setLocalCache(storeName, updated);

  // 2. Asynchronous IndexedDB DB_Store persistence (non-blocking)
  putInIDB(storeName, record).catch(e => console.warn('IDB save error:', e));
}

export async function deleteRecord(storeName: string, key: string): Promise<void> {
  if (!key) return;

  // 1. Instant local update & real-time notification
  const current = getLocalCache<any>(storeName, []);
  const updated = current.filter(item => item.id !== key);
  setLocalCache(storeName, updated);

  // 2. Asynchronous IndexedDB DB_Store deletion (non-blocking)
  deleteFromIDB(storeName, key).catch(e => console.warn('IDB delete error:', e));
}

// NC Specialized helpers
export const dbNC = {
  getAll: () => getAllRecords<NonConformite>(STORES.NC),
  save: async (nc: NonConformite) => {
    await saveRecord<NonConformite>(STORES.NC, nc);
  },
  delete: async (id: string) => {
    await deleteRecord(STORES.NC, id);
  }
};

// BT Specialized helpers
export const dbBT = {
  getAll: () => getAllRecords<BonDeTransfert>(STORES.BT),
  save: async (bt: BonDeTransfert) => {
    await saveRecord<BonDeTransfert>(STORES.BT, bt);
  },
  delete: async (id: string) => {
    await deleteRecord(STORES.BT, id);
  }
};

// Clients Specialized helpers
export const dbClients = {
  getAll: () => getAllRecords<ClientComplaint>(STORES.CLIENTS),
  save: async (client: ClientComplaint) => {
    await saveRecord<ClientComplaint>(STORES.CLIENTS, client);
  },
  delete: async (id: string) => {
    await deleteRecord(STORES.CLIENTS, id);
  }
};

// Users Specialized helpers
export const dbUsers = {
  getAll: () => getAllRecords<User>(STORES.USERS),
  save: async (user: User) => {
    await saveRecord<User>(STORES.USERS, user);
  },
  delete: async (id: string) => {
    await deleteRecord(STORES.USERS, id);
  }
};

// Audit trail helpers
export const dbAudit = {
  getAll: () => getAllRecords<AuditLog>(STORES.AUDIT),
  save: async (log: AuditLog) => {
    await saveRecord<AuditLog>(STORES.AUDIT, log);
  },
  log: async (userId: string, userName: string, role: string, action: string, module: 'NC' | 'BT' | 'CLIENT' | 'USER' | 'AUTH', targetId: string, details: string) => {
    const log: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole: role,
      action,
      module,
      targetId,
      details
    };
    await saveRecord<AuditLog>(STORES.AUDIT, log);
  }
};

// Notification log helpers
export const dbNotifs = {
  getAll: () => getAllRecords<NotificationLog>(STORES.NOTIFS),
  save: (notif: NotificationLog) => saveRecord<NotificationLog>(STORES.NOTIFS, notif),
  triggerNotification: async (recipientEmail: string, recipientName: string, subject: string, body: string) => {
    const notif: NotificationLog = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      recipientEmail,
      recipientName,
      subject,
      body,
      status: 'Sent'
    };
    await saveRecord<NotificationLog>(STORES.NOTIFS, notif);
    console.log(`Notification envoyée à ${recipientName} (${recipientEmail}) : ${subject}`);
    return notif;
  }
};
