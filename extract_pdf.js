/**
 * Extract text from the source PDF.
 * 
 * Usage: node extract_pdf.js
 * 
 * Reads: source/know-your-ammo.pdf
 * Writes: source-text/full_text.md
 * 
 * After extraction, you'll need to manually split into chapter files
 * or ask Claude in Cursor to help split them.
 */

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

async function extractPDF() {
  const pdfPath = path.join(__dirname, "source", "know-your-ammo.pdf");

  if (!fs.existsSync(pdfPath)) {
    console.error(`\n❌ PDF not found at: ${pdfPath}`);
    console.error(`\nPlease copy your PDF to the source/ folder and name it "know-your-ammo.pdf"`);
    console.error(`Or update the filename in this script.\n`);
    process.exit(1);
  }

  console.log(`\nReading PDF: ${pdfPath}`);
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);

  console.log(`Pages: ${data.numpages}`);
  console.log(`Characters: ${data.text.length.toLocaleString()}`);

  // Clean up extracted text
  let text = data.text;

  // Fix common PDF extraction issues
  text = text
    // Fix broken words at line breaks (hyphenation)
    .replace(/(\w)-\n(\w)/g, "$1$2")
    // Normalize multiple blank lines
    .replace(/\n{4,}/g, "\n\n\n")
    // Fix spaces before punctuation
    .replace(/ ([.,;:!?])/g, "$1");

  // Save full text
  const outputDir = path.join(__dirname, "source-text");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "full_text.md");
  fs.writeFileSync(outputPath, text, "utf8");

  console.log(`\n✅ Extracted to: ${outputPath}`);
  console.log(`\nNext steps:`);
  console.log(`1. Open source-text/full_text.md and review the extracted text`);
  console.log(`2. Split into chapter files: chapter_01.md, chapter_02.md, etc.`);
  console.log(`3. You can ask Claude in Cursor to help split: "Read source-text/full_text.md and split into chapter files"`);
  console.log(``);

  // Try to detect chapter boundaries
  const chapterMatches = text.match(/chapter\s+\d+/gi);
  if (chapterMatches) {
    console.log(`Detected ${chapterMatches.length} potential chapter markers:`);
    const unique = [...new Set(chapterMatches.map(m => m.toLowerCase()))];
    unique.forEach(m => console.log(`  - ${m}`));
  }
}

extractPDF().catch(err => {
  console.error("Extraction failed:", err.message);
  process.exit(1);
});
