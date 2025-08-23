// Import styles as modules (webpack will handle them)
import variablesCSS from '@shared/ui/styles/variables.css';
import componentsCSS from '@shared/ui/styles/components.css';
import responsiveCSS from '@shared/ui/styles/responsive.css';

// Import shared modules
import { CONFIG } from '@shared/core/config';
import { state } from '@shared/core/state';
import { setLanguage, getCurrentLanguage } from '@shared/i18n';

// Import UI components
import { createSidebar } from '@shared/ui/components/sidebar';
import { initializeEventHandlers } from '@shared/ui/events';

// Import API modules
import { loadUserProfile } from '@shared/api/auth';
import { fetchMyCases } from '@shared/api/cases';

// Import utilities
import { setupPersistenceListeners, restoreSidebarState } from '@shared/utils/persistence';
import UpdateChecker from '@shared/utils/updateChecker';

// Version will be injected by webpack
// Improvement: Add fallback
const VERSION = '{{VERSION}}' === '{{' + 'VERSION' + '}}' ? '1.0.0' : '{{VERSION}}';

/**
 * CoreTabs - Main userscript class
 * Provides enhanced functionality for CoreTabs interface
 */
class CoreTabs {
    constructor() {
        this.initialized = false;
        this.version = VERSION;
        this.updateChecker = new UpdateChecker();
        this.injectStyles();
    }

    injectStyles() {
        // Add check to prevent duplicate injection
        if (document.querySelector('style[data-coretabs]')) return;
        
        const style = document.createElement('style');
        style.setAttribute('data-coretabs', 'true');
        style.textContent = variablesCSS + componentsCSS + responsiveCSS;
        document.head.appendChild(style);
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            // Remove console.log statements
            this.initialized = true;
            console.log(`CoreTabs v${this.version} initializing...`);
            
            // Initialize language system
            setLanguage(getCurrentLanguage());
            
            // Create UI
            createSidebar();
            
            // Load user profile
            await loadUserProfile();
            
            // Initialize event handlers
            initializeEventHandlers();
            
            // Setup persistence
            setupPersistenceListeners();
            restoreSidebarState();
            
            // Load initial data
            await fetchMyCases();
            
            this.initialized = true;
            console.log('CoreTabs initialized successfully');
            
        } catch (error) {
            // Replace console.log with proper error handling
            throw new Error(`CoreTabs initialization failed: ${error.message}`);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CoreTabs().init();
    });
} else {
    new CoreTabs().init();
}