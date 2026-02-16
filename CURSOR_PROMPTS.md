# Cursor Prompts — Copy & Paste Reference

Use these prompts in Cursor's chat (Cmd+L / Ctrl+L). They're designed to work 
perfectly with the .cursorrules and RULES.md files in this project.

---

## Phase 1: Extract & Split PDF

### Extract PDF text
```
Run `node extract_pdf.js` to extract the PDF. Then open source-text/full_text.md 
and split it into individual chapter files (chapter_01.md, chapter_02.md, etc.) 
in the source-text/ folder. Look for chapter headings to determine boundaries.
```

---

## Phase 2: Rewrite Chapters (one at a time)

### Rewrite a single chapter
```
Read RULES.md first. Then read source-text/chapter_01.md and rewrite it 
completely following all the rules. Save the rewritten version to 
chapters/chapter_01.md
```

### If a chapter is very long (20+ pages)
```
Read RULES.md. Then read source-text/chapter_08.md — it's long so process 
the first half only (up to [section name]). Save to chapters/chapter_08.md
```
Then:
```
Continue rewriting the second half of source-text/chapter_08.md (from 
[section name] onward). Append to chapters/chapter_08.md
```

### If you want deeper technical content
```
Read RULES.md. Rewrite source-text/chapter_03.md but expand the technical 
depth significantly — add more detail on bullet construction physics, 
include specific examples, and make the Key Takeaway boxes more actionable. 
Save to chapters/chapter_03.md
```

### If a rewrite is too similar to the source
```
Read chapters/chapter_05.md and source-text/chapter_05.md side by side. 
The rewrite is still too close to the original. Rewrite it again with MORE 
aggressive changes: completely different paragraph structure, different 
examples and analogies, different section order where possible. 
Replace chapters/chapter_05.md
```

---

## Phase 3: Generate .docx Files

### Generate Part 1
```
Run: node generate.js --part 1 --chapters 1,2,3,4,5 --title "Ammunition Foundations"
```

### Generate Part 2
```
Run: node generate.js --part 2 --chapters 6,7,8,9,10 --title "The Science of Stopping Power"
```

### Generate Part 3
```
Run: node generate.js --part 3 --chapters 11,12,13,14,15 --title "Caliber Deep Dives"
```

### Generate Part 4
```
Run: node generate.js --part 4 --chapters 16,17,18,19,20 --title "Advanced Ammunition Topics"
```

### Generate Part 5
```
Run: node generate.js --part 5 --chapters 21,22,23,24,25 --title "The Informed Carrier"
```

---

## Quality Check Prompts

### Verify originality
```
Read source-text/chapter_03.md and chapters/chapter_03.md side by side. 
Check if any phrases of 5+ words match between them. List any matches found.
```

### Check formatting compliance
```
Read chapters/chapter_03.md and verify it has:
1. Chapter number and title
2. At least 2 image placeholders
3. At least 1 Key Takeaway box  
4. Section headings for every major topic
5. No author names from the original
6. No brand endorsements (only neutral educational mentions)
Report any issues found.
```

### Review all chapters for consistency
```
Read all files in chapters/ and check that tone, depth, and formatting 
are consistent across chapters. Note any that feel too short, too 
technical, or inconsistent with the others.
```

---

## Useful One-Liners

### Count words per chapter
```
For each file in chapters/, count the words and show me a summary table.
```

### Check for accidentally copied phrases
```
For each chapter in chapters/, search for any phrase that appears 
verbatim in the corresponding source-text/ file. Flag anything 
longer than 4 consecutive matching words.
```
