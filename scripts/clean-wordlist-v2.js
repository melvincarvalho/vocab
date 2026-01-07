#!/usr/bin/env node
/**
 * Clean Czech-English word list v2
 * - Fix incorrect translations
 * - Remove non-Czech words, abbreviations, single letters
 * - Remove proper nouns
 */

const fs = require('fs');

const input = fs.readFileSync('/tmp/czech-pairs.tsv', 'utf8');
const lines = input.trim().split('\n');

// Comprehensive translation corrections
const corrections = {
  // Common words with wrong/suboptimal translations
  'ten': 'that',
  'člověk': 'person',
  'velký': 'big',
  'hodně': 'a lot',
  'každý': 'every',
  'druhý': 'second',
  'strana': 'side',
  'dobře': 'well',
  'asi': 'probably',
  'cesta': 'way',
  'poslední': 'last',
  'dům': 'house',
  'část': 'part',
  'lze': 'possible',
  'firma': 'company',
  'problém': 'problem',
  'řada': 'series',
  'rozhodnout': 'decide',
  'výsledek': 'result',
  'procento': 'percent',
  'kvůli': 'because of',
  'noha': 'leg',
  'jistý': 'certain',
  'přímo': 'directly',
  'hodina': 'hour',
  'obraz': 'picture',
  'cíl': 'goal',
  'silný': 'strong',
  'proces': 'process',
  'podařit se': 'succeed',
  'těžký': 'difficult',
  'rada': 'advice',
  'přítel': 'friend',
  'kraj': 'region',
  'období': 'period',
  'zároveň': 'at the same time',
  'zvláštní': 'special',
  'obec': 'municipality',
  'náklad': 'cost',
  'obchod': 'shop',
  'umět': 'know how',
  'pán': 'gentleman',
  'tvořit': 'create',
  'svatý': 'holy',
  'poprvé': 'for the first time',
  'vzniknout': 'arise',
  'věnovat': 'dedicate',
  'pravý': 'right',
  'poznat': 'recognize',
  'nabízet': 'offer',
  'list': 'leaf',
  'použít': 'use',
  'podpora': 'support',
  'prosit': 'please',
  'jenže': 'but',
  'energie': 'energy',
  'doprava': 'transport',
  'zvíře': 'animal',
  'správný': 'correct',
  'silnice': 'road',
  'jednoduchý': 'simple',
  'dnešní': "today's",
  'využít': 'use',
  'zrovna': 'just now',
  'jazyk': 'language',
  'nabídka': 'offer',
  'uvědomit': 'realize',
  'vstup': 'entrance',
  'závod': 'race',
  'pokus': 'attempt',
  'vytvářet': 'create',
  'využívat': 'use',
  'docházet': 'attend',
  'náměstí': 'square',
  'uvádět': 'state',
  'chovat': 'behave',
  'údaj': 'data',
  'chyba': 'mistake',
  'bydlet': 'live',
  'současně': 'at the same time',
  'projev': 'speech',
  'veliký': 'big',
  'klid': 'calm',
  'uzavřít': 'close',
  'kapitola': 'chapter',
  'krk': 'neck',
  'šat': 'clothing',
  'slečna': 'miss',
  'připravovat': 'prepare',
  'domnívat se': 'think',
  'pokoušet': 'try',
  'kuchyně': 'kitchen',
  'krajina': 'landscape',
  'nebe': 'sky',
  'střecha': 'roof',
  'použití': 'use',
  'pravit': 'say',
  'úzký': 'narrow',
  'vazba': 'bond',
  'přinášet': 'bring',
  'podporovat': 'support',
  'všecek': 'all',
  'kino': 'cinema',
  'stát': 'state',
  'moc': 'power',
  'vlas': 'hair',
  'proud': 'stream',
  'vzhledem': 'due to',
  'samý': 'same',
  'samotný': 'alone',
  'drobný': 'small',
  'vyprávět': 'tell',
  'úprava': 'modification',
  'bolest': 'pain',
  'závislý': 'dependent',
  'přiznat': 'admit',
  'příslušný': 'relevant',
  'rána': 'wound',
  'slavný': 'famous',
  'uvedený': 'mentioned',
  'veškerý': 'all',
  'uvědomit': 'realize',
  'host': 'guest',
  'těšit': 'look forward',
  'prostřednictví': 'through',
  'čelo': 'forehead',
  'škoda': 'pity',
  'kontrola': 'control',
  'přímý': 'direct',
  'hledisko': 'point of view',
  'stávat': 'become',
  'fotografie': 'photograph',
  'povinnost': 'duty',
  'obrátit': 'turn',
  'vůči': 'towards',
  'letošní': "this year's",
  'souvislost': 'connection',
  'daný': 'given',
  'položit': 'put',
  'opatření': 'measure',
  'vytvářet': 'create',
  'půda': 'ground',
  'využívat': 'use',
  'docházet': 'come',
  'uvádět': 'state',
  'špatně': 'badly',
  'naděje': 'hope',
  'paragraf': 'paragraph',
  'řídit': 'drive',
  'oběť': 'victim',
  'viz': 'see',
  'naučit': 'learn',
  'takto': 'like this',
  'přát': 'wish',
  'objekt': 'object',
  'čistý': 'clean',
  'spousta': 'many',
  'nikoliv': 'not',
  'případně': 'possibly',
  'složitý': 'complicated',
  'bavit': 'amuse',
  'těžko': 'hardly',
  'pocházet': 'originate',
  'vystoupit': 'get off',
  'dopadnout': 'turn out',
  'stopa': 'trace',
  'zahájit': 'begin',
  'vstát': 'stand up',
  'hledět': 'look',
  'sejít': 'come down',
  'vadit': 'mind',
  'vazba': 'connection',
  'zbavit': 'get rid of',
  'přinášet': 'bring',
  'vydržet': 'endure',
  'podporovat': 'support',
  'podlaha': 'floor',
  'původně': 'originally',
  'zvlášť': 'especially',
  'všecek': 'all',
  'pozdní': 'late',
  'odpor': 'resistance',
  'podstatný': 'significant',
  'vyrazit': 'set out',
  'vyvolat': 'cause',
  'žádost': 'request',
  'závislost': 'dependence',
  'projevit': 'show',
  'spočívat': 'consist',
};

// Words to completely remove
const removeWords = new Set([
  // Single letters and abbreviations
  '-li', 'm', 'l', 'g', 'b', 'a', 'i', 'v', 'k', 's', 'z', 'o', 'u',
  // But keep important short words - we'll handle this below

  // Abbreviations
  'ČR', 'ČSSD', 'Sb', 'Kč', 'aj', 'atd', 'apod', 'tzn', 'resp', 'tzv', 'mj', 'cca', 'cit',
  'tj.', 'apod.', 'km', 'mm',

  // Non-Czech words
  'de', 'le', 'new', 'the',

  // Proper nouns (names, places)
  'Petr', 'Jan', 'Pavel', 'Jiří', 'Josef', 'Martin', 'Tomáš', 'Jaroslav',
  'Anna', 'Marie', 'Jana', 'Eva', 'Hana', 'Lenka', 'Kateřina', 'Lucie',
  'David', 'Michael', 'John', 'George', 'Bill', 'James', 'Tom', 'Harry',
  'Praha', 'Brno', 'Ostrava', 'Plzeň', 'plzeň', 'Olomouc',
  'Londýn', 'Paříž', 'Berlín', 'Moskva', 'amerika',
  'Ladislav', 'Stanislav', 'Vladimír', 'Čech',
]);

// Important short words to KEEP
const keepShortWords = new Set([
  'já', 'ty', 'on', 'my', 'vy', 'co', 'že', 'je', 'se', 'si', 'to', 'tu',
  'ta', 'ne', 'už', 'by', 'do', 'na', 'po', 'za', 'od', 'při', 'jak', 'tak',
  'jen', 'ale', 'ani', 'než', 'až', 'pak', 'pro', 'či', 'ač',
]);

function shouldRemove(cs, en) {
  // Remove if in remove list
  if (removeWords.has(cs)) return true;

  // Remove single letters (unless in keep list)
  if (cs.length === 1 && !keepShortWords.has(cs)) return true;

  // Remove if starts with capital and is a name
  if (/^[A-Z][a-z]+$/.test(cs) && !['Čech'].includes(cs)) return true;

  // Remove Roman numerals
  if (/^[IVX]+$/.test(cs)) return true;

  // Remove pure numbers
  if (/^\d+$/.test(cs)) return true;

  return false;
}

const cleaned = [];
let corrected = 0;
let removed = 0;

for (const line of lines) {
  const [cs, en] = line.split('\t');
  if (!cs || !en) continue;

  const csTrim = cs.trim();
  const enTrim = en.trim();

  if (shouldRemove(csTrim, enTrim)) {
    removed++;
    continue;
  }

  // Apply correction if available
  let finalEn = enTrim;
  if (corrections[csTrim]) {
    finalEn = corrections[csTrim];
    corrected++;
  }

  // Fix "a se" -> "a"
  let finalCs = csTrim;
  if (finalCs === 'a se') finalCs = 'a';

  cleaned.push({ cs: finalCs, en: finalEn });
}

console.error(`Processed ${lines.length} words`);
console.error(`Removed ${removed} words`);
console.error(`Corrected ${corrected} translations`);
console.error(`Final count: ${cleaned.length} words`);

// Output as TSV
for (const { cs, en } of cleaned) {
  console.log(`${cs}\t${en}`);
}
