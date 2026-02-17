import { apiKeyItem, modelItem, tonesItem } from '@/utils/storage';
import { DEFAULT_TONES } from '@/utils/default-tones';
import type {
  GenerateReplyRequest,
  GenerateReplyResponse,
} from '@/utils/messaging';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (
      message: GenerateReplyRequest,
      _sender: browser.runtime.MessageSender,
      sendResponse: (response: GenerateReplyResponse) => void,
    ) => {
      if (message.type === 'GENERATE_REPLY') {
        handleGenerateReply(message).then(sendResponse);
        return true; // keep channel open for async response
      }
    },
  );
});

async function handleGenerateReply(
  request: GenerateReplyRequest,
): Promise<GenerateReplyResponse> {
  const apiKey = await apiKeyItem.getValue();
  if (!apiKey) {
    return {
      success: false,
      error:
        'API key not configured. Please set your OpenRouter API key in the extension options.',
    };
  }

  const model = await modelItem.getValue();
  const tones = await tonesItem.getValue();
  const allTones = [...DEFAULT_TONES, ...tones];
  const tone = allTones.find((t) => t.id === request.toneId);

  if (!tone) {
    return { success: false, error: 'Selected tone not found.' };
  }

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/reply-assistant',
          'X-Title': 'Reply Assistant',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `${tone.prompt}\n\nIMPORTANT RULES:\n- Write ONLY the reply text, nothing else.\n- Do NOT include quotes, prefixes like "Reply:", or any meta-commentary.\n- Keep it concise and suitable for a tweet reply (under 280 characters when possible).\n- Match the language of the original tweet.`,
            },
            {
              role: 'user',
              content: `Write a reply to this tweet:\n\n"${request.originalTweet}"${request.additionalContext ? `\n\nAdditional context (e.g. description of image/video in the tweet):\n${request.additionalContext}` : ''}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const rawMsg =
        errorData?.error?.message || `API error: ${response.status}`;

      if (response.status === 401 || response.status === 403 || rawMsg.toLowerCase().includes('auth')) {
        return {
          success: false,
          error: 'Invalid API key. Please check your OpenRouter API key in extension settings.',
        };
      }
      return { success: false, error: rawMsg };
    }

    const data = await response.json();
    console.log('[Reply Assistant] API response:', JSON.stringify(data));

    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      data.choices?.[0]?.text?.trim() ||
      data.output?.trim();

    if (!text) {
      return {
        success: false,
        error: `No response generated. Model: ${model}. Try a different model in settings.`,
      };
    }

    return { success: true, text };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error occurred.',
    };
  }
}
