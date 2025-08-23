import { fetchMyCases } from '@api/cases';
import { t, setLanguage } from '@i18n';
import { state } from '@core/state';
import { createMainContent, switchToTab } from './components/mainContent';

export function initializeEventHandlers() {
  // Toggle sidebar
  const toggle = document.getElementById('coretabs-toggle');
  const sidebar = document.getElementById('coretabs-sidebar');
  const closeBtn = document.getElementById('coretabs-close');
    
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      // Load main content when sidebar opens
      if (sidebar.classList.contains('open')) {
        createMainContent();
      }
    });
  }
    
  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }

  // Language selection
  const languageSelect = document.getElementById('ct-language-select');
  if (languageSelect) {
    // Set current language
    languageSelect.value = state.get('currentLanguage') || 'en';
    
    languageSelect.addEventListener('change', (e) => {
      const newLanguage = e.target.value;
      setLanguage(newLanguage);
      state.set('currentLanguage', newLanguage);
      
      // Refresh the sidebar content
      const sidebar = document.getElementById('coretabs-sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        updateSidebarLabels();
        createMainContent();
      }
    });
  }

  // Tab switching
  const tabButtons = document.querySelectorAll('.ct-tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      const selectedCaseId = state.get('selectedCaseId');
      switchToTab(tabId, selectedCaseId);
    });
  });

  // Back button navigation
  const backBtn = document.getElementById('ct-nav-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Clear selected case
      state.set('selectedCaseId', null);
      
      // Update header
      const headerTitle = document.getElementById('ct-header-title-text');
      const headerSubtitle = document.getElementById('ct-header-subtitle');
      
      if (headerTitle) {
        headerTitle.textContent = t('no_case_selected');
      }
      
      if (headerSubtitle) {
        headerSubtitle.textContent = t('select_case_message');
      }
      
      // Hide tab buttons
      const tabButtons = document.getElementById('ct-tab-buttons');
      if (tabButtons) {
        tabButtons.style.display = 'none';
      }
      
      // Hide back button
      backBtn.style.display = 'none';
      
      // Load cases list
      createMainContent();
    });
  }
    
  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // ESC to close sidebar
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }
    
    // Ctrl+Shift+C to toggle sidebar
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      if (toggle) {
        toggle.click();
      }
    }
  });

  // Initialize state listeners
  initializeStateListeners();
}

function updateSidebarLabels() {
  // Update navigation labels
  const navTitle = document.getElementById('ct-nav-title');
  if (navTitle) {
    navTitle.textContent = t('my_cases');
  }
  
  const backBtn = document.getElementById('ct-nav-back-btn');
  if (backBtn) {
    backBtn.textContent = t('back');
  }
  
  // Update header labels
  const headerTitle = document.getElementById('ct-header-title-text');
  const headerSubtitle = document.getElementById('ct-header-subtitle');
  
  const selectedCaseId = state.get('selectedCaseId');
  if (!selectedCaseId) {
    if (headerTitle) {
      headerTitle.textContent = t('no_case_selected');
    }
    if (headerSubtitle) {
      headerSubtitle.textContent = t('select_case_message');
    }
  }
  
  // Update tab button labels
  const tabButtons = document.querySelectorAll('.ct-tab-button');
  tabButtons.forEach(button => {
    const tabId = button.dataset.tab;
    switch (tabId) {
    case 'tab-profile':
      button.textContent = t('profile');
      break;
    case 'tab-docs':
      button.textContent = t('documents');
      break;
    case 'tab-users':
      button.textContent = t('users');
      break;
    case 'tab-refund':
      button.textContent = t('refund_review');
      break;
    case 'tab-routing':
      button.textContent = t('routing');
      break;
    }
  });
}

function initializeStateListeners() {
  // Listen for case selection changes
  state.subscribe('selectedCaseId', (caseId) => {
    const backBtn = document.getElementById('ct-nav-back-btn');
    const tabButtons = document.getElementById('ct-tab-buttons');
    
    if (caseId) {
      // Show back button and tab buttons when case is selected
      if (backBtn) {
        backBtn.style.display = 'block';
      }
      if (tabButtons) {
        tabButtons.style.display = 'flex';
      }
    } else {
      // Hide back button and tab buttons when no case is selected
      if (backBtn) {
        backBtn.style.display = 'none';
      }
      if (tabButtons) {
        tabButtons.style.display = 'none';
      }
    }
  });
  
  // Listen for language changes
  state.subscribe('currentLanguage', () => {
    updateSidebarLabels();
  });
}

// Export utility functions for external use
export { switchToTab, updateSidebarLabels };

export function switchTab(tabName) {
  // Update active tab
  document.querySelectorAll('.coretabs-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });
    
  // Update active content
  document.querySelectorAll('.coretabs-tab-content').forEach(content => {
    content.classList.remove('active');
  });
    
  const activeContent = document.getElementById(`tab-${tabName}`);
  if (activeContent) {
    activeContent.classList.add('active');
        
    // Load data for the tab
    loadTabData(tabName);
  }
}

async function loadTabData(tabName) {
  const contentElement = document.querySelector('.coretabs-content');
  if (!contentElement) return;
    
  // Clear content safely
  while (contentElement.firstChild) {
    contentElement.removeChild(contentElement.firstChild);
  }
    
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'coretabs-loading';
  loadingDiv.textContent = t('common.loading');
  contentElement.appendChild(loadingDiv);
    
  try {
    switch (tabName) {
    case 'cases': {
      const cases = await fetchMyCases();
      renderCases(cases, contentElement);
      break;
    }
    case 'documents': {
      // Load documents for selected case
      const noDocsDiv = document.createElement('div');
      noDocsDiv.textContent = t('documents.noData');
      // Clear content safely
      while (contentElement.firstChild) {
        contentElement.removeChild(contentElement.firstChild);
      }
      contentElement.appendChild(noDocsDiv);
      break;
    }
    case 'routing': {
      // Load routing for selected case
      const noRoutingDiv = document.createElement('div');
      noRoutingDiv.textContent = t('routing.noData');
      // Clear content safely
      while (contentElement.firstChild) {
        contentElement.removeChild(contentElement.firstChild);
      }
      contentElement.appendChild(noRoutingDiv);
      break;
    }
    }
  } catch (error) {
    // Remove console.error to fix no-console warning
    // Clear content safely
    while (contentElement.firstChild) {
      contentElement.removeChild(contentElement.firstChild);
    }
    const errorDiv = document.createElement('div');
    errorDiv.className = 'coretabs-error';
    errorDiv.textContent = t('common.error');
    contentElement.appendChild(errorDiv);
  }
}

function renderCases(casesData, container) {
  if (!casesData || !casesData.data || casesData.data.length === 0) {
    const noCasesDiv = document.createElement('div');
    noCasesDiv.textContent = t('cases.noData');
    container.appendChild(noCasesDiv);
    return;
  }
    
  const table = document.createElement('table');
  table.className = 'coretabs-table';
    
  // Create thead safely
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
    
  const headers = [
    t('cases.caseNumber'),
    t('cases.status'),
    t('cases.type'),
    t('cases.lastUpdate')
  ];
    
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
    
  thead.appendChild(headerRow);
  table.appendChild(thead);
    
  // Create tbody safely
  const tbody = document.createElement('tbody');
    
  casesData.data.forEach(caseItem => {
    const row = document.createElement('tr');
        
    // Case number cell
    const caseNumberCell = document.createElement('td');
    caseNumberCell.textContent = caseItem.caseNumber || 'N/A';
    row.appendChild(caseNumberCell);
        
    // Status cell with badge
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `coretabs-badge status-${(caseItem.status || '').toLowerCase().replace(' ', '-')}`;
    statusBadge.textContent = caseItem.status || 'N/A';
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
        
    // Case type cell
    const caseTypeCell = document.createElement('td');
    caseTypeCell.textContent = caseItem.caseType || 'N/A';
    row.appendChild(caseTypeCell);
        
    // Last update cell
    const lastUpdateCell = document.createElement('td');
    lastUpdateCell.textContent = caseItem.lastUpdate || 'N/A';
    row.appendChild(lastUpdateCell);
        
    tbody.appendChild(row);
  });
    
  table.appendChild(tbody);
    
  // Clear container safely
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  container.appendChild(table);
}