/**
 * Cloudsion GitHub Deploy Module
 * Deploys static sites to GitHub Pages
 */

const GitHubDeploy = {
  // GitHub API base
  API_BASE: 'https://api.github.com',
  
  // Stored credentials
  token: null,
  username: null,

  /**
   * Initialize with Personal Access Token
   */
  async init(token) {
    this.token = token;
    
    // Validate token and get username
    const user = await this.request('GET', '/user');
    if (!user || !user.login) {
      throw new Error('Invalid GitHub token');
    }
    
    this.username = user.login;
    
    // Save to localStorage
    localStorage.setItem('cloudsion_github_token', token);
    localStorage.setItem('cloudsion_github_user', user.login);
    
    return user;
  },

  /**
   * Load saved credentials
   */
  loadSaved() {
    const token = localStorage.getItem('cloudsion_github_token');
    const username = localStorage.getItem('cloudsion_github_user');
    
    if (token && username) {
      this.token = token;
      this.username = username;
      return { token, username };
    }
    return null;
  },

  /**
   * Clear saved credentials
   */
  logout() {
    this.token = null;
    this.username = null;
    localStorage.removeItem('cloudsion_github_token');
    localStorage.removeItem('cloudsion_github_user');
  },

  /**
   * Make authenticated request to GitHub API
   */
  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudsion-Deploy'
      }
    };

    if (this.token) {
      options.headers['Authorization'] = `token ${this.token}`;
    }

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  },

  /**
   * Create a new repository
   */
  async createRepo(name, options = {}) {
    const data = {
      name,
      description: options.description || `Deployed via Cloudsion`,
      private: options.private || false,
      auto_init: false,
      has_issues: false,
      has_projects: false,
      has_wiki: false
    };

    try {
      return await this.request('POST', '/user/repos', data);
    } catch (err) {
      if (err.message.includes('name already exists')) {
        throw new Error(`Repository "${name}" already exists. Choose a different name.`);
      }
      throw err;
    }
  },

  /**
   * Check if repo exists
   */
  async repoExists(name) {
    try {
      await this.request('GET', `/repos/${this.username}/${name}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Upload a single file to repo
   */
  async uploadFile(repo, path, content, message = 'Deploy via Cloudsion') {
    // Convert content to base64
    const base64Content = typeof content === 'string' 
      ? btoa(unescape(encodeURIComponent(content)))
      : await this.fileToBase64(content);

    const data = {
      message,
      content: base64Content
    };

    // Check if file exists (need SHA for update)
    try {
      const existing = await this.request('GET', `/repos/${this.username}/${repo}/contents/${path}`);
      if (existing && existing.sha) {
        data.sha = existing.sha;
      }
    } catch {
      // File doesn't exist, that's fine
    }

    return await this.request('PUT', `/repos/${this.username}/${repo}/contents/${path}`, data);
  },

  /**
   * Convert File object to base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload multiple files
   */
  async uploadFiles(repo, files, onProgress = null) {
    const total = files.length;
    let completed = 0;

    for (const file of files) {
      await this.uploadFile(repo, file.path, file.content);
      completed++;
      if (onProgress) {
        onProgress(completed, total, file.path);
      }
    }

    return { uploaded: completed };
  },

  /**
   * Enable GitHub Pages for repo
   */
  async enablePages(repo, branch = 'main') {
    try {
      // First, try to enable Pages
      await this.request('POST', `/repos/${this.username}/${repo}/pages`, {
        source: {
          branch,
          path: '/'
        }
      });
    } catch (err) {
      // Pages might already be enabled, try to update
      if (err.message.includes('already enabled') || err.message.includes('409')) {
        return await this.getPagesStatus(repo);
      }
      throw err;
    }

    // Wait a bit for Pages to initialize
    await this.sleep(2000);
    
    return await this.getPagesStatus(repo);
  },

  /**
   * Get Pages status
   */
  async getPagesStatus(repo) {
    try {
      return await this.request('GET', `/repos/${this.username}/${repo}/pages`);
    } catch {
      return null;
    }
  },

  /**
   * Get the GitHub Pages URL
   */
  getPagesUrl(repo) {
    return `https://${this.username}.github.io/${repo}/`;
  },

  /**
   * Full deploy workflow
   */
  async deploy(siteName, files, onProgress = null) {
    const steps = [
      'Checking repository...',
      'Creating repository...',
      'Uploading files...',
      'Enabling GitHub Pages...',
      'Finalizing...'
    ];

    const updateStatus = (step, detail = '') => {
      if (onProgress) {
        onProgress({ step: steps.indexOf(step), total: steps.length, message: step, detail });
      }
    };

    // Step 1: Check if repo exists
    updateStatus(steps[0]);
    const exists = await this.repoExists(siteName);

    // Step 2: Create repo if needed
    if (!exists) {
      updateStatus(steps[1]);
      await this.createRepo(siteName);
      await this.sleep(1000); // Wait for repo to be ready
    }

    // Step 3: Upload files
    updateStatus(steps[2]);
    await this.uploadFiles(siteName, files, (completed, total, path) => {
      updateStatus(steps[2], `${completed}/${total} files - ${path}`);
    });

    // Step 4: Enable Pages
    updateStatus(steps[3]);
    await this.enablePages(siteName);

    // Step 5: Done
    updateStatus(steps[4]);
    await this.sleep(1000);

    const url = this.getPagesUrl(siteName);

    // Save to deployed sites list
    this.saveSite(siteName, url, files.length);

    return {
      success: true,
      url,
      repo: `${this.username}/${siteName}`,
      repoUrl: `https://github.com/${this.username}/${siteName}`,
      filesUploaded: files.length
    };
  },

  /**
   * Save deployed site to list
   */
  saveSite(name, url, fileCount) {
    const sites = this.getSites();
    const existing = sites.findIndex(s => s.name === name);
    
    const siteData = {
      name,
      url,
      repoUrl: `https://github.com/${this.username}/${name}`,
      fileCount,
      lastDeploy: new Date().toISOString()
    };

    if (existing >= 0) {
      sites[existing] = siteData;
    } else {
      sites.unshift(siteData);
    }

    localStorage.setItem('cloudsion_sites', JSON.stringify(sites));
  },

  /**
   * Get list of deployed sites
   */
  getSites() {
    try {
      return JSON.parse(localStorage.getItem('cloudsion_sites') || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Delete a site (repo)
   */
  async deleteSite(name) {
    await this.request('DELETE', `/repos/${this.username}/${name}`);
    
    // Remove from local list
    const sites = this.getSites().filter(s => s.name !== name);
    localStorage.setItem('cloudsion_sites', JSON.stringify(sites));
  },

  /**
   * Helper: sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Process dropped files/folders
   */
  async processFiles(items) {
    const files = [];

    const processEntry = async (entry, path = '') => {
      if (entry.isFile) {
        const file = await new Promise(resolve => entry.file(resolve));
        const filePath = path + entry.name;
        
        // Skip hidden files and common ignores
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          return;
        }

        files.push({
          path: filePath,
          content: file,
          size: file.size
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise(resolve => reader.readEntries(resolve));
        
        for (const childEntry of entries) {
          await processEntry(childEntry, path + entry.name + '/');
        }
      }
    };

    for (const item of items) {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : item;
      if (entry) {
        await processEntry(entry);
      }
    }

    return files;
  },

  /**
   * Process file input
   */
  async processFileInput(fileList) {
    const files = [];
    
    for (const file of fileList) {
      // Skip hidden files
      if (file.name.startsWith('.')) continue;
      
      // Get relative path if available
      const path = file.webkitRelativePath || file.name;
      
      files.push({
        path: path.replace(/^[^/]+\//, ''), // Remove top folder
        content: file,
        size: file.size
      });
    }

    return files;
  }
};

// Export for use
window.GitHubDeploy = GitHubDeploy;
