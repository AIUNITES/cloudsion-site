/**
 * Cloudsion Project Plans
 * Business model and roadmap tracking
 */

const ProjectPlans = {
  plans: {
    high: [
      {
        title: 'Hybrid Pricing Model Implementation',
        status: 'In Progress',
        effort: '1-2 weeks',
        description: 'Free tier uses GitHub Pages (costs us $0), paid tiers use our own CDN infrastructure.',
        details: [
          'Free tier: Wrap GitHub Pages with nicer UI, drag & drop deploy',
          'Pro/Team tier: Our own CDN (Cloudflare Workers or S3 + CloudFront)',
          'Upgrade incentives: Custom domains, analytics, no "Powered by" badge'
        ],
        economics: [
          'Free users cost us $0 (GitHub pays)',
          'Storage: ~$0.02/GB/month',
          'Bandwidth: ~$0.05/GB',
          '1 Pro user ($9) covers ~100 free users',
          '1 Team user ($29) covers ~50 free users'
        ]
      },
      {
        title: 'GitHub Pages Integration',
        status: 'Done',
        effort: '3-5 days',
        description: 'Build the free tier wrapper around GitHub Pages.',
        details: [
          'Personal Access Token authentication',
          'Auto-create repo on deploy',
          'Drag & drop file upload via GitHub API',
          'Enable GitHub Pages automatically'
        ],
        files: ['js/github-deploy.js', 'js/app.js']
      }
    ],
    medium: [
      {
        title: 'Premium CDN Infrastructure',
        status: 'Planned',
        effort: '1-2 weeks',
        description: 'Build our own hosting for paid tiers.',
        options: [
          'Cloudflare Workers + R2 (cheapest)',
          'AWS S3 + CloudFront (most reliable)',
          'Vercel/Netlify reseller (fastest to launch)'
        ]
      },
      {
        title: 'Analytics Dashboard',
        status: 'Planned',
        effort: '3-5 days',
        description: 'Page views, visitors, bandwidth usage for Pro/Team users.'
      },
      {
        title: 'Custom Domain Support',
        status: 'Planned',
        effort: '2-3 days',
        description: 'Let Pro users connect their own domains with auto-SSL.'
      },
      {
        title: 'User Authentication System',
        status: 'Done',
        effort: '1 day',
        description: 'Basic login/signup with localStorage. Admin panel.'
      }
    ],
    low: [
      { title: 'Team collaboration features', status: 'Planned' },
      { title: 'Deploy previews for branches', status: 'Planned' },
      { title: 'Rollback to previous versions', status: 'Planned' },
      { title: 'API access for CI/CD', status: 'Planned' },
      { title: 'Slack/Discord deploy notifications', status: 'Planned' }
    ],
    completed: [
      { title: 'Landing page rebrand', date: 'Jan 26', version: 'v2.0.0' },
      { title: 'Hybrid pricing model design', date: 'Jan 26', version: 'v2.1.0' },
      { title: 'Infrastructure comparison table', date: 'Jan 26', version: 'v2.1.0' },
      { title: 'Auth system + Admin panel', date: 'Jan 26', version: 'v2.2.0' },
      { title: 'Project plans tracking', date: 'Jan 26', version: 'v2.2.0' },
      { title: 'GitHub Pages deployment MVP', date: 'Jan 26', version: 'v2.3.0' },
      { title: 'My Sites dashboard', date: 'Jan 26', version: 'v2.3.0' },
      { title: 'File drag & drop upload', date: 'Jan 26', version: 'v2.3.0' }
    ]
  },

  businessModel: {
    summary: 'Free tier uses free infrastructure (GitHub Pages), paid tiers use our own CDN.',
    tiers: [
      {
        name: 'Free',
        price: '$0/forever',
        infrastructure: 'GitHub Pages',
        costToUs: '$0',
        features: ['Unlimited static sites', 'yourname.cloudsion.io subdomain', 'Free SSL', '100GB bandwidth', 'GitHub integration']
      },
      {
        name: 'Pro',
        price: '$9/month',
        infrastructure: 'Cloudsion CDN',
        costToUs: '~$1-2/user/month',
        features: ['Everything in Free', 'Custom domains', '1TB bandwidth', 'Global CDN (50+ PoPs)', 'Analytics dashboard', 'No "Powered by" badge']
      },
      {
        name: 'Team',
        price: '$29/month',
        infrastructure: 'Cloudsion CDN',
        costToUs: '~$3-5/user/month',
        features: ['Everything in Pro', '5 team members', 'Unlimited bandwidth', 'Deploy previews', 'Rollback history', 'API access']
      }
    ],
    keyInsights: [
      'Free users cost us nothing - GitHub hosts everything',
      'Upgrade path is clear: custom domains + analytics + no badge',
      'This is exactly how Vercel/Netlify work',
      'Cloudflare Pages could be another free backend option'
    ]
  },

  renderPanel() {
    const container = document.getElementById('admin-plans-content');
    if (!container) return;

    container.innerHTML = `
      <div class="plans-section">
        <h3>💰 Business Model</h3>
        <div class="business-model-summary">
          <p class="model-summary">${this.businessModel.summary}</p>
          <div class="tiers-grid">
            ${this.businessModel.tiers.map(tier => `
              <div class="tier-card ${tier.name.toLowerCase()}">
                <h4>${tier.name}</h4>
                <div class="tier-price">${tier.price}</div>
                <div class="tier-infra">
                  <span class="label">Infrastructure:</span>
                  <span class="value">${tier.infrastructure}</span>
                </div>
                <div class="tier-cost">
                  <span class="label">Our cost:</span>
                  <span class="value">${tier.costToUs}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="key-insights">
            <h4>💡 Key Insights</h4>
            <ul>
              ${this.businessModel.keyInsights.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="plans-section">
        <h3>🔴 High Priority</h3>
        <div class="plans-grid">
          ${this.plans.high.map(plan => this.renderHighPriorityCard(plan)).join('')}
        </div>
      </div>

      <div class="plans-section">
        <h3>🟡 Medium Priority</h3>
        <div class="plans-grid medium">
          ${this.plans.medium.map(plan => this.renderMediumCard(plan)).join('')}
        </div>
      </div>

      <div class="plans-section">
        <h3>🟢 Low Priority / Nice to Have</h3>
        <div class="low-priority-list">
          ${this.plans.low.map(plan => `
            <div class="low-item">
              <span class="status-dot ${plan.status.toLowerCase().replace(' ', '-')}"></span>
              <span>${plan.title}</span>
              <span class="status-badge">${plan.status}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="plans-section">
        <h3>✅ Completed</h3>
        <div class="completed-grid">
          ${this.plans.completed.map(item => `
            <div class="completed-item">
              <span class="check">✓</span>
              <span class="title">${item.title}</span>
              <span class="meta">${item.date} • ${item.version}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderHighPriorityCard(plan) {
    return `
      <div class="plan-card high">
        <div class="plan-header">
          <h4>${plan.title}</h4>
          <span class="effort-badge">${plan.effort}</span>
        </div>
        <span class="status-badge ${plan.status.toLowerCase().replace(' ', '-')}">${plan.status}</span>
        <p class="plan-desc">${plan.description}</p>
        ${plan.details ? `
          <div class="plan-details">
            <strong>Details:</strong>
            <ul>${plan.details.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ${plan.economics ? `
          <div class="plan-economics">
            <strong>💰 Economics:</strong>
            <ul>${plan.economics.map(e => `<li>${e}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ${plan.files ? `
          <div class="plan-files">
            <strong>Files:</strong>
            ${plan.files.map(f => `<code>${f}</code>`).join(' ')}
          </div>
        ` : ''}
      </div>
    `;
  },

  renderMediumCard(plan) {
    return `
      <div class="plan-card medium">
        <div class="plan-header">
          <h4>${plan.title}</h4>
          ${plan.effort ? `<span class="effort-badge">${plan.effort}</span>` : ''}
        </div>
        <span class="status-badge ${plan.status.toLowerCase().replace(' ', '-')}">${plan.status}</span>
        <p class="plan-desc">${plan.description}</p>
        ${plan.options ? `
          <div class="plan-options">
            <strong>Options:</strong>
            <ul>${plan.options.map(o => `<li>${o}</li>`).join('')}</ul>
          </div>
        ` : ''}
      </div>
    `;
  }
};
