export type Platform = 'x' | 'linkedin';

export interface PlatformConfig {
  platform: Platform;
  /** Selector for individual post containers */
  postSelector: string;
  /** Selector for the text content within a post */
  textSelector: string;
  /** Selector for the action bar (like/comment/share buttons) */
  actionBarSelector: string;
  /** Hover color for the injected button */
  hoverColor: string;
  /** Hover background color */
  hoverBgColor: string;
  /** Default icon color */
  iconColor: string;
}

const X_CONFIG: PlatformConfig = {
  platform: 'x',
  postSelector: 'article',
  textSelector: '[data-testid="tweetText"]',
  actionBarSelector: '[role="group"]',
  hoverColor: 'rgb(29,155,240)',
  hoverBgColor: 'rgba(29,155,240,0.1)',
  iconColor: 'rgb(113,118,123)',
};

const LINKEDIN_CONFIG: PlatformConfig = {
  platform: 'linkedin',
  postSelector: '.feed-shared-update-v2',
  textSelector: '.update-components-text',
  actionBarSelector: '.feed-shared-social-action-bar',
  hoverColor: 'rgb(10,102,194)',
  hoverBgColor: 'rgba(10,102,194,0.1)',
  iconColor: 'rgba(0,0,0,0.6)',
};

export function detectPlatform(): Platform {
  const host = window.location.hostname;
  if (host.includes('linkedin.com')) return 'linkedin';
  return 'x';
}

export function getPlatformConfig(): PlatformConfig {
  return detectPlatform() === 'linkedin' ? LINKEDIN_CONFIG : X_CONFIG;
}
