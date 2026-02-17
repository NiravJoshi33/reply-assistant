import type { GenerateReplyResponse } from '@/utils/messaging';

export default defineContentScript({
  matches: [
    '*://x.com/*',
    '*://pro.x.com/*',
    '*://tweetdeck.twitter.com/*',
    '*://pro.twitter.com/*',
  ],
  runAt: 'document_idle',

  main() {
    const BUTTON_ATTR = 'data-reply-assistant';

    function injectButtons() {
      const articles = document.querySelectorAll('article');
      for (const article of articles) {
        const actionBar = article.querySelector('[role="group"]');
        if (!actionBar || actionBar.querySelector(`[${BUTTON_ATTR}]`)) continue;

        const button = createTriggerButton(article);
        actionBar.appendChild(button);
      }
    }

    function createTriggerButton(article: Element): HTMLElement {
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
        color:rgb(113,118,123);
      `.replace(/\n/g, '');
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/></svg>`;

      btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = 'rgba(29,155,240,0.1)';
        btn.style.color = 'rgb(29,155,240)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'rgb(113,118,123)';
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tweetText = extractTweetText(article);
        openReplyModal(tweetText);
      });

      wrapper.appendChild(btn);
      return wrapper;
    }

    function extractTweetText(article: Element): string {
      const tweetTextEl = article.querySelector('[data-testid="tweetText"]');
      return tweetTextEl?.textContent?.trim() || '';
    }

    function openReplyModal(tweetText: string) {
      // Dispatch custom event that the shadow DOM UI will listen for
      window.dispatchEvent(
        new CustomEvent('reply-assistant:open', {
          detail: { tweetText },
        }),
      );
    }

    // Initial scan
    injectButtons();

    // Observe for new tweets (virtualized list recycling)
    const observer = new MutationObserver(() => {
      injectButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
});
