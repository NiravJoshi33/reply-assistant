import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'dist',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reply Assistant',
    description: 'AI-powered reply suggestions for X and LinkedIn',
    permissions: ['storage', 'activeTab'],
    host_permissions: [
      'https://x.com/*',
      'https://pro.x.com/*',
      'https://tweetdeck.twitter.com/*',
      'https://pro.twitter.com/*',
      'https://www.linkedin.com/*',
      'https://openrouter.ai/*',
    ],
  },
});
