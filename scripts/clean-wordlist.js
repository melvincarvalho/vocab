#!/usr/bin/env node
/**
 * Clean Czech-English word list
 * - Remove proper names
 * - Remove abbreviations
 * - Fix known bad translations
 * - Output clean TSV
 */

const fs = require('fs');

// Read input
const input = fs.readFileSync('/tmp/czech-pairs.tsv', 'utf8');
const lines = input.trim().split('\n');

// Known corrections (cs -> en)
const corrections = {
  'dítě': 'child',
  'celý': 'whole',
  'jazyk': 'language',
  'kolo': 'wheel',
  'stát': 'stand',  // or 'state' depending on context
  'právo': 'right',
  'hlava': 'head',
  'věc': 'thing',
  'a se': 'and',  // fix "a se" to just show as "and"
};

// Important short Czech words to keep
const keepShortWords = new Set([
  'a', 'i', 'v', 'k', 's', 'z', 'o', 'u', 'já', 'ty', 'on', 'my', 'vy',
  'do', 'na', 'po', 'za', 'od', 'co', 'že', 'je', 'se', 'si', 'to', 'tu',
  'ta', 'ne', 'už', 'by', 'být', 'mít', 'jít', 'dát', 'při', 'jak', 'tak',
  'jen', 'ale', 'ani', 'než', 'až', 'pak', 'pro', 'přes', 'mezi', 'nebo',
]);

// Patterns to skip
const skipPatterns = [
  /^[A-Z][a-z]+$/,     // Proper names (Petr, Anna, etc.)
  /^[A-Z]{2,}$/,       // Acronyms (ČSSD, ČR)
  /^[A-Z]$/,           // Single letters (but keep lowercase)
  /^[IVX]+$/,          // Roman numerals
  /^\d+$/,             // Numbers
  /^Kč$/i,             // Currency
  /^mm$/,              // Units
  /^Sb$/,              // Legal reference
  /^aj$/,              // Abbreviation
];

// Common Czech names to filter
const czechNames = new Set([
  'Petr', 'Jan', 'Pavel', 'Jiří', 'Josef', 'Martin', 'Tomáš', 'Jaroslav',
  'Miroslav', 'Zdeněk', 'Václav', 'František', 'Karel', 'Milan', 'Michal',
  'Anna', 'Marie', 'Jana', 'Eva', 'Hana', 'Lenka', 'Kateřina', 'Lucie',
  'Věra', 'Petra', 'Martina', 'Jitka', 'Helena', 'Ludmila', 'Alena',
  'David', 'Michael', 'John', 'George', 'Bill', 'James', 'Tom', 'Harry',
  'Praha', 'Brno', 'Ostrava', 'Plzeň', 'Olomouc', 'Liberec',
  'Německo', 'Francie', 'Anglie', 'Amerika', 'Rusko', 'Polsko',
  'Londýn', 'Paříž', 'Berlín', 'Moskva', 'Vídeň', 'Řím',
  'Evropa', 'Asie', 'Afrika', 'Indie', 'Čína', 'Japonsko',
  'Ladislav', 'Stanislav', 'Bohumil', 'Vladimír', 'Oldřich', 'Břetislav',
]);

// English names/places to filter
const englishNames = new Set([
  'Peter', 'John', 'George', 'Bill', 'James', 'Tom', 'Harry', 'David',
  'Michael', 'Anna', 'Mary', 'Jane', 'London', 'Paris', 'Berlin',
  'Prague', 'Europe', 'America', 'Germany', 'France', 'England',
  'India', 'China', 'Japan', 'Russia', 'Poland',
]);

function shouldSkip(cs, en) {
  // Always keep important short words
  if (keepShortWords.has(cs)) return false;

  // Skip if matches any pattern
  for (const pattern of skipPatterns) {
    if (pattern.test(cs) || pattern.test(en)) return true;
  }

  // Skip known names
  if (czechNames.has(cs) || englishNames.has(en)) return true;

  // Skip if Czech word starts with capital (likely proper noun)
  if (/^[A-Z]/.test(cs) && cs.length > 2) {
    const lower = cs.toLowerCase();
    // Check if it's a real word (has vowels, reasonable length)
    if (!/[aeiouyáéíóúůýě]/i.test(lower)) return true;
  }

  return false;
}

const cleaned = [];
let skipped = 0;

for (const line of lines) {
  const [cs, en] = line.split('\t');
  if (!cs || !en) continue;

  if (shouldSkip(cs, en)) {
    skipped++;
    continue;
  }

  // Apply corrections
  let correctedCs = cs.trim();
  let correctedEn = corrections[cs] || en.trim();

  // Fix "a se" -> "a"
  if (correctedCs === 'a se') correctedCs = 'a';

  cleaned.push({ cs: correctedCs, en: correctedEn });
}

console.error(`Processed ${lines.length} words, kept ${cleaned.length}, skipped ${skipped}`);

// Output as TSV
for (const { cs, en } of cleaned) {
  console.log(`${cs}\t${en}`);
}
