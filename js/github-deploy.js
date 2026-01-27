/**
 * Cloudsion GitHub Deploy Module
 * Deploys static sites to GitHub Pages using the GitHub API
 */

const GitHubDeploy = {
  baseUrl: 'https://api.github.com',
  token: null,
  username: null,

  /**
   * Initialize with GitHub credentials
   */
  init(token) {
    this.token = token;
    return this.validateToken();
  },

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) return null;
    
    return response.json();
  },

  /**
   * Validate token and get user info
   */
  async validateToken() {
    try {
      const user = await this.request('/user');
      this.username = user.login;
      return {
        valid: true,
        username: user.login,
        name: user.name,
        avatar: user.avatar_url,
        publicRepos: user.public_repos
      };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  },

  /**
   * Check if repo exists
   */
  async repoExists(repoName) {
    try {
      await this.request(`/repos/${this.username}/${repoName}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Create a new repository
   */
  async createRepo(name, description = 'Deployed with Cloudsion', isPrivate = false) {
    return this.request('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: false,
        has_issues: false,
        has_projects: false,
        has_wiki: false
      })
    });
  },

  /**
   * Upload a single file to repo
   */
  async uploadFile(repoName, path, content, message = 'Deploy via Cloudsion') {
    // Convert content to base64
    const base64Content = typeof content === 'string' 
      ? btoa(unescape(encodeURIComponent(content)))
      : await this.fileToBase64(content);

    // Check if file exists (for updates)
    let sha = null;
    try {
      const existing = await this.request(`/repos/${this.username}/${repoName}/contents/${path}`);
      sha = existing.sha;
    } catch {
      // File doesn't exist, that's fine
    }

    return this.request(`/repos/${this.username}/${repoName}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: base64Content,
        sha
      })
    });
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
  async uploadFiles(repoName, files, onProgress) {
    const results = [];
    let completed = 0;

    for (const file of files) {
      try {
        const result = await this.uploadFile(
          repoName,
          file.path,
          file.content,
          `Add ${file.path}`
        );
        results.push({ path: file.path, success: true, result });
      } catch (err) {
        results.push({ path: file.path, success: false, error: err.message });
      }

      completed++;
      if (onProgress) {
        onProgress(completed, files.length, file.path);
      }

      // Small delay to avoid rate limiting
      if (completed < files.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return results;
  },

  /**
   * Enable GitHub Pages for repo
   */
  async enablePages(repoName, branch = 'main') {
    try {
      // First check if pages already enabled
      const pages = await this.request(`/repos/${this.username}/${repoName}/pages`);
      return { enabled: true, url: pages.html_url, alreadyEnabled: true };
    } catch {
      // Pages not enabled, enable it
    }

    try {
      const result = await this.request(`/repos/${this.username}/${repoName}/pages`, {
        method: 'POST',
        body: JSON.stringify({
          source: {
            branch,
            path: '/'
          }
        })
      });
      return { enabled: true, url: result.html_url };
    } catch (err) {
      // Sometimes the API returns error but pages is enabled
      // Wait and check again
      await new Promise(r => setTimeout(r, 2000));
      try {
        const pages = await this.request(`/repos/${this.username}/${repoName}/pages`);
        return { enabled: true, url: pages.html_url };
      } catch {
        return { enabled: false, error: err.message };
      }
    }
  },

  /**
   * Get GitHub Pages status
   */
  async getPagesStatus(repoName) {
    try {
      const pages = await this.request(`/repos/${this.username}/${repoName}/pages`);
      return {
        enabled: true,
        url: pages.html_url,
        status: pages.status,
        cname: pages.cname
      };
    } catch {
      return { enabled: false };
    }
  },

  /**
   * Full deploy flow
   */
  async deploy(repoName, files, options = {}) {
    const {
      description = 'Deployed with Cloudsion',
      isPrivate = false,
      onProgress = null
    } = options;

    const steps = [];
    let siteUrl = null;

    // Step 1: Check/Create repo
    if (onProgress) onProgress('checking', 'Checking repository...');
    
    const exists = await this.repoExists(repoName);
    if (!exists) {
      if (onProgress) onProgress('creating', 'Creating repository...');
      await this.createRepo(repoName, description, isPrivate);
      steps.push({ step: 'create_repo', success: true });
      
      // Wait for repo to be ready
      await new Promise(r => setTimeout(r, 1000));
    } else {
      steps.push({ step: 'repo_exists', success: true });
    }

    // Step 2: Upload files
    if (onProgress) onProgress('uploading', 'Uploading files...');
    
    const uploadResults = await this.uploadFiles(repoName, files, (done, total, file) => {
      if (onProgress) onProgress('uploading', `Uploading ${file}... (${done}/${total})`);
    });
    
    const failedUploads = uploadResults.filter(r => !r.success);
    steps.push({ 
      step: 'upload_files', 
      success: failedUploads.length === 0,
      uploaded: uploadResults.filter(r => r.success).length,
      failed: failedUploads.length
    });

    // Step 3: Enable GitHub Pages
    if (onProgress) onProgress('enabling', 'Enabling GitHub Pages...');
    
    const pagesResult = await this.enablePages(repoName);
    steps.push({ step: 'enable_pages', ...pagesResult });

    if (pagesResult.enabled) {
      siteUrl = `https://${this.username}.github.io/${repoName}/`;
    }

    // Step 4: Wait for deployment
    if (siteUrl) {
      if (onProgress) onProgress('deploying', 'Waiting for site to go live...');
      
      // GitHub Pages can take a minute to deploy
      await new Promise(r => setTimeout(r, 3000));
    }

    return {
      success: pagesResult.enabled && failedUploads.length === 0,
      repoUrl: `https://github.com/${this.username}/${repoName}`,
      siteUrl,
      steps
    };
  },

  /**
   * List user's repos that have GitHub Pages enabled
   */
  async listDeployedSites() {
    const repos = await this.request('/user/repos?per_page=100&sort=updated');
    const sites = [];

    for (const repo of repos) {
      if (repo.has_pages) {
        sites.push({
          name: repo.name,
          url: `https://${this.username}.github.io/${repo.name}/`,
          repoUrl: repo.html_url,
          updatedAt: repo.updated_at,
          private: repo.private
        });
      }
    }

    return sites;
  },

  /**
   * Delete a repo (use with caution!)
   */
  async deleteRepo(repoName) {
    return this.request(`/repos/${this.username}/${repoName}`, {
      method: 'DELETE'
    });
  },

  /**
   * Get repo details
   */
  async getRepo(repoName) {
    return this.request(`/repos/${this.username}/${repoName}`);
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubDeploy;
}
