// Remove unused imports
// import { state } from '@core/state'; // Remove this line
import { fetchMyCases } from '@api/cases';
import { t } from '@i18n';

export function initializeEventHandlers() {
  // Toggle sidebar
  const toggle = document.getElementById('coretabs-toggle');
  const sidebar = document.getElementById('coretabs-sidebar');
  const closeBtn = document.getElementById('coretabs-close');
    
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
    
  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }
    
  // Tab switching
  const tabs = document.querySelectorAll('.coretabs-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
    
  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });
}

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