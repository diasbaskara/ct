# API Documentation

This document describes the basic APIs for CoreTabs.

## CoreTabs Class

Main class that manages the userscript functionality.

```javascript
class CoreTabs {
    constructor(options = {})
    async init()
    destroy()
    getVersion()
}
```

### Basic Usage

```javascript
// Initialize CoreTabs
const coreTabs = new CoreTabs();
await coreTabs.init();

// Get version
console.log(coreTabs.getVersion());

// Clean up when done
coreTabs.destroy();
```

## State Management

Simple state management for the application.

```javascript
// Get state
const value = stateManager.getState('key');

// Set state
stateManager.setState('key', 'value');

// Listen for changes
stateManager.subscribe('key', (newValue) => {
    console.log('Value changed:', newValue);
});
```

## Authentication

Basic authentication with CoreTax system.

```javascript
// Login
const user = await authAPI.login({
    username: 'your-username',
    password: 'your-password'
});

// Check if authenticated
if (authAPI.isAuthenticated()) {
    console.log('User is logged in');
}
```

## Cases API

Manage cases in the system.

```javascript
// Get all cases
const cases = await casesAPI.getCases();

// Get specific case
const case = await casesAPI.getCase('case-id');

// Update case
await casesAPI.updateCase('case-id', { status: 'completed' });
```

## UI Components

Basic UI components for building interfaces.

```javascript
// Create a tab component
const tabs = new TabComponent(container);
tabs.addTab('dashboard', 'Dashboard', content);
tabs.setActiveTab('dashboard');

// Create a modal
const modal = new ModalComponent({
    title: 'Settings',
    content: 'Modal content here'
});
modal.open();
```

## Utilities

### Storage

```javascript
// Save data
await persistence.save('settings', { theme: 'dark' });

// Load data
const settings = await persistence.load('settings', {});
```

### Events

```javascript
// Listen for events
eventManager.on('user:login', (user) => {
    console.log('User logged in:', user.name);
});

// Emit events
eventManager.emit('user:login', user);
```

## Error Handling

```javascript
try {
    await casesAPI.getCases();
} catch (error) {
    console.error('Error:', error.message);
}
```

For more detailed examples, see the source code in the `shared/` directory.