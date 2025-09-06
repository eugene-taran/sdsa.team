# SDSA Knowledge Repository

[![Release](https://img.shields.io/github/v/release/eugene-taran/sdsa.team)](https://github.com/eugene-taran/sdsa.team/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Knowledge Blocks](https://img.shields.io/badge/knowledge%20blocks-1-green)](knowledge/blocks)
[![Contributors](https://img.shields.io/badge/contributors-welcome-brightgreen)](CLAUDE.md#contributing)

Open-source knowledge repository for **SDSA (Software Development Smart Assist)** - Interactive learning paths for everyone in tech.

## 🚀 What is SDSA?

SDSA is a cross-platform application (iOS, Android, Web) that provides guided learning journeys through interactive knowledge trees. Unlike traditional documentation or Q&A, SDSA:

- **Builds Context** - Walks through decision trees to understand your specific situation
- **Provides Resources** - Surfaces relevant guides based on your journey
- **AI Assistance** - Offers contextualized chat with full awareness of your path
- **Privacy-First** - Free tier runs entirely on-device with offline support

## 📚 Repository Contents

This repository contains:

- **Knowledge Trees** (`knowledge/blocks/`) - Interactive decision trees in YAML format
- **Resources** (`knowledge/resources/`) - Markdown guides and documentation
- **Author Registry** (`knowledge/authors.json`) - Contributor recognition
- **Release System** - Automated versioning and distribution

## 🎯 Current Knowledge Blocks

> **Note**: These knowledge blocks are currently stubs - they guide you through decision trees and connect you with AI assistance for detailed implementation help.

| Topic | Description | Difficulty | Time |
|-------|-------------|------------|------|
| [E2E Testing](knowledge/blocks/e2e-testing.yaml) | Complete testing setup guide | Intermediate | 10 mins |
| [CI/CD Pipeline](knowledge/blocks/cicd-pipeline.yaml) | Automation setup | Advanced | 20 mins |

*More coming soon! [Contribute your own →](CLAUDE.md#contributing)*

## 🤝 Contributing

We welcome contributions! Add your knowledge:

**Option A: Direct contribution (if you have write access)**
1. **Create** a new branch
2. **Add** your knowledge tree in `knowledge/blocks/`
3. **Submit** a pull request

**Option B: Fork contribution (for external contributors)**
1. **Fork** this repository
2. **Create** your knowledge tree in `knowledge/blocks/`
3. **Submit** a pull request from your fork

See [CLAUDE.md](CLAUDE.md) for detailed contribution guidelines.

### Quick Example

```yaml
id: 'your-topic'
title: 'Your Topic Title'
initial_question: 'Starting question?'
paths:
  yes:
    question: 'Follow-up question?'
    options: ['option1', 'option2']
    paths:
      option1:
        summary: 'AI assistant can help with implementation details'
      option2:
        summary: 'Ask the AI for specific guidance'
  no:
    summary: 'The AI can provide alternative approaches'
metadata:
  author: 'your-github-username'
  version: '1.0.0'
  created: '2024-12-15'
  difficulty: 'intermediate'
```

## 📦 Releases

Knowledge content is automatically versioned and released:

- **Latest Bundle**: [Download →](https://github.com/eugene-taran/sdsa.team/releases/latest)
- **Manifest**: [View →](https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json)
- **Version Format**: `YYYY.MM.DD.PATCH`


## 🏗️ Repository Structure

```
knowledge/
├── manifest.json         # Version and checksums
├── catalog.json         # Available topics
├── authors.json         # Contributors
├── blocks/              # Knowledge trees (YAML)
│   └── *.yaml
└── resources/           # Guides (Markdown)
    └── *.md
```

## 👥 Authors & Contributors

Knowledge blocks are created by the community. Each block includes author attribution, and contributors are recognized in the [authors registry](knowledge/authors.json).

### Become a Contributor

1. Create valuable content
2. Add yourself to `authors.json`
3. Get recognized in the app!

## 🔗 Links

- **Documentation**: [CLAUDE.md](CLAUDE.md)
- **Website**: [sdsa.team](https://sdsa.team)
- **Releases**: [GitHub Releases](https://github.com/eugene-taran/sdsa.team/releases)

## 🛠️ Development

### Prerequisites

- **Node.js**: Required for running validation scripts

### Test Your Content

```bash
# Clone repository
git clone https://github.com/eugene-taran/sdsa.team
cd sdsa.team

# Validate all YAML files
node scripts/validate.js

# Validate a specific file
node scripts/validate.js knowledge/blocks/your-topic.yaml

# Generate checksums
node scripts/generate-checksums.js
```


## 📄 License

All knowledge content is available under the [MIT License](LICENSE). Free to use, modify, and distribute.

## 🙏 Acknowledgments

- Built for the developer community
- Powered by React Native
- Inspired by the need for better learning paths

## 📮 Support

- **Issues**: [Report bugs or suggest features](https://github.com/eugene-taran/sdsa.team/issues)
- **Discussions**: [Ask questions, share ideas](https://github.com/eugene-taran/sdsa.team/discussions)
- **Pull Requests**: [Contribute content](https://github.com/eugene-taran/sdsa.team/pulls)

---

**Ready to contribute?** Check out [CLAUDE.md](CLAUDE.md) for detailed guidelines or jump right in by [creating your first knowledge block](CLAUDE.md#adding-a-new-knowledge-tree)!

*Made with ❤️ by the SDSA community*