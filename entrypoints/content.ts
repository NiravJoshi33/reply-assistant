import type { GenerateReplyResponse } from '@/utils/messaging';
import { getPlatformConfig, type PlatformConfig } from '@/utils/platform';

export default defineContentScript({
  matches: [
    '*://x.com/*',
    '*://pro.x.com/*',
    '*://tweetdeck.twitter.com/*',
    '*://pro.twitter.com/*',
    '*://www.linkedin.com/*',
  ],
  runAt: 'document_idle',

  main() {
    const BUTTON_ATTR = 'data-reply-assistant';
    const config = getPlatformConfig();

    function injectButtons() {
      const posts = document.querySelectorAll(config.postSelector);
      for (const post of posts) {
        const actionBar = post.querySelector(config.actionBarSelector);
        if (!actionBar || actionBar.querySelector(`[${BUTTON_ATTR}]`)) continue;

        const button = createTriggerButton(post, config);
        actionBar.appendChild(button);
      }
    }

    function createTriggerButton(post: Element, cfg: PlatformConfig): HTMLElement {
      const wrapper = document.createElement('div');
      wrapper.setAttribute(BUTTON_ATTR, 'true');
      wrapper.style.cssText =
        'display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0 4px;';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = 'Generate Reply';
      btn.style.cssText = `
        background:none;border:none;cursor:pointer;padding:8px;
        border-radius:9999px;display:inline-flex;align-items:center;
        justify-content:center;transition:background-color 0.2s;
        color:${cfg.iconColor};
      `.replace(/\n/g, '');
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/></svg>`;

      btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = cfg.hoverBgColor;
        btn.style.color = cfg.hoverColor;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = cfg.iconColor;
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const postText = extractPostText(post, cfg);
        openReplyModal(postText);
      });

      wrapper.appendChild(btn);
      return wrapper;
    }

    function extractPostText(post: Element, cfg: PlatformConfig): string {
      const textEl = post.querySelector(cfg.textSelector);
      return textEl?.textContent?.trim() || '';
    }

    function openReplyModal(postText: string) {
      window.dispatchEvent(
        new CustomEvent('reply-assistant:open', {
          detail: { tweetText: postText, platform: config.platform },
        }),
      );
    }

    // Initial scan
    injectButtons();

    // Observe for new posts (virtualized list recycling)
    const observer = new MutationObserver(() => {
      injectButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
});
