import { t } from '@i18n';
import { fetchRefundReview } from '@api/cases';
import { exportToExcel, formatRefundDataForExcel } from '@utils/excelExport';

export function createRefundTab(container, caseId) {
  if (!caseId) {
    const noSelection = document.createElement('div');
    noSelection.className = 'ct-no-selection';
    noSelection.textContent = t('refund.no_case_selected');
    container.appendChild(noSelection);
    return;
  }

  // Show loading
  const loading = document.createElement('div');
  loading.className = 'ct-loading';
  loading.textContent = t('common.loading');
  container.appendChild(loading);

  // Fetch and display refund review data
  fetchRefundReview(caseId).then(refundData => {
    container.innerHTML = '';
    
    if (!refundData || !refundData.data || refundData.data.length === 0) {
      const noData = document.createElement('div');
      noData.className = 'ct-no-data';
      noData.textContent = t('refund.no_data');
      container.appendChild(noData);
      return;
    }

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'ct-controls';
    
    // Filter controls
    const filterContainer = document.createElement('div');
    filterContainer.className = 'ct-filter-container';
    
    const statusFilter = document.createElement('select');
    statusFilter.className = 'ct-select';
    statusFilter.innerHTML = `
      <option value="">${t('refund.all_statuses')}</option>
      <option value="pending">${t('refund.pending')}</option>
      <option value="approved">${t('refund.approved')}</option>
      <option value="rejected">${t('refund.rejected')}</option>
    `;
    
    const amountFilter = document.createElement('input');
    amountFilter.type = 'number';
    amountFilter.className = 'ct-input';
    amountFilter.placeholder = t('refund.min_amount');
    
    filterContainer.appendChild(statusFilter);
    filterContainer.appendChild(amountFilter);
    
    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'ct-btn ct-btn-primary';
    exportBtn.textContent = t('refund.export_excel');
    exportBtn.onclick = () => exportRefundData(refundData.data);
    
    controls.appendChild(filterContainer);
    controls.appendChild(exportBtn);
    container.appendChild(controls);

    // Create refund table
    const table = document.createElement('table');
    table.className = 'ct-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
      t('refund.id'),
      t('refund.amount'),
      t('refund.currency'),
      t('refund.status'),
      t('refund.date'),
      t('refund.reason'),
      t('refund.actions')
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
    renderRefundData(refundData.data, tbody);
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add filter event listeners
    statusFilter.addEventListener('change', () => {
      const filteredData = filterRefundData(refundData.data);
      tbody.innerHTML = '';
      renderRefundData(filteredData, tbody);
    });
    
    amountFilter.addEventListener('input', () => {
      const filteredData = filterRefundData(refundData.data);
      tbody.innerHTML = '';
      renderRefundData(filteredData, tbody);
    });
    
  }).catch(() => {
    container.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ct-error';
    errorDiv.textContent = t('common.error');
    container.appendChild(errorDiv);
  });
}

function renderRefundData(data, tbody) {
  data.forEach(refund => {
    const row = document.createElement('tr');
    
    // ID cell
    const idCell = document.createElement('td');
    idCell.textContent = refund.id || 'N/A';
    row.appendChild(idCell);
    
    // Amount cell
    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(refund.amount, refund.currency);
    row.appendChild(amountCell);
    
    // Currency cell
    const currencyCell = document.createElement('td');
    currencyCell.textContent = refund.currency || 'USD';
    row.appendChild(currencyCell);
    
    // Status cell
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `ct-badge ct-badge-${refund.status || 'pending'}`;
    statusBadge.textContent = t(`refund.${refund.status || 'pending'}`);
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
    
    // Date cell
    const dateCell = document.createElement('td');
    dateCell.textContent = refund.date ? new Date(refund.date).toLocaleDateString() : 'N/A';
    row.appendChild(dateCell);
    
    // Reason cell
    const reasonCell = document.createElement('td');
    reasonCell.textContent = refund.reason || 'N/A';
    reasonCell.title = refund.reason || '';
    row.appendChild(reasonCell);
    
    // Actions cell
    const actionsCell = document.createElement('td');
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'ct-actions';
    
    if (refund.status === 'pending') {
      const approveBtn = document.createElement('button');
      approveBtn.className = 'ct-btn ct-btn-sm ct-btn-success';
      approveBtn.textContent = t('refund.approve');
      approveBtn.onclick = () => processRefund(refund.id, 'approve');
      
      const rejectBtn = document.createElement('button');
      rejectBtn.className = 'ct-btn ct-btn-sm ct-btn-danger';
      rejectBtn.textContent = t('refund.reject');
      rejectBtn.onclick = () => processRefund(refund.id, 'reject');
      
      actionsContainer.appendChild(approveBtn);
      actionsContainer.appendChild(rejectBtn);
    }
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'ct-btn ct-btn-sm ct-btn-secondary';
    viewBtn.textContent = t('refund.view_details');
    viewBtn.onclick = () => viewRefundDetails(refund.id);
    
    actionsContainer.appendChild(viewBtn);
    actionsCell.appendChild(actionsContainer);
    row.appendChild(actionsCell);
    
    tbody.appendChild(row);
  });
}

function filterRefundData(data) {
  // Implementation for filtering refund data
  return data;
}

function exportRefundData(data) {
  try {
    const formattedData = formatRefundDataForExcel(data);
    exportToExcel(formattedData, 'refund_review_data');
  } catch (exportError) {
    // Handle export error silently
  }
}

function formatCurrency(amount, currency) {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount);
}

function processRefund() {
  // Implementation for processing refund approval/rejection
}

function viewRefundDetails() {
  // Implementation for viewing refund details
}