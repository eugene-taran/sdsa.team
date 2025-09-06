# SDSA Contexts Repository

[![Release](https://img.shields.io/github/v/release/eugene-taran/sdsa.team)](https://github.com/eugene-taran/sdsa.team/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Categories](https://img.shields.io/badge/categories-2-blue)](contexts/categories)
[![Topics](https://img.shields.io/badge/questionnaires-2-green)](contexts/categories)
[![Contributors](https://img.shields.io/badge/contributors-welcome-brightgreen)](CLAUDE.md#contributing)

Open-source questionnaire repository for **SDSA (Software Development Smart Assist)** - AI-powered development assistance through context-aware conversations.

## 🚀 What is SDSA?

SDSA is a cross-platform application (iOS, Android, Web) that provides personalized AI assistance by first understanding your context through interactive questionnaires. Unlike generic AI assistants, SDSA:

- **Gathers Context** - Uses questionnaires to understand your specific needs
- **AI-Powered Chat** - Provides tailored recommendations based on your answers
- **Privacy-First** - Your conversations stay private, questionnaires are open-source
- **Offline Support** - Cached questionnaires work without internet
- **On-device LLMs** - one of the first priorities on the roadmap

## 📚 Repository Structure

```
contexts/
├── categories.json      # All category metadata
└── categories/          # Category folders
    ├── cicd/            # CI/CD & DevOps
    │   └── cicd-pipeline.json
    ├── e2e/             # Testing & Quality
    │   └── e2e-testing.json
    └── ...
```

## 🎯 How It Works

1. **Choose a questionnaire** - Select from available topics
2. **Answer questions** - Provide context about your specific situation
3. **Get AI assistance** - Receive personalized recommendations via chat
4. **Continue conversation** - Ask follow-up questions with full context

## 📝 File Formats

### Categories Metadata (categories.json)

All categories are defined in a single `contexts/categories.json` file:

```json
{
  "categories": [
    {
      "id": "cicd",
      "name": "CI/CD & DevOps",
      "description": "Continuous Integration, Continuous Deployment, and DevOps practices",
      "icon": "🚀",
      "path": "cicd",
      "order": 1
    },
    {
      "id": "e2e",
      "name": "Testing & Quality",
      "description": "Testing strategies, frameworks, and quality assurance",
      "icon": "🧪",
      "path": "e2e",
      "order": 2
    }
  ]
}
```

### Questionnaire Format

Questionnaires use JSON. The `id` should match the filename (e.g., file `e2e-testing.json` has `id: "e2e-testing"`). Metadata is optional and currently only contains the author field:

```json
{
  "id": "your-topic-name",
  "title": "Questionnaire Title",
  "description": "What this helps with",
  "questions": [
    {
      "type": "radio",
      "label": "Your question?",
      "options": [
        { "value": "opt1", "label": "Option 1" },
        { "value": "opt2", "label": "Option 2" }
      ]
    }
  ],
  "llmConfig": {
    "systemPrompt": "You are an expert...",
    "temperature": 0.7,
    "maxTokens": 1500
  },
  "metadata": {
    "author": "github-username"
  }
}
```

## 📊 Available Question Types

### Input Types (4 total)
- **text** - Single-line text input (names, numbers, emails, etc.)
- **textarea** - Multi-line text input (descriptions, requirements)
- **radio** - Single choice from options
- **checkbox** - Multiple choice selection

### Features
- **Text Input on Options** - Any radio/checkbox option can have `hasTextInput: true`
- **Placeholders** - Help text for users

## 🎮 Full Example: CI/CD Setup Questionnaire

```json
{
  "id": "cicd-setup",
  "title": "CI/CD Pipeline Configuration",
  "description": "Get personalized CI/CD setup recommendations",
  "questions": [
    {
      "type": "radio",
      "label": "Which CI/CD platform are you using?",
      "options": [
        { "value": "github-actions", "label": "GitHub Actions" },
        { "value": "jenkins", "label": "Jenkins" },
        { "value": "gitlab-ci", "label": "GitLab CI" },
        { 
          "value": "other", 
          "label": "Other", 
          "hasTextInput": true,
          "textInputPlaceholder": "Please specify..."
        }
      ]
    },
    {
      "type": "checkbox",
      "label": "What type of projects will you build?",
      "options": [
        { "value": "nodejs", "label": "Node.js" },
        { "value": "python", "label": "Python" },
        { "value": "docker", "label": "Docker" },
        { "value": "mobile", "label": "Mobile (iOS/Android)" }
      ]
    },
    {
      "type": "radio",
      "label": "Where will you deploy?",
      "options": [
        { "value": "aws", "label": "AWS" },
        { "value": "gcp", "label": "Google Cloud" },
        { "value": "azure", "label": "Azure" },
        { "value": "self-hosted", "label": "Self-hosted servers" }
      ]
    },
    {
      "type": "text",
      "label": "How many developers on your team?",
      "placeholder": "Enter number"
    },
    {
      "type": "radio",
      "label": "Do you have automated tests?",
      "options": [
        { "value": "yes", "label": "Yes" },
        { "value": "no", "label": "No" }
      ]
    },
    {
      "type": "checkbox",
      "label": "Which test types?",
      "options": [
        { "value": "unit", "label": "Unit Tests" },
        { "value": "integration", "label": "Integration Tests" },
        { "value": "e2e", "label": "End-to-End Tests" },
        { "value": "performance", "label": "Performance Tests" }
      ]
    },
    {
      "type": "textarea",
      "label": "Any specific requirements or constraints?",
      "placeholder": "E.g., must comply with SOC2, need blue-green deployments...",
      "rows": 4
    }
  ],
  "llmConfig": {
    "systemPrompt": "You are a DevOps expert. Based on the user's CI/CD requirements, provide specific configuration examples, best practices, and step-by-step implementation guidance. Include actual config files where relevant.",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "metadata": {
    "author": "eugene-taran"
  }
}
```

## 🤝 Contributing

We welcome contributions! Add your expertise:

### Quick Start

1. **Fork** this repository
2. **Create** your questionnaire:
```bash
# Create a new category folder (if needed)
mkdir -p contexts/categories/your-category

# Add your category to contexts/categories.json
# Edit the file to add your category metadata

# Create your questionnaire file
touch contexts/categories/your-category/your-topic.json
```
3. **Add** your questions following the format above
4. **Submit** a pull request

### Contribution Guidelines

- **Focus on context gathering** - Questions should help understand the user's specific situation
- **Be comprehensive** - Cover common scenarios and edge cases
- **Write clear labels** - Questions should be easy to understand
- **Include good prompts** - Help the LLM provide valuable responses

### Ideas for Contributions

- Architecture decisions (monolith vs microservices)
- Database selection helper
- Authentication implementation guide
- API design questionnaire
- Testing strategy advisor
- Performance optimization guide
- Security audit checklist
- Cloud migration planner

## 📱 For End Users

1. Open SDSA app (coming soon to App Store/Play Store)
2. Browse available questionnaires
3. Complete relevant questions
4. Chat with AI using your context

## 🔄 Versioning

- Questionnaires are versioned individually
- The repository uses date-based releases: `YYYY.MM.DD.PATCH`
- Manifest.json is auto-generated during releases with content checksum

## 📄 License

MIT - See [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

Built with ❤️ by the open-source community for developers everywhere.

Special thanks to all [contributors](https://github.com/eugene-taran/sdsa.team/graphs/contributors)!

---

**Want to contribute?** Check out our [detailed guide](CLAUDE.md) or open an issue with your ideas!
