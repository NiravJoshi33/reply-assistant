import { storage } from 'wxt/utils/storage';

export interface Tone {
  id: string;
  name: string;
  prompt: string;
  icon?: string;
  isDefault?: boolean;
}

export const apiKeyItem = storage.defineItem<string>('local:apiKey', {
  fallback: '',
});

export const modelItem = storage.defineItem<string>('local:model', {
  fallback: 'google/gemini-2.0-flash-001',
});

export const tonesItem = storage.defineItem<Tone[]>('sync:tones', {
  fallback: [],
});
