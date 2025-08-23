import { t } from '@i18n';
import { fetchCaseProfile } from '@api/cases';

export function createProfileTab(container, caseId) {
  if (!caseId) {
    const noSelection = document.createElement('div');
    noSelection.className = 'ct-no-selection';
    noSelection.textContent = t('profile.no_case_selected');
    container.appendChild(noSelection);
    return;
  }

  // Show loading
  const loading = document.createElement('div');
  loading.className = 'ct-loading';
  loading.textContent = t('common.loading');
  container.appendChild(loading);

  // Fetch and display profile data
  fetchCaseProfile(caseId).then(profileData => {
    container.innerHTML = '';
    
    if (!profileData || !profileData.data) {
      const noData = document.createElement('div');
      noData.className = 'ct-no-data';
      noData.textContent = t('profile.no_data');
      container.appendChild(noData);
      return;
    }

    const profile = profileData.data;
    
    // Create profile container
    const profileContainer = document.createElement('div');
    profileContainer.className = 'ct-profile-container';
    
    // Basic Information Section
    const basicInfo = createProfileSection(t('profile.basic_info'), [
      { label: t('profile.case_number'), value: profile.caseNumber },
      { label: t('profile.status'), value: profile.status },
      { label: t('profile.type'), value: profile.caseType },
      { label: t('profile.priority'), value: profile.priority },
      { label: t('profile.created_date'), value: profile.createdDate },
      { label: t('profile.last_update'), value: profile.lastUpdate }
    ]);
    
    // Customer Information Section
    const customerInfo = createProfileSection(t('profile.customer_info'), [
      { label: t('profile.customer_name'), value: profile.customerName },
      { label: t('profile.customer_email'), value: profile.customerEmail },
      { label: t('profile.customer_phone'), value: profile.customerPhone },
      { label: t('profile.customer_id'), value: profile.customerId }
    ]);
    
    // Transaction Information Section
    const transactionInfo = createProfileSection(t('profile.transaction_info'), [
      { label: t('profile.transaction_id'), value: profile.transactionId },
      { label: t('profile.amount'), value: profile.amount },
      { label: t('profile.currency'), value: profile.currency },
      { label: t('profile.payment_method'), value: profile.paymentMethod },
      { label: t('profile.transaction_date'), value: profile.transactionDate }
    ]);
    
    profileContainer.appendChild(basicInfo);
    profileContainer.appendChild(customerInfo);
    profileContainer.appendChild(transactionInfo);
    
    container.appendChild(profileContainer);
  }).catch(() => {
    container.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ct-error';
    errorDiv.textContent = t('common.error');
    container.appendChild(errorDiv);
  });
}

function createProfileSection(title, fields) {
  const section = document.createElement('div');
  section.className = 'ct-profile-section';
  
  const sectionTitle = document.createElement('h4');
  sectionTitle.className = 'ct-profile-section-title';
  sectionTitle.textContent = title;
  section.appendChild(sectionTitle);
  
  const fieldContainer = document.createElement('div');
  fieldContainer.className = 'ct-profile-fields';
  
  fields.forEach(field => {
    if (field.value) {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'ct-profile-field';
      
      const label = document.createElement('span');
      label.className = 'ct-profile-label';
      label.textContent = field.label + ':';
      
      const value = document.createElement('span');
      value.className = 'ct-profile-value';
      value.textContent = field.value;
      
      fieldDiv.appendChild(label);
      fieldDiv.appendChild(value);
      fieldContainer.appendChild(fieldDiv);
    }
  });
  
  section.appendChild(fieldContainer);
  return section;
}