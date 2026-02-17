import { useState, useEffect } from 'react';
import { Settings, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiKeyItem } from '@/utils/storage';

export default function App() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    apiKeyItem.getValue().then((key) => setHasKey(!!key));
  }, []);

  const openOptions = () => {
    browser.runtime.openOptionsPage();
  };

  return (
    <div className="popup">
      <h1><Sparkles size={20} /> Reply Assistant</h1>
      <p className="subtitle">AI-powered reply suggestions for X</p>

      {hasKey === false && (
        <div className="warning">
          <AlertTriangle size={14} /> No API key configured. Set up your OpenRouter API key.
        </div>
      )}

      {hasKey === true && (
        <div className="status">
          <CheckCircle size={14} /> Ready! Look for the sparkle icon on tweets.
        </div>
      )}

      <button className="btn" onClick={openOptions}>
        <Settings size={14} /> Open Settings
      </button>
    </div>
  );
}
