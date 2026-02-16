/**
 * Certified Concealed — Complete E-Book Generator
 * Merges ALL 22 chapters into a single DOCX file
 * 
 * Usage: node generate-complete.js
 */

const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = require("docx");

// ============================================================
// FORMATTING HELPERS — Match Certified Concealed spec exactly
// ============================================================

/** Chapter number line: "Chapter X" — Georgia 11pt Bold */
function chapterNumber(text, pageBreak = false) {
  return new Paragraph({
    pageBreakBefore: pageBreak,
    spacing: { before: 360, after: 240 },
    children: [new TextRun({ text, font: "Georgia", bold: true, size: 22 })],
  });
}

/** Chapter title — Georgia 15pt Bold */
function chapterTitle(text) {
  return new Paragraph({
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text, font: "Georgia", bold: true, size: 30 })],
  });
}

/** Section heading — Georgia 15pt Bold */
function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text, font: "Georgia", bold: true, size: 30 })],
  });
}

/** Body text paragraph — Georgia 12pt, 1.5 line spacing */
function bodyText(text) {
  return new Paragraph({
    spacing: { after: 200, line: 360 },
    children: [new TextRun({ text, font: "Georgia", size: 24 })],
  });
}

/** Image placeholder — Georgia 11pt Italic Grey, centered */
function imagePlaceholder(text) {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: `[IMAGE: ${text}]`,
      font: "Georgia", italics: true, color: "666666", size: 22,
    })],
  });
}

/** Key Takeaway callout box — grey left border, indented, bold italic */
function calloutBox(text) {
  return new Paragraph({
    border: { left: { style: BorderStyle.SINGLE, color: "999999", size: 6, space: 10 } },
    spacing: { before: 300, after: 300 },
    indent: { left: 720, right: 720 },
    children: [new TextRun({
      text: `Key Takeaway: ${text}`,
      font: "Georgia", bold: true, italics: true, size: 26,
    })],
  });
}

/** Title page */
function createTitlePage() {
  return [
    new Paragraph({
      spacing: { before: 5000, after: 400 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: "KNOW YOUR AMMO", 
        font: "Georgia", bold: true, size: 56 
      })],
    }),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: "The Complete Self-Defense Ammunition Guide", 
        font: "Georgia", size: 32 
      })],
    }),
    new Paragraph({
      spacing: { before: 3000, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: "CERTIFIED CONCEALED", 
        font: "Georgia", bold: true, size: 24 
      })],
    }),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: "2026 Edition", 
        font: "Georgia", size: 20 
      })],
    }),
  ];
}

// ============================================================
// MARKDOWN PARSER
// ============================================================

function parseChapterMarkdown(markdown, addPageBreak = true) {
  const lines = markdown.split("\n");
  const paragraphs = [];
  let i = 0;
  let foundChapterNum = false;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    // Chapter number: **Chapter XX**
    if (/^\*\*Chapter \d+\*\*$/.test(line)) {
      const text = line.replace(/\*\*/g, "");
      paragraphs.push(chapterNumber(text, addPageBreak && !foundChapterNum));
      foundChapterNum = true;
      i++;
      continue;
    }

    // Key Takeaway box: > ***Key Takeaway: ...***
    if (line.startsWith("> ***Key Takeaway:") || line.startsWith("> *Key Takeaway:") || line.startsWith(">***Key Takeaway:")) {
      let callText = line;
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith(">")) {
        i++;
        callText += " " + lines[i].trim().replace(/^>\s*/, "");
      }
      callText = callText
        .replace(/^>\s*\*{1,3}\s*Key Takeaway:\s*/, "")
        .replace(/\*{1,3}$/, "")
        .replace(/\\'/g, "\u2019")
        .replace(/'/g, "\u2019")
        .trim();
      paragraphs.push(calloutBox(callText));
      i++;
      continue;
    }

    // Skip standalone ">"
    if (line === ">") { i++; continue; }

    // Image placeholder: *[IMAGE: ...]* or *\[IMAGE: ...]*
    if (line.startsWith("*[IMAGE:") || line.startsWith("*\\[IMAGE:")) {
      let imgText = line;
      while (i + 1 < lines.length && !imgText.endsWith("]*") && !imgText.endsWith("\\]*")) {
        i++;
        imgText += " " + lines[i].trim();
      }
      imgText = imgText
        .replace(/^\*\\\[IMAGE:\s*/, "").replace(/\\\]\*$/, "")
        .replace(/^\*\[IMAGE:\s*/, "").replace(/\]\*$/, "")
        .replace(/\\/g, "").replace(/\s+/g, " ").trim();
      paragraphs.push(imagePlaceholder(imgText));
      i++;
      continue;
    }

    // Bold standalone line = heading or title
    if (/^\*\*[^*]+\*\*$/.test(line)) {
      const text = line.replace(/\*\*/g, "");
      // If previous element was a chapter number, this is the title
      if (paragraphs.length > 0 && foundChapterNum && paragraphs.length === 1) {
        paragraphs.push(chapterTitle(text));
      } else {
        paragraphs.push(sectionHeading(text));
      }
      i++;
      continue;
    }

    // Body text — collect full paragraph
    if (line && !line.startsWith("**") && !line.startsWith("*[") && !line.startsWith("*\\[") && !line.startsWith(">")) {
      let paraText = line;
      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (!nextLine || nextLine.startsWith("**") || nextLine.startsWith("*[") ||
            nextLine.startsWith("*\\[") || nextLine.startsWith(">")) break;
        i++;
        paraText += " " + nextLine;
      }
      // Clean markdown artifacts
      paraText = paraText
        .replace(/\\'/g, "\u2019")
        .replace(/'/g, "\u2019")
        .replace(/\\"/g, '"')
        .replace(/\\/g, "")
        .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1");
      paragraphs.push(bodyText(paraText));
      i++;
      continue;
    }

    i++;
  }

  return paragraphs;
}

// ============================================================
// MAIN GENERATOR
// ============================================================

async function generateCompleteBook() {
  console.log("\n📖 GENERATING COMPLETE KNOW YOUR AMMO E-BOOK\n");
  console.log("═".repeat(60));

  const allParagraphs = [];

  // Title page
  console.log("\n✓ Creating title page...");
  allParagraphs.push(...createTitlePage());

  // Process all 22 chapters
  for (let chNum = 1; chNum <= 22; chNum++) {
    const padded = String(chNum).padStart(2, "0");
    const filePath = path.join(__dirname, "chapters", `chapter_${padded}.md`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ ERROR: Chapter ${chNum} not found at ${filePath}`);
      process.exit(1);
    }

    const markdown = fs.readFileSync(filePath, "utf8");
    const chapterParas = parseChapterMarkdown(markdown, true); // page break before each chapter
    allParagraphs.push(...chapterParas);
    console.log(`✓ Chapter ${chNum}: ${chapterParas.length} paragraphs`);
  }

  console.log("\n" + "═".repeat(60));
  console.log(`\n📊 TOTAL: ${allParagraphs.length} paragraphs across 22 chapters\n`);

  // Build document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter (8.5" × 11")
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1" all sides
        },
      },
      children: allParagraphs,
    }],
  });

  // Save to output
  const outputPath = path.join(__dirname, "output", "KnowYourAmmo_Complete.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  const sizeKB = (buffer.length / 1024).toFixed(1);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

  console.log("═".repeat(60));
  console.log(`\n✅ SUCCESS!`);
  console.log(`\n📄 File: ${outputPath}`);
  console.log(`📏 Size: ${sizeKB} KB (${sizeMB} MB)`);
  console.log(`📝 Paragraphs: ${allParagraphs.length}`);
  console.log(`\n✨ All 22 chapters merged into one complete e-book!\n`);
}

// Run it
generateCompleteBook().catch(err => {
  console.error("\n❌ ERROR:", err);
  process.exit(1);
});
