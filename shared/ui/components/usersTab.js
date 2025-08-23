import { t } from '@i18n';
import { fetchCaseUsers } from '@api/cases';

export function createUsersTab(container, caseId) {
  if (!caseId) {
    const noSelection = document.createElement('div');
    noSelection.className = 'ct-no-selection';
    noSelection.textContent = t('users.no_case_selected');
    container.appendChild(noSelection);
    return;
  }

  // Show loading
  const loading = document.createElement('div');
  loading.className = 'ct-loading';
  loading.textContent = t('common.loading');
  container.appendChild(loading);

  // Fetch and display users
  fetchCaseUsers(caseId).then(usersData => {
    container.innerHTML = '';
    
    if (!usersData || !usersData.data || usersData.data.length === 0) {
      const noData = document.createElement('div');
      noData.className = 'ct-no-data';
      noData.textContent = t('users.no_data');
      container.appendChild(noData);
      return;
    }

    // Create users table
    const table = document.createElement('table');
    table.className = 'ct-table ct-users-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
      t('users.name'),
      t('users.role'),
      t('users.email'),
      t('users.department'),
      t('users.last_activity')
    ];
    
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    usersData.data.forEach(user => {
      const row = document.createElement('tr');
      
      // User name
      const nameCell = document.createElement('td');
      nameCell.textContent = user.name || 'N/A';
      row.appendChild(nameCell);
      
      // Role
      const roleCell = document.createElement('td');
      const roleBadge = document.createElement('span');
      roleBadge.className = `ct-badge ct-role-${(user.role || '').toLowerCase().replace(' ', '-')}`;
      roleBadge.textContent = user.role || 'N/A';
      roleCell.appendChild(roleBadge);
      row.appendChild(roleCell);
      
      // Email
      const emailCell = document.createElement('td');
      emailCell.textContent = user.email || 'N/A';
      row.appendChild(emailCell);
      
      // Department
      const deptCell = document.createElement('td');
      deptCell.textContent = user.department || 'N/A';
      row.appendChild(deptCell);
      
      // Last activity
      const activityCell = document.createElement('td');
      activityCell.textContent = user.lastActivity || 'N/A';
      row.appendChild(activityCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
  }).catch(() => {
    container.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ct-error';
    errorDiv.textContent = t('common.error');
    container.appendChild(errorDiv);
  });
}