import { jsPDF } from 'jspdf';
import { Participant, CertificateTheme, DocumentCategoryId, UploadedDocument } from '../types';
import { DOCUMENT_CATEGORIES } from '../data/categories';

interface GenerateOptions {
  submissionTitle?: string;
  theme?: CertificateTheme;
  signatory1Name?: string;
  signatory1Title?: string;
  signatory2Name?: string;
  signatory2Title?: string;
  organization?: string;
  documents?: Record<DocumentCategoryId, UploadedDocument | null>;
}

// Color palettes for themes
const THEME_COLORS: Record<CertificateTheme, {
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  seal: [number, number, number];
  border: [number, number, number];
  bgLight: [number, number, number];
}> = {
  gold: {
    primary: [30, 41, 59],      // slate-800
    secondary: [146, 64, 14],   // amber-800
    accent: [217, 119, 6],      // amber-600
    seal: [180, 83, 9],         // amber-700
    border: [202, 138, 4],      // yellow-600
    bgLight: [255, 251, 235],   // amber-50
  },
  navy: {
    primary: [15, 23, 42],      // slate-900
    secondary: [30, 58, 138],   // blue-900
    accent: [2, 132, 199],      // sky-600
    seal: [29, 78, 216],        // blue-700
    border: [37, 99, 235],      // blue-600
    bgLight: [240, 249, 255],   // sky-50
  },
  emerald: {
    primary: [6, 78, 59],       // emerald-900
    secondary: [4, 120, 87],    // emerald-700
    accent: [5, 150, 105],      // emerald-600
    seal: [16, 185, 129],       // emerald-500
    border: [5, 150, 105],      // emerald-600
    bgLight: [236, 253, 245],   // emerald-50
  },
  crimson: {
    primary: [136, 19, 55],     // rose-900
    secondary: [159, 18, 57],   // rose-800
    accent: [225, 29, 72],      // rose-600
    seal: [190, 18, 60],        // rose-700
    border: [225, 29, 72],      // rose-600
    bgLight: [255, 241, 242],   // rose-50
  },
};

function drawCertificatePage(
  doc: jsPDF,
  participant: Participant,
  options: GenerateOptions,
  isFirstPage = true
) {
  if (!isFirstPage) {
    doc.addPage('a4', 'landscape');
  }

  const width = doc.internal.pageSize.getWidth();   // 297 mm
  const height = doc.internal.pageSize.getHeight(); // 210 mm
  const theme = options.theme || 'gold';
  const colors = THEME_COLORS[theme];

  // 1. Subtle Paper Background Fill
  doc.setFillColor(254, 254, 252);
  doc.rect(0, 0, width, height, 'F');

  // Background delicate watermark frame
  doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
  doc.roundedRect(8, 8, width - 16, height - 16, 4, 4, 'F');

  // 2. Outer Ornamental Border
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(1.8);
  doc.roundedRect(12, 12, width - 24, height - 24, 3, 3, 'D');

  // 3. Inner Decorative Border
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, 15, width - 30, height - 30, 2, 2, 'D');

  // Corner decorative flourishes
  const cornerSize = 10;
  const corners = [
    [15, 15],
    [width - 15, 15],
    [15, height - 15],
    [width - 15, height - 15],
  ];
  doc.setLineWidth(1.2);
  corners.forEach(([cx, cy]) => {
    doc.circle(cx, cy, 2.5, 'FD');
  });

  // 4. Header & Organization
  const orgName = options.organization || participant.organization || 'AI WORKSHOP PROGRAM';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(orgName.toUpperCase(), width / 2, 26, { align: 'center' });

  // Sub-header rule
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(0.4);
  doc.line(width / 2 - 50, 29, width / 2 + 50, 29);

  // 5. Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('CERTIFICATE OF COMPLETION', width / 2, 40, { align: 'center' });

  // 6. Sub-title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text('OFFICIAL VERIFIED CERTIFICATION', width / 2, 46, { align: 'center' });

  // 7. "This is proudly presented to"
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text('This is to certify that', width / 2, 56, { align: 'center' });

  // 8. Participant Name (Prominent)
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(participant.fullName, width / 2, 68, { align: 'center' });

  // Name underline
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.8);
  const nameWidth = Math.max(doc.getTextWidth(participant.fullName) + 20, 80);
  doc.line(width / 2 - nameWidth / 2, 71, width / 2 + nameWidth / 2, 71);

  // 9. Participant Designation & Department
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  const designationLine = `${participant.designation} • ${participant.department}`;
  doc.text(designationLine, width / 2, 77, { align: 'center' });

  // 10. Main Certificate Body Statement
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const bodyText =
    'has successfully compiled, submitted, and completed all 9 core statutory and technical modules. All submissions and practical exercises have been verified with complete technical compliance:';
  
  const splitBody = doc.splitTextToSize(bodyText, width - 60);
  doc.text(splitBody, width / 2, 85, { align: 'center' });

  // 11. Document Category Badges (9 Items Grid: 3 columns x 3 rows)
  const gridStartX = 24;
  const gridStartY = 96;
  const colWidth = (width - 48) / 3;
  const rowHeight = 11.5;

  DOCUMENT_CATEGORIES.forEach((cat, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = gridStartX + col * colWidth;
    const y = gridStartY + row * rowHeight;

    // Small rounded card for each category
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 2, y, colWidth - 4, 9.5, 1.5, 1.5, 'FD');

    // Verification checkmark circle
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.circle(x + 6.5, y + 4.75, 2.2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('✓', x + 5.7, y + 6.2);

    // Number code & Category Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(cat.title, x + 11, y + 6.2);

    // Verified tag on right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(16, 185, 129);
    doc.text('VERIFIED', x + colWidth - 16, y + 6.2);
  });

  // 12. Bottom Section: Left Metadata, Center Seal, Right Single Signature (Thiru . Vishu Mahajan I.A.S)
  const bottomY = 148;

  // Left: Security & Serial details (No QR code)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CERTIFICATE ID:', 24, bottomY);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(participant.certificateNumber, 24, bottomY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issue Date: ${participant.issueDate}`, 24, bottomY + 11);
  doc.text(`Verification Hash: ${participant.verificationCode}`, 24, bottomY + 16);
  
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.setLineWidth(0.3);
  doc.roundedRect(24, bottomY + 20, 52, 6, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(22, 101, 52);
  doc.text('✓ Authenticated & Digitally Certified', 26, bottomY + 24.2);

  // Center: Official Emblem / Seal
  const sealCenterX = width / 2;
  const sealCenterY = bottomY + 14;

  // Outer scalloped ring
  doc.setDrawColor(colors.seal[0], colors.seal[1], colors.seal[2]);
  doc.setLineWidth(1.2);
  doc.circle(sealCenterX, sealCenterY, 15, 'D');
  doc.setLineWidth(0.4);
  doc.circle(sealCenterX, sealCenterY, 13.5, 'D');
  
  // Seal center fill
  doc.setFillColor(colors.seal[0], colors.seal[1], colors.seal[2]);
  doc.circle(sealCenterX, sealCenterY, 11, 'F');

  // Seal inner text
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(6.5);
  doc.text('OFFICIAL', sealCenterX, sealCenterY - 3, { align: 'center' });
  doc.setFontSize(8.5);
  doc.text('SEAL', sealCenterX, sealCenterY + 2, { align: 'center' });
  doc.setFontSize(5);
  doc.text('AUTHENTICATED', sealCenterX, sealCenterY + 6, { align: 'center' });

  // Seal ribbon streamers
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.triangle(
    sealCenterX - 8, sealCenterY + 13,
    sealCenterX - 3, sealCenterY + 13,
    sealCenterX - 6, sealCenterY + 23,
    'F'
  );
  doc.triangle(
    sealCenterX + 3, sealCenterY + 13,
    sealCenterX + 8, sealCenterY + 13,
    sealCenterX + 6, sealCenterY + 23,
    'F'
  );

  // Right: Single Signature (Thiru . Vishu Mahajan I.A.S)
  const sigX = width - 55;
  const sigLineY = bottomY + 18;

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.6);
  doc.line(sigX - 35, sigLineY, sigX + 35, sigLineY);

  // Script signature text
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('Vishu Mahajan', sigX, sigLineY - 3, { align: 'center' });

  const singleSignerName = options.signatory1Name || 'Thiru . Vishu Mahajan I.A.S';
  const singleSignerTitle = options.signatory1Title || 'Authorized Signatory';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(singleSignerName, sigX, sigLineY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(singleSignerTitle, sigX, sigLineY + 9.5, { align: 'center' });

  // Bottom tiny verification disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is a digitally generated and cryptographically verifiable certificate issued upon successful completion of all 9 modules.',
    width / 2,
    height - 14,
    { align: 'center' }
  );
}

// Generate Group Master Roster Certificate Page
function drawGroupMasterRosterPage(
  doc: jsPDF,
  participants: Participant[],
  options: GenerateOptions,
  isFirstPage = true
) {
  if (!isFirstPage) {
    doc.addPage('a4', 'landscape');
  }

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const theme = options.theme || 'gold';
  const colors = THEME_COLORS[theme];

  // Background
  doc.setFillColor(254, 254, 252);
  doc.rect(0, 0, width, height, 'F');
  doc.setFillColor(colors.bgLight[0], colors.bgLight[1], colors.bgLight[2]);
  doc.roundedRect(8, 8, width - 16, height - 16, 4, 4, 'F');

  // Borders
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(1.8);
  doc.roundedRect(12, 12, width - 24, height - 24, 3, 3, 'D');

  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, 15, width - 30, height - 30, 2, 2, 'D');

  // Header
  const orgName = options.organization || 'AI WORKSHOP PROGRAM';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(orgName.toUpperCase(), width / 2, 24, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('GROUP COMPLETION & ENDORSEMENT CERTIFICATE', width / 2, 34, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Official Group Record • Total ${participants.length} Certified Participants • All 9 Modules Completed`,
    width / 2,
    40,
    { align: 'center' }
  );

  // Group Roster Table Header
  const tableX = 22;
  let tableY = 48;
  const colWidths = [12, 60, 65, 65, 45]; // Total = 247mm

  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.rect(tableX, tableY, width - 44, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('#', tableX + 4, tableY + 5.5);
  doc.text('FULL NAME', tableX + colWidths[0] + 4, tableY + 5.5);
  doc.text('DESIGNATION', tableX + colWidths[0] + colWidths[1] + 4, tableY + 5.5);
  doc.text('DEPARTMENT / ORG', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 4, tableY + 5.5);
  doc.text('CERTIFICATE NUMBER', tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 4, tableY + 5.5);

  tableY += 8;

  // Render Table Rows (up to 8 participants on master sheet)
  participants.slice(0, 8).forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(tableX, tableY, width - 44, 8.5, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(tableX, tableY, width - 44, 8.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(String(idx + 1), tableX + 4, tableY + 6);

    doc.text(p.fullName, tableX + colWidths[0] + 4, tableY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(p.designation, tableX + colWidths[0] + colWidths[1] + 4, tableY + 6);
    doc.text(`${p.department} (${p.organization})`, tableX + colWidths[0] + colWidths[1] + colWidths[2] + 4, tableY + 6);

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(p.certificateNumber, tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 4, tableY + 6);

    tableY += 8.5;
  });

  // Checklist of 9 Documents Verified
  const checkY = tableY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('Mandatory 9-Module Verification Audit Status:', tableX, checkY);

  const docPillWidth = (width - 44) / 3;
  DOCUMENT_CATEGORIES.forEach((cat, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const px = tableX + col * docPillWidth;
    const py = checkY + 3 + row * 7.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(px, py, docPillWidth - 3, 6, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(16, 185, 129);
    doc.text('[COMPLIANT]', px + 2, py + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(cat.title, px + 22, py + 4.2);
  });

  // Footer: Left Official Status & Right Single Signature
  const footerY = height - 30;
  
  // Left: Verification status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('OFFICIAL RECORD CLEARANCE:', tableX, footerY + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Authenticated Roster • Date: ${new Date().toLocaleDateString()}`, tableX, footerY + 6);
  doc.text('Status: All listed participants verified and cleared for certification', tableX, footerY + 10);

  // Right: Single Signature
  const sigX = width - tableX - 35;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(sigX - 30, footerY + 2, sigX + 30, footerY + 2);

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text('Vishu Mahajan', sigX, footerY - 1, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(options.signatory1Name || 'Thiru . Vishu Mahajan I.A.S', sigX, footerY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(options.signatory1Title || 'Authorized Signatory', sigX, footerY + 10, { align: 'center' });
}

export function generateSingleCertificatePDF(
  participant: Participant,
  options: GenerateOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  drawCertificatePage(doc, participant, options, true);
  return doc;
}

export function generateGroupCertificatesPDF(
  participants: Participant[],
  options: GenerateOptions = {},
  includeMasterRoster = true
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  let isFirst = true;

  // If requested, include group master endorsement sheet first
  if (includeMasterRoster) {
    drawGroupMasterRosterPage(doc, participants, options, true);
    isFirst = false;
  }

  // Generate an individual certificate for EVERY participant in the group
  participants.forEach((participant) => {
    drawCertificatePage(doc, participant, options, isFirst);
    isFirst = false;
  });

  return doc;
}

export function downloadSingleCertificate(
  participant: Participant,
  options: GenerateOptions = {}
) {
  const doc = generateSingleCertificatePDF(participant, options);
  const cleanName = participant.fullName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Certificate_${cleanName}_${participant.certificateNumber}.pdf`);
}

export function downloadGroupCertificatesBundle(
  participants: Participant[],
  options: GenerateOptions = {},
  groupName = 'AI_Workshop_Group'
) {
  const doc = generateGroupCertificatesPDF(participants, options, true);
  const cleanGroup = groupName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Individual_Certificates_Bundle_${cleanGroup}.pdf`);
}
