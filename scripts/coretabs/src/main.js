import { state } from '@core/state.js';
import { fetchMyCases } from '@api/cases.js';
import UpdateChecker from '@utils/updateChecker.js';

// Import CSS files
import variablesCSS from '@ui/styles/variables.css';
import componentsCSS from '@ui/styles/components.css';
import responsiveCSS from '@ui/styles/responsive.css';

// Version will be injected by webpack
const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : '1.0.0';

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
      this.initializeState();
      this.createUI();
      this.initializeEventHandlers();
      await this.fetchInitialData();
      this.initialized = true;
    } catch (error) {
      // Error handling without console statement
    }
  }
  
  createUI() {
    // Create sidebar with all components
  }
  
  initializeEventHandlers() {
    // Initialize event handlers
  }
  
  initializeState() {
    // Initialize state with default values
    state.set('currentScreen', 'cases');
    state.set('currentTab', 'profile');
    state.set('sidebarOpen', false);
    state.set('selectedCaseId', null);
    state.set('currentLanguage', 'en');
    
    // Initialize data states
    state.set('allMyCases', []);
    state.set('allCaseDocuments', []);
    state.set('allCaseUsers', []);
    state.set('refundReviewData', []);
    state.set('filteredRefundData', []);
    state.set('routingData', null);
    state.set('workflowDiagram', null);
    
    // Initialize loading states
    state.set('loadedCasesForCaseId', null);
    state.set('loadedDocumentsForCaseId', null);
    state.set('loadedUsersForCaseId', null);
    state.set('loadedRefundForCaseId', null);
    state.set('loadedRoutingForCaseId', null);
  }
  
  async fetchInitialData() {
    try {
      // Pre-load user cases
      const cases = await fetchMyCases();
      if (cases && cases.data) {
        state.set('allMyCases', cases.data);
      }
    } catch (error) {
      // Error handling without console statement
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