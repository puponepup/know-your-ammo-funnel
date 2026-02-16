/**
 * Certified Concealed — DOCX Generator
 * 
 * Usage:
 *   node generate.js --part 1 --chapters 1,2,3,4,5 --title "Ammunition Foundations"
 * 
 * Or import the helpers in Cursor and let Claude build the document:
 *   const { buildChapter, partDivider, createDocument } = require('./generate');
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

/** Part divider page — centered, large text */
function partDivider(partNum, subtitle) {
  return [
    new Paragraph({
      pageBreakBefore: true,
      spacing: { before: 4000, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `PART ${partNum}`, font: "Georgia", bold: true, size: 48 })],
    }),
    new Paragraph({
      spacing: { before: 200, after: 400 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: subtitle.toUpperCase(), font: "Georgia", bold: true, size: 36 })],
    }),
  ];
}

// ============================================================
// MARKDOWN PARSER — Converts chapter .md files to paragraph arrays
// ============================================================

/**
 * Parse a rewritten chapter markdown file into an array of paragraph objects.
 * Expected format:
 *   **Chapter X**
 *   **Title Here**
 *   *[IMAGE: description]*
 *   Body text...
 *   **Section Heading**
 *   More body...
 *   > ***Key Takeaway: text***
 */
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
    if (line.startsWith("> ***Key Takeaway:") || line.startsWith("> *Key Takeaway:")) {
      let callText = line;
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith(">")) {
        i++;
        callText += " " + lines[i].trim().replace(/^>\s*/, "");
      }
      callText = callText
        .replace(/^>\s*\*{1,3}Key Takeaway:\s*/, "")
        .replace(/\*{1,3}$/, "")
        .replace(/\\'/g, "\u2019")
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
      if (paragraphs.length > 0) {
        const last = paragraphs[paragraphs.length - 1];
        // Check if the last paragraph's text content starts with "Chapter"
        const lastText = last.root?.[1]?.root?.[0]?.root?.[1] || "";
        if (typeof lastText === "string" && lastText.startsWith && lastText.startsWith("Chapter")) {
          paragraphs.push(chapterTitle(text));
        } else {
          paragraphs.push(sectionHeading(text));
        }
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
        .replace(/\\"/g, '"')
        .replace(/\\/g, "")
        .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1");
      paragraphs.push(bodyText(paraText));
      i++;
      continue;
    }

    i++;
  }

  // Fix: if second element looks like a section heading right after chapter number, make it title
  if (paragraphs.length >= 2) {
    // Simple heuristic: check the text content
    const firstRun = paragraphs[0]?.root;
    if (firstRun) {
      // Just mark second paragraph as title if first is chapter number
      // This is handled by the parser above, but as a safety net:
    }
  }

  return paragraphs;
}

// ============================================================
// DOCUMENT BUILDER
// ============================================================

/**
 * Create a complete .docx document from parsed chapters.
 * 
 * @param {Object} options
 * @param {number} options.partNumber — Part number (I, II, III, IV, V)
 * @param {string} options.partTitle — Part subtitle (e.g., "Ammunition Foundations")
 * @param {string[]} options.chapterFiles — Array of file paths to chapter .md files
 * @param {string} options.outputPath — Where to save the .docx
 */
async function createDocument({ partNumber, partTitle, chapterFiles, outputPath }) {
  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const partRoman = romanNumerals[partNumber - 1] || String(partNumber);

  const allParagraphs = [];

  // Part divider page
  allParagraphs.push(...partDivider(partRoman, partTitle));

  // Process each chapter
  for (let i = 0; i < chapterFiles.length; i++) {
    const filePath = chapterFiles[i];
    if (!fs.existsSync(filePath)) {
      console.error(`WARNING: File not found: ${filePath}`);
      continue;
    }
    const markdown = fs.readFileSync(filePath, "utf8");
    const chapterParas = parseChapterMarkdown(markdown, true); // always page break before chapter
    allParagraphs.push(...chapterParas);
    console.log(`  ✓ Processed: ${path.basename(filePath)} (${chapterParas.length} paragraphs)`);
  }

  // Build document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1" all sides
        },
      },
      children: allParagraphs,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`\n✅ Generated: ${outputPath} (${(buffer.length / 1024).toFixed(0)} KB, ${allParagraphs.length} paragraphs)`);
}

// ============================================================
// CLI INTERFACE
// ============================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse --part N --chapters 1,2,3,4,5 --title "Title"
  let partNum = 1;
  let chapterNums = [];
  let title = "Untitled";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--part") partNum = parseInt(args[++i]);
    if (args[i] === "--chapters") chapterNums = args[++i].split(",").map(Number);
    if (args[i] === "--title") title = args[++i];
  }

  if (chapterNums.length === 0) {
    console.log(`
Certified Concealed — DOCX Generator

Usage:
  node generate.js --part 1 --chapters 1,2,3,4,5 --title "Ammunition Foundations"

Options:
  --part N          Part number (1-5)
  --chapters X,Y,Z  Chapter numbers to include
  --title "..."     Part subtitle

Example:
  node generate.js --part 1 --chapters 1,2,3,4,5 --title "Ammunition Foundations"
  → Reads chapters/chapter_01.md through chapter_05.md
  → Generates output/KnowYourAmmo_Part1.docx
    `);
    process.exit(0);
  }

  const chapterFiles = chapterNums.map(n => {
    const padded = String(n).padStart(2, "0");
    return path.join(__dirname, "chapters", `chapter_${padded}.md`);
  });

  const outputPath = path.join(__dirname, "output", `KnowYourAmmo_Part${partNum}.docx`);

  console.log(`\nGenerating Part ${partNum}: "${title}"`);
  console.log(`Chapters: ${chapterNums.join(", ")}\n`);

  createDocument({ partNumber: partNum, partTitle: title, chapterFiles, outputPath })
    .catch(err => { console.error("Error:", err); process.exit(1); });
}

// Export for use in Cursor
module.exports = {
  chapterNumber, chapterTitle, sectionHeading, bodyText,
  imagePlaceholder, calloutBox, partDivider,
  parseChapterMarkdown, createDocument,
};
