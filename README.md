# CT Collection

A modular, feature-rich collection of userscripts with shared infrastructure for enhanced web experiences.

## 🚀 Available Scripts

### CoreTabs
A comprehensive userscript for enhancing the CoreTax intranet experience.

**Features:**
- Modular architecture with reusable components
- Automatic updates with version checking
- Internationalization support (English, Indonesian)
- Modern build system with CSS injection
- CI/CD pipeline with automated deployment

## 📦 Installation

### Quick Install

1. **Install a userscript manager:**
   - [Tampermonkey](https://tampermonkey.net/) (Chrome, Firefox, Safari, Edge)
   - [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/) (Firefox)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)

2. **Browse and install scripts:**
   - **Browse All Scripts**: [📋 Script Gallery](https://githack.com/diasbaskara/ct/raw/main/cdn/index.html)
   - **Install Helper**: [🔧 Installation Assistant](https://githack.com/diasbaskara/ct/raw/main/cdn/install.html)
   - **CoreTabs**: [📥 Install Latest](https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/coretabs.user.js)

### Manual Installation

1. Download the desired `.user.js` file from the [releases page](https://github.com/diasbaskara/ct/releases)
2. Open your userscript manager dashboard
3. Create a new script and paste the contents
4. Save and enable the script

For detailed installation instructions, see [INSTALL.md](INSTALL.md).

## 🛠️ Development

### Quick Start

```bash
# Clone the repository
git clone https://github.com/diasbaskara/ct.git
cd ct

# Install dependencies
pnpm install

# Build all scripts
pnpm run build

# Build specific script
pnpm run build:coretabs

# Development mode with watch
pnpm run dev:coretabs

# Deploy all scripts to CDN
pnpm run deploy

# Deploy specific script
pnpm run deploy:coretabs
```

### Adding New Scripts

1. **Create script directory:**
   ```bash
   mkdir scripts/newscript
   mkdir scripts/newscript/src
   mkdir scripts/newscript/styles
   ```

2. **Create configuration:**
   ```json
   // scripts/newscript/config.json
   {
     "name": "newscript",
     "displayName": "New Script",
     "description": "Description of the new script",
     "version": "1.0.0",
     "match": "https://example.com/*",
     "namespace": "https://github.com/diasbaskara/ct",
     "homepage": "https://github.com/diasbaskara/ct",
     "supportURL": "https://github.com/diasbaskara/ct/issues",
     "updateURL": "https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/newscript.meta.js",
     "downloadURL": "https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/newscript.user.js",
     "grant": ["none"],
     "require": []
   }
   ```

3. **Create entry point:**
   ```javascript
   // scripts/newscript/src/main.js
   import '@shared/ui/styles/variables.css';
   import { createLogger } from '@utils/logger';
   
   class NewScript {
     constructor() {
       this.logger = createLogger('NewScript');
     }
   
     init() {
       this.logger.info('NewScript initialized');
       // Your script logic here
     }
   }
   
   // Initialize when DOM is ready
   if (document.readyState === 'loading') {
     document.addEventListener('DOMContentLoaded', () => new NewScript().init());
   } else {
     new NewScript().init();
   }
   ```

4. **Build and test:**
   ```bash
   pnpm run build:newscript
   pnpm run deploy:newscript
   ```

### Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[API Documentation](API.md)** - Internal APIs and module documentation
- **[Installation Guide](INSTALL.md)** - Detailed installation instructions

### Project Structure

scripts/
├── coretabs/          # CoreTabs script
│   ├── config.json    # Script configuration
│   ├── src/           # Script source code
│   └── styles/        # Script-specific styles
└── newscript/         # Example new script
├── config.json
├── src/
└── styles/

shared/                # Shared modules across all scripts
├── api/               # API integration modules
├── core/              # Core functionality and configuration
├── i18n/              # Internationalization
├── ui/                # UI components and event handlers
└── utils/             # Utility functions

build/                 # Build system and deployment scripts
├── deploy.js          # Multi-script deployment
├── css-to-string-loader.js
└── templates/         # Build templates

.github/workflows/     # CI/CD pipelines
cdn/                   # CDN distribution files
dist/                  # Build output

## 🔧 Available Scripts

### Build Commands
- `pnpm run build` - Build all scripts
- `pnpm run build:coretabs` - Build CoreTabs
- `pnpm run dev:coretabs` - Development mode with watch

### Deploy Commands
- `pnpm run deploy` - Deploy all scripts to CDN
- `pnpm run deploy:coretabs` - Deploy CoreTabs

### Development Commands
- `pnpm run lint` - Lint all scripts
- `pnpm run test` - Run tests
- `pnpm run new-script` - Create new script template

## 🌐 Browser Compatibility

| Browser | Userscript Manager | Status |
|---------|-------------------|--------|
| Chrome  | Tampermonkey      | ✅ Fully Supported |
| Firefox | Tampermonkey      | ✅ Fully Supported |
| Firefox | Greasemonkey      | ✅ Fully Supported |
| Edge    | Tampermonkey      | ✅ Fully Supported |
| Safari  | Tampermonkey      | ⚠️ Limited Support |

## 🔄 Updates

All scripts include automatic update checking:

- **Automatic**: Updates are checked every 24 hours
- **Manual**: Click the update notification when available
- **Version Control**: Rollback to previous versions if needed

### Update Channels

- **Latest**: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/`
- **Specific Version**: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/v1.0.0/`
- **Versions Manifest**: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/versions.json`

## 🐛 Troubleshooting

### Common Issues

1. **Script not loading**
   - Check if userscript manager is enabled
   - Verify the script is enabled in the dashboard
   - Check browser console for errors

2. **Features not working**
   - Ensure you're on the correct domain
   - Check if you're logged into the target site
   - Try refreshing the page

3. **Update issues**
   - Manually check for updates in userscript manager
   - Clear browser cache
   - Reinstall the script if necessary

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Coding standards and best practices
- Submitting pull requests
- Reporting bugs and requesting features

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Web platform developers for creating amazing sites
- Userscript community for tools and inspiration
- Contributors who help improve this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/diasbaskara/ct/issues)
- **Discussions**: [GitHub Discussions](https://github.com/diasbaskara/ct/discussions)
- **Documentation**: [Project Wiki](https://github.com/diasbaskara/ct/wiki)

---

**Made with ❤️ for the web community**

The main changes include:
1. Title changed from "Userscripts Collection" to "CT Collection"
2. All GitHub URLs updated from `diasbaskara/userscripts` to `diasbaskara/ct`
3. All CDN URLs updated from `userscripts@main` to `ct@main`
4. Repository clone command updated to use `ct` instead of `userscripts`
5. Directory name in clone command changed from `userscripts` to `ct`