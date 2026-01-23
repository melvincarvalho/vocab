<div align="center">
  <img src="https://melvincarvalho.gitbooks.io/solid-tutorials/content/words.png" alt="Vocab Logo" width="120" height="120">
  <h1>Vocab</h1>
  <p><strong>Spaced repetition vocabulary trainer built on Solid</strong></p>

  ![License](https://img.shields.io/github/license/melvincarvalho/vocab?style=flat-square) ![GitHub Stars](https://img.shields.io/github/stars/melvincarvalho/vocab?style=flat-square) ![Last Commit](https://img.shields.io/github/last-commit/melvincarvalho/vocab?style=flat-square) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

  [Live Demo](https://melvincarvalho.github.io/vocab/) · [Tutorial](https://melvincarvalho.gitbooks.io/solid-tutorials/content/) · [Report Bug](https://github.com/melvincarvalho/vocab/issues)
</div>

## Quick Start

```bash
git clone https://github.com/melvincarvalho/vocab
cd vocab
npm install -g bower
bower install
# Open index.html in browser
```

Or try the [Live Demo](https://melvincarvalho.github.io/vocab/) directly.

## Features

- **Spaced Repetition** - Learn using scientifically-proven memory techniques (easy/good/again)
- **10,000 Words** - Based on frequency lists from Wiktionary
- **Multiple Languages** - Czech, French, Hungarian, and more
- **Solid Integration** - Decentralized data storage with WebID login
- **Audio Feedback** - Sound effects for button interactions
- **Progress Tracking** - localStorage persists your learning state
- **Linked Data Notifications** - Share scores to your Solid inbox

## Language Grid

| Languages | 🇬🇧 English | 🇨🇿 Czech | 🇫🇷 French |
|-----------|:-----------:|:---------:|:----------:|
| 🇬🇧 English | - | [cs-en](https://melvincarvalho.github.io/vocab/) | fr-en |
| 🇨🇿 Czech | [en-cs](https://melvincarvalho.github.io/vocab/?lang1=en&lang2=cs) | - | fr-cs |
| 🇫🇷 French | en-fr | cs-fr | - |

**More:** [Hungarian](https://melvincarvalho.github.io/vocab/?lang1=hu&lang2=en&storageURI=https:%2F%2Fmelvincarvalho.github.io%2Fdata%2Fvocab%2Fhu-en.ttl&max=1000)

## How It Works

1. A random word from the top 1,000 most common words appears
2. Click the word to reveal the translation
3. Rate yourself: **Easy** (knew it), **Good** (almost), **Again** (didn't know)
4. Progress to 2,000, 3,000, 5,000, or 10,000 words as you improve

## Adding Your Own Language

Create a Turtle file with word pairs:

```turtle
<#1> <http://www.w3.org/2000/01/rdf-schema#label> "hello"@en .
<#1> <http://www.w3.org/2000/01/rdf-schema#label> "hola"@es .
```

Convert from tab-separated text:

```bash
awk -F $'\t' '{ print "<#" ++i "> <http://www.w3.org/2000/01/rdf-schema#label> \"" $2 "\"@en .\n<#" i "> <http://www.w3.org/2000/01/rdf-schema#label> \"" $1 "\"@cs ." }'
```

Host on GitHub Pages and load via `storageURI` parameter.

## Tech Stack

- **Frontend:** AngularJS
- **Data Format:** Turtle (RDF)
- **Auth:** Solid WebID
- **Audio:** ngAudio
- **Notifications:** Linked Data Notifications (LDN)

## Contributing

Contributions welcome! See [issues](https://github.com/melvincarvalho/vocab/issues).

1. Fork the repository
2. Create your branch (`git checkout -b feature/new-language`)
3. Commit changes (`git commit -m 'Add Spanish language pair'`)
4. Push (`git push origin feature/new-language`)
5. Open a Pull Request

## See Also

- [Solid Tutorials](https://melvincarvalho.gitbooks.io/solid-tutorials/content/)
- [Wiktionary Frequency Lists](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists)
- [Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition)
- [Linked Data Notifications Spec](https://linkedresearch.org/ldn/)

## License

MIT License - see [LICENSE](LICENSE) for details.
