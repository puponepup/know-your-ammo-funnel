# Know Your Ammo — Complete Rewriting Project Setup Guide

## What You Need Before Starting

1. **Cursor IDE** installed (https://cursor.sh) — free tier works, Pro is better for long sessions
2. **Node.js** installed (v18+) — download from https://nodejs.org
3. **The source PDF** — "Know Your Ammo: The Complete Self-Defense Ammunition Guide" (280 pages)
4. **This project folder** with all files included

---

## STEP 1: Create the Project Folder

Create this folder structure on your computer. You can put it anywhere (Desktop, Documents, etc.):

```
know-your-ammo/
├── .cursorrules          ← (PROVIDED - paste from file)
├── RULES.md              ← (PROVIDED - paste from file)
├── generate.js           ← (PROVIDED - paste from file)
├── extract_pdf.js        ← (PROVIDED - paste from file)
├── source/
│   └── know-your-ammo.pdf   ← PUT YOUR PDF HERE
├── source-text/              ← (will be created by extraction)
├── chapters/                 ← (rewritten chapters go here)
└── output/                   ← (final .docx files go here)
```

### How to do it:

**On Mac:**
```bash
mkdir -p ~/Desktop/know-your-ammo/{source,source-text,chapters,output}
```

**On Windows (PowerShell):**
```powershell
mkdir ~/Desktop/know-your-ammo/source, ~/Desktop/know-your-ammo/source-text, ~/Desktop/know-your-ammo/chapters, ~/Desktop/know-your-ammo/output
```

Then copy your PDF into the `source/` folder.

---

## STEP 2: Install Dependencies

Open a terminal, navigate to the project folder, and run:

```bash
cd ~/Desktop/know-your-ammo
npm init -y
npm install docx pdf-parse
```

This installs the two packages needed:
- `docx` — generates Word documents
- `pdf-parse` — extracts text from the PDF

---

## STEP 3: Copy the Project Files

Copy all 4 provided files into the project root:

1. **`.cursorrules`** — Cursor reads this automatically when you open the project
2. **`RULES.md`** — All rewriting and formatting rules
3. **`generate.js`** — The .docx generation script
4. **`extract_pdf.js`** — Extracts the PDF into chapter files

---

## STEP 4: Extract the PDF

Run the extraction script:

```bash
node extract_pdf.js
```

This will:
- Read your PDF from `source/know-your-ammo.pdf`
- Extract all text
- Save it as `source-text/full_text.md`

**IMPORTANT:** After extraction, you need to manually split the text into chapters.
Open `source-text/full_text.md` and create individual chapter files:

```
source-text/
├── full_text.md          ← complete extracted text
├── chapter_01.md         ← manually split
├── chapter_02.md
├── chapter_03.md
├── ...
```

**How to split:** Search for chapter headings in the full text, then copy-paste each
chapter into its own file. Name them `chapter_01.md`, `chapter_02.md`, etc.

You can also ask Claude in Cursor to help you split: 
"Read source-text/full_text.md and split it into individual chapter files in source-text/"

---

## STEP 5: Open in Cursor

1. Open Cursor IDE
2. File → Open Folder → select `know-your-ammo/`
3. Cursor will automatically read `.cursorrules` and understand the project

---

## STEP 6: Start Rewriting — Chapter by Chapter

In Cursor's chat (Cmd+L on Mac, Ctrl+L on Windows), give this command:

```
Read RULES.md first. Then read source-text/chapter_01.md and rewrite it 
following all the rules. Save the rewritten version to chapters/chapter_01.md
```

**Wait for it to finish**, then continue:

```
Now read source-text/chapter_02.md and rewrite it following RULES.md. 
Save to chapters/chapter_02.md
```

### Tips for Best Results:

- **Do ONE chapter at a time** — don't ask for multiple chapters in one message
- **After each chapter**, quickly scan it to make sure quality is good
- **If a chapter is too long** (20+ pages), tell Cursor to do it in sections:
  "Rewrite the first half of chapter_05.md, save as chapter_05.md. Then continue with the second half and append."
- **If context gets long**, start a new Cursor chat (Cmd+L) — .cursorrules carries over automatically
- **You can give feedback**: "Chapter 3 was too short, expand the section on bullet construction"

---

## STEP 7: Generate the .docx Files (Per Part)

Once you have a batch of chapters rewritten (e.g., Part 1 = Chapters 1-X), generate the Word document:

```
Read generate.js and chapters/chapter_01.md through chapter_05.md. 
Generate Part 1 of the e-book as output/KnowYourAmmo_Part1.docx
```

The generate.js script has all the formatting rules built in (Georgia font, sizes, margins, etc.)
Cursor/Claude will use it as a template.

---

## STEP 8: Review and Iterate

Open each generated .docx in Word or Google Docs and review:

- [ ] All content is 100% original language (no copied phrases)
- [ ] No author names from original
- [ ] No specific brand endorsements (neutral product mentions)
- [ ] "Certified Concealed" branding applied correctly
- [ ] Image placeholders present and descriptive
- [ ] Key Takeaway boxes at end of major sections
- [ ] Formatting matches spec (Georgia, correct sizes, spacing)

If anything needs fixing, tell Cursor:
"In chapters/chapter_03.md, the section on bullet expansion is too close to the original. Rewrite it more aggressively."

---

## Suggested 5-Part Division (280 pages)

Based on the description, here's a logical division. Adjust once you see the actual chapter structure:

| Part | Chapters | Topic Area | ~Pages |
|------|----------|-----------|--------|
| **Part I** | 1-5 | Foundations: FMJ vs HP, ballistics basics, how bullets work | ~55 |
| **Part II** | 6-10 | Penetration science: FBI protocol, gelatin testing, expansion | ~55 |
| **Part III** | 11-15 | Caliber deep-dives: 9mm, .40, .45, .380, .357 | ~55 |
| **Part IV** | 16-20 | Advanced topics: +P ammo, barrier performance, specialty loads | ~55 |
| **Part V** | 21-25+ | Practical: manufacturer comparisons, what pros carry, selection guide | ~60 |

---

## Troubleshooting

**"Cursor lost context / forgot the rules"**
→ Start a new chat. .cursorrules loads automatically every time.

**"The rewrite is too similar to the original"**
→ Add to your prompt: "Make this MORE different from the source. Restructure paragraphs completely, use different examples, change the teaching approach."

**"The docx looks wrong"**
→ Run validation: `node -e "const {execSync} = require('child_process'); console.log(execSync('file output/KnowYourAmmo_Part1.docx').toString())"`

**"PDF extraction is messy"**
→ PDF extraction is never perfect. You may need to clean up the source-text files manually — fix broken paragraphs, remove headers/footers, fix encoding issues.

**"Chapter is too long for one Cursor message"**
→ Split the source chapter into sections and process each separately, appending to the output file.
