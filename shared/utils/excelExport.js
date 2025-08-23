// Enhanced Excel export functionality using SheetJS
import { formatDate } from '@utils/dateFormatter';

// Load XLSX library for userscript environment
function loadXLSX() {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    if (typeof XLSX !== 'undefined') {
      // eslint-disable-next-line no-undef
      resolve(XLSX);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function exportToExcel(data, filename = 'export', options = {}) {
  try {
    // Load XLSX library
    const XLSX = await loadXLSX();
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Data');
    
    // Generate and download file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
}

export function formatRefundDataForExcel(refundData) {
  return refundData.map(item => ({
    'Case ID': item.caseId || '',
    'Amount': formatCurrency(item.amount, item.currency),
    'Status': formatStatus(item.status),
    'Date': formatDate(item.date, 'short'),
    'Reason': item.reason || '',
    'Processed By': item.processedBy || ''
  }));
}

export function formatDocumentsDataForExcel(documentsData) {
  return documentsData.map(doc => ({
    'Document Name': doc.name || '',
    'Type': doc.type || '',
    'Size': formatFileSize(doc.size),
    'Upload Date': formatDate(doc.uploadDate, 'short'),
    'Status': formatStatus(doc.status)
  }));
}

export function formatUsersDataForExcel(usersData) {
  return usersData.map(user => ({
    'User ID': user.id || '',
    'Name': user.name || '',
    'Email': user.email || '',
    'Role': user.role || '',
    'Department': user.department || '',
    'Last Login': formatDate(user.lastLogin, 'short')
  }));
}

export function formatRoutingDataForExcel(routingData) {
  return routingData.map(route => ({
    'Route ID': route.id || '',
    'From': route.from || '',
    'To': route.to || '',
    'Status': formatStatus(route.status),
    'Created': formatDate(route.created, 'short')
  }));
}

function formatCurrency(amount, currency = 'USD') {
  if (!amount) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function formatStatus(status) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export async function exportMultipleSheets(sheetsData, filename = 'ct-export.xlsx') {
  try {
    const XLSX = await loadXLSX();
    
    const workbook = XLSX.utils.book_new();
    
    sheetsData.forEach(({ name, data }) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    });
    
    XLSX.writeFile(workbook, filename);
    return true;
  } catch (error) {
    throw new Error(`Multi-sheet export failed: ${error.message}`);
  }
}