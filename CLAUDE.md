# CLAUDE.md - SDSA Knowledge Repository

## Repository Overview

This is the public knowledge repository for SDSA (Software Development Smart Assist). It contains all knowledge trees, resources, and learning paths that power the SDSA application across all platforms (iOS, Android, and Web).

## Purpose

- **Knowledge Trees**: Interactive decision trees that guide everyone in tech through complex topics
- **Resources**: Markdown guides and documentation referenced by knowledge trees
- **Community Driven**: Open for contributions via pull requests
- **Author Attribution**: Contributors are recognized in the app

## Repository Structure

```
sdsa.team/
├── knowledge/
│   ├── manifest.json         # Version and checksum information
│   ├── catalog.json         # List of available topics
│   ├── authors.json         # Contributor registry
│   ├── blocks/              # Knowledge tree YAML files
│   │   ├── e2e-testing.yaml
│   │   ├── react-setup.yaml
│   │   └── ...
│   └── resources/           # Markdown documentation
│       ├── cypress-modern-setup.md
│       ├── playwright-parallel-setup.md
│       └── ...
├── .github/
│   └── workflows/
│       └── release.yml      # Automated release workflow
├── scripts/
│   ├── bump-version.js     # Version management
│   └── generate-checksums.js # Integrity verification
└── docs/
    └── ...                  # Documentation

```

## Knowledge Tree Format

### Basic Structure

```yaml
id: 'unique-identifier'
title: 'Display Title'
description: 'Brief description'
initial_question: 'Starting question?'

paths:
  answer1:
    question: 'Follow-up question?'
    options: ['option1', 'option2']
    resources: 
      - 'guide1.md'
    paths:
      option1:
        resources: 
          - 'specific-guide.md'
        summary: 'Terminal node message'
      option2:
        # More nested paths...
  
  answer2:
    resources:
      - 'alternative-guide.md'
    summary: 'Different path conclusion'

context_variables:
  - variable_name1
  - variable_name2

metadata:
  author: 'github-username'  # Your GitHub username
  version: '1.0.0'
  created: '2024-12-15'
  last_updated: '2024-12-15'
  estimated_time: '10 minutes'
  difficulty: 'beginner|intermediate|advanced'
  tags: ['tag1', 'tag2']
```

### Key Concepts

1. **Paths**: Each user answer creates a new path branch
2. **Resources**: Markdown files shown at any node (accumulate through journey)
3. **Terminal Nodes**: End with `summary` and/or `resources`, no more questions
4. **Context Variables**: Track user's journey for AI chat context
5. **Metadata**: Author attribution and content metadata

## Contributing

### Adding a New Knowledge Tree

1. **Fork this repository**

2. **Create your knowledge tree**:
```bash
# Create new YAML file
touch knowledge/blocks/your-topic.yaml
```

3. **Add yourself as author**:
```json
// In knowledge/authors.json
{
  "your-github-username": {
    "name": "Your Name",
    "github": "your-github-username",
    "avatar": "https://github.com/your-github-username.png",
    "bio": "Brief bio",
    "contributions": ["your-topic"],
    "joined": "2024-12-15"
  }
}
```

4. **Create supporting resources**:
```bash
# Add markdown guides
touch knowledge/resources/your-guide.md
```

5. **Update catalog**:
```json
// In knowledge/catalog.json
{
  "id": "your-topic",
  "title": "Your Topic Title",
  "description": "Brief description",
  "category": "category-name",
  "difficulty": "intermediate",
  "estimatedTime": "15 mins",
  "blockId": "your-topic"
}
```

6. **Submit pull request**

### Resource Guidelines

Resources should:
- Be self-contained markdown files
- Include code examples with syntax highlighting
- Have clear sections and headings
- Include author attribution at the bottom
- Focus on practical, actionable content

Example resource structure:
```markdown
# Title

## Overview
Brief introduction

## Installation
Step-by-step setup

## Configuration
Code examples

## Best Practices
Recommendations

## Troubleshooting
Common issues and solutions

---
*Author: github-username | Last updated: 2024-12-15*
```

### Validation

Before submitting:
```bash
# Validate YAML syntax
node scripts/validate-yaml.js

# Generate checksums
node scripts/generate-checksums.js

# Test locally (if you have SDSA app)
# Point app to your fork for testing
```

## Release Process

### Automated Releases

Releases are automated via GitHub Actions:

1. **Trigger**: Push to `main` branch with changes in `knowledge/` folder
2. **Version**: Date-based format `YYYY.MM.DD.PATCH`
3. **Artifacts**: Creates `.zip` and `.tar.gz` bundles
4. **Distribution**: Published as GitHub releases

### Version Manifest

The `manifest.json` is automatically updated with:
- Version number
- Release timestamp
- File checksums
- Content statistics

### Consuming Releases

The SDSA app fetches content from:
- **Manifest**: `https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json`
- **Bundle**: `https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.zip`

## Content Guidelines

### Quality Standards

- **Accuracy**: Information must be technically correct
- **Clarity**: Clear, concise explanations
- **Completeness**: Cover common scenarios
- **Maintenance**: Keep content up-to-date

### Topic Selection

Good topics for knowledge trees:
- Complex setup processes (CI/CD, testing, deployment)
- Framework configurations (React, Vue, Angular)
- Tool integrations (Docker, Kubernetes)
- Best practices and patterns
- Troubleshooting guides

### Depth Guidelines

- **Minimum**: 2-3 levels of questions
- **Maximum**: No hard limit, but consider UX
- **Balance**: Mix of quick and detailed paths
- **Resources**: At least 1-2 resources per major path

## Testing Your Content

### Local Testing

1. **Clone the repo**:
```bash
git clone https://github.com/your-username/sdsa.team
cd sdsa.team
```

2. **Validate structure**:
```bash
# Check YAML validity
cat knowledge/blocks/your-topic.yaml | node -e "console.log(require('js-yaml').load(require('fs').readFileSync(0, 'utf8')))"
```

3. **Test with app** (if available):
- Point SDSA app to your fork
- Navigate through your knowledge tree
- Verify resources load correctly

### Pull Request Testing

- CI will validate YAML syntax
- Reviewers will check content quality
- Test deployment available for verification

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

## API Endpoints

### Public Access Points

```bash
# Get manifest (version info)
curl https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json

# Get catalog (topic list)
curl https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/catalog.json

# Get specific block
curl https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/blocks/e2e-testing.yaml

# Get resource
curl https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/resources/cypress-modern-setup.md

# Download full bundle
curl -L https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.zip
```

### Rate Limiting

GitHub raw content has rate limits:
- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5000 requests/hour

The SDSA app caches content locally to minimize API calls.

## Licensing

### Content License

All knowledge content is available under [MIT License](LICENSE):
- Free to use, modify, and distribute
- Attribution appreciated but not required
- No warranty provided

### Contribution Agreement

By contributing, you agree that:
- Your content is original or properly attributed
- You grant MIT license for your contributions
- You're listed in `authors.json` for attribution

## Roadmap

### Current Features
- ✅ Knowledge tree system
- ✅ Resource management
- ✅ Author attribution
- ✅ Automated releases
- ✅ Version management

### Planned Features
- 📋 Knowledge tree templates
- 📋 Interactive preview tool
- 📋 Translation support
- 📋 Difficulty progression tracking
- 📋 Community voting/rating

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
- **Main App**: [github.com/eugene-taran/sdsa](https://github.com/eugene-taran/sdsa)
- **Maintainer**: Eugene Taran (@eugene-taran)