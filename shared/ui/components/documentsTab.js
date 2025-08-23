import { t } from '@i18n';
import { fetchCaseDocuments, downloadDocument, printDocument } from '@api/cases';

export function createDocumentsTab(container, caseId) {
  if (!caseId) {
    const noSelection = document.createElement('div');
    noSelection.className = 'ct-no-selection';
    noSelection.textContent = t('documents.no_case_selected');
    container.appendChild(noSelection);
    return;
  }

  // Show loading
  const loading = document.createElement('div');
  loading.className = 'ct-loading';
  loading.textContent = t('common.loading');
  container.appendChild(loading);

  // Fetch and display documents
  fetchCaseDocuments(caseId).then(documentsData => {
    container.innerHTML = '';
    
    if (!documentsData || !documentsData.data || documentsData.data.length === 0) {
      const noData = document.createElement('div');
      noData.className = 'ct-no-data';
      noData.textContent = t('documents.no_data');
      container.appendChild(noData);
      return;
    }

    // Create documents table
    const table = document.createElement('table');
    table.className = 'ct-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
      t('documents.name'),
      t('documents.type'),
      t('documents.size'),
      t('documents.date'),
      t('documents.actions')
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
    
    documentsData.data.forEach(doc => {
      const row = document.createElement('tr');
      
      // Name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = doc.name || 'N/A';
      row.appendChild(nameCell);
      
      // Type cell
      const typeCell = document.createElement('td');
      typeCell.textContent = doc.type || 'N/A';
      row.appendChild(typeCell);
      
      // Size cell
      const sizeCell = document.createElement('td');
      sizeCell.textContent = formatFileSize(doc.size);
      row.appendChild(sizeCell);
      
      // Date cell
      const dateCell = document.createElement('td');
      dateCell.textContent = doc.date ? new Date(doc.date).toLocaleDateString() : 'N/A';
      row.appendChild(dateCell);
      
      // Actions cell
      const actionsCell = document.createElement('td');
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'ct-actions';
      
      // Download button
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'ct-btn ct-btn-sm ct-btn-primary';
      downloadBtn.textContent = t('documents.download');
      downloadBtn.onclick = () => downloadDocument(doc.id, doc.name);
      
      // Print button
      const printBtn = document.createElement('button');
      printBtn.className = 'ct-btn ct-btn-sm ct-btn-secondary';
      printBtn.textContent = t('documents.print');
      printBtn.onclick = () => printDocument(doc.id);
      
      actionsContainer.appendChild(downloadBtn);
      actionsContainer.appendChild(printBtn);
      actionsCell.appendChild(actionsContainer);
      row.appendChild(actionsCell);
      
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

function formatFileSize(bytes) {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}