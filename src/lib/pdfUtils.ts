import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates an A4 PDF from any DOM element and forces an immediate automatic file download
 * directly into the browser's Downloads folder.
 */
export async function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  // Preserve original inline styles
  const originalStyle = element.style.cssText;
  
  // Temporarily force full expansion, remove scrollbar constraints and set white background
  element.style.height = 'auto';
  element.style.maxHeight = 'none';
  element.style.overflow = 'visible';
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';

  // Hide non-printable elements
  const noPrintElements = element.querySelectorAll('.no-print');
  noPrintElements.forEach(el => {
    (el as HTMLElement).style.display = 'none';
  });

  try {
    // Render the element to canvas at high resolution
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for crisp typography
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Create A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 8; // 8mm margin
    const usableWidth = pdfWidth - (margin * 2); // 194mm
    const usableHeight = pdfHeight - (margin * 2); // 281mm

    // Calculate height per page on canvas
    const canvasPageHeight = (canvas.width * usableHeight) / usableWidth;
    let currentY = 0;
    let pageIndex = 0;

    while (currentY < canvas.height) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      // Slice portion of canvas for current page
      const sliceHeight = Math.min(canvasPageHeight, canvas.height - currentY);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0, currentY, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight
        );
      }

      const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      const sliceMmHeight = (sliceHeight * usableWidth) / canvas.width;

      pdf.addImage(sliceImgData, 'JPEG', margin, margin, usableWidth, sliceMmHeight, undefined, 'FAST');

      currentY += canvasPageHeight;
      pageIndex++;
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Save generated PDF once
    pdf.save(cleanFilename);

  } catch (error) {
    console.error('Erreur lors de la génération du PDF :', error);
    try {
      window.print();
    } catch {
      // ignore print error
    }
  } finally {
    // Restore original styles
    element.style.cssText = originalStyle;
    noPrintElements.forEach(el => {
      (el as HTMLElement).style.display = '';
    });
  }
}

