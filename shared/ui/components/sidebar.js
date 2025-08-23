import { t } from '@i18n';
import { state } from '@core/state';

export function createSidebar() {
    // Remove existing sidebar if any
    const existing = document.getElementById('coretabs-sidebar');
    if (existing) {
        existing.remove();
    }
    
    // Create sidebar HTML safely
    const sidebar = document.createElement('div');
    sidebar.id = 'coretabs-sidebar';
    sidebar.className = 'coretabs-sidebar';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'coretabs-header';
    
    const title = document.createElement('h2');
    title.className = 'coretabs-title';
    title.textContent = t('app.title');
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'coretabs-close';
    closeBtn.id = 'coretabs-close';
    closeBtn.textContent = '×';
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Create content area
    const content = document.createElement('div');
    content.className = 'coretabs-content';
    
    // Create profile section
    const profile = document.createElement('div');
    profile.className = 'coretabs-profile';
    profile.id = 'coretabs-profile';
    
    const profileLoading = document.createElement('div');
    profileLoading.className = 'coretabs-loading';
    profileLoading.textContent = t('common.loading');
    profile.appendChild(profileLoading);
    
    // Create tabs
    const tabs = document.createElement('div');
    tabs.className = 'coretabs-tabs';
    
    const casesTab = document.createElement('button');
    casesTab.className = 'coretabs-tab active';
    casesTab.setAttribute('data-tab', 'cases');
    casesTab.textContent = t('tabs.cases');
    
    const docsTab = document.createElement('button');
    docsTab.className = 'coretabs-tab';
    docsTab.setAttribute('data-tab', 'documents');
    docsTab.textContent = t('tabs.documents');
    
    const routingTab = document.createElement('button');
    routingTab.className = 'coretabs-tab';
    routingTab.setAttribute('data-tab', 'routing');
    routingTab.textContent = t('tabs.routing');
    
    tabs.appendChild(casesTab);
    tabs.appendChild(docsTab);
    tabs.appendChild(routingTab);
    
    // Create tab content areas
    const casesContent = document.createElement('div');
    casesContent.className = 'coretabs-tab-content active';
    casesContent.id = 'tab-cases';
    const casesLoading = document.createElement('div');
    casesLoading.className = 'coretabs-loading';
    casesLoading.textContent = t('common.loading');
    casesContent.appendChild(casesLoading);
    
    const documentsContent = document.createElement('div');
    documentsContent.className = 'coretabs-tab-content';
    documentsContent.id = 'tab-documents';
    const docsLoading = document.createElement('div');
    docsLoading.className = 'coretabs-loading';
    docsLoading.textContent = t('common.loading');
    documentsContent.appendChild(docsLoading);
    
    const routingContent = document.createElement('div');
    routingContent.className = 'coretabs-tab-content';
    routingContent.id = 'tab-routing';
    const routingLoading = document.createElement('div');
    routingLoading.className = 'coretabs-loading';
    routingLoading.textContent = t('common.loading');
    routingContent.appendChild(routingLoading);
    
    // Assemble the sidebar
    content.appendChild(profile);
    content.appendChild(tabs);
    content.appendChild(casesContent);
    content.appendChild(documentsContent);
    content.appendChild(routingContent);
    
    sidebar.appendChild(header);
    sidebar.appendChild(content);
    
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.id = 'coretabs-toggle';
    toggle.className = 'coretabs-toggle';
    toggle.textContent = '📋';
    toggle.title = t('app.toggle');
    
    // Add to page
    document.body.appendChild(sidebar);
    document.body.appendChild(toggle);
    
    return { sidebar, toggle };
}