/**
 * Cloudsion App Module
 */

const App = {
  // Deploy state
  selectedFiles: [],
  
  init() {
    this.bindEvents();
    this.updateUI();
    this.checkGitHubConnection();
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

    // Deploy button in nav
    const navDeployBtn = document.getElementById('nav-deploy-btn');
    if (navDeployBtn) {
      navDeployBtn.addEventListener('click', () => this.openDeployModal());
    }

    // Dashboard button
    const dashboardBtn = document.getElementById('dashboard-btn');
    if (dashboardBtn) {
      dashboardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDashboard();
      });
    }

    // GitHub connect
    const githubConnectBtn = document.getElementById('github-connect-btn');
    if (githubConnectBtn) {
      githubConnectBtn.addEventListener('click', () => this.connectGitHub());
    }

    // GitHub disconnect
    const githubDisconnect = document.getElementById('github-disconnect');
    if (githubDisconnect) {
      githubDisconnect.addEventListener('click', () => this.disconnectGitHub());
    }

    // Site name input - update preview URL
    const siteNameInput = document.getElementById('deploy-site-name');
    if (siteNameInput) {
      siteNameInput.addEventListener('input', () => this.updateUrlPreview());
    }

    // File drop zone
    const dropZone = document.getElementById('file-drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        this.handleFileDrop(e.dataTransfer.items);
      });
    }

    // File input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        this.handleFileSelect(fileInput.files);
      });
    }

    // Clear files button
    const clearFilesBtn = document.getElementById('clear-files');
    if (clearFilesBtn) {
      clearFilesBtn.addEventListener('click', () => this.clearFiles());
    }

    // Deploy button
    const deployBtn = document.getElementById('deploy-btn');
    if (deployBtn) {
      deployBtn.addEventListener('click', () => this.startDeploy());
    }

    // Deploy another button
    const deployAnotherBtn = document.getElementById('deploy-another-btn');
    if (deployAnotherBtn) {
      deployAnotherBtn.addEventListener('click', () => this.resetDeploy());
    }

    // Dashboard deploy buttons
    const dashboardDeployBtn = document.getElementById('dashboard-deploy-btn');
    if (dashboardDeployBtn) {
      dashboardDeployBtn.addEventListener('click', () => {
        this.closeAllModals();
        this.openDeployModal();
      });
    }

    const emptyDeployBtn = document.getElementById('empty-deploy-btn');
    if (emptyDeployBtn) {
      emptyDeployBtn.addEventListener('click', () => {
        this.closeAllModals();
        this.openDeployModal();
      });
    }
  },

  // ============================================
  // AUTH METHODS
  // ============================================

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

  // ============================================
  // GITHUB METHODS
  // ============================================

  checkGitHubConnection() {
    const saved = localStorage.getItem('cloudsion_github');
    if (saved) {
      try {
        const { token, username } = JSON.parse(saved);
        GitHubDeploy.token = token;
        GitHubDeploy.username = username;
        this.updateGitHubUI(true, username);
      } catch {
        localStorage.removeItem('cloudsion_github');
      }
    }
  },

  async connectGitHub() {
    const tokenInput = document.getElementById('github-token');
    const token = tokenInput.value.trim();

    if (!token) {
      this.showToast('Please enter your GitHub token', 'error');
      return;
    }

    const btn = document.getElementById('github-connect-btn');
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Connecting...';

    try {
      const result = await GitHubDeploy.init(token);
      
      if (result.valid) {
        // Save credentials
        localStorage.setItem('cloudsion_github', JSON.stringify({
          token,
          username: result.username
        }));

        this.updateGitHubUI(true, result.username);
        this.showToast(`Connected as ${result.username}!`, 'success');
        
        // Move to upload step
        this.showDeployStep('upload');
      } else {
        this.showToast(result.error || 'Invalid token', 'error');
      }
    } catch (err) {
      this.showToast(err.message, 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<span>🔗</span> Connect GitHub';
  },

  disconnectGitHub() {
    localStorage.removeItem('cloudsion_github');
    GitHubDeploy.token = null;
    GitHubDeploy.username = null;
    this.updateGitHubUI(false);
    this.showToast('Disconnected from GitHub', 'success');
  },

  updateGitHubUI(connected, username = '') {
    const status = document.getElementById('github-status');
    const form = document.getElementById('github-connect-form');
    const usernameEl = document.getElementById('github-username');
    const urlPreview = document.getElementById('deploy-url-preview');

    if (connected) {
      status.style.display = 'flex';
      form.style.display = 'none';
      usernameEl.textContent = username;
      if (urlPreview) {
        urlPreview.textContent = `${username}.github.io/my-awesome-site`;
      }
    } else {
      status.style.display = 'none';
      form.style.display = 'block';
    }
  },

  // ============================================
  // DEPLOY METHODS
  // ============================================

  openDeployModal() {
    // Check if GitHub is connected
    if (GitHubDeploy.token && GitHubDeploy.username) {
      this.showDeployStep('upload');
    } else {
      this.showDeployStep('connect');
    }
    this.showModal('deploy-modal');
  },

  showDeployStep(step) {
    document.querySelectorAll('.deploy-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`deploy-step-${step}`).classList.add('active');
  },

  updateUrlPreview() {
    const siteName = document.getElementById('deploy-site-name').value || 'my-awesome-site';
    const preview = document.getElementById('deploy-url-preview');
    const username = GitHubDeploy.username || 'username';
    preview.textContent = `${username}.github.io/${siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
  },

  async handleFileDrop(items) {
    const files = [];
    
    const processEntry = async (entry, path = '') => {
      if (entry.isFile) {
        const file = await new Promise(resolve => entry.file(resolve));
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push({
            path: path + entry.name,
            content: file,
            size: file.size
          });
        }
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise(resolve => reader.readEntries(resolve));
        for (const childEntry of entries) {
          await processEntry(childEntry, path + entry.name + '/');
        }
      }
    };

    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        await processEntry(entry);
      }
    }

    this.selectedFiles = files;
    this.updateFilesPreview();
  },

  async handleFileSelect(fileList) {
    const files = [];
    
    for (const file of fileList) {
      if (file.name.startsWith('.')) continue;
      
      const path = file.webkitRelativePath 
        ? file.webkitRelativePath.split('/').slice(1).join('/')
        : file.name;
      
      files.push({
        path,
        content: file,
        size: file.size
      });
    }

    this.selectedFiles = files;
    this.updateFilesPreview();
  },

  updateFilesPreview() {
    const preview = document.getElementById('files-preview');
    const dropZone = document.getElementById('file-drop-zone');
    const countEl = document.getElementById('files-count');
    const sizeEl = document.getElementById('files-size');
    const listEl = document.getElementById('files-list');
    const deployBtn = document.getElementById('deploy-btn');

    if (this.selectedFiles.length === 0) {
      preview.style.display = 'none';
      dropZone.style.display = 'block';
      deployBtn.disabled = true;
      return;
    }

    preview.style.display = 'block';
    dropZone.style.display = 'none';
    deployBtn.disabled = false;

    const totalSize = this.selectedFiles.reduce((sum, f) => sum + f.size, 0);
    countEl.textContent = `${this.selectedFiles.length} files`;
    sizeEl.textContent = this.formatSize(totalSize);

    listEl.innerHTML = this.selectedFiles
      .slice(0, 20)
      .map(f => `<div>📄 ${f.path}</div>`)
      .join('');
    
    if (this.selectedFiles.length > 20) {
      listEl.innerHTML += `<div>... and ${this.selectedFiles.length - 20} more</div>`;
    }
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  clearFiles() {
    this.selectedFiles = [];
    this.updateFilesPreview();
    document.getElementById('file-input').value = '';
  },

  async startDeploy() {
    const siteName = document.getElementById('deploy-site-name').value.trim();
    
    if (!siteName) {
      this.showToast('Please enter a site name', 'error');
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.showToast('Please select files to deploy', 'error');
      return;
    }

    // Sanitize site name
    const repoName = siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    this.showDeployStep('progress');

    try {
      const result = await GitHubDeploy.deploy(repoName, this.selectedFiles, {
        onProgress: (status, message) => {
          document.getElementById('deploy-status').textContent = message;
          
          // Update progress bar
          const progressMap = {
            'checking': 20,
            'creating': 30,
            'uploading': 50,
            'enabling': 80,
            'deploying': 90
          };
          const progress = progressMap[status] || 0;
          document.getElementById('deploy-progress-bar').style.width = progress + '%';
        }
      });

      if (result.success) {
        document.getElementById('deploy-progress-bar').style.width = '100%';
        
        // Show success
        setTimeout(() => {
          this.showDeployStep('success');
          document.getElementById('deployed-url').href = result.siteUrl;
          document.getElementById('deployed-url').textContent = result.siteUrl;
          document.getElementById('deployed-repo-link').href = result.repoUrl;
        }, 500);

        this.showToast('Site deployed successfully!', 'success');
      } else {
        throw new Error('Deployment failed');
      }
    } catch (err) {
      this.showToast(err.message, 'error');
      this.showDeployStep('upload');
    }
  },

  resetDeploy() {
    this.clearFiles();
    document.getElementById('deploy-site-name').value = '';
    document.getElementById('deploy-progress-bar').style.width = '0%';
    this.showDeployStep('upload');
  },

  // ============================================
  // DASHBOARD METHODS
  // ============================================

  async openDashboard() {
    this.showModal('dashboard-modal');
    
    const userEl = document.getElementById('dashboard-github-user');
    const sitesGrid = document.getElementById('sites-grid');
    const emptySites = document.getElementById('empty-sites');

    if (!GitHubDeploy.token) {
      userEl.textContent = 'Not connected to GitHub';
      emptySites.innerHTML = `
        <span>🔗</span>
        <p>Connect to GitHub to see your sites</p>
        <button class="btn btn-primary" onclick="App.closeAllModals(); App.openDeployModal();">Connect GitHub</button>
      `;
      emptySites.style.display = 'block';
      return;
    }

    userEl.textContent = `Connected as @${GitHubDeploy.username}`;
    
    try {
      const sites = await GitHubDeploy.listDeployedSites();
      
      if (sites.length === 0) {
        emptySites.style.display = 'block';
        return;
      }

      emptySites.style.display = 'none';
      sitesGrid.innerHTML = sites.map(site => `
        <div class="site-card">
          <div class="site-card-header">
            <h4>${site.name}</h4>
            ${site.private ? '<span class="badge">🔒 Private</span>' : ''}
          </div>
          <a href="${site.url}" target="_blank" class="site-card-url">${site.url}</a>
          <div class="site-card-meta">
            <span>Updated ${this.formatDate(site.updatedAt)}</span>
          </div>
          <div class="site-card-actions">
            <a href="${site.url}" target="_blank" class="btn-small btn-secondary">🌐 Visit</a>
            <a href="${site.repoUrl}" target="_blank" class="btn-small btn-secondary">🐙 Repo</a>
          </div>
        </div>
      `).join('');
    } catch (err) {
      this.showToast('Failed to load sites: ' + err.message, 'error');
    }
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    
    return date.toLocaleDateString();
  },

  // ============================================
  // UI METHODS
  // ============================================

  updateUI() {
    const user = Auth.getCurrentUser();
    const navLogin = document.getElementById('nav-login-btn');
    const userMenu = document.getElementById('user-menu');
    const adminBtn = document.getElementById('admin-panel-btn');

    if (user) {
      // Logged in - hide login button, show user menu
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
      // Logged out - show login button, hide user menu
      if (navLogin) navLogin.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
      if (adminBtn) adminBtn.style.display = 'none';
    }

    // Deploy button is always visible (no login required!)
    
    this.updateAdminStats();
  },

  updateAdminStats() {
    const users = Storage.getUsers();
    const userCount = Object.keys(users).length;
    
    const statUsers = document.getElementById('admin-stat-users');
    if (statUsers) statUsers.textContent = userCount;

    const adminVersion = document.getElementById('admin-version');
    if (adminVersion) adminVersion.textContent = `v${APP_CONFIG.version}`;

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
