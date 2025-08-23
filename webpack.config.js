const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');
const glob = require('glob');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Get script name from environment or build all scripts
  const scriptName = env && env.script;
  
  // Function to get all script configurations
  const getScriptConfigs = () => {
    const scriptDirs = glob.sync('scripts/*/config.json');
    return scriptDirs.map(configPath => {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const scriptDir = path.dirname(configPath);
      return {
        ...config,
        scriptDir,
        entryPoint: path.join(scriptDir, 'src/main.js')
      };
    });
  };
  
  const scriptConfigs = getScriptConfigs();
  
  // Filter scripts if specific script is requested
  const targetScripts = scriptName 
    ? scriptConfigs.filter(config => config.name === scriptName)
    : scriptConfigs;
  
  if (targetScripts.length === 0) {
    throw new Error(`Script '${scriptName}' not found`);
  }
  
  // Create entry points
  const entry = {};
  targetScripts.forEach(config => {
    entry[config.name] = `./${config.entryPoint}`;
  });
  
  return {
    entry,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].user.js',
      clean: true
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@core': path.resolve(__dirname, 'shared/core'),
        '@api': path.resolve(__dirname, 'shared/api'),
        '@ui': path.resolve(__dirname, 'shared/ui'),
        '@i18n': path.resolve(__dirname, 'shared/i18n'),
        '@utils': path.resolve(__dirname, 'shared/utils')
      }
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            {
              loader: path.resolve(__dirname, 'build/css-to-string-loader.js')
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        '{{VERSION}}': JSON.stringify(packageJson.version)
      }),
      new CopyPlugin({
        patterns: targetScripts.map(config => ({
          from: 'build/templates/userscript-header.js',
          to: `${config.name}-header.js`,
          transform(content) {
            const isDebug = process.env.NODE_ENV !== 'production' || process.env.WEBPACK_DEBUG === 'true';
            if (isDebug) {
              console.log('Processing template for:', config.name);
            }
            const template = content.toString();
            if (isDebug) {
              console.log('Template before:', template.substring(0, 100));
            }
            const result = template
              .replace(/{{VERSION}}/g, config.version || packageJson.version)
              .replace(/{{NAME}}/g, config.displayName || config.name)
              .replace(/{{DESCRIPTION}}/g, config.description)
              .replace(/{{MATCH}}/g, config.match)
              .replace(/{{NAMESPACE}}/g, config.namespace)
              .replace(/{{HOMEPAGE}}/g, config.homepage)
              .replace(/{{SUPPORT_URL}}/g, config.supportURL)
              .replace(/{{UPDATE_URL}}/g, config.updateURL)
              .replace(/{{DOWNLOAD_URL}}/g, config.downloadURL)
              .replace(/{{GRANT}}/g, config.grant.map(g => `// @grant        ${g}`).join('\n'))
              .replace(/{{REQUIRE}}/g, config.require.map(r => `// @require      ${r}`).join('\n'));
            if (isDebug) {
              console.log('Template after:', result.substring(0, 100));
            }
            return result;
          }
        }))
      }),
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: /^\s*==\/?UserScript==/
            }
          },
          extractComments: false
        })
      ]
    },
    devtool: isProduction ? false : 'inline-source-map'
  };
};