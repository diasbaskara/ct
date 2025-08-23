import { CONFIG } from '@core/config';
import { state } from '@core/state';

export function getAuthToken() {
    const authData = localStorage.getItem(CONFIG.AUTH_STORAGE_KEY);
    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            return parsed.access_token || parsed.accessToken;
        } catch (e) {
            return null;
        }
    }
    return null;
}

export function getUserProfile() {
    const authData = localStorage.getItem(CONFIG.AUTH_STORAGE_KEY);
    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            return {
                name: parsed.name || parsed.user?.name || 'Unknown User',
                role: parsed.role || parsed.user?.role || 'Unknown Role',
                email: parsed.email || parsed.user?.email || '',
                department: parsed.department || parsed.user?.department || ''
            };
        } catch (e) {
            // Remove console.warn for production
            return null;
        }
    }
    return null;
}

export function getHeaders(caseUrl = null) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (caseUrl) {
        headers['X-Case-Url'] = caseUrl;
    }

    return headers;
}

export async function loadUserProfile() {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Profile fetch failed: ${response.status}`);
        }

        const userData = await response.json();
        localStorage.setItem(CONFIG.PROFILE_STORAGE_KEY, JSON.stringify(userData));
        updateProfileDisplay(userData);

        return userData;
    } catch (error) {
        updateProfileDisplay(null);
        throw error;
    }
}

// Add the missing updateProfileDisplay function
export function updateProfileDisplay(userData) {
    const profileElement = document.querySelector('[data-profile]');
    if (!profileElement) return;

    // Clear existing content safely
    profileElement.textContent = '';

    if (userData) {
        const nameElement = document.createElement('span');
        nameElement.textContent = userData.name || 'Unknown User';
        nameElement.className = 'profile-name';

        const roleElement = document.createElement('span');
        roleElement.textContent = userData.role || 'Unknown Role';
        roleElement.className = 'profile-role';

        profileElement.appendChild(nameElement);
        profileElement.appendChild(roleElement);
    }
}