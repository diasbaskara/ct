import { t } from '@i18n';
// Remove this unused import
// import { state } from '@core/state';
import { createProfileTab } from './profileTab';
import { createDocumentsTab } from './documentsTab';
import { createUsersTab } from './usersTab';
import { createRefundTab } from './refundTab';
import { createRoutingTab } from './routingTab';

export function createCaseDetailsScreen(container) {
  // Clear container
  container.innerHTML = '';
  
  // Create case details screen
  const caseDetailsScreen = document.createElement('div');
  caseDetailsScreen.id = 'ct-case-details-screen';
  caseDetailsScreen.className = 'ct-screen';
  
  // Create header area with proper structure
  const headerArea = document.createElement('div');
  headerArea.id = 'ct-header-area';
  
  const headerContent = document.createElement('div');
  headerContent.id = 'ct-header-content';
  
  const headerLeft = document.createElement('div');
  headerLeft.id = 'ct-header-left';
  
  const headerTitle = document.createElement('div');
  headerTitle.id = 'ct-header-title';
  
  const headerInitial = document.createElement('div');
  headerInitial.id = 'ct-header-initial';
  
  const headerTitleText = document.createElement('span');
  headerTitleText.id = 'ct-header-title-text';
  headerTitleText.textContent = t('no_case_selected');
  
  headerTitle.appendChild(headerInitial);
  headerTitle.appendChild(headerTitleText);
  
  const headerSubtitle = document.createElement('div');
  headerSubtitle.id = 'ct-header-subtitle';
  headerSubtitle.textContent = t('select_case_message');
  
  headerLeft.appendChild(headerTitle);
  headerLeft.appendChild(headerSubtitle);
  
  const headerActions = document.createElement('div');
  headerActions.id = 'ct-header-actions';
  
  headerContent.appendChild(headerLeft);
  headerContent.appendChild(headerActions);
  headerArea.appendChild(headerContent);
  
  // Create tab bar
  const tabBar = document.createElement('div');
  tabBar.id = 'ct-tab-bar';
  
  const tabs = [
    { id: 'tab-profile', key: 'profile' },
    { id: 'tab-docs', key: 'documents' },
    { id: 'tab-users', key: 'users' },
    { id: 'tab-refund', key: 'refund_review' },
    { id: 'tab-routing', key: 'routing' }
  ];
  
  tabs.forEach((tab, index) => {
    const button = document.createElement('button');
    button.className = `ct-tab-button ${index === 0 ? 'active' : ''}`;
    button.dataset.tab = tab.id;
    button.textContent = t(tab.key);
    tabBar.appendChild(button);
  });
  
  // Create tab content area
  const tabContentArea = document.createElement('div');
  tabContentArea.id = 'ct-tab-content-area';
  
  // Create tab panels
  tabs.forEach((tab, index) => {
    const panel = document.createElement('div');
    panel.id = tab.id;
    panel.className = `ct-tab-panel ${index === 0 ? 'active' : ''}`;
    tabContentArea.appendChild(panel);
  });
  
  // Assemble the screen
  caseDetailsScreen.appendChild(headerArea);
  caseDetailsScreen.appendChild(tabBar);
  caseDetailsScreen.appendChild(tabContentArea);
  
  container.appendChild(caseDetailsScreen);
  
  return caseDetailsScreen;
}

export function updateCaseDetailsHeader(caseData) {
  const headerTitleText = document.getElementById('ct-header-title-text');
  const headerSubtitle = document.getElementById('ct-header-subtitle');
  const headerInitial = document.getElementById('ct-header-initial');
  
  if (caseData) {
    if (headerTitleText) {
      headerTitleText.textContent = `${t('case')} ${caseData.caseNumber || caseData.id}`;
    }
    
    if (headerSubtitle) {
      headerSubtitle.textContent = caseData.status || t('case_selected_message');
    }
    
    if (headerInitial) {
      const initial = (caseData.caseNumber || caseData.id || 'C').charAt(0).toUpperCase();
      headerInitial.textContent = initial;
    }
  } else {
    if (headerTitleText) {
      headerTitleText.textContent = t('no_case_selected');
    }
    
    if (headerSubtitle) {
      headerSubtitle.textContent = t('select_case_message');
    }
    
    if (headerInitial) {
      headerInitial.textContent = '';
    }
  }
}

export function switchToCaseDetailsTab(tabId, caseId) {
  // Update tab buttons
  document.querySelectorAll('.ct-tab-button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    }
  });
  
  // Update tab panels
  document.querySelectorAll('.ct-tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.classList.add('active');
    
    // Load appropriate tab content
    switch (tabId) {
    case 'tab-profile':
      createProfileTab(activePanel, caseId);
      break;
    case 'tab-docs':
      createDocumentsTab(activePanel, caseId);
      break;
    case 'tab-users':
      createUsersTab(activePanel, caseId);
      break;
    case 'tab-refund':
      createRefundTab(activePanel, caseId);
      break;
    case 'tab-routing':
      createRoutingTab(activePanel, caseId);
      break;
    }
  }
}