const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

class MultiScriptDeployer {
  constructor() {
    this.verbose = process.env.DEPLOY_VERBOSE === 'true' || process.argv.includes('--verbose');
    this.packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    this.version = this.packageJson.version;
    this.cdnDir = './cdn';
    this.distDir = './dist';

    // Get script name from command line args
    const scriptArg = process.argv.find(arg => arg.startsWith('--script='));
    this.targetScript = scriptArg ? scriptArg.split('=')[1] : null;
  }

  getScriptConfigs() {
    const configPaths = glob.sync('scripts/*/config.json');
    return configPaths.map(configPath => {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const scriptName = path.basename(path.dirname(configPath));
      return { ...config, scriptName };
    });
  }

  validateConfig(config) {
    const required = ['name', 'description', 'match', 'namespace'];
    const missing = required.filter(field => !config[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required config fields for ${config.scriptName}: ${missing.join(', ')}`);
    }
  }

  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }

  warn(message) {
    if (this.verbose) {
      console.warn(message);
    }
  }

  error(message, error) {
    console.error(message, error);
  }

  async deploy() {
    this.log('🚀 Starting multi-script deployment...');

    const scriptConfigs = this.getScriptConfigs();
    const targetConfigs = this.targetScript
      ? scriptConfigs.filter(config => config.scriptName === this.targetScript)
      : scriptConfigs;

    if (targetConfigs.length === 0) {
      throw new Error(`Script '${this.targetScript}' not found`);
    }

    // Build scripts
    await this.buildScripts(targetConfigs);

    // Deploy to CDN
    await this.deployCDN(targetConfigs);

    // Update versions manifest
    await this.updateVersionsManifest(targetConfigs);

    this.log('✅ Deployment completed successfully!');
  }

  async buildScripts(configs) {
    this.log('📦 Building scripts...');

    for (const config of configs) {
      this.log(`Building ${config.scriptName}...`);
      const buildCmd = `npx webpack --mode production --env script=${config.scriptName}`;
      try {
        execSync(buildCmd, { stdio: 'inherit' });
      } catch (error) {
        this.error(`❌ Build failed for ${config.scriptName}:`, error.message);
        throw error;
      }
    }
  }

  async deployCDN(configs) {
    this.log('📡 Deploying to CDN...');

    // Ensure CDN directories exist
    this.ensureDir(`${this.cdnDir}/latest`);
    this.ensureDir(`${this.cdnDir}/v${this.version}`);

    for (const config of configs) {
      const scriptName = config.scriptName;
      const userScriptPath = `${this.distDir}/${scriptName}.user.js`;
      const headerPath = `${this.distDir}/${scriptName}-header.js`;

      if (!fs.existsSync(userScriptPath)) {
        this.warn(`⚠️  ${userScriptPath} not found, skipping...`);
        continue;
      }

      // Read and combine header + script
      // Replace the header reading logic with:
      const header = this.generateUserScriptHeader(config);
      const script = fs.readFileSync(userScriptPath, 'utf8');
      
      // Add debugging
      console.log(`DEBUG: userScriptPath = ${userScriptPath}`);
      console.log(`DEBUG: script length = ${script.length}`);
      console.log(`DEBUG: script first 100 chars = ${script.substring(0, 100)}`);
      console.log(`DEBUG: header length = ${header.length}`);
      
      const combined = header + '\n' + script;
      console.log(`DEBUG: combined length = ${combined.length}`);

      // Create meta.js (header only)
      const metaContent = header;

      // Deploy to latest
      fs.writeFileSync(`${this.cdnDir}/latest/${scriptName}.user.js`, combined);
      fs.writeFileSync(`${this.cdnDir}/latest/${scriptName}.meta.js`, metaContent);

      // Deploy to versioned
      fs.writeFileSync(`${this.cdnDir}/v${this.version}/${scriptName}.user.js`, combined);
      fs.writeFileSync(`${this.cdnDir}/v${this.version}/${scriptName}.meta.js`, metaContent);

      this.log(`✅ Deployed ${scriptName} to CDN`);
    }
  }

  async updateVersionsManifest(configs) {
    this.log('📝 Updating versions manifest...');

    const manifestPath = `${this.cdnDir}/versions.json`;
    let manifest = { versions: [], scripts: {} };

    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      // Ensure scripts property exists
      if (!manifest.scripts) {
        manifest.scripts = {};
      }
    }

    // Check if current version exists in the versions array
    const versionExists = manifest.versions.some(v => 
      typeof v === 'string' ? v === this.version : v.version === this.version
    );

    if (!versionExists) {
      // Add new version object
      const newVersion = {
        version: this.version,
        releaseDate: new Date().toISOString(),
        downloadUrl: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/v${this.version}/coretabs.user.js`,
        metaUrl: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/v${this.version}/coretabs.meta.js`,
        changelog: [
          'Bug fixes and improvements',
          'Enhanced modular architecture',
          'Better error handling'
        ]
      };
            
      manifest.versions.push(newVersion);
            
      // Sort versions by version string (handle both object and string formats)
      manifest.versions.sort((a, b) => {
        const versionA = typeof a === 'string' ? a : a.version;
        const versionB = typeof b === 'string' ? b : b.version;
        return versionB.localeCompare(versionA, undefined, { numeric: true });
      });
    }

    // Update latest version
    const latestVersion = manifest.versions[0];
    manifest.latest = typeof latestVersion === 'string' ? latestVersion : latestVersion.version;

    // Update script information
    for (const config of configs) {
      const scriptName = config.scriptName;
      manifest.scripts[scriptName] = {
        name: config.displayName || config.name,
        description: config.description,
        version: this.version,
        downloadUrl: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/v${this.version}/${scriptName}.user.js`,
        metaUrl: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/v${this.version}/${scriptName}.meta.js`,
        latestUrl: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/latest/${scriptName}.user.js`,
        installUrl: `https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/install.html?script=${scriptName}`
      };
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    this.log('✅ Updated versions manifest');
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  generateUserScriptHeader(config) {
    return `// ==UserScript==
// @name         ${config.displayName || config.name}
// @namespace    ${config.namespace}
// @version      ${config.version || this.version}
// @description  ${config.description}
// @author       diasbaskara
// @match        ${config.match}
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pajak.go.id
// @homepage     ${config.homepage}
// @supportURL   ${config.supportURL}
// @updateURL    ${config.updateURL}
// @downloadURL  ${config.downloadURL}
${config.grant.map(g => `// @grant        ${g}`).join('\n')}
${config.require.map(r => `// @require      ${r}`).join('\n')}
// ==/UserScript==`;
  }
}

// Run deployment
if (require.main === module) {
  const deployer = new MultiScriptDeployer();
  deployer.deploy().catch(error => {
    deployer.error('❌ Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = MultiScriptDeployer;