# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the public knowledge repository for SDSA (Software Development Smart Assist). It contains JSON questionnaires that collect context from users to provide personalized AI-powered recommendations.

## Purpose

- **Contexts Questionnaires**: Context-gathering questionnaires that collect user requirements and preferences
- **AI-Powered Recommendations**: User answers are processed by LLM to generate personalized guidance
- **Community Driven**: Open for contributions via pull requests
- **Author Attribution**: Contributors are recognized in the app

## Common Development Commands

```bash
# Validate all JSON files in contexts/topics/
node scripts/validate.js

# Validate a specific questionnaire
node scripts/validate.js contexts/topics/your-topic.json

# Generate checksums for all files (updates manifest.json)
node scripts/generate-checksums.js

# Bump version (updates manifest.json with new version)
node scripts/bump-version.js
```

## Repository Structure

```
sdsa.team/
├── contexts/
│   ├── manifest.json         # Version and checksum information
│   └── cicd/                 # Domain
│       ├── e2e-testing.json  # Questionnaire JSON files
│       ├── cicd-pipeline.json
│       └── ...
├── .github/
│   └── workflows/
│       ├── release.yml      # Automated release workflow
│       └── validate-pr.yml  # PR validation checks
├── scripts/
│   ├── validate.js          # JSON validation script
│   ├── bump-version.js      # Version management
│   └── generate-checksums.js # Integrity verification
└── docs/
    └── ...                  # Documentation

```

## High-Level Architecture

### Content Distribution Model
- **Static Repository**: All questionnaires are stored as static JSON files
- **Version-Based Releases**: Content is bundled and versioned using date-based format (YYYY.MM.DD.PATCH)
- **GitHub Raw API**: Apps fetch content directly from GitHub's raw content CDN
- **Offline-First**: Apps cache content locally for offline access

### Automated Workflow System
1. **PR Validation** (`validate-pr.yml`): Runs on every PR that modifies contexts content
   - Validates JSON syntax
   - Checks author attribution
   - Verifies resource references exist
   - Ensures required files are present

2. **Release Pipeline** (`release.yml`): Triggers on pushes to main branch
   - Auto-generates version number
   - Calculates checksums for all files
   - Updates manifest.json
   - Creates GitHub release with bundled artifacts

### Content Validation Rules
- All JSON files must have valid syntax
- ID should match the filename (without .json extension)

## Questionnaire Format

### Basic Structure

The `id` field should match the filename without extension (e.g., file `e2e-testing.json` should have `id: "e2e-testing"`). Metadata is optional and currently only contains the author field:

```json
{
  "id": "e2e-testing",
  "title": "E2E Testing Setup", 
  "description": "Help configure end-to-end testing for your project",
  "questions": [
    {
      "type": "radio",
      "label": "What is your primary use case?",
      "options": [
        {
          "value": "option1",
          "label": "Option 1 Display Text"
        },
        {
          "value": "option2", 
          "label": "Option 2 Display Text"
        }
      ]
    },
    {
      "type": "checkbox",
      "label": "Which features do you need?",
      "options": [
        {
          "value": "feature1",
          "label": "Feature 1"
        },
        {
          "value": "feature2",
          "label": "Feature 2"
        }
      ]
    },
    {
      "type": "text",
      "label": "Describe any specific requirements",
      "placeholder": "Enter your requirements..."
    }
  ],
  "llmConfig": {
    "systemPrompt": "You are an expert assistant. Based on the user's answers, provide specific, actionable recommendations.",
    "temperature": 0.7,
    "maxTokens": 1500
  },
  "metadata": {
    "author": "github-username"
  }
}
```

### Question Types and Examples

#### 1. Text Input (Single-line)
```json
{
  "type": "text",
  "label": "What is your project name?",
  "placeholder": "Enter project name"
}
```

#### 2. Textarea (Multi-line)
```json
{
  "type": "textarea",
  "label": "Describe your requirements",
  "placeholder": "Enter detailed description..."
}
```

#### 3. Radio Buttons (Single Choice)
```json
{
  "type": "radio",
  "label": "Select your platform",
  "options": [
    { "value": "aws", "label": "Amazon Web Services" },
    { "value": "gcp", "label": "Google Cloud Platform" },
    { "value": "azure", "label": "Microsoft Azure" }
  ]
}
```

#### 4. Radio with Text Input Option
```json
{
  "type": "radio",
  "label": "Which framework are you using?",
  "options": [
    { "value": "react", "label": "React" },
    { "value": "vue", "label": "Vue" },
    { "value": "angular", "label": "Angular" },
    { 
      "value": "other", 
      "label": "Other", 
      "hasTextInput": true,
      "textInputPlaceholder": "Please specify..."
    }
  ]
}
```

#### 5. Checkboxes (Multiple Choice)
```json
{
  "type": "checkbox",
  "label": "Select features you need",
  "options": [
    { "value": "auth", "label": "Authentication" },
    { "value": "database", "label": "Database Integration" },
    { "value": "api", "label": "REST API" },
    { 
      "value": "other", 
      "label": "Other", 
      "hasTextInput": true,
      "textInputPlaceholder": "Specify other features..."
    }
  ]
}
```

### Key Concepts

1. **ID Format**: Use kebab-case like filename (e.g., "cicd-setup", "e2e-testing")
2. **Questions Array**: All questions in a flat array with unique IDs
3. **Four Input Types**: text, textarea, radio, checkbox
4. **Text Input Options**: Any option can have `hasTextInput: true` for custom values
5. **Validation**: Optional validation rules (maxLength, minLength, patterns)
6. **LLM Configuration**: Settings for AI chat responses
7. **Metadata**: Optional, currently only contains author field

## Contributing

### Prerequisites

- **Node.js**: Required for running validation scripts. [Download Node.js](https://nodejs.org/)

### Critical Development Rules

1. **NEVER modify manifest.json manually** - It's auto-generated by scripts and GitHub Actions
2. **Question IDs must be unique** - Within each questionnaire file
4. **Use scripts/validate.js before committing** - Catches errors before PR submission
5. **Version format is automatic** - Don't create version tags manually

### Adding a New Questionnaire

1. **Fork this repository**

2. **Create your questionnaire**:
```bash
# Create new JSON file
touch contexts/topics/your-topic.json
```

3. **Add questionnaire content**:
```json
{
  "id": "your-topic",
  "title": "Your Topic Title",
  "description": "Brief description",
  "questions": [
    {
      "id": "q1",
      "type": "radio",
      "label": "Your first question?",
      "options": [
        { "value": "option1", "label": "Option 1" },
        { "value": "option2", "label": "Option 2" }
      ]
    }
  ],
  "llmConfig": {
    "systemPrompt": "You are an expert assistant...",
    "temperature": 0.7,
    "maxTokens": 1500
  },
  "metadata": {
    "author": "your-github-username"
  }
}
```

4. **Submit pull request**

### Validation

Before submitting:
```bash
# Validate all JSON files
node scripts/validate.js

# Or validate a specific file
node scripts/validate.js contexts/topics/your-topic.json
```

## Release Process

### Automated Releases

Releases are automated via GitHub Actions:

1. **Trigger**: Push to `main` branch with changes in `contexts/` folder
2. **Version**: Date-based format `YYYY.MM.DD.PATCH`
3. **Artifacts**: Creates `.zip` and `.tar.gz` bundles
4. **Distribution**: Published as GitHub releases

### Version Manifest

The `manifest.json` is automatically updated with:
- Version number
- Release timestamp
- File checksums
- Content statistics


### Quality Standards

- **Clarity**: Information should help LLM to gather context
- **Maintenance**: Keep content up-to-date

### Topic Selection

Good topics for questionnaires:
- Complex setup processes (CI/CD, testing, deployment)
- Framework configurations (React, Vue, Angular)
- Tool integrations (Docker, Kubernetes)
- Best practices and patterns
- Troubleshooting guides


## Testing Your Content

### Pre-Commit Validation

```bash
# Always run before committing:
node scripts/validate.js
```

### Local Testing

1. **Clone the repo**:
```bash
git clone https://github.com/your-username/sdsa.team
cd sdsa.team
```

2. **Validate structure**:
```bash
# Check JSON validity
node scripts/validate.js contexts/blocks/your-topic.json
```

3. **Verify structure**:
- Ensure JSON follows the questionnaire format

### Pull Request Testing

When you submit a pull request, automated checks will run:

1. **JSON Validation**: All JSON files must pass syntax validation
3. **Question Validation**: Checks for valid types and correct fields

The PR will be blocked from merging if any validation fails. You'll see:
- ✅ Green check if all validations pass
- ❌ Red X if any validation fails (with details in the logs)

Manual review will check:
- Content quality and accuracy
- Appropriate difficulty level
- Clear and helpful resources

## Community

### Getting Help

- **Issues**: Report bugs or suggest improvements
- **Discussions**: Ask questions, share ideas
- **Pull Requests**: Contribute new content

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Attribute sources properly

## Licensing

### Content License

All contexts content is available under [MIT License](LICENSE):
- Free to use, modify, and distribute
- Attribution appreciated but not required
- No warranty provided

### Contribution Agreement

By contributing, you agree that:
- You grant MIT license for your contributions

## Roadmap

- 

### Current Features
- ✅ Questionnaire system
- ✅ LLM integration configuration
- ✅ Author attribution
- ✅ Automated releases
- ✅ Version management

## Maintenance

### Regular Tasks

- **Weekly**: Review and merge PRs
- **Monthly**: Update popular topics
- **Quarterly**: Audit content quality
- **Yearly**: Major structure updates

### Deprecation Process

When content becomes outdated:
1. Mark as deprecated in metadata
2. Add migration guide
3. Maintain for 6 months
4. Archive or remove

## Contact

- **Repository**: [github.com/eugene-taran/sdsa.team](https://github.com/eugene-taran/sdsa.team)
- **Maintainer**: Eugene Taran (@eugene-taran)
- always remember that we are building questionaires
