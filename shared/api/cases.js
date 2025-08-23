import { getHeaders } from './auth';
import { CONFIG } from '@core/config';

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
        return data;
    } catch (error) {
        // Replace console.error with proper error handling
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
        return data;
    } catch (error) {
        // Replace console.error with proper error handling
        throw new Error(`Failed to fetch documents: ${error.message}`);
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
        return data;
    } catch (error) {
        // Replace console.error with proper error handling
        throw new Error(`Failed to fetch routing: ${error.message}`);
    }
}