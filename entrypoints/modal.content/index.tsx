import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

export default defineContentScript({
  matches: [
    '*://x.com/*',
    '*://pro.x.com/*',
    '*://tweetdeck.twitter.com/*',
    '*://pro.twitter.com/*',
  ],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'reply-assistant-modal',
      position: 'overlay',
      zIndex: 10000,
      isolateEvents: true,
      onMount: (container) => {
        const app = document.createElement('div');
        app.id = 'reply-assistant-root';
        container.append(app);
        const root = ReactDOM.createRoot(app);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
