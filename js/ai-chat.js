/**
 * Cloudsion AI Chat Module
 * Simple AI assistant for deployment help
 */

const CloudsionAI = {
  // Knowledge base for common questions
  knowledge: {
    greeting: [
      "Hi! I'm the Cloudsion AI assistant. I can help you with deploying websites, GitHub tokens, and troubleshooting. What do you need help with?",
      "Hello! I'm here to help you publish your website. Ask me anything about deployment, tokens, or common issues!"
    ],
    
    topics: {
      'token': {
        keywords: ['token', 'pat', 'personal access', 'ghp_', 'create token', 'github token'],
        response: `**Creating a GitHub Token:**

1. Go to [GitHub Token Settings](https://github.com/settings/tokens/new?scopes=repo&description=Cloudsion%20Deploy)
2. Set an expiration (90 days recommended)
3. Check the **"repo"** checkbox
4. Click "Generate token"
5. Copy the token (starts with \`ghp_\`)

⚠️ Save it somewhere safe - you won't see it again!`
      },
      
      'free': {
        keywords: ['free', 'cost', 'price', 'pay', 'money', 'charge'],
        response: `**Yes, Cloudsion is free!**

The free tier uses GitHub Pages, which is 100% free:
- ✅ Unlimited sites
- ✅ Free SSL certificates  
- ✅ No monthly fees
- ✅ 100GB bandwidth/month

GitHub pays for the hosting, not you!

**Pro tier ($9/mo)** adds: custom domains, analytics, faster CDN.`
      },
      
      'safe': {
        keywords: ['safe', 'secure', 'trust', 'privacy', 'steal', 'hack'],
        response: `**Your token is safe:**

- 🔒 Stored only in your browser's localStorage
- 🚫 Never sent to our servers
- 🔑 We only use it to talk directly to GitHub's API
- ❌ We can't see your GitHub password

You can revoke the token anytime at [github.com/settings/tokens](https://github.com/settings/tokens)`
      },
      
      'files': {
        keywords: ['files', 'index.html', 'what files', 'folder', 'upload', 'need'],
        response: `**What files to upload:**

**Required:**
- \`index.html\` - Your homepage

**Optional:**
- \`css/\` folder - Stylesheets
- \`js/\` folder - JavaScript
- \`images/\` folder - Pictures
- Any other static files

**Not supported:**
- PHP, Python, Node.js (server-side code)
- Databases`
      },
      
      'domain': {
        keywords: ['domain', 'custom domain', 'url', 'mydomain', '.com', 'dns'],
        response: `**Custom Domains:**

**Free tier (GitHub Pages):**
1. Deploy your site first
2. Go to your repo on GitHub → Settings → Pages
3. Add your custom domain
4. Update your DNS to point to GitHub

**Pro tier ($9/mo):**
We handle everything automatically - just add your domain in Cloudsion!`
      },
      
      'not working': {
        keywords: ['not working', 'broken', 'error', '404', 'not loading', 'blank', 'white page'],
        response: `**Troubleshooting:**

1. **Wait 1-2 minutes** - GitHub Pages needs time to build

2. **Check for index.html** - Must be in the root folder

3. **Check file paths** - Use relative paths:
   - ✅ \`./css/style.css\`
   - ❌ \`/css/style.css\`

4. **Check repo settings** - Go to GitHub → repo → Settings → Pages

5. **Clear browser cache** - Ctrl+Shift+R

Still not working? Check the [Help page](help.html) or ask me more details!`
      },
      
      'update': {
        keywords: ['update', 'change', 'edit', 'redeploy', 'new version'],
        response: `**Updating your site:**

Just deploy again with the same site name! Cloudsion will:
1. Update existing files
2. Add new files
3. Keep the same URL

GitHub Pages usually updates within 1-2 minutes.`
      },
      
      'delete': {
        keywords: ['delete', 'remove', 'take down', 'unpublish'],
        response: `**Deleting a site:**

1. Go to [github.com](https://github.com)
2. Find your repository
3. Go to Settings (bottom of page)
4. Scroll to "Danger Zone"
5. Click "Delete this repository"

The site will be taken offline immediately.`
      },
      
      'how': {
        keywords: ['how does', 'how do i', 'how to', 'steps', 'process'],
        response: `**How Cloudsion works:**

1. **Create account** - Sign up for Cloudsion
2. **Connect GitHub** - Paste your Personal Access Token
3. **Upload files** - Drag & drop your website folder
4. **Deploy!** - Click deploy and your site goes live

Your site URL: \`yourusername.github.io/site-name\`

It's powered by GitHub Pages - free and reliable!`
      }
    },
    
    fallback: "I'm not sure about that specific question. Try asking about:\n- Creating a GitHub token\n- Deploying your site\n- Custom domains\n- Troubleshooting errors\n\nOr visit our [Help page](help.html) for more info!"
  },

  /**
   * Find best matching response
   */
  getResponse(message) {
    const lower = message.toLowerCase();
    
    // Check for greetings
    if (/^(hi|hello|hey|help|start)/.test(lower)) {
      return this.knowledge.greeting[Math.floor(Math.random() * this.knowledge.greeting.length)];
    }
    
    // Search topics
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [topic, data] of Object.entries(this.knowledge.topics)) {
      let score = 0;
      for (const keyword of data.keywords) {
        if (lower.includes(keyword)) {
          score += keyword.length; // Longer matches score higher
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = data.response;
      }
    }
    
    return bestMatch || this.knowledge.fallback;
  },

  /**
   * Format response with markdown-like styling
   */
  formatResponse(text) {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
  },

  /**
   * Initialize chat UI
   */
  init() {
    this.container = document.getElementById('ai-chat-container');
    this.messages = document.getElementById('ai-chat-messages');
    this.input = document.getElementById('ai-chat-input');
    this.sendBtn = document.getElementById('ai-chat-send');
    this.toggleBtn = document.getElementById('ai-chat-toggle');
    
    if (!this.container) return;
    
    // Event listeners
    this.toggleBtn?.addEventListener('click', () => this.toggle());
    this.sendBtn?.addEventListener('click', () => this.send());
    this.input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });
    
    // Close button
    document.getElementById('ai-chat-close')?.addEventListener('click', () => this.close());
    
    // Quick questions
    document.querySelectorAll('.ai-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.input.value = btn.dataset.question;
        this.send();
      });
    });
  },

  /**
   * Toggle chat open/closed
   */
  toggle() {
    this.container.classList.toggle('open');
    if (this.container.classList.contains('open')) {
      this.input?.focus();
      // Show welcome if empty
      if (this.messages && this.messages.children.length === 0) {
        this.addMessage(this.knowledge.greeting[0], 'ai');
      }
    }
  },

  /**
   * Close chat
   */
  close() {
    this.container.classList.remove('open');
  },

  /**
   * Send message
   */
  send() {
    const text = this.input?.value.trim();
    if (!text) return;
    
    // Add user message
    this.addMessage(text, 'user');
    this.input.value = '';
    
    // Show typing indicator
    this.showTyping();
    
    // Get response after short delay
    setTimeout(() => {
      this.hideTyping();
      const response = this.getResponse(text);
      this.addMessage(response, 'ai');
    }, 500 + Math.random() * 500);
  },

  /**
   * Add message to chat
   */
  addMessage(text, type) {
    if (!this.messages) return;
    
    const div = document.createElement('div');
    div.className = `ai-message ai-message-${type}`;
    div.innerHTML = type === 'ai' ? this.formatResponse(text) : text;
    this.messages.appendChild(div);
    this.messages.scrollTop = this.messages.scrollHeight;
  },

  /**
   * Show typing indicator
   */
  showTyping() {
    if (!this.messages) return;
    const div = document.createElement('div');
    div.className = 'ai-message ai-message-ai ai-typing';
    div.id = 'ai-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    this.messages.appendChild(div);
    this.messages.scrollTop = this.messages.scrollHeight;
  },

  /**
   * Hide typing indicator
   */
  hideTyping() {
    document.getElementById('ai-typing')?.remove();
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => CloudsionAI.init());
