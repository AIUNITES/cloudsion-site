/**
 * Cloudsion App Module
 */

const App = {
  init() {
    this.bindEvents();
    this.updateUI();
  },

  bindEvents() {
    // Login button in nav
    const loginBtn = document.getElementById('nav-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showModal('auth-modal'));
    }

    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
      });
    });

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignup();
      });
    }

    // Demo login
    const demoBtn = document.getElementById('demo-login-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.handleDemoLogin());
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Admin panel button
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => this.showModal('admin-modal'));
    }

    // Admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`admin-${tab.dataset.adminTab}-tab`).classList.add('active');
        
        // Render plans if that tab
        if (tab.dataset.adminTab === 'plans') {
          ProjectPlans.renderPanel();
        }
      });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAllModals();
      });
    });

    // User menu toggle
    const userAvatar = document.getElementById('user-avatar');
    const userDropdown = document.getElementById('user-dropdown');
    if (userAvatar && userDropdown) {
      userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });
      document.addEventListener('click', () => userDropdown.classList.remove('show'));
    }
  },

  handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
      Auth.login(username, password);
      this.closeAllModals();
      this.updateUI();
      this.showToast('Welcome back!', 'success');
    } catch (err) {
      errorEl.textContent = err.message;
    }
  },

  handleSignup() {
    const displayName = document.getElementById('signup-name').value;
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const errorEl = document.getElementById('signup-error');

    if (password !== confirm) {
      errorEl.textContent = 'Passwords do not match';
      return;
    }

    try {
      Auth.signup(displayName, username, email, password);
      this.closeAllModals();
      this.updateUI();
      this.showToast('Account created!', 'success');
    } catch (err) {
      errorEl.textContent = err.message;
    }
  },

  handleDemoLogin() {
    try {
      Auth.login('demo', 'demo123');
      this.closeAllModals();
      this.updateUI();
      this.showToast('Logged in as Demo User', 'success');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  handleLogout() {
    Auth.logout();
    this.updateUI();
    this.showToast('Logged out', 'success');
  },

  updateUI() {
    const user = Auth.getCurrentUser();
    const navLogin = document.getElementById('nav-login-btn');
    const userMenu = document.getElementById('user-menu');
    const adminBtn = document.getElementById('admin-panel-btn');

    if (user) {
      // Logged in
      if (navLogin) navLogin.style.display = 'none';
      if (userMenu) {
        userMenu.style.display = 'flex';
        document.getElementById('user-display-name').textContent = user.displayName;
        document.getElementById('user-avatar').textContent = user.displayName.charAt(0).toUpperCase();
      }
      if (adminBtn) {
        adminBtn.style.display = Auth.isAdmin() ? 'block' : 'none';
      }
    } else {
      // Logged out
      if (navLogin) navLogin.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
      if (adminBtn) adminBtn.style.display = 'none';
    }

    // Update admin panel stats
    this.updateAdminStats();
  },

  updateAdminStats() {
    const users = Storage.getUsers();
    const userCount = Object.keys(users).length;
    
    const statUsers = document.getElementById('admin-stat-users');
    if (statUsers) statUsers.textContent = userCount;

    const adminVersion = document.getElementById('admin-version');
    if (adminVersion) adminVersion.textContent = `v${APP_CONFIG.version}`;

    // Render changelog
    this.renderChangelog();
  },

  renderChangelog() {
    const container = document.getElementById('changelog-content');
    if (!container || !APP_CONFIG.changelog) return;

    container.innerHTML = APP_CONFIG.changelog.map(entry => `
      <div class="changelog-entry">
        <div class="changelog-header">
          <span class="changelog-version">${entry.version}</span>
          <span class="changelog-date">${entry.date}</span>
        </div>
        <ul class="changelog-changes">
          ${entry.changes.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  },

  showModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
  },

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    // Clear form errors
    document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : '✗'}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
