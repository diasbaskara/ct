import { t } from '@i18n';
// Remove unused state import

export function createSidebar() {
  // Remove existing sidebar if any
  const existing = document.getElementById('coretabs-sidebar');
  if (existing) {
    existing.remove();
  }
  
  // Create toggle button
  createToggleButton();
    
  // Create sidebar HTML safely
  const sidebar = document.createElement('div');
  sidebar.id = 'coretabs-sidebar';
  sidebar.className = 'coretabs-sidebar';
    
  // Create header
  const header = document.createElement('div');
  header.className = 'coretabs-header';
  header.id = 'ct-header';
    
  // Navigation section
  const nav = document.createElement('div');
  nav.className = 'ct-nav';
  nav.id = 'ct-nav';
  
  const backBtn = document.createElement('button');
  backBtn.id = 'ct-nav-back-btn';
  backBtn.className = 'ct-nav-back-btn';
  backBtn.textContent = t('back');
  backBtn.style.display = 'none';
  
  const navTitle = document.createElement('h2');
  navTitle.id = 'ct-nav-title';
  navTitle.className = 'ct-nav-title';
  navTitle.textContent = t('my_cases');
  
  const languageSelect = document.createElement('select');
  languageSelect.id = 'ct-language-select';
  languageSelect.className = 'ct-language-select';
  
  const enOption = document.createElement('option');
  enOption.value = 'en';
  enOption.textContent = 'English';
  
  const idOption = document.createElement('option');
  idOption.value = 'id';
  idOption.textContent = 'Bahasa Indonesia';
  
  languageSelect.appendChild(enOption);
  languageSelect.appendChild(idOption);
  
  nav.appendChild(backBtn);
  nav.appendChild(navTitle);
  nav.appendChild(languageSelect);
  
  // Header title section
  const headerTitle = document.createElement('div');
  headerTitle.className = 'ct-header-title';
  headerTitle.id = 'ct-header-title';
  
  const titleText = document.createElement('h3');
  titleText.id = 'ct-header-title-text';
  titleText.textContent = t('no_case_selected');
  
  const subtitle = document.createElement('p');
  subtitle.id = 'ct-header-subtitle';
  subtitle.textContent = t('select_case_message');
  
  headerTitle.appendChild(titleText);
  headerTitle.appendChild(subtitle);
  
  // Tab buttons
  const tabButtons = document.createElement('div');
  tabButtons.className = 'ct-tab-buttons';
  tabButtons.id = 'ct-tab-buttons';
  
  const tabs = [
    { id: 'tab-profile', key: 'profile' },
    { id: 'tab-docs', key: 'documents' },
    { id: 'tab-users', key: 'users' },
    { id: 'tab-refund', key: 'refund_review' },
    { id: 'tab-routing', key: 'routing' }
  ];
  
  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.className = 'ct-tab-button';
    button.dataset.tab = tab.id;
    button.textContent = t(tab.key);
    tabButtons.appendChild(button);
  });
  
  header.appendChild(nav);
  header.appendChild(headerTitle);
  header.appendChild(tabButtons);
    
  // Create content area
  const content = document.createElement('div');
  content.className = 'ct-content';
  content.id = 'ct-content';
  
  // Create loading message
  const loading = document.createElement('div');
  loading.className = 'ct-loading-message';
  loading.textContent = t('loading_my_cases');
  content.appendChild(loading);
    
  // Assemble the sidebar
  sidebar.appendChild(header);
  sidebar.appendChild(content);
    
  // Add to document
  document.body.appendChild(sidebar);
    
  return sidebar;
}

function createToggleButton() {
  // Remove existing toggle if any
  const existing = document.getElementById('coretabs-toggle');
  if (existing) {
    existing.remove();
  }
  
  const toggle = document.createElement('button');
  toggle.id = 'coretabs-toggle';
  toggle.className = 'coretabs-toggle';
  toggle.textContent = t('coretabs');
  toggle.setAttribute('aria-label', t('app.toggle'));
  
  document.body.appendChild(toggle);
  
  return toggle;
}