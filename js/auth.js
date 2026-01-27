/**
 * Cloudsion Auth Module
 */

const Auth = {
  signup(displayName, username, email, password) {
    if (!displayName || displayName.length < 2) {
      throw new Error('Display name must be at least 2 characters');
    }
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (Storage.getUserByUsername(username)) {
      throw new Error('Username already taken');
    }

    const user = Storage.createUser({ displayName, username, email, password });
    Storage.setCurrentUser(user.username);
    return user;
  },

  login(username, password) {
    if (!username || !password) {
      throw new Error('Please enter username and password');
    }

    const user = Storage.getUserByUsername(username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.password !== password) {
      throw new Error('Incorrect password');
    }
    
    Storage.setCurrentUser(user.username);
    return user;
  },

  logout() {
    Storage.clearCurrentUser();
  },

  isLoggedIn() {
    return Storage.getCurrentUser() !== null;
  },

  getCurrentUser() {
    return Storage.getCurrentUser();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.isAdmin === true;
  }
};
