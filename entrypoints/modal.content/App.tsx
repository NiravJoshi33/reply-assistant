import { useState, useEffect, useCallback } from 'react';
import { X, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { ToneIcon } from '@/utils/tone-icons';
import { DEFAULT_TONES } from '@/utils/default-tones';
import { tonesItem } from '@/utils/storage';
import type { Tone } from '@/utils/storage';
import type {
  GenerateReplyRequest,
  GenerateReplyResponse,
} from '@/utils/messaging';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [tweetText, setTweetText] = useState('');
  const [allTones, setAllTones] = useState<Tone[]>(DEFAULT_TONES);
  const [selectedToneId, setSelectedToneId] = useState(DEFAULT_TONES[0]?.id || '');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');

  // Load custom tones
  useEffect(() => {
    tonesItem.getValue().then((customTones) => {
      setAllTones([...DEFAULT_TONES, ...customTones]);
    });
  }, [isOpen]);

  // Listen for open events from content script
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setTweetText(detail.tweetText);
      setGeneratedReply('');
      setError('');
      setCopied(false);
      setAdditionalContext('');
      setIsOpen(true);
    };
    window.addEventListener('reply-assistant:open', handler);
    return () => window.removeEventListener('reply-assistant:open', handler);
  }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleGenerate = useCallback(async () => {
    if ((!tweetText && !additionalContext.trim()) || !selectedToneId) return;
    setIsLoading(true);
    setError('');
    setGeneratedReply('');
    setCopied(false);

    try {
      const response: GenerateReplyResponse = await browser.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        toneId: selectedToneId,
        originalTweet: tweetText,
        additionalContext: additionalContext.trim() || undefined,
      } satisfies GenerateReplyRequest);

      if (response.success && response.text) {
        setGeneratedReply(response.text);
      } else {
        setError(response.error || 'Failed to generate reply.');
      }
    } catch (err) {
      setError('Failed to communicate with extension. Try reloading the page.');
    } finally {
      setIsLoading(false);
    }
  }, [tweetText, selectedToneId, additionalContext]);

  const handleCopy = useCallback(async () => {
    if (!generatedReply) return;
    await navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedReply]);

  if (!isOpen) return null;

  const isDark = detectDarkMode();

  return (
    <div className={`ra-overlay ${isDark ? 'ra-dark' : 'ra-light'}`} onClick={() => setIsOpen(false)}>
      <div className="ra-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ra-header">
          <h2 className="ra-title">Reply Assistant</h2>
          <button className="ra-close" onClick={() => setIsOpen(false)} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tweet Preview */}
        <div className="ra-preview">
          <span className="ra-preview-label">Replying to:</span>
          <p className="ra-preview-text">
            {tweetText.length > 200 ? tweetText.slice(0, 200) + '...' : tweetText}
          </p>
        </div>

        {/* Tone Selector */}
        <div className="ra-tone-section">
          <label className="ra-label">Tone</label>
          <div className="ra-tone-grid">
            {allTones.map((tone) => (
              <button
                key={tone.id}
                className={`ra-tone-btn ${selectedToneId === tone.id ? 'ra-tone-active' : ''}`}
                onClick={() => setSelectedToneId(tone.id)}
              >
                {tone.icon && <span className="ra-tone-icon"><ToneIcon name={tone.icon} size={14} /></span>}
                {tone.name}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Context */}
        <div className="ra-context-section">
          <label className="ra-label">Additional context (optional)</label>
          <textarea
            className="ra-context-input"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Describe the image/video, or add any extra context for the AI..."
            rows={2}
          />
        </div>

        {/* Generate Button */}
        <button
          className="ra-generate"
          onClick={handleGenerate}
          disabled={isLoading || (!tweetText && !additionalContext.trim())}
        >
          {isLoading ? (
            <span className="ra-spinner" />
          ) : (
            <><Sparkles size={16} /> Generate Reply</>
          )}
        </button>

        {/* Error */}
        {error && <div className="ra-error">{error}</div>}

        {/* Output */}
        {generatedReply && (
          <div className="ra-output-section">
            <textarea
              className="ra-output"
              value={generatedReply}
              onChange={(e) => setGeneratedReply(e.target.value)}
              rows={4}
            />
            <div className="ra-actions">
              <button className={`ra-copy ${copied ? 'ra-copied' : ''}`} onClick={handleCopy}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
              <button className="ra-regenerate" onClick={handleGenerate} disabled={isLoading}>
                <RefreshCw size={14} /> Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function detectDarkMode(): boolean {
  const bg = window.getComputedStyle(document.body).backgroundColor;
  if (!bg || bg === 'transparent') return true;
  const match = bg.match(/\d+/g);
  if (!match) return true;
  const [r, g, b] = match.map(Number);
  // Luminance check: dark if average RGB < 128
  return (r + g + b) / 3 < 128;
}
