const fs = require('fs');
const text = fs.readFileSync('source-text/full_text.md', 'utf8');
const lines = text.split('\n');

// Find where each chapter starts using .indd page markers
const re = /(\d+-\d+)_[Cc]hapter\s+(\d+)\.indd/;
const chapterStarts = {};

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(re);
  if (m) {
    const chNum = m[2];
    if (!chapterStarts[chNum]) {
      chapterStarts[chNum] = Math.max(0, i - 5);
    }
  }
}

const nums = Object.keys(chapterStarts).map(Number).sort((a, b) => a - b);

// Write each chapter file
for (let i = 0; i < nums.length; i++) {
  const ch = String(nums[i]);
  const start = chapterStarts[ch];
  const end = i < nums.length - 1 ? chapterStarts[String(nums[i + 1])] : lines.length;
  const padded = ch.padStart(2, '0');
  const filePath = 'source-text/chapter_' + padded + '.md';
  fs.writeFileSync(filePath, lines.slice(start, end).join('\n'));
  console.log('Wrote ' + filePath + ' (' + (end - start) + ' lines)');
}

// Also write introduction (from line with INTRODUCTION heading to chapter 1 start)
const introIdx = lines.findIndex(l => l === 'INTRODUCTION');
if (introIdx > 0) {
  const introEnd = chapterStarts['1'] || introIdx + 200;
  fs.writeFileSync('source-text/introduction.md', lines.slice(introIdx, introEnd).join('\n'));
  console.log('Wrote source-text/introduction.md');
}

console.log('Done! All chapters split.');
