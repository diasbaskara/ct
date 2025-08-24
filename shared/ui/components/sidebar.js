import { t } from '@i18n';
import { createCaseDetailsScreen } from './caseDetailsScreen';

export function createSidebar() {
  // Remove existing sidebar if any
  const existing = document.getElementById('ct-sidebar');
  if (existing) {
    existing.remove();
  }
  
  // Create toggle button
  createToggleButton();
    
  // Create sidebar HTML safely
  const sidebar = document.createElement('div');
  sidebar.id = 'ct-sidebar';
  sidebar.className = 'ct-sidebar';
    
  // Create header
  const header = document.createElement('div');
  header.className = 'ct-header';
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
  
  header.appendChild(nav);
    
  // Create content area
  const content = document.createElement('div');
  content.className = 'ct-content';
  content.id = 'ct-content';
  
  // Create the case details screen inside content
  createCaseDetailsScreen(content);
    
  sidebar.appendChild(header);
  sidebar.appendChild(content);
    
  document.body.appendChild(sidebar);
    
  return sidebar;
}

export function createToggleButton() {
  // Remove existing toggle if any
  const existing = document.getElementById('ct-sidebar-toggle');
  if (existing) {
    existing.remove();
  }
  
  const toggle = document.createElement('button');
  toggle.id = 'ct-sidebar-toggle';
  toggle.className = 'ct-sidebar-toggle';
  toggle.textContent = t('coretabs');
  toggle.setAttribute('aria-label', t('app.toggle'));
  
  document.body.appendChild(toggle);
  
  return toggle;
}