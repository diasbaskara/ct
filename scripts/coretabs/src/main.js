import { state } from '@core/state.js';
import { fetchMyCases } from '@api/cases.js';
import UpdateChecker from '@utils/updateChecker.js';
import { initializeEventHandlers } from '@ui/events.js';
import { createSidebar, createToggleButton } from '@ui/components/sidebar.js';

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
      console.log('CoreTabs: Starting initialization...');
      this.initializeState();
      console.log('CoreTabs: State initialized');
      this.createUI();
      console.log('CoreTabs: UI created');
      this.initializeEventHandlers();
      console.log('CoreTabs: Event handlers initialized');
      await this.fetchInitialData();
      console.log('CoreTabs: Initial data fetched');
      this.initialized = true;
      console.log('CoreTabs: Initialization complete!');
    } catch (error) {
      console.error('CoreTabs initialization failed:', error);
      console.error('Error stack:', error.stack);
    }
  }
  
  createUI() {
    console.log('CoreTabs: Creating UI components...');
    // Create sidebar with all components
    createToggleButton();
    console.log('CoreTabs: Toggle button created');
    createSidebar();
    console.log('CoreTabs: Sidebar created');
  }
  
  initializeEventHandlers() {
    // Initialize event handlers
    initializeEventHandlers();
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
      console.log('CoreTabs: Fetching initial data...');
      // Pre-load user cases
      const cases = await fetchMyCases();
      if (cases && cases.data) {
        state.set('allMyCases', cases.data);
        console.log('CoreTabs: Cases loaded:', cases.data.length);
      }
    } catch (error) {
      console.error('CoreTabs: Failed to fetch initial data:', error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  console.log('CoreTabs: DOM still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('CoreTabs: DOMContentLoaded fired, initializing...');
    new CoreTabs().init();
  });
} else {
  console.log('CoreTabs: DOM ready, initializing immediately...');
  new CoreTabs().init();
}