import { getHeaders } from './auth';
import { CONFIG } from '@core/config';
import { state } from '@core/state';

export async function fetchMyCases() {
  try {
    const response = await fetch(CONFIG.API_ENDPOINTS.CASES, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        filter: CONFIG.DEFAULT_CASES_FILTER,
        pageSize: 50,
        pageNumber: 1
      })
    });
        
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    const data = await response.json();
    
    // Store in state
    state.set('allMyCases', data.data || data);
    
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch cases: ${error.message}`);
  }
}

export async function fetchCaseDocuments(caseId) {
  try {
    const response = await fetch(CONFIG.API_ENDPOINTS.DOCUMENTS, {
      method: 'POST',
      headers: getHeaders(caseId),
      body: JSON.stringify({
        caseId: caseId
      })
    });
        
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    const data = await response.json();
    
    // Store in state
    state.set('allCaseDocuments', data.data || data);
    state.set('loadedDocsForCaseId', caseId);
    
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }
}

export async function fetchCaseUsers(caseId) {
  try {
    const response = await fetch(CONFIG.API_ENDPOINTS.USERS, {
      method: 'POST',
      headers: getHeaders(caseId),
      body: JSON.stringify({
        caseId: caseId
      })
    });
        
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    const data = await response.json();
    
    // Store in state
    state.set('allCaseUsers', data.data || data);
    state.set('loadedUsersForCaseId', caseId);
    
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function fetchCaseProfile(caseId) {
  try {
    const response = await fetch(CONFIG.API_ENDPOINTS.PROFILE, {
      method: 'POST',
      headers: getHeaders(caseId),
      body: JSON.stringify({
        caseId: caseId
      })
    });
        
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    const data = await response.json();
    
    // Store in state
    state.set('loadedProfileForCaseId', caseId);
    
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
}

export async function fetchCaseRouting(caseId) {
  try {
    const response = await fetch(CONFIG.API_ENDPOINTS.ROUTING, {
      method: 'POST',
      headers: getHeaders(caseId),
      body: JSON.stringify({
        caseId: caseId
      })
    });
        
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    const data = await response.json();
    
    // Store in state
    state.set('routingData', data.data || data);
    state.set('loadedRoutingForCaseId', caseId);
    
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch routing: ${error.message}`);
  }
}

// Refund Review API Functions
export async function fetchRefundReview(caseId) {
  try {
    // Step 1: Get subprocess ID
    const subProcessResponse = await fetch('https://coretax.intranet.pajak.go.id/casemanagement/api/casedetail/view', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ caseId })
    });
    
    if (!subProcessResponse.ok) {
      throw new Error(`Failed to fetch subprocess: ${subProcessResponse.status}`);
    }
    
    const subProcessData = await subProcessResponse.json();
    const subProcessId = subProcessData.data?.subProcessId;
    
    if (!subProcessId) {
      throw new Error('SubProcess ID not found');
    }
    
    // Step 2: Get reference number
    const referenceResponse = await fetch('https://coretax.intranet.pajak.go.id/casemanagement/api/casereference/view', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subProcessId })
    });
    
    if (!referenceResponse.ok) {
      throw new Error(`Failed to fetch reference: ${referenceResponse.status}`);
    }
    
    const referenceData = await referenceResponse.json();
    const referenceNumber = referenceData.data?.referenceNumber;
    
    if (!referenceNumber) {
      throw new Error('Reference number not found');
    }
    
    // Step 3: Get refund details
    const refundResponse = await fetch('https://coretax.intranet.pajak.go.id/refundreview/api/refundreview/list', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ referenceNumber })
    });
    
    if (!refundResponse.ok) {
      throw new Error(`Failed to fetch refund details: ${refundResponse.status}`);
    }
    
    const refundData = await refundResponse.json();
    
    // Store in state
    state.set('refundReviewData', refundData.data || []);
    state.set('filteredRefundData', refundData.data || []);
    
    return refundData;
  } catch (error) {
    throw new Error(`Failed to fetch refund review: ${error.message}`);
  }
}

// Download document function
export async function downloadDocument(documentId, fileName) {
  try {
    const response = await fetch(`${CONFIG.API_ENDPOINTS.DOWNLOAD}/${documentId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    throw new Error(`Failed to download document: ${error.message}`);
  }
}

// Print document function
export async function printDocument(documentId) {
  try {
    const response = await fetch(`${CONFIG.API_ENDPOINTS.DOWNLOAD}/${documentId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Print failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Open in new window for printing
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    return true;
  } catch (error) {
    throw new Error(`Failed to print document: ${error.message}`);
  }
}