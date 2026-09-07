import { User, NonConformite, BonDeTransfert, ClientComplaint, AuditLog, NotificationLog } from '../types';

export function generateSQLScript(
  users: User[],
  ncs: NonConformite[],
  bts: BonDeTransfert[],
  complaints: ClientComplaint[],
  auditLogs: AuditLog[],
  notifications?: NotificationLog[]
): string {
  let sql = `-- ========================================================\n`;
  sql += `-- SOLUPACK S.A. - SYSTEME DE MANAGEMENT DE LA QUALITE (SMQ)\n`;
  sql += `-- SCRIPT D'INITIALISATION BASE DE DONNEES MYSQL / MARIADB / CLOUD SQL\n`;
  sql += `-- Base de données : solupack_quality (Port MySQL 3306)\n`;
  sql += `-- Compatible : MySQL 5.7 / 8.0, MariaDB, Cloud SQL, phpMyAdmin\n`;
  sql += `-- Généré automatiquement le : ${new Date().toLocaleString('fr-FR')}\n`;
  sql += `-- ========================================================\n\n`;

  sql += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
  sql += `START TRANSACTION;\n`;
  sql += `SET time_zone = "+00:00";\n`;
  sql += `SET NAMES utf8mb4;\n\n`;

  sql += `-- --------------------------------------------------------\n`;
  sql += `-- 1. CREATION DE LA BASE DE DONNEES\n`;
  sql += `-- --------------------------------------------------------\n`;
  sql += `CREATE DATABASE IF NOT EXISTS \`solupack_quality\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  sql += `USE \`solupack_quality\`;\n\n`;

  // Helper to escape string inputs safely for MySQL
  const esc = (str: string | undefined | null): string => {
    if (str === undefined || str === null) return 'NULL';
    const escaped = str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n');
    return `'${escaped}'`;
  };

  const num = (n: number | undefined | null): string => {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return n.toString();
  };

  const bool = (b: boolean | undefined | null): string => {
    return b ? '1' : '0';
  };

  // 1. TABLE UTILISATEURS
  sql += `-- --------------------------------------------------------\n`;
  sql += `-- Structure MySQL de la table \`utilisateurs\`\n`;
  sql += `-- --------------------------------------------------------\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`utilisateurs\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`name\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`email\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`phone\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`role\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`function\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`signature\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`password\` VARCHAR(255) DEFAULT NULL,\n`;
  sql += `  \`active\` TINYINT(1) NOT NULL DEFAULT 1,\n`;
  sql += `  \`createdAt\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`updatedAt\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  PRIMARY KEY (\`id\`),\n`;
  sql += `  KEY \`idx_user_role\` (\`role\`),\n`;
  sql += `  KEY \`idx_user_email\` (\`email\`)\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  sql += `-- Données de la table \`utilisateurs\`\n`;
  if (users.length > 0) {
    sql += `INSERT INTO \`utilisateurs\` (\`id\`, \`name\`, \`email\`, \`phone\`, \`role\`, \`function\`, \`signature\`, \`password\`, \`active\`, \`createdAt\`, \`updatedAt\`) VALUES\n`;
    const userRows = users.map(u => 
      `(${esc(u.id)}, ${esc(u.name)}, ${esc(u.email)}, ${esc(u.phone)}, ${esc(u.role)}, ${esc(u.function)}, ${esc(u.signature)}, ${esc(u.password || '123456')}, ${bool(u.active)}, ${esc(u.createdAt || new Date().toISOString())}, ${esc(u.updatedAt || new Date().toISOString())})`
    );
    sql += userRows.join(',\n') + `;\n\n`;
  }

  // 2. TABLE NON_CONFORMITES
  sql += `-- --------------------------------------------------------\n`;
  sql += `-- Structure MySQL de la table \`non_conformites\`\n`;
  sql += `-- --------------------------------------------------------\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`non_conformites\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`createdAt\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`updatedAt\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`shift\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`team\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`supervisor\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`ncDate\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`ncTime\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`detectorName\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`detectorFunction\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`serviceConcerned\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`detectionMethod\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`source\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`productType\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`articleCode\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`articleLabel\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`clients\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`machine\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`quantityKg\` DOUBLE NOT NULL DEFAULT 0,\n`;
  sql += `  \`quantityUnitDetails\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`ofNumber\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`originSection\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`manufacturingDate\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`shortTitle\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`description\` LONGTEXT NOT NULL,\n`;
  sql += `  \`possibleCauses\` LONGTEXT NOT NULL,\n`;
  sql += `  \`decision\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`cause5M\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`whysJson\` LONGTEXT DEFAULT NULL,\n`;
  sql += `  \`ishikawaAnalysis\` LONGTEXT DEFAULT NULL,\n`;
  sql += `  \`smqRiskAttached\` TINYINT(1) NOT NULL DEFAULT 0,\n`;
  sql += `  \`smqRiskRef\` VARCHAR(100) DEFAULT NULL,\n`;
  sql += `  \`actionsJson\` LONGTEXT DEFAULT NULL,\n`;
  sql += `  \`closeMethod\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`closeRef\` VARCHAR(100) DEFAULT NULL,\n`;
  sql += `  \`closeDate\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`closedBy\` VARCHAR(255) DEFAULT NULL,\n`;
  sql += `  \`additionalNotesJson\` LONGTEXT DEFAULT NULL,\n`;
  sql += `  \`attachmentsJson\` LONGTEXT DEFAULT NULL,\n`;
  sql += `  \`signaturesJson\` LONGTEXT DEFAULT NULL,\n`;
  sql += `  PRIMARY KEY (\`id\`),\n`;
  sql += `  KEY \`idx_nc_date\` (\`ncDate\`),\n`;
  sql += `  KEY \`idx_nc_decision\` (\`decision\`),\n`;
  sql += `  KEY \`idx_nc_product\` (\`productType\`),\n`;
  sql += `  KEY \`idx_nc_of\` (\`ofNumber\`)\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  sql += `-- Données de la table \`non_conformites\`\n`;
  if (ncs.length > 0) {
    sql += `INSERT INTO \`non_conformites\` (\n`;
    sql += `  \`id\`, \`createdAt\`, \`updatedAt\`, \`shift\`, \`team\`, \`supervisor\`, \`ncDate\`, \`ncTime\`,\n`;
    sql += `  \`detectorName\`, \`detectorFunction\`, \`serviceConcerned\`, \`detectionMethod\`, \`source\`,\n`;
    sql += `  \`productType\`, \`articleCode\`, \`articleLabel\`, \`clients\`, \`machine\`, \`quantityKg\`,\n`;
    sql += `  \`quantityUnitDetails\`, \`ofNumber\`, \`originSection\`, \`manufacturingDate\`, \`shortTitle\`,\n`;
    sql += `  \`description\`, \`possibleCauses\`, \`decision\`, \`cause5M\`, \`whysJson\`, \`ishikawaAnalysis\`,\n`;
    sql += `  \`smqRiskAttached\`, \`smqRiskRef\`, \`actionsJson\`, \`closeMethod\`, \`closeRef\`, \`closeDate\`,\n`;
    sql += `  \`closedBy\`, \`additionalNotesJson\`, \`attachmentsJson\`, \`signaturesJson\`\n`;
    sql += `) VALUES\n`;
    const ncRows = ncs.map(nc => {
      const whysJson = JSON.stringify(nc.whys || []);
      const ishikawa = nc.ishikawaAnalysis || JSON.stringify(nc.ishikawaCategories || []);
      const actionsJson = JSON.stringify(nc.actions || []);
      const notesJson = JSON.stringify(nc.additionalNotes || []);
      const attachJson = JSON.stringify(nc.attachments || []);
      const sigJson = JSON.stringify(nc.signatures || []);

      return `(${esc(nc.id)}, ${esc(nc.createdAt)}, ${esc(nc.updatedAt)}, ${esc(nc.shift)}, ${esc(nc.team)}, ${esc(nc.supervisor)}, ${esc(nc.ncDate)}, ${esc(nc.ncTime)}, ${esc(nc.detectorName)}, ${esc(nc.detectorFunction)}, ${esc(nc.serviceConcerned)}, ${esc(nc.detectionMethod)}, ${esc(nc.source)}, ${esc(nc.productType)}, ${esc(nc.articleCode)}, ${esc(nc.articleLabel)}, ${esc(nc.clients)}, ${esc(nc.machine)}, ${num(nc.quantityKg)}, ${esc(nc.quantityUnitDetails)}, ${esc(nc.ofNumber)}, ${esc(nc.originSection)}, ${esc(nc.manufacturingDate)}, ${esc(nc.shortTitle)}, ${esc(nc.description)}, ${esc(nc.possibleCauses)}, ${esc(nc.decision)}, ${esc(nc.cause5M)}, ${esc(whysJson)}, ${esc(ishikawa)}, ${bool(nc.smqRiskAttached)}, ${esc(nc.smqRiskRef)}, ${esc(actionsJson)}, ${esc(nc.closeMethod)}, ${esc(nc.closeRef)}, ${esc(nc.closeDate)}, ${esc(nc.closedBy)}, ${esc(notesJson)}, ${esc(attachJson)}, ${esc(sigJson)})`;
    });
    sql += ncRows.join(',\n') + `;\n\n`;
  }

  // 3. TABLE BONS_DE_TRANSFERT
  sql += `-- --------------------------------------------------------\n`;
  sql += `-- Structure MySQL de la table \`bons_de_transfert\`\n`;
  sql += `-- --------------------------------------------------------\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`bons_de_transfert\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`btNumber\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`btType\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`constatDate\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`constatTime\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`sender\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`closeDate\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`ncSheetNumber\` VARCHAR(100) DEFAULT NULL,\n`;
  sql += `  \`returnSheetNumber\` VARCHAR(100) DEFAULT NULL,\n`;
  sql += `  \`actionSheetNumber\` VARCHAR(100) DEFAULT NULL,\n`;
  sql += `  \`productType\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`ofNumber\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`team\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`quantityKg\` DOUBLE NOT NULL DEFAULT 0,\n`;
  sql += `  \`transferSubject\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`packagingZone\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`destination\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`observation\` LONGTEXT DEFAULT NULL,\n`;
  sql += `  \`status\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`createdAt\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`updatedAt\` VARCHAR(50) NOT NULL,\n`;
  sql += `  PRIMARY KEY (\`id\`),\n`;
  sql += `  UNIQUE KEY \`uniq_btNumber\` (\`btNumber\`),\n`;
  sql += `  KEY \`idx_bt_status\` (\`status\`),\n`;
  sql += `  KEY \`idx_bt_date\` (\`constatDate\`)\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  sql += `-- Données de la table \`bons_de_transfert\`\n`;
  if (bts.length > 0) {
    sql += `INSERT INTO \`bons_de_transfert\` (\n`;
    sql += `  \`id\`, \`btNumber\`, \`btType\`, \`constatDate\`, \`constatTime\`, \`sender\`, \`closeDate\`,\n`;
    sql += `  \`ncSheetNumber\`, \`returnSheetNumber\`, \`actionSheetNumber\`, \`productType\`, \`ofNumber\`,\n`;
    sql += `  \`team\`, \`quantityKg\`, \`transferSubject\`, \`packagingZone\`, \`destination\`, \`observation\`,\n`;
    sql += `  \`status\`, \`createdAt\`, \`updatedAt\`\n`;
    sql += `) VALUES\n`;
    const btRows = bts.map(bt => 
      `(${esc(bt.id)}, ${esc(bt.btNumber)}, ${esc(bt.btType)}, ${esc(bt.constatDate)}, ${esc(bt.constatTime)}, ${esc(bt.sender)}, ${esc(bt.closeDate)}, ${esc(bt.ncSheetNumber)}, ${esc(bt.returnSheetNumber)}, ${esc(bt.actionSheetNumber)}, ${esc(bt.productType)}, ${esc(bt.ofNumber)}, ${esc(bt.team)}, ${num(bt.quantityKg)}, ${esc(bt.transferSubject)}, ${esc(bt.packagingZone)}, ${esc(bt.destination)}, ${esc(bt.observation)}, ${esc(bt.status)}, ${esc(bt.createdAt)}, ${esc(bt.updatedAt)})`
    );
    sql += btRows.join(',\n') + `;\n\n`;
  }

  // 4. TABLE RECLAMATIONS_CLIENTS
  sql += `-- --------------------------------------------------------\n`;
  sql += `-- Structure MySQL de la table \`reclamations_clients\`\n`;
  sql += `-- --------------------------------------------------------\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`reclamations_clients\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`clientName\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`contactPhone\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`orderNumber\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`reclamationDate\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`channel\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`estimatedCostFcfa\` DOUBLE NOT NULL DEFAULT 0,\n`;
  sql += `  \`compensationGranted\` LONGTEXT DEFAULT NULL,\n`;
  sql += `  \`shortDescription\` LONGTEXT NOT NULL,\n`;
  sql += `  \`associatedNcId\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`status\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`createdAt\` VARCHAR(50) NOT NULL,\n`;
  sql += `  PRIMARY KEY (\`id\`),\n`;
  sql += `  KEY \`idx_client_name\` (\`clientName\`),\n`;
  sql += `  KEY \`idx_client_status\` (\`status\`)\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  sql += `-- Données de la table \`reclamations_clients\`\n`;
  if (complaints.length > 0) {
    sql += `INSERT INTO \`reclamations_clients\` (\n`;
    sql += `  \`id\`, \`clientName\`, \`contactPhone\`, \`orderNumber\`, \`reclamationDate\`, \`channel\`,\n`;
    sql += `  \`estimatedCostFcfa\`, \`compensationGranted\`, \`shortDescription\`, \`associatedNcId\`, \`status\`, \`createdAt\`\n`;
    sql += `) VALUES\n`;
    const complaintRows = complaints.map(c => 
      `(${esc(c.id)}, ${esc(c.clientName)}, ${esc(c.contactPhone)}, ${esc(c.orderNumber)}, ${esc(c.reclamationDate)}, ${esc(c.channel)}, ${num(c.estimatedCostFcfa)}, ${esc(c.compensationGranted)}, ${esc(c.shortDescription)}, ${esc(c.associatedNcId)}, ${esc(c.status)}, ${esc(c.createdAt)})`
    );
    sql += complaintRows.join(',\n') + `;\n\n`;
  }

  // 5. TABLE JOURNAL_AUDIT
  sql += `-- --------------------------------------------------------\n`;
  sql += `-- Structure MySQL de la table \`journal_audit\`\n`;
  sql += `-- --------------------------------------------------------\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`journal_audit\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`timestamp\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`userId\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`userName\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`userRole\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`action\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`module\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`targetId\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`details\` LONGTEXT NOT NULL,\n`;
  sql += `  PRIMARY KEY (\`id\`),\n`;
  sql += `  KEY \`idx_audit_time\` (\`timestamp\`),\n`;
  sql += `  KEY \`idx_audit_user\` (\`userId\`)\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  sql += `-- Données de la table \`journal_audit\`\n`;
  if (auditLogs.length > 0) {
    sql += `INSERT INTO \`journal_audit\` (\`id\`, \`timestamp\`, \`userId\`, \`userName\`, \`userRole\`, \`action\`, \`module\`, \`targetId\`, \`details\`) VALUES\n`;
    const logRows = auditLogs.map(a => 
      `(${esc(a.id)}, ${esc(a.timestamp)}, ${esc(a.userId)}, ${esc(a.userName)}, ${esc(a.userRole)}, ${esc(a.action)}, ${esc(a.module)}, ${esc(a.targetId)}, ${esc(a.details)})`
    );
    sql += logRows.join(',\n') + `;\n\n`;
  }

  // 6. TABLE NOTIFICATIONS_MAIL
  sql += `-- --------------------------------------------------------\n`;
  sql += `-- Structure MySQL de la table \`notifications_mail\`\n`;
  sql += `-- --------------------------------------------------------\n`;
  sql += `CREATE TABLE IF NOT EXISTS \`notifications_mail\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`timestamp\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`recipientName\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`recipientEmail\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`subject\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`body\` LONGTEXT NOT NULL,\n`;
  sql += `  \`status\` VARCHAR(50) NOT NULL,\n`;
  sql += `  PRIMARY KEY (\`id\`),\n`;
  sql += `  KEY \`idx_notif_time\` (\`timestamp\`)\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  if (notifications && notifications.length > 0) {
    sql += `-- Données de la table \`notifications_mail\`\n`;
    sql += `INSERT INTO \`notifications_mail\` (\`id\`, \`timestamp\`, \`recipientName\`, \`recipientEmail\`, \`subject\`, \`body\`, \`status\`) VALUES\n`;
    const notifRows = notifications.map(n => 
      `(${esc(n.id)}, ${esc(n.timestamp)}, ${esc(n.recipientName)}, ${esc(n.recipientEmail)}, ${esc(n.subject)}, ${esc(n.body)}, ${esc(n.status)})`
    );
    sql += notifRows.join(',\n') + `;\n\n`;
  }

  sql += `COMMIT;\n`;
  return sql;
}

export function triggerDownloadSQL(sqlContent: string, filename: string = 'solupack_quality_mysql.sql'): void {
  const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
