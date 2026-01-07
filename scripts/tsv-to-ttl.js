#!/usr/bin/env node
/**
 * Convert TSV word list to Turtle (TTL) format
 */

const fs = require('fs');

const input = fs.readFileSync(process.argv[2] || '/home/melvin/ideas/vocab/data/czech-en.tsv', 'utf8');
const lines = input.trim().split('\n');

console.log('# Czech-English Vocabulary');
console.log('# Cleaned word list for vocabulary learning');
console.log('# Format: rdfs:label with language tags');
console.log('');

let id = 1;
for (const line of lines) {
  const [cs, en] = line.split('\t');
  if (!cs || !en) continue;

  // Escape quotes in words
  const csEsc = cs.replace(/"/g, '\\"');
  const enEsc = en.replace(/"/g, '\\"');

  console.log(`<#${id}> <http://www.w3.org/2000/01/rdf-schema#label> "${csEsc}"@cs .`);
  console.log(`<#${id}> <http://www.w3.org/2000/01/rdf-schema#label> "${enEsc}"@en .`);
  id++;
}

process.stderr.write(`Generated ${id - 1} word pairs\n`);
