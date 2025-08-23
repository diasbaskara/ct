class StateManager {
  constructor() {
    this.state = {
      // Core data arrays
      allMyCases: [],
      allCaseDocuments: [],
      allCaseUsers: [],
      refundReviewData: [],
      filteredRefundData: [],
      
      // Selected state
      selectedCaseId: null,
      
      // Loading states
      loadedDocsForCaseId: null,
      loadedUsersForCaseId: null,
      loadedProfileForCaseId: null,
      loadedRoutingForCaseId: null,
      
      // Additional data
      routingData: null,
      workflowDiagram: null,
      
      // UI state
      currentScreen: 'my-cases', // 'my-cases' or 'case-details'
      currentTab: 'my-cases',
      sidebarOpen: false
    };
    this.listeners = {};
  }
    
  get(key) {
    return this.state[key];
  }
    
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
        
    // Notify listeners
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => {
        try {
          callback(value, oldValue);
        } catch (error) {
          // Handle listener errors silently in production
        }
      });
    }
  }
    
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
        
    // Return unsubscribe function
    return () => {
      const index = this.listeners[key].indexOf(callback);
      if (index > -1) {
        this.listeners[key].splice(index, 1);
      }
    };
  }
    
  getAll() {
    return { ...this.state };
  }
    
  clear() {
    this.state = {
      allMyCases: [],
      allCaseDocuments: [],
      allCaseUsers: [],
      refundReviewData: [],
      filteredRefundData: [],
      selectedCaseId: null,
      loadedDocsForCaseId: null,
      loadedUsersForCaseId: null,
      loadedProfileForCaseId: null,
      loadedRoutingForCaseId: null,
      routingData: null,
      workflowDiagram: null,
      currentScreen: 'my-cases',
      currentTab: 'my-cases',
      sidebarOpen: false
    };
    this.listeners = {};
  }
    
  notify(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // Handle listener errors silently in production
        }
      });
    }
  }
}

export const state = new StateManager();