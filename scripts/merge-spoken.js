#!/usr/bin/env node
/**
 * Merge OpenSubtitles spoken frequency with our translations
 * Creates a word list ordered by actual spoken Czech usage
 */

const fs = require('fs');

// Load OpenSubtitles frequency list
const openSubsRaw = fs.readFileSync('/tmp/opensubtitles-czech.txt', 'utf8');
const openSubsLines = openSubsRaw.trim().split('\n');

// Load our existing translations
const translationsRaw = fs.readFileSync('data/czech-en.tsv', 'utf8');
const translationsMap = new Map();
for (const line of translationsRaw.trim().split('\n')) {
  const [cs, en] = line.split('\t');
  if (cs && en) translationsMap.set(cs.toLowerCase(), en);
}

// Additional translations for common spoken words missing from our list
const spokenTranslations = {
  // Fix case issues from original list
  'ne': 'no',
  'ano': 'yes',
  'ahoj': 'hi/bye',
  'jo': 'yeah',

  // Pronouns & particles
  'to': 'it/that',
  'se': 'oneself',
  'je': 'is',
  'jsem': 'I am',
  'jsi': 'you are',
  'mi': 'to me',
  'mě': 'me',
  'si': 'oneself',
  'jste': 'you are',
  'jsme': 'we are',
  'ho': 'him',
  'ti': 'to you',
  'tě': 'you',
  'mu': 'to him',
  'ji': 'her',
  'nás': 'us',
  'vás': 'you',
  'vám': 'to you',
  'jim': 'to them',
  'jí': 'her/to her',
  'ní': 'her',
  'něm': 'him',
  'něj': 'him',
  'nich': 'them',
  'ně': 'something',
  'mně': 'to me',
  'mnou': 'with me',
  'tebou': 'with you',
  'sebou': 'with oneself',
  'ním': 'with him',

  // Common verb forms
  'není': 'is not',
  'byl': 'was',
  'byla': 'was',
  'bylo': 'was',
  'byli': 'were',
  'byly': 'were',
  'bude': 'will be',
  'budou': 'will be',
  'budu': 'I will be',
  'budeš': 'you will be',
  'budeme': 'we will be',
  'mám': 'I have',
  'máš': 'you have',
  'máme': 'we have',
  'mají': 'they have',
  'měl': 'had/should',
  'měla': 'had/should',
  'můžu': 'I can',
  'můžeš': 'you can',
  'může': 'can',
  'můžeme': 'we can',
  'chci': 'I want',
  'chceš': 'you want',
  'chce': 'wants',
  'musím': 'I must',
  'musíš': 'you must',
  'vím': 'I know',
  'víš': 'you know',
  'ví': 'knows',
  'víme': 'we know',
  'nevím': 'I don\'t know',
  'nevíš': 'you don\'t know',
  'dělám': 'I do',
  'děláš': 'you do',
  'dělá': 'does',
  'myslím': 'I think',
  'myslíš': 'you think',
  'říkám': 'I say',
  'říká': 'says',
  'jdu': 'I go',
  'jdeš': 'you go',
  'jde': 'goes',
  'jdeme': 'we go',
  'jdou': 'they go',
  'šel': 'went',
  'šla': 'went',
  'pojď': 'come',
  'pojďme': 'let\'s go',
  'dej': 'give',
  'dejte': 'give',
  'řekl': 'said',
  'řekla': 'said',
  'řekni': 'say/tell',
  'řekněte': 'tell',
  'podívej': 'look',
  'počkej': 'wait',
  'poslouchej': 'listen',
  'přestaň': 'stop',

  // Informal/spoken words
  'jo': 'yeah',
  'no': 'well/yeah',
  'hele': 'hey/look',
  'tady': 'here',
  'tam': 'there',
  'tohle': 'this',
  'tamhle': 'over there',
  'takhle': 'like this',
  'támhle': 'over there',
  'toho': 'of that',
  'tomu': 'to that',
  'tom': 'about that',
  'tím': 'with that',
  'tohoto': 'of this',
  'takže': 'so',
  'prostě': 'simply/just',
  'vlastně': 'actually',
  'fakt': 'really',
  'vážně': 'seriously',
  'opravdu': 'really',
  'asi': 'probably',
  'možná': 'maybe',
  'určitě': 'definitely',
  'samozřejmě': 'of course',
  'hned': 'right away',
  'zrovna': 'just now',
  'právě': 'just/right',
  'třeba': 'perhaps/for example',
  'taky': 'also',
  'ještě': 'still/yet',
  'zase': 'again',
  'pořád': 'still/always',
  'vždycky': 'always',
  'nikdy': 'never',
  'někdy': 'sometimes',
  'někdo': 'someone',
  'něco': 'something',
  'nikdo': 'nobody',
  'nic': 'nothing',
  'všechno': 'everything',
  'všichni': 'everyone',
  'každý': 'every/everyone',
  'žádný': 'none/no',

  // Question words
  'proč': 'why',
  'kde': 'where',
  'kam': 'where to',
  'odkud': 'from where',
  'kdy': 'when',
  'kdo': 'who',
  'koho': 'whom',
  'komu': 'to whom',
  'čí': 'whose',
  'jaký': 'what kind',
  'který': 'which',
  'kolik': 'how many',

  // Common nouns
  'člověk': 'person',
  'lidi': 'people',
  'lidé': 'people',
  'muž': 'man',
  'žena': 'woman',
  'dítě': 'child',
  'děti': 'children',
  'kluk': 'boy',
  'holka': 'girl',
  'kámoš': 'buddy',
  'kamarád': 'friend',
  'přítel': 'friend',
  'rodina': 'family',
  'táta': 'dad',
  'máma': 'mom',
  'otec': 'father',
  'matka': 'mother',
  'bratr': 'brother',
  'sestra': 'sister',
  'syn': 'son',
  'dcera': 'daughter',

  // Time
  'teď': 'now',
  'dnes': 'today',
  'zítra': 'tomorrow',
  'včera': 'yesterday',
  'ráno': 'morning',
  'večer': 'evening',
  'noc': 'night',
  'den': 'day',
  'hodina': 'hour',
  'minuta': 'minute',
  'rok': 'year',
  'měsíc': 'month',
  'týden': 'week',
  'chvíle': 'moment',
  'chvilku': 'a moment',

  // Common phrases/words
  'prosím': 'please',
  'děkuji': 'thank you',
  'díky': 'thanks',
  'ahoj': 'hi/bye',
  'čau': 'hi/bye',
  'nazdar': 'hello',
  'dobrý': 'good',
  'špatný': 'bad',
  'hezký': 'nice',
  'krásný': 'beautiful',
  'skvělý': 'great',
  'super': 'super',
  'fajn': 'fine',
  'v pořádku': 'alright',
  'správně': 'correct',
  'špatně': 'wrong',
  'rychle': 'quickly',
  'pomalu': 'slowly',

  // Titles/address
  'pane': 'sir/Mr.',
  'paní': 'madam/Mrs.',
  'pánové': 'gentlemen',

  // Other common
  'sakra': 'damn',
  'bože': 'god',
  'kurva': 'damn',  // common expletive
  'hergot': 'damn',
  'kruci': 'darn',
};

// Words to skip (names, English, artifacts)
const skipWords = new Set([
  // Common English words that appear in subtitles
  'the', 'you', 'to', 'and', 'of', 'is', 'it', 'in', 'that', 'for',
  'my', 'me', 'we', 'be', 'do', 'so', 'no', 'ok', 'oh', 'hi', 'hey',
  'yeah', 'yes', 'just', 'all', 'are', 'was', 'but', 'not', 'what',
  'this', 'have', 'can', 'will', 'your', 'with', 'they', 'if', 'or',
  'an', 'as', 'at', 'by', 'on', 'up', 'out', 'get', 'got', 'go',
  'come', 'know', 'think', 'see', 'look', 'want', 'well', 'now', 'good',

  // Common names in subtitles
  'jack', 'john', 'mike', 'tom', 'jim', 'joe', 'bob', 'sam', 'max',
  'david', 'peter', 'paul', 'george', 'harry', 'james', 'michael',
  'mary', 'sarah', 'anna', 'jane', 'kate', 'emma', 'lisa',

  // Subtitle artifacts
  'www', 'http', 'com', 'org', 'cz', 'sub', 'srt',
]);

// Check if word looks like a name (capitalized, not at sentence start in our context)
function isLikelyName(word) {
  // Skip short words
  if (word.length < 3) return false;
  // Names typically start with capital
  if (!/^[A-Z]/.test(word)) return false;
  // Check against common Czech name patterns
  if (/^[A-Z][a-z]+(ová|ová|ek|ík|ský|cký)$/.test(word)) return true;
  return false;
}

// Process and merge
const merged = [];
let kept = 0;
let skipped = 0;
let addedTranslation = 0;

for (const line of openSubsLines) {
  const parts = line.split(' ');
  const word = parts[0];
  const freq = parseInt(parts[1]) || 0;

  if (!word) continue;

  const wordLower = word.toLowerCase();

  // Skip English words and names
  if (skipWords.has(wordLower)) {
    skipped++;
    continue;
  }

  // Skip likely names
  if (isLikelyName(word)) {
    skipped++;
    continue;
  }

  // Skip single letters
  if (word.length === 1 && !/[aoiuíéáý]/.test(word)) {
    skipped++;
    continue;
  }

  // Skip numbers
  if (/^\d+$/.test(word)) {
    skipped++;
    continue;
  }

  // Get translation - spoken translations take priority
  let translation = spokenTranslations[wordLower];

  if (!translation) {
    translation = translationsMap.get(wordLower);
  } else {
    addedTranslation++;
  }

  if (!translation) {
    // Skip words without translation for now
    skipped++;
    continue;
  }

  merged.push({
    cs: wordLower,
    en: translation,
    freq: freq
  });
  kept++;
}

console.error(`OpenSubtitles words: ${openSubsLines.length}`);
console.error(`Kept: ${kept}`);
console.error(`Skipped: ${skipped}`);
console.error(`Added spoken translations: ${addedTranslation}`);

// Output TSV (already sorted by frequency from OpenSubtitles)
for (const { cs, en } of merged) {
  console.log(`${cs}\t${en}`);
}
