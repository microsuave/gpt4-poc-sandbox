import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

export async function splitIntoPages(pathToPdf: string) {
  const docmentAsBytes = await fs.promises.readFile(pathToPdf);

  

  // Load your PDFDocument
  const pdfDoc = await PDFDocument.load(docmentAsBytes);

  const numberOfPages = pdfDoc.getPages().length;

  console.log({numberOfPages})

  for (let i = 0; i < numberOfPages; i++) {
    // Create a new "sub" document
    const subDocument = await PDFDocument.create();
    // copy the page at current index
    const [copiedPage] = await subDocument.copyPages(pdfDoc, [i]);
    subDocument.addPage(copiedPage);
    const pdfBytes = await subDocument.save();
    await writePdfBytesToFile(`pages/page-${i + 1}.pdf`, pdfBytes);
  }
}

function writePdfBytesToFile(fileName: string, pdfBytes: Uint8Array) {
  return fs.promises.writeFile(fileName, pdfBytes);
}
