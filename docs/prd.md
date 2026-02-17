---

# PRD: X-Pro Reply Assistant ("The Reply Guy")

## 1. Executive Summary

**Product:** A Chrome browser extension (built with WXT) that integrates directly into the **X Pro (TweetDeck)** interface.
**Goal:** To act as a "Reply Guy on Steroids" by generating context-aware reply suggestions based on user-defined "Tones."
**Primary Mechanism:** The user clicks a custom trigger on a specific tweet, selects a tone, generates a reply, and manually copies the text to the clipboard.
**Key Constraint:** NO auto-insertion into the text input. The user retains full control via a "Copy" workflow.

---

## 2. User Flow & UX

### 2.1 The Trigger (Entry Point)

- **Location:** Inside the "Action Bar" of every tweet (the row containing Reply, Retweet, Like) within any X Pro column.
- **Visual:** A subtle icon (e.g., a "Sparkles" or "Brain" icon) that matches X Pro’s native aesthetic (monochrome, minimalist).
- **Behavior:**
- **Hover:** Shows a tooltip "Generate Reply".
- **Click:** Opens the **Reply Assistant Modal**.

### 2.2 The Assistant Modal (The "Work Surface")

b

- **Type:** A lightweight Popover or Modal positioned relative to the clicked tweet (or centered on screen if column width is too narrow).
- **Components:**

1. **Context Preview:** A truncated view of the tweet being replied to (sanity check).
2. **Tone Selector:** A dropdown or tag cloud of available tones (e.g., "Snarky," "Professional," "Questioning").
3. **Generate Button:** Triggers the API call.
4. **Output Area:** A textarea displaying the generated draft.
5. **Action Buttons:**

- **Copy:** Copies text to clipboard and flashes a "Copied!" state.
- **Regenerate:** Re-runs the prompt with the same tone.
- **Close:** Dismisses the modal.

### 2.3 Configuration (Options Page)

- **API Management:** Input field for OpenRouter API Key.
- **Tone Library:** A CRUD interface to add, edit, or delete tones.
- _Default Tones:_ Provided out of the box (e.g., "Agree & Amplify", "Debate", "Joke").

---

## 3. Technical Architecture (WXT Stack)

### 3.1 Manifest & Permissions

- **`host_permissions`:** `https://tweetdeck.twitter.com/*`, `https://pro.twitter.com/*`, `https://x.com/*`
- **`permissions`:** `storage`, `activeTab`

### 3.2 Content Script (`entrypoints/content.ts`)

**Challenge:** X Pro is a heavy SPA with virtualized lists (tweets recycle as you scroll).
**Strategy:**

- **Observer:** A highly optimized `MutationObserver` targeting `.js-chirp-container` (the column body class in old TweetDeck) or the `[data-testid="cellInnerDiv"]` equivalents in the new X Pro.
- **Injection:**
- Target the `.tweet-actions` or `[role="group"]` container.
- Check for existence of `id="wxt-reply-trigger"` before injecting to prevent duplicates.

- **Shadow DOM:** The entire Modal/Popover will live in a Shadow Root attached to the specific tweet's DOM node or a global overlay container to prevent style bleeding.

### 3.3 Data Structures (Storage)

We will use `browser.storage.sync` to keep the user's tones available across devices.

**`Tone` Interface:**

```typescript
interface Tone {
  id: string; // UUID
  name: string; // Display name (e.g., "Tech Bro")
  prompt: string; // System instruction (e.g., "You are a VC. Use buzzwords like 'paradigm shift'.")
  icon?: string; // Optional emoji
}
```

### 3.4 LLM Service Layer (Background Script)

To keep the API key secure and handle CORS properly, all API calls go through the background script.

**Message Protocol:**

- **Event:** `GENERATE_REPLY`
- **Payload:** `{ prompt: string, toneId: string, originalTweet: string }`
- **Response:** `{ success: true, text: string }`

**Service Provider (OpenRouter):**

- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Model:** Configurable, defaulting to `google/gemini-2.0-flash-001` (Fast/Cheap) or `anthropic/claude-3-haiku`.

---

## 4. Specific X Pro Implementation Details

### 4.1 DOM Targeting (The "Hard Part")

X Pro's DOM is complex. The extension must identify the "Tweet Text" relative to the "Action Bar" clicked.

**Algorithm:**

1. User clicks trigger button.
2. Script finds `closest('article')` or the column item container.
3. Script queries for the text content.

- _Selector Strategy:_ Look for `[data-testid="tweetText"]` or generic paragraph tags if test-ids are obfuscated.
- _Handling Threads:_ If the tweet is part of a thread, we might need to grab the parent tweet text too (Optional V2 feature).

### 4.2 Styling

- **CSS Isolation:** Use WXT’s `shadow-root` feature.
- **Theme Awareness:** X Pro has Dark/Dim/Light modes. The extension should detect `document.body` background color or media queries to match the modal theme (so it doesn't look out of place).

---

## 5. Development Phases

### Phase 1: The Skeleton (MVP)

- **Goal:** Inject a button into X Pro columns that logs "Clicked" to the console.
- **Tasks:**
- Set up WXT project.
- Implement `MutationObserver` for X Pro columns.
- Correctly place the button in the action bar.

### Phase 2: The Brain (Connection)

- **Goal:** Extract text and get a response from OpenRouter.
- **Tasks:**
- Implement `extractTweetText(element)`.
- Build `OpenRouterService` in `background.ts`.
- Hardcode one tone (e.g., "Generic Helpful").

### Phase 3: The UI (Interaction)

- **Goal:** The Modal and Copy workflow.
- **Tasks:**
- Build the React component for the Modal.
- Implement the Tone Selector dropdown.
- Implement the "Copy to Clipboard" utility.
- Create the Options page for adding custom tones.

### Phase 4: Polish

- **Tasks:**
- Add loading states (spinners) during generation.
- Error handling (e.g., "API Key Missing").
- Theme matching (Dark mode support).

---
