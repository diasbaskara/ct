import { t } from '@i18n';
import { state } from '@core/state';
import { createProfileTab } from './profileTab';
import { createDocumentsTab } from './documentsTab';
import { createUsersTab } from './usersTab';
import { createRefundTab } from './refundTab';
import { createRoutingTab } from './routingTab';
import { fetchMyCases } from '@api/cases';

export function createMainContent() {
  const content = document.getElementById('ct-content');
  if (!content) return;
  
  // Load and display cases list initially
  loadCasesList(content);
}

export function switchToTab(tabId, caseId) {
  const content = document.getElementById('ct-content');
  if (!content) return;
  
  // Clear content
  content.innerHTML = '';
  
  // Update tab buttons
  document.querySelectorAll('.ct-tab-button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    }
  });
  
  // Load appropriate tab content
  switch (tabId) {
  case 'tab-profile':
    createProfileTab(content, caseId);
    break;
  case 'tab-docs':
    createDocumentsTab(content, caseId);
    break;
  case 'tab-users':
    createUsersTab(content, caseId);
    break;
  case 'tab-refund':
    createRefundTab(content, caseId);
    break;
  case 'tab-routing':
    createRoutingTab(content, caseId);
    break;
  default:
    loadCasesList(content);
  }
}

function loadCasesList(container) {
  // Show loading
  const loading = document.createElement('div');
  loading.className = 'ct-loading';
  loading.textContent = t('loading_my_cases');
  container.appendChild(loading);
  
  // Fetch and display cases
  fetchMyCases().then(casesData => {
    container.innerHTML = '';
    
    if (!casesData || !casesData.data || casesData.data.length === 0) {
      const noCases = document.createElement('div');
      noCases.className = 'ct-no-data';
      noCases.textContent = t('cases.no_data');
      container.appendChild(noCases);
      return;
    }
    
    // Create cases list
    const casesList = document.createElement('div');
    casesList.className = 'ct-cases-list';
    
    const title = document.createElement('h3');
    title.textContent = t('my_cases');
    casesList.appendChild(title);
    
    const casesTable = document.createElement('table');
    casesTable.className = 'ct-table ct-cases-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
      t('cases.case_number'),
      t('cases.status'),
      t('cases.type'),
      t('cases.priority'),
      t('cases.last_update'),
      t('cases.actions')
    ];
    
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    casesTable.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    casesData.data.forEach(caseItem => {
      const row = document.createElement('tr');
      row.className = 'ct-case-row';
      row.onclick = () => selectCase(caseItem.id, caseItem.caseNumber);
      
      // Case number
      const caseNumberCell = document.createElement('td');
      caseNumberCell.textContent = caseItem.caseNumber || 'N/A';
      row.appendChild(caseNumberCell);
      
      // Status
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `ct-badge ct-status-${(caseItem.status || '').toLowerCase().replace(' ', '-')}`;
      statusBadge.textContent = caseItem.status || 'N/A';
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);
      
      // Type
      const typeCell = document.createElement('td');
      typeCell.textContent = caseItem.caseType || 'N/A';
      row.appendChild(typeCell);
      
      // Priority
      const priorityCell = document.createElement('td');
      const priorityBadge = document.createElement('span');
      priorityBadge.className = `ct-badge ct-priority-${(caseItem.priority || '').toLowerCase()}`;
      priorityBadge.textContent = caseItem.priority || 'N/A';
      priorityCell.appendChild(priorityBadge);
      row.appendChild(priorityCell);
      
      // Last update
      const lastUpdateCell = document.createElement('td');
      lastUpdateCell.textContent = caseItem.lastUpdate || 'N/A';
      row.appendChild(lastUpdateCell);
      
      // Actions
      const actionsCell = document.createElement('td');
      const selectBtn = document.createElement('button');
      selectBtn.className = 'ct-btn ct-btn-sm ct-btn-primary';
      selectBtn.textContent = t('cases.select');
      selectBtn.onclick = (e) => {
        e.stopPropagation();
        selectCase(caseItem.id, caseItem.caseNumber);
      };
      actionsCell.appendChild(selectBtn);
      row.appendChild(actionsCell);
      
      tbody.appendChild(row);
    });
    
    casesTable.appendChild(tbody);
    casesList.appendChild(casesTable);
    container.appendChild(casesList);
    
  }).catch(() => {
    container.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ct-error';
    errorDiv.textContent = t('common.error');
    container.appendChild(errorDiv);
  });
}

function selectCase(caseId, caseNumber) {
  // Update state
  state.set('selectedCaseId', caseId);
  
  // Update header
  const headerTitle = document.getElementById('ct-header-title-text');
  const headerSubtitle = document.getElementById('ct-header-subtitle');
  
  if (headerTitle) {
    headerTitle.textContent = `${t('case')} ${caseNumber}`;
  }
  
  if (headerSubtitle) {
    headerSubtitle.textContent = t('case_selected_message');
  }
  
  // Show tab buttons
  const tabButtons = document.getElementById('ct-tab-buttons');
  if (tabButtons) {
    tabButtons.style.display = 'flex';
  }
  
  // Load profile tab by default
  switchToTab('tab-profile', caseId);
}