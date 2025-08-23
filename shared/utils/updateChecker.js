// import { CONFIG } from '@core/config';
import { t } from '@i18n';

class UpdateChecker {
  constructor(version, cdnBaseUrl) {
    this.currentVersion = version || '1.0.0';
    this.cdnBaseUrl = cdnBaseUrl || 'https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn';
    this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.lastCheckKey = 'coretabs_last_update_check';
  }

  async checkForUpdates(force = false) {
    try {
      // Skip if recently checked (unless forced)
      if (!force && !this.shouldCheck()) {
        return null;
      }

      const versionsData = await this.fetchVersionsData();
      if (!versionsData) return null;

      const latestVersion = versionsData.latest;
      const updateAvailable = this.compareVersions(latestVersion, this.currentVersion) > 0;

      // Store last check time (use GM_setValue if available, fallback to localStorage)
      if (typeof GM_setValue !== 'undefined') {
        await GM_setValue(this.lastCheckKey, Date.now());
      } else {
        localStorage.setItem(this.lastCheckKey, Date.now().toString());
      }

      if (updateAvailable) {
        const updateInfo = {
          currentVersion: this.currentVersion,
          latestVersion: latestVersion,
          releaseNotes: versionsData.versions[latestVersion]?.notes || '',
          downloadUrl: `${this.cdnBaseUrl}/latest/coretabs.user.js`
        };

        this.showUpdateNotification(updateInfo);
        return updateInfo;
      }

      return null;

    } catch (error) {
      return null;
    }
  }

  async fetchVersionsData() {
    try {
      return new Promise((resolve) => {
        if (typeof GM_xmlhttpRequest === 'undefined') {
          // Handle silently - GM_xmlhttpRequest not available for update checks
          resolve(null);
          return;
        }

        const timeout = setTimeout(() => {
          resolve(null);
        }, 10000);

        GM_xmlhttpRequest({
          method: 'GET',
          url: `${this.cdnBaseUrl}/versions.json`,
          timeout: 10000,
          onload: (response) => {
            clearTimeout(timeout);
            try {
              const data = JSON.parse(response.responseText);
              resolve(data);
            } catch (error) {
              // Handle parsing error silently
              resolve(null);
            }
          },
          onerror: () => {
            clearTimeout(timeout);
            resolve(null);
          },
          ontimeout: () => {
            clearTimeout(timeout);
            resolve(null);
          }
        });
      });
    } catch (error) {
      return null;
    }
  }

  shouldCheck() {
    try {
      let lastCheck;
      if (typeof GM_getValue !== 'undefined') {
        lastCheck = GM_getValue(this.lastCheckKey, 0);
      } else {
        const stored = localStorage.getItem(this.lastCheckKey);
        lastCheck = stored ? parseInt(stored) : 0;
      }

      if (!lastCheck) return true;

      const timeSinceLastCheck = Date.now() - lastCheck;
      return timeSinceLastCheck > this.checkInterval;
    } catch (error) {
      return true; // Default to allowing check if error occurs
    }
  }

  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }

    return 0;
  }

  showUpdateNotification(version) {
    // Remove existing notification if present
    const existingNotification = document.getElementById('coretabs-update-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification container
    const notification = document.createElement('div');
    notification.id = 'coretabs-update-notification';
    notification.className = 'coretabs-update-notification';

    // Create title
    const title = document.createElement('div');
    title.className = 'update-title';
    title.textContent = t('update.available');
    notification.appendChild(title);

    // Create message
    const message = document.createElement('div');
    message.className = 'update-message';
    message.textContent = `${t('update.newVersion')} ${version}`;
    notification.appendChild(message);

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'update-buttons';

    // Create update button
    const updateBtn = document.createElement('button');
    updateBtn.textContent = t('update.install');
    updateBtn.onclick = function () {
      window.open(this.updateUrl, '_blank');
      notification.remove();
    }.bind(this);
    buttonsContainer.appendChild(updateBtn);

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = t('common.close');
    closeBtn.onclick = function () {
      notification.remove();
    };
    buttonsContainer.appendChild(closeBtn);

    notification.appendChild(buttonsContainer);

    // Add to page
    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  createUpdateNotification(updateInfo) {
    const notification = document.createElement('div');
    notification.className = 'coretabs-update-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create content container
    const content = document.createElement('div');
    content.className = 'coretabs-update-content';

    // Create header
    const header = document.createElement('div');
    header.className = 'coretabs-update-header';

    const title = document.createElement('h3');
    title.textContent = t('update.available', 'Update Available');
    title.style.margin = '0 0 10px 0';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'coretabs-update-close';
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'float: right; background: none; border: none; font-size: 20px; cursor: pointer;';
    closeBtn.onclick = () => notification.remove();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create body
    const body = document.createElement('div');
    body.className = 'coretabs-update-body';

    const newVersionText = document.createElement('p');
    newVersionText.textContent = t('update.newVersion', 'A new version of CoreTabs is available!');

    const currentVersionText = document.createElement('p');
    const currentStrong = document.createElement('strong');
    currentStrong.textContent = `${t('update.current', 'Current')}: ${updateInfo.currentVersion}`;
    currentVersionText.appendChild(currentStrong);

    const latestVersionText = document.createElement('p');
    const latestStrong = document.createElement('strong');
    latestStrong.textContent = `${t('update.latest', 'Latest')}: ${updateInfo.latestVersion}`;
    latestVersionText.appendChild(latestStrong);

    body.appendChild(newVersionText);
    body.appendChild(currentVersionText);
    body.appendChild(latestVersionText);

    // Add changelog if available
    if (updateInfo.changelog.length > 0) {
      const changelogDiv = document.createElement('div');
      changelogDiv.className = 'coretabs-update-changelog';

      const changelogTitle = document.createElement('h4');
      changelogTitle.textContent = t('update.changelog', 'What\'s New:');
      changelogDiv.appendChild(changelogTitle);

      const changelogList = document.createElement('ul');
      updateInfo.changelog.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        changelogList.appendChild(listItem);
      });
      changelogDiv.appendChild(changelogList);
      body.appendChild(changelogDiv);
    }

    // Create actions
    const actions = document.createElement('div');
    actions.className = 'coretabs-update-actions';
    actions.style.cssText = 'margin-top: 15px; text-align: right;';

    const installBtn = document.createElement('a');
    installBtn.href = updateInfo.downloadUrl;
    installBtn.className = 'coretabs-update-btn coretabs-update-btn-primary';
    installBtn.textContent = t('update.install', 'Install Update');
    installBtn.style.cssText = 'display: inline-block; padding: 8px 16px; margin: 0 5px; background: #007cba; color: white; text-decoration: none; border-radius: 4px;';

    const laterBtn = document.createElement('button');
    laterBtn.className = 'coretabs-update-btn coretabs-update-btn-secondary';
    laterBtn.textContent = t('update.later', 'Later');
    laterBtn.style.cssText = 'padding: 8px 16px; margin: 0 5px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;';
    laterBtn.onclick = () => notification.remove();

    const skipBtn = document.createElement('button');
    skipBtn.className = 'coretabs-update-btn coretabs-update-btn-text';
    skipBtn.textContent = t('update.skip', 'Skip This Version');
    skipBtn.style.cssText = 'padding: 8px 16px; margin: 0 5px; background: none; border: none; color: #666; cursor: pointer;';
    skipBtn.onclick = () => {
      localStorage.setItem('coretabs_skip_version', updateInfo.latestVersion);
      notification.remove();
    };

    actions.appendChild(installBtn);
    actions.appendChild(laterBtn);
    actions.appendChild(skipBtn);

    // Assemble the notification
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(actions);
    notification.appendChild(content);

    // Add styles
    this.injectUpdateStyles();

    return notification;
  }

  injectUpdateStyles() {
    if (document.querySelector('#coretabs-update-styles')) return;

    const style = document.createElement('style');
    style.id = 'coretabs-update-styles';
    style.textContent = `
        .coretabs-update-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .coretabs-update-content {
            padding: 0;
        }
        
        .coretabs-update-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px 10px;
            border-bottom: 1px solid #eee;
        }
        
        .coretabs-update-header h3 {
            margin: 0;
            color: #333;
            font-size: 16px;
            font-weight: 600;
        }
        
        .coretabs-update-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .coretabs-update-close:hover {
            color: #666;
        }
        
        .coretabs-update-body {
            padding: 15px 20px;
        }
        
        .coretabs-update-body p {
            margin: 0 0 8px 0;
            color: #555;
            line-height: 1.4;
        }
        
        .coretabs-update-changelog {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #f0f0f0;
        }
        
        .coretabs-update-changelog h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #333;
        }
        
        .coretabs-update-changelog ul {
            margin: 0;
            padding-left: 18px;
        }
        
        .coretabs-update-changelog li {
            margin-bottom: 4px;
            color: #666;
            font-size: 13px;
        }
        
        .coretabs-update-actions {
            padding: 15px 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .coretabs-update-btn {
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid transparent;
            transition: all 0.2s;
        }
        
        .coretabs-update-btn-primary {
            background: #007cba;
            color: white;
        }
        
        .coretabs-update-btn-primary:hover {
            background: #005a87;
        }
        
        .coretabs-update-btn-secondary {
            background: #f8f9fa;
            color: #495057;
            border-color: #dee2e6;
        }
        
        .coretabs-update-btn-secondary:hover {
            background: #e9ecef;
        }
        
        .coretabs-update-btn-text {
            background: none;
            color: #6c757d;
            padding: 8px 12px;
        }
        
        .coretabs-update-btn-text:hover {
            color: #495057;
            background: #f8f9fa;
        }
    `;

    document.head.appendChild(style);
  }

  // Manual update check (can be triggered by user)
  async manualCheck() {
    return await this.checkForUpdates(true);
  }
}

export default UpdateChecker;