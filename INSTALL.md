# Installation Guide

## Quick Install

1. **Install Tampermonkey**:
   - [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)

2. **Install CoreTabs**:
   - Click: [📥 Install CoreTabs](https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/coretabs.user.js)
   - Confirm installation in Tampermonkey

3. **Done!** Visit CoreTax intranet to see the enhanced interface

## Manual Installation

1. Download the script file: [coretabs.user.js](https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/coretabs.user.js)
2. Open Tampermonkey dashboard
3. Click "Create a new script"
4. Replace the template with the downloaded script
5. Save (Ctrl+S)

## For Developers

```bash
# Clone and build
git clone https://github.com/diasbaskara/ct.git
cd ct
pnpm install
pnpm build

# Install from dist/coretabs.user.js
```

## Mobile Installation

### iOS
1. Install [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)
2. Visit the [install link](https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/coretabs.user.js)
3. Follow prompts to install

### Android
1. Install [Tampermonkey](https://play.google.com/store/apps/details?id=net.biniok.tampermonkey)
2. Visit the [install link](https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/coretabs.user.js)
3. Confirm installation

## Troubleshooting

**Script not working?**
- Make sure Tampermonkey is enabled
- Check you're on the correct website
- Look for errors in browser console (F12)

**Installation failed?**
- Try disabling popup blockers
- Use manual installation method
- Check if corporate firewall is blocking

**Need help?**
- [Create an issue](https://github.com/diasbaskara/ct/issues)
- [Join discussions](https://github.com/diasbaskara/ct/discussions)

## Updates

Scripts automatically check for updates every 24 hours. You'll get a notification when updates are available.