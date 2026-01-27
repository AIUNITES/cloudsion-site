/**
 * Cloudsion Storage Module
 */

const Storage = {
  get KEYS() {
    const prefix = APP_CONFIG.storagePrefix;
    return {
      USERS: `${prefix}_users`,
      CURRENT_USER: `${prefix}_current_user`,
      SETTINGS: `${prefix}_settings`
    };
  },

  init() {
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const users = {};
      
      // Admin user
      const admin = APP_CONFIG.defaultAdmin;
      users[admin.username] = {
        id: 'admin_001',
        username: admin.username,
        displayName: admin.displayName,
        email: admin.email,
        password: admin.password,
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      
      // Demo user
      const demo = APP_CONFIG.defaultDemo;
      users[demo.username] = {
        id: 'demo_001',
        username: demo.username,
        displayName: demo.displayName,
        email: demo.email,
        password: demo.password,
        isAdmin: false,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    }
  },

  getAll(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  },

  saveAll(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getUsers() {
    return this.getAll(this.KEYS.USERS);
  },

  getUserByUsername(username) {
    const users = this.getUsers();
    return users[username.toLowerCase()] || null;
  },

  createUser(userData) {
    const users = this.getUsers();
    const username = userData.username.toLowerCase();
    
    if (users[username]) {
      throw new Error('Username already exists');
    }

    const user = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      username: username,
      displayName: userData.displayName,
      email: userData.email || '',
      password: userData.password,
      isAdmin: userData.isAdmin || false,
      createdAt: new Date().toISOString()
    };

    users[username] = user;
    this.saveAll(this.KEYS.USERS, users);
    return user;
  },

  getCurrentUser() {
    const username = localStorage.getItem(this.KEYS.CURRENT_USER);
    if (!username) return null;
    return this.getUserByUsername(username);
  },

  setCurrentUser(username) {
    localStorage.setItem(this.KEYS.CURRENT_USER, username.toLowerCase());
  },

  clearCurrentUser() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
  }
};

Storage.init();
