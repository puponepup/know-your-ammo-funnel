/**
 * Self-Defense Legal Survival Guide — DOCX Generator
 * 
 * Generates a single .docx from all chapter files.
 * Also creates a merged markdown file.
 * 
 * Usage:  node generate_sdlg.js
 */

const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = require("docx");

// ============================================================
// FORMATTING HELPERS
// ============================================================

function chapterNumber(text, pageBreak = false) {
  return new Paragraph({
    pageBreakBefore: pageBreak,
    spacing: { before: 360, after: 240 },
    children: [new TextRun({ text, font: "Georgia", bold: true, size: 22 })],
  });
}

function chapterTitle(text) {
  return new Paragraph({
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text, font: "Georgia", bold: true, size: 30 })],
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 300, after: 200 },
    children: [new TextRun({ text, font: "Georgia", bold: true, size: 30 })],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { after: 200, line: 360 },
    children: [new TextRun({ text, font: "Georgia", size: 24 })],
  });
}

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

function bulletItem(text) {
  return new Paragraph({
    spacing: { after: 100, line: 360 },
    indent: { left: 360 },
    children: [new TextRun({ text: "• " + text, font: "Georgia", size: 24 })],
  });
}

function titlePage() {
  return [
    new Paragraph({ spacing: { before: 4000, after: 200 }, alignment: AlignmentType.CENTER, children: [] }),
    new Paragraph({
      spacing: { before: 2000, after: 400 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "THE SELF-DEFENSE", font: "Georgia", bold: true, size: 52 })],
    }),
    new Paragraph({
      spacing: { before: 100, after: 400 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "LEGAL SURVIVAL GUIDE", font: "Georgia", bold: true, size: 52 })],
    }),
    new Paragraph({
      spacing: { before: 400, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Your Complete Handbook for Understanding Self-Defense Law", font: "Georgia", italics: true, size: 28 })],
    }),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "The Five Elements • Criminal Justice Process • Castle Doctrine • Stand Your Ground", font: "Georgia", size: 22 })],
    }),
    new Paragraph({
      spacing: { before: 800, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "CERTIFIED CONCEALED", font: "Georgia", bold: true, size: 30 })],
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

    // Chapter number or Introduction: **Chapter XX** or **Introduction**
    if (/^\*\*(Chapter \d+|Introduction)\*\*$/.test(line)) {
      const text = line.replace(/\*\*/g, "");
      paragraphs.push(chapterNumber(text, addPageBreak && !foundChapterNum));
      foundChapterNum = true;
      i++;
      continue;
    }

    // Key Takeaway box
    if (line.startsWith("> ***Key Takeaway:") || line.startsWith("> *Key Takeaway:")) {
      let callText = line;
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith(">")) {
        i++;
        callText += " " + lines[i].trim().replace(/^>\s*/, "");
      }
      callText = callText
        .replace(/^>\s*\*{1,3}Key Takeaway:\s*/, "")
        .replace(/\*{1,3}$/, "")
        .trim();
      paragraphs.push(calloutBox(callText));
      i++;
      continue;
    }

    if (line === ">") { i++; continue; }

    // Image placeholder
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
      // Distinguish chapter title (comes right after chapter number) from section headings
      if (paragraphs.length > 0) {
        const last = paragraphs[paragraphs.length - 1];
        const lastText = last.root && last.root[1] && last.root[1][0] ? "" : "";
        paragraphs.push(sectionHeading(text));
      } else {
        paragraphs.push(sectionHeading(text));
      }
      i++;
      continue;
    }

    // Italic standalone line
    if (/^\*[^*]+\*$/.test(line)) {
      const text = line.replace(/^\*/, "").replace(/\*$/, "");
      paragraphs.push(new Paragraph({
        spacing: { after: 200, line: 360 },
        children: [new TextRun({ text, font: "Georgia", italics: true, size: 24 })],
      }));
      i++;
      continue;
    }

    // Bullet list items (various formats)
    if (line.startsWith("- ")) {
      let bulletText = line.replace(/^- /, "");
      bulletText = bulletText
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1");
      paragraphs.push(bulletItem(bulletText));
      i++;
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(line)) {
      let listText = line;
      listText = listText
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1");
      paragraphs.push(new Paragraph({
        spacing: { after: 100, line: 360 },
        indent: { left: 360 },
        children: [new TextRun({ text: listText, font: "Georgia", size: 24 })],
      }));
      i++;
      continue;
    }

    // Regular body text
    if (line && !line.startsWith("**") && !line.startsWith("*[") && !line.startsWith("*\\[") && !line.startsWith(">")) {
      let paraText = line;
      while (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (!nextLine || nextLine.startsWith("**") || nextLine.startsWith("*[") || nextLine.startsWith("- ") ||
            nextLine.startsWith("*\\[") || nextLine.startsWith(">") || /^\*[^*]+\*$/.test(nextLine) ||
            /^\d+\.\s/.test(nextLine)) break;
        i++;
        paraText += " " + nextLine;
      }
      paraText = paraText
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/\s+/g, " ").trim();
      paragraphs.push(bodyText(paraText));
      i++;
      continue;
    }

    i++;
  }

  return paragraphs;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const chaptersDir = path.join(__dirname, "chapters");
  const outputDir = path.join(__dirname, "output");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all chapter files sorted
  const files = fs.readdirSync(chaptersDir)
    .filter(f => f.endsWith(".md") && f.startsWith("chapter_"))
    .sort((a, b) => {
      const numA = parseInt(a.match(/chapter_(\d+)/)[1]);
      const numB = parseInt(b.match(/chapter_(\d+)/)[1]);
      return numA - numB;
    });

  console.log(`Found ${files.length} chapter files\n`);

  // 1. Merge all chapters into a single Markdown file
  let mergedMd = "# The Self-Defense Legal Survival Guide\n\n";
  mergedMd += "## Your Complete Handbook for Understanding Self-Defense Law\n\n";
  mergedMd += "### Certified Concealed\n\n---\n\n";

  for (const file of files) {
    const content = fs.readFileSync(path.join(chaptersDir, file), "utf8");
    mergedMd += content + "\n\n---\n\n";
  }

  const mergedPath = path.join(outputDir, "SelfDefenseLegalSurvivalGuide_Complete.md");
  fs.writeFileSync(mergedPath, mergedMd);
  console.log(`✅ Merged Markdown: ${mergedPath}`);

  // 2. Generate .docx
  const allParagraphs = [];

  // Title page
  allParagraphs.push(...titlePage());

  // Process each chapter
  for (let idx = 0; idx < files.length; idx++) {
    const filePath = path.join(chaptersDir, files[idx]);
    const markdown = fs.readFileSync(filePath, "utf8");
    const chapterParas = parseChapterMarkdown(markdown, true);
    allParagraphs.push(...chapterParas);
    console.log(`  ✓ ${files[idx]} (${chapterParas.length} elements)`);
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: allParagraphs,
    }],
  });

  const docxPath = path.join(outputDir, "SelfDefenseLegalSurvivalGuide_Complete.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log(`\n✅ Generated DOCX: ${docxPath} (${(buffer.length / 1024).toFixed(0)} KB, ${allParagraphs.length} elements)`);
}

main().catch(err => { console.error("Error:", err); process.exit(1); });
