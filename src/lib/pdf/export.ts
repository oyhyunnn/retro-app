import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format, parseISO } from "date-fns";

import type { Retrospective } from "@/types/retro";

function sanitizeFilename(s: string): string {
  return (
    s
      .replace(/[\\/:*?"<>|\n\r\t]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "retro"
  );
}

interface ExportOptions {
  retro: Retrospective;
  element: HTMLElement;
}

export async function exportRetroToPDF({
  retro,
  element,
}: ExportOptions): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#FFFFFF",
    useCORS: true,
    imageTimeout: 0,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height / canvas.width) * imgWidth;
  const usablePage = pageHeight - margin * 2;

  if (imgHeight <= usablePage) {
    pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
  } else {
    let heightLeft = imgHeight;
    let position = margin;
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= usablePage;

    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= usablePage;
    }
  }

  const dateStr = (() => {
    try {
      return format(parseISO(retro.retroDate), "yyyyMMdd");
    } catch {
      return format(new Date(), "yyyyMMdd");
    }
  })();

  pdf.save(`${sanitizeFilename(retro.title)}_${dateStr}.pdf`);
}
