import { t } from '@i18n';
import { state } from '@core/state';
import { updateCaseDetailsHeader, switchToCaseDetailsTab } from './caseDetailsScreen';
import { fetchMyCases } from '@api/cases';

export function createMainContent() {
  const content = document.getElementById('ct-content');
  if (!content) return;
  
  // Load and display cases list initially
  loadCasesList();
}

export function switchToTab(tabId, caseId) {
  switchToCaseDetailsTab(tabId, caseId);
}

function loadCasesList() {
  const tabContentArea = document.getElementById('ct-tab-content-area');
  if (!tabContentArea) return;
  
  // Clear all tab panels and show cases list in the first panel
  const firstPanel = document.getElementById('tab-profile');
  if (!firstPanel) return;
  
  // Show loading
  firstPanel.innerHTML = '';
  const loading = document.createElement('div');
  loading.className = 'ct-loading';
  loading.textContent = t('loading_my_cases');
  firstPanel.appendChild(loading);
  
  // Fetch and display cases
  fetchMyCases().then(casesData => {
    firstPanel.innerHTML = '';
    
    if (!casesData || !casesData.data || casesData.data.length === 0) {
      const noCases = document.createElement('div');
      noCases.className = 'ct-no-data';
      noCases.textContent = t('cases.no_data');
      firstPanel.appendChild(noCases);
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
      row.onclick = () => selectCase(caseItem.id, caseItem.caseNumber, caseItem);
      
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
    firstPanel.appendChild(casesList);
    
  }).catch(() => {
    firstPanel.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ct-error';
    errorDiv.textContent = t('common.error');
    firstPanel.appendChild(errorDiv);
  });
}

function selectCase(caseId, caseNumber, caseData) {
  // Update state
  state.set('selectedCaseId', caseId);
  
  // Update header with proper structure
  updateCaseDetailsHeader(caseData);
  
  // Load profile tab by default
  switchToCaseDetailsTab('tab-profile', caseId);
}