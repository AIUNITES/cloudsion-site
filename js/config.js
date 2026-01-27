/**
 * Cloudsion Configuration
 */

const APP_CONFIG = {
  name: 'Cloudsion',
  tagline: 'Publish Your Website Instantly',
  description: 'Deploy your website to the cloud in seconds.',
  icon: '☁️',
  
  version: '2.2.0',
  lastUpdated: '2026-01-26',
  
  logoHtml: 'Cloud<span class="logo-accent">sion</span>',
  
  storagePrefix: 'cloudsion',
  
  itemName: 'site',
  itemNamePlural: 'sites',
  
  defaultAdmin: {
    username: 'admin',
    password: 'admin123',
    displayName: 'Administrator',
    email: 'admin@cloudsion.io',
    isAdmin: true
  },
  
  defaultDemo: {
    username: 'demo',
    password: 'demo123',
    displayName: 'Demo User',
    email: 'demo@cloudsion.io',
    isAdmin: false
  },

  demoItems: [],

  changelog: [
    {
      version: 'v2.2.0',
      date: 'January 26, 2026',
      changes: [
        'Added user authentication (login/signup)',
        'Admin panel with Project Plans tab',
        'Business model documentation in admin',
        'User dropdown menu',
        'Toast notifications'
      ]
    },
    {
      version: 'v2.1.0',
      date: 'January 26, 2026',
      changes: [
        'Hybrid pricing model: Free (GitHub Pages) + Premium hosting',
        'Infrastructure comparison table'
      ]
    },
    {
      version: 'v2.0.0',
      date: 'January 26, 2026',
      changes: [
        'Complete rebrand to website publishing platform',
        'New hero with deploy terminal demo',
        'Pricing tiers: Free, Pro ($9), Team ($29)',
        'How It Works section',
        'Use cases section'
      ]
    },
    {
      version: 'v1.0.0',
      date: 'January 24, 2026',
      changes: [
        'Initial release (enterprise cloud services)'
      ]
    }
  ]
};

window.APP_CONFIG = APP_CONFIG;
console.log(`${APP_CONFIG.name} v${APP_CONFIG.version}`);
