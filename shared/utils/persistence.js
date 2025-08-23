import { CONFIG } from '@core/config';
import { state } from '@core/state';

export function setupPersistenceListeners() {
  // Save sidebar state when it changes
  const sidebar = document.getElementById('ct-sidebar');
  if (sidebar) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isOpen = sidebar.classList.contains('open');
          saveSidebarState({ isOpen });
        }
      });
    });
        
    observer.observe(sidebar, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
    
  // Save data periodically
  setInterval(() => {
    saveStateData();
  }, 30000); // Save every 30 seconds
}

export function saveSidebarState(state) {
  try {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    // Handle silently
    return false;
  }
}

export function restoreSidebarState() {
  try {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    // Handle silently
    return null;
  }
}

export async function saveStateData(key, data) {
  try {
    const serialized = JSON.stringify(data);
    await GM_setValue(key, serialized);
    return true;
  } catch (error) {
    // Handle silently
    return false;
  }
}

export async function loadStateData(key, defaultValue = null) {
  try {
    const stored = await GM_getValue(key, null);
    if (stored === null) {
      return defaultValue;
    }
    return JSON.parse(stored);
  } catch (error) {
    // Handle silently and return default
    return defaultValue;
  }
}

export async function removeStateData(key) {
  try {
    await GM_deleteValue(key);
    return true;
  } catch (error) {
    // Handle silently
    return false;
  }
}

export async function restoreState() {
  try {
    const sidebarState = await loadStateData('sidebar_state', { collapsed: false });
    const tabState = await loadStateData('active_tab', 'cases');
        
    // Apply restored state
    if (sidebarState.collapsed) {
      document.body.classList.add('ct-sidebar-collapsed');
    }
        
    // Activate restored tab
    const activeTab = document.querySelector(`[data-tab="${tabState}"]`);
    if (activeTab) {
      activeTab.click();
    }
        
    return { sidebarState, tabState };
  } catch (error) {
    // Handle silently and use defaults
    return { sidebarState: { collapsed: false }, tabState: 'cases' };
  }
}

export function restoreStateData(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    // Handle silently
    return null;
  }
}

export function restoreAllStateData() {
  try {
    const savedData = localStorage.getItem(CONFIG.SIDEBAR_DATA_KEY);
    if (savedData) {
      const data = JSON.parse(savedData);
      Object.keys(data).forEach(key => {
        state.set(key, data[key]);
      });
    }
  } catch (error) {
    // Handle silently
  }
}

// Removed console.warn statements and replaced with silent error handling
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
      // Handle silently - invalid profile data will be handled by profile flow
    }
  }
  return null;
}