import { useState, useEffect } from 'react';
import { apiKeyItem, modelItem, tonesItem } from '@/utils/storage';
import { DEFAULT_TONES } from '@/utils/default-tones';
import { ToneIcon, AVAILABLE_ICONS } from '@/utils/tone-icons';
import type { Tone } from '@/utils/storage';

const MODELS = [
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash (Fast/Cheap)' },
  { id: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (Fast)' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Quality)' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
  { id: 'openai/gpt-4o', label: 'GPT-4o (Quality)' },
  { id: 'openai/gpt-oss-20b', label: 'GPT OSS 20B' },
  { id: 'openai/gpt-oss-120b', label: 'GPT OSS 120B' },
];

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [customTones, setCustomTones] = useState<Tone[]>([]);
  const [saved, setSaved] = useState(false);

  // Editing state
  const [editingTone, setEditingTone] = useState<Tone | null>(null);
  const [showToneForm, setShowToneForm] = useState(false);
  const [toneName, setToneName] = useState('');
  const [tonePrompt, setTonePrompt] = useState('');
  const [toneIcon, setToneIcon] = useState('');

  useEffect(() => {
    apiKeyItem.getValue().then(setApiKey);
    modelItem.getValue().then(setModel);
    tonesItem.getValue().then(setCustomTones);
  }, []);

  const saveSettings = async () => {
    await apiKeyItem.setValue(apiKey);
    await modelItem.setValue(model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openToneForm = (tone?: Tone) => {
    if (tone) {
      setEditingTone(tone);
      setToneName(tone.name);
      setTonePrompt(tone.prompt);
      setToneIcon(tone.icon || '');
    } else {
      setEditingTone(null);
      setToneName('');
      setTonePrompt('');
      setToneIcon('');
    }
    setShowToneForm(true);
  };

  const saveTone = async () => {
    if (!toneName.trim() || !tonePrompt.trim()) return;

    let updated: Tone[];
    if (editingTone) {
      updated = customTones.map((t) =>
        t.id === editingTone.id
          ? { ...t, name: toneName.trim(), prompt: tonePrompt.trim(), icon: toneIcon.trim() || undefined }
          : t,
      );
    } else {
      const newTone: Tone = {
        id: `custom-${Date.now()}`,
        name: toneName.trim(),
        prompt: tonePrompt.trim(),
        icon: toneIcon.trim() || undefined,
      };
      updated = [...customTones, newTone];
    }

    await tonesItem.setValue(updated);
    setCustomTones(updated);
    setShowToneForm(false);
  };

  const deleteTone = async (id: string) => {
    const updated = customTones.filter((t) => t.id !== id);
    await tonesItem.setValue(updated);
    setCustomTones(updated);
  };

  return (
    <div className="options-container">
      <h1>Reply Assistant Settings</h1>

      {/* API Key */}
      <section className="section">
        <h2>API Configuration</h2>
        <div className="field">
          <label htmlFor="apiKey">OpenRouter API Key</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-..."
          />
          <p className="hint">
            Get your API key from{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
              openrouter.ai/keys
            </a>
          </p>
        </div>

        <div className="field">
          <label htmlFor="model">Model</label>
          <select id="model" value={model} onChange={(e) => setModel(e.target.value)}>
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button className="btn-primary" onClick={saveSettings}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </section>

      {/* Default Tones */}
      <section className="section">
        <h2>Default Tones</h2>
        <div className="tone-list">
          {DEFAULT_TONES.map((tone) => (
            <div key={tone.id} className="tone-card">
              <div className="tone-header">
                {tone.icon && <span className="tone-icon"><ToneIcon name={tone.icon} size={16} /></span>}
                <strong>{tone.name}</strong>
              </div>
              <p className="tone-prompt">{tone.prompt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Tones */}
      <section className="section">
        <div className="section-header">
          <h2>Custom Tones</h2>
          <button className="btn-secondary" onClick={() => openToneForm()}>
            + Add Tone
          </button>
        </div>

        {customTones.length === 0 && (
          <p className="empty">No custom tones yet. Add one to get started.</p>
        )}

        <div className="tone-list">
          {customTones.map((tone) => (
            <div key={tone.id} className="tone-card">
              <div className="tone-header">
                {tone.icon && <span className="tone-icon"><ToneIcon name={tone.icon} size={16} /></span>}
                <strong>{tone.name}</strong>
                <div className="tone-actions">
                  <button className="btn-text" onClick={() => openToneForm(tone)}>
                    Edit
                  </button>
                  <button className="btn-text btn-danger" onClick={() => deleteTone(tone.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <p className="tone-prompt">{tone.prompt}</p>
            </div>
          ))}
        </div>

        {/* Tone Form */}
        {showToneForm && (
          <div className="tone-form">
            <h3>{editingTone ? 'Edit Tone' : 'New Tone'}</h3>
            <div className="field">
              <label>Name</label>
              <input
                value={toneName}
                onChange={(e) => setToneName(e.target.value)}
                placeholder="e.g., Tech Bro"
              />
            </div>
            <div className="field">
              <label>Icon (optional)</label>
              <div className="icon-picker">
                <button
                  type="button"
                  className={`icon-option ${!toneIcon ? 'icon-selected' : ''}`}
                  onClick={() => setToneIcon('')}
                  title="None"
                >
                  --
                </button>
                {AVAILABLE_ICONS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`icon-option ${toneIcon === name ? 'icon-selected' : ''}`}
                    onClick={() => setToneIcon(name)}
                    title={name}
                  >
                    <ToneIcon name={name} size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>System Prompt</label>
              <textarea
                value={tonePrompt}
                onChange={(e) => setTonePrompt(e.target.value)}
                placeholder="You are a... Describe the persona and reply style."
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={saveTone}>
                {editingTone ? 'Update' : 'Add'} Tone
              </button>
              <button className="btn-secondary" onClick={() => setShowToneForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
