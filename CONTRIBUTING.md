# Contributing to CreatorVault

First off, thank you for considering contributing to CreatorVault! It's people like you that make CreatorVault such a great tool for content creators and their communities.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [How to Contribute](#how-to-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- **Be respectful**: Treat everyone with respect. No harassment, trolling, or discriminatory behavior.
- **Be collaborative**: Work together and help each other learn and grow.
- **Be constructive**: Provide constructive feedback and be open to receiving it.
- **Be professional**: Keep discussions focused on the project and technical matters.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- Python 3.8+ installed
- Git installed
- A GitHub account
- Pera Wallet (for testing blockchain features)
- Basic knowledge of:
  - React and TypeScript
  - Python and Flask
  - Algorand blockchain (helpful but not required)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/algos2.git
   cd algos2/techtrio
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Sarthaknimje/algos2.git
   ```

4. **Follow the setup instructions** in [SETUP.md](SETUP.md)

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation updates

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Code contributions**: Bug fixes, new features, performance improvements
2. **Documentation**: README updates, code comments, tutorials
3. **Design**: UI/UX improvements, graphics, animations
4. **Testing**: Writing tests, reporting bugs
5. **Community**: Helping others, answering questions

### Finding Issues to Work On

- Check the [Issues](https://github.com/Sarthaknimje/algos2/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to let others know you're working on it

### Making Changes

1. **Create a branch** for your changes
2. **Make your changes** following our style guidelines
3. **Test your changes** thoroughly
4. **Commit your changes** following commit guidelines
5. **Push to your fork**
6. **Create a Pull Request**

## Style Guidelines

### TypeScript/React

- Use functional components with hooks
- Use TypeScript for type safety
- Follow the existing code structure
- Use path aliases: `@components`, `@services`, etc.
- Keep components small and focused (< 300 lines)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

**Example:**
```typescript
/**
 * Creates a new creator token on Algorand
 * @param params - Token creation parameters
 * @returns Promise resolving to created token info
 */
async function createCreatorToken(params: TokenParams): Promise<TokenInfo> {
  // Implementation
}
```

### Python/Flask

- Follow PEP 8 style guide
- Use type hints where applicable
- Add docstrings to functions and classes
- Keep functions focused and small
- Use meaningful variable names
- Handle errors appropriately

**Example:**
```python
def validate_token_params(token_name: str, total_supply: int) -> tuple[bool, str]:
    """
    Validate token creation parameters.
    
    Args:
        token_name: Name of the token
        total_supply: Total token supply
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Implementation
```

### File Organization

```
src/
├── components/     # React components
├── pages/         # Page components
├── services/      # API and business logic
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
├── utils/         # Utility functions
└── assets/        # Static assets
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(wallet): add Pera Wallet connection support

- Implemented wallet connection flow
- Added wallet state management
- Created wallet context provider

Closes #123
```

```bash
fix(api): resolve YouTube OAuth callback error

Fixed issue where OAuth callback was failing due to
missing session ID parameter.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. ✅ Ensure your code follows style guidelines
2. ✅ Add/update tests if applicable
3. ✅ Update documentation if needed
4. ✅ Run linters and fix any issues
5. ✅ Test your changes locally
6. ✅ Rebase on latest main branch

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
```

### Review Process

1. At least one maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be credited in release notes

## Reporting Bugs

### Before Reporting

- Check if the bug has already been reported
- Ensure you're using the latest version
- Try to reproduce the bug

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Safari]
- Node version: [e.g., 18.0.0]
- Python version: [e.g., 3.11.0]

**Additional context**
Any other relevant information
```

## Suggesting Features

We love new ideas! To suggest a feature:

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with the `enhancement` label
3. **Describe the feature** clearly
4. **Explain the use case** and benefits
5. **Discuss implementation** ideas (optional)

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of what you want to happen

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or other context
```

## Community

### Getting Help

- 💬 [GitHub Discussions](https://github.com/Sarthaknimje/algos2/discussions)
- 📧 Email: sarthaknimje@gmail.com
- 🐛 [Issue Tracker](https://github.com/Sarthaknimje/algos2/issues)

### Communication Guidelines

- Be respectful and professional
- Stay on topic
- Help others when you can
- Share your knowledge and experience

## Development Tips

### Frontend Development

```bash
# Run with hot reload
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Backend Development

```bash
# Activate virtual environment
source venv/bin/activate

# Run Flask server
python app.py

# Install new dependencies
pip install package-name
pip freeze > requirements.txt
```

### Testing Blockchain Features

1. Use Algorand testnet (already configured)
2. Get test ALGO from [Testnet Dispenser](https://bank.testnet.algorand.network/)
3. Test with Pera Wallet on testnet

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

Don't hesitate to reach out if you have questions:
- Email: sarthaknimje@gmail.com, itsapurvasb343@gmail.com, tanushreediwan98@gmail.com
- Open a discussion on GitHub

**Thank you for contributing to CreatorVault! 🎉**

