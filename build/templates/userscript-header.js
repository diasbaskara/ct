// ==UserScript==
// @name         {{NAME}}
// @namespace    {{NAMESPACE}}
// @version      {{VERSION}}
// @description  {{DESCRIPTION}}
// @author       diasbaskara
// @match        {{MATCH}}
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pajak.go.id
// @homepage     {{HOMEPAGE}}
// @supportURL   {{SUPPORT_URL}}
// @updateURL    {{UPDATE_URL}}
// @downloadURL  {{DOWNLOAD_URL}}
{{GRANT;}}
{{REQUIRE;}}
// ==/UserScript==

(function () {
  'use strict';

  // Auto-update check
  const CURRENT_VERSION = '{{VERSION}}';
  // Replace line 22
  const UPDATE_CHECK_URL = 'https://cdn.jsdelivr.net/gh/diasbaskara/ct@main/cdn/versions.json';

  // Version check function
  async function checkForUpdates() {
    try {
      const response = await fetch(UPDATE_CHECK_URL);
      const versions = await response.json();

      if (versions.latest !== CURRENT_VERSION) {
        console.log(`CoreTabs update available: ${versions.latest} (current: ${CURRENT_VERSION})`);

        // Show update notification
        if (confirm(`CoreTabs update available: ${versions.latest}\nCurrent version: ${CURRENT_VERSION}\n\nWould you like to update now?`)) {
          window.open(versions.downloadUrl, '_blank');
        }
      }
    } catch (error) {
      console.warn('CoreTabs: Could not check for updates:', error);
    }
  }

  // Check for updates on load (with delay)
  setTimeout(checkForUpdates, 5000);
});