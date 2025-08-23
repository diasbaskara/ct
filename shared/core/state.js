class StateManager {
    constructor() {
        this.state = {};
        this.listeners = {};
    }
    
    get(key) {
        return this.state[key];
    }
    
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Notify listeners
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => {
                try {
                    callback(value, oldValue);
                } catch (error) {
                    // Handle listener errors silently in production
                }
            });
        }
    }
    
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners[key].indexOf(callback);
            if (index > -1) {
                this.listeners[key].splice(index, 1);
            }
        };
    }
    
    getAll() {
        return { ...this.state };
    }
    
    clear() {
        this.state = {};
        this.listeners = {};
    }
    
    notify(event, data) {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                // Handle listener errors silently or use proper error reporting
                // Could implement a global error handler here
            }
        });
    }
}

export const state = new StateManager();