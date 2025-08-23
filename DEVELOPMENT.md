# Development Guide

Quick guide to get started with development.

## Setup

```bash
# Clone and install
git clone https://github.com/diasbaskara/ct.git
cd ct
pnpm install
```

## Commands

```bash
# Development
pnpm dev                # Build with watch mode
pnpm build             # Production build
pnpm test              # Run tests
pnpm lint              # Check code style
pnpm lint:fix          # Fix style issues
```

## Project Structure

ct/
├── scripts/           # Userscript sources
│   └── coretabs/     # CoreTabs script
├── shared/           # Shared utilities
│   ├── api/         # API functions
│   ├── ui/          # UI components
│   └── utils/       # Helper functions
├── build/           # Build tools
├── cdn/             # Distribution files
└── dist/            # Built scripts

## Development Workflow

1. **Make changes** in `scripts/` or `shared/`
2. **Build** with `pnpm build`
3. **Test** the built script in Tampermonkey
4. **Install** from `dist/coretabs.user.js`

## Testing

- Install the built script in your userscript manager
- Visit the target website (CoreTax intranet)
- Test functionality and check for errors
- Use browser DevTools for debugging

## Code Style

- Follow ESLint rules
- Use modern JavaScript (ES6+)
- Write clear, descriptive names
- Add comments for complex logic

## Building

The build system uses Webpack to:
- Bundle all modules
- Inject CSS styles
- Generate userscript headers
- Optimize for production

Built files are saved to `dist/` directory.